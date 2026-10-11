//! Streaming ZIP writer: entries are deflated straight into the output with
//! data descriptors, so archives are sent while they are being built. ZIP64
//! records are written for entries and archives beyond 4 GiB.

use crate::date;
use flate2::Compression;
use flate2::write::DeflateEncoder;
use std::io::{self, Read, Write};
use std::time::SystemTime;

const LOCAL_HEADER_SIGNATURE: u32 = 0x0403_4b50;
const DATA_DESCRIPTOR_SIGNATURE: u32 = 0x0807_4b50;
const CENTRAL_HEADER_SIGNATURE: u32 = 0x0201_4b50;
const ZIP64_END_SIGNATURE: u32 = 0x0606_4b50;
const ZIP64_LOCATOR_SIGNATURE: u32 = 0x0706_4b50;
const END_SIGNATURE: u32 = 0x0605_4b50;
const ZIP64_EXTRA_ID: u16 = 0x0001;
/// Data descriptor present, UTF-8 names.
const FLAGS: u16 = 0x0808;
const METHOD_DEFLATE: u16 = 8;
const VERSION_DEFAULT: u16 = 20;
const VERSION_ZIP64: u16 = 45;
const MADE_BY_UNIX: u16 = 3 << 8;
const LIMIT_32: u64 = 0xFFFF_FFFF;
/// Entries that may come close to 4 GiB once deflated use ZIP64 sizes.
const ZIP64_ENTRY_THRESHOLD: u64 = 0xF000_0000;

struct CentralEntry {
    name: String,
    dos_time: u16,
    dos_date: u16,
    crc: u32,
    compressed_size: u64,
    size: u64,
    offset: u64,
    mode: u32,
}

impl CentralEntry {
    fn needs_zip64(&self) -> bool {
        self.compressed_size >= LIMIT_32 || self.size >= LIMIT_32 || self.offset >= LIMIT_32
    }
}

struct CountingWriter<W: Write> {
    inner: W,
    written: u64,
}

impl<W: Write> Write for CountingWriter<W> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let written = self.inner.write(buf)?;
        self.written += written as u64;
        Ok(written)
    }

    fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}

struct CrcReader<R: Read> {
    inner: R,
    crc: flate2::Crc,
}

impl<R: Read> Read for CrcReader<R> {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        let read = self.inner.read(buf)?;
        self.crc.update(&buf[..read]);
        Ok(read)
    }
}

fn dos_date_time(time: SystemTime) -> (u16, u16) {
    let (year, month, day, hour, minute, second) = date::civil_time(time);
    if year < 1980 {
        return (0, (1 << 5) | 1);
    }
    let year = year.min(2107) as u16;
    (
        ((hour as u16) << 11) | ((minute as u16) << 5) | (second as u16 / 2),
        ((year - 1980) << 9) | ((month as u16) << 5) | day as u16,
    )
}

pub struct ZipWriter<W: Write> {
    out: CountingWriter<W>,
    entries: Vec<CentralEntry>,
}

impl<W: Write> ZipWriter<W> {
    pub fn new(out: W) -> ZipWriter<W> {
        ZipWriter {
            out: CountingWriter {
                inner: out,
                written: 0,
            },
            entries: Vec::new(),
        }
    }

    /// Adds a file. `size_hint` decides whether the entry needs ZIP64 sizes.
    pub fn add_file(
        &mut self,
        name: &str,
        content: impl Read,
        size_hint: u64,
        modified: SystemTime,
        mode: u32,
    ) -> io::Result<()> {
        let offset = self.out.written;
        let is_zip64 = size_hint >= ZIP64_ENTRY_THRESHOLD;
        let (dos_time, dos_date) = dos_date_time(modified);

        let mut header = Vec::with_capacity(30 + name.len() + 20);
        header.extend(LOCAL_HEADER_SIGNATURE.to_le_bytes());
        header.extend(
            if is_zip64 {
                VERSION_ZIP64
            } else {
                VERSION_DEFAULT
            }
            .to_le_bytes(),
        );
        header.extend(FLAGS.to_le_bytes());
        header.extend(METHOD_DEFLATE.to_le_bytes());
        header.extend(dos_time.to_le_bytes());
        header.extend(dos_date.to_le_bytes());
        header.extend(0u32.to_le_bytes());
        let unknown_size: u32 = if is_zip64 { u32::MAX } else { 0 };
        header.extend(unknown_size.to_le_bytes());
        header.extend(unknown_size.to_le_bytes());
        header.extend((name.len() as u16).to_le_bytes());
        header.extend((if is_zip64 { 20u16 } else { 0 }).to_le_bytes());
        header.extend(name.as_bytes());
        if is_zip64 {
            header.extend(ZIP64_EXTRA_ID.to_le_bytes());
            header.extend(16u16.to_le_bytes());
            header.extend(0u64.to_le_bytes());
            header.extend(0u64.to_le_bytes());
        }
        self.out.write_all(&header)?;

        let data_start = self.out.written;
        let mut reader = CrcReader {
            inner: content,
            crc: flate2::Crc::new(),
        };
        let mut encoder = DeflateEncoder::new(&mut self.out, Compression::new(5));
        let size = io::copy(&mut reader, &mut encoder)?;
        encoder.finish()?;
        let compressed_size = self.out.written - data_start;
        let crc = reader.crc.sum();

        let mut descriptor = Vec::with_capacity(24);
        descriptor.extend(DATA_DESCRIPTOR_SIGNATURE.to_le_bytes());
        descriptor.extend(crc.to_le_bytes());
        if is_zip64 {
            descriptor.extend(compressed_size.to_le_bytes());
            descriptor.extend(size.to_le_bytes());
        } else {
            if compressed_size >= LIMIT_32 || size >= LIMIT_32 {
                return Err(io::Error::other(format!(
                    "{name} grew beyond 4 GiB while it was archived"
                )));
            }
            descriptor.extend((compressed_size as u32).to_le_bytes());
            descriptor.extend((size as u32).to_le_bytes());
        }
        self.out.write_all(&descriptor)?;

        self.entries.push(CentralEntry {
            name: name.to_string(),
            dos_time,
            dos_date,
            crc,
            compressed_size,
            size,
            offset,
            mode,
        });
        Ok(())
    }

    /// Writes the central directory and returns the output.
    pub fn finish(mut self) -> io::Result<W> {
        let directory_offset = self.out.written;
        for entry in &self.entries {
            let is_zip64 = entry.needs_zip64();
            let mut header = Vec::with_capacity(46 + entry.name.len() + 28);
            header.extend(CENTRAL_HEADER_SIGNATURE.to_le_bytes());
            let version = if is_zip64 {
                VERSION_ZIP64
            } else {
                VERSION_DEFAULT
            };
            header.extend((MADE_BY_UNIX | version).to_le_bytes());
            header.extend(version.to_le_bytes());
            header.extend(FLAGS.to_le_bytes());
            header.extend(METHOD_DEFLATE.to_le_bytes());
            header.extend(entry.dos_time.to_le_bytes());
            header.extend(entry.dos_date.to_le_bytes());
            header.extend(entry.crc.to_le_bytes());
            let narrow = |value: u64| if is_zip64 { u32::MAX } else { value as u32 };
            header.extend(narrow(entry.compressed_size).to_le_bytes());
            header.extend(narrow(entry.size).to_le_bytes());
            header.extend((entry.name.len() as u16).to_le_bytes());
            header.extend((if is_zip64 { 28u16 } else { 0 }).to_le_bytes());
            header.extend(0u16.to_le_bytes());
            header.extend(0u16.to_le_bytes());
            header.extend(0u16.to_le_bytes());
            header.extend((entry.mode << 16).to_le_bytes());
            header.extend(narrow(entry.offset).to_le_bytes());
            header.extend(entry.name.as_bytes());
            if is_zip64 {
                header.extend(ZIP64_EXTRA_ID.to_le_bytes());
                header.extend(24u16.to_le_bytes());
                header.extend(entry.size.to_le_bytes());
                header.extend(entry.compressed_size.to_le_bytes());
                header.extend(entry.offset.to_le_bytes());
            }
            self.out.write_all(&header)?;
        }
        let directory_size = self.out.written - directory_offset;
        let count = self.entries.len() as u64;

        let mut end = Vec::new();
        if count >= 0xFFFF || directory_size >= LIMIT_32 || directory_offset >= LIMIT_32 {
            let zip64_end_offset = self.out.written;
            end.extend(ZIP64_END_SIGNATURE.to_le_bytes());
            end.extend(44u64.to_le_bytes());
            end.extend((MADE_BY_UNIX | VERSION_ZIP64).to_le_bytes());
            end.extend(VERSION_ZIP64.to_le_bytes());
            end.extend(0u32.to_le_bytes());
            end.extend(0u32.to_le_bytes());
            end.extend(count.to_le_bytes());
            end.extend(count.to_le_bytes());
            end.extend(directory_size.to_le_bytes());
            end.extend(directory_offset.to_le_bytes());
            end.extend(ZIP64_LOCATOR_SIGNATURE.to_le_bytes());
            end.extend(0u32.to_le_bytes());
            end.extend(zip64_end_offset.to_le_bytes());
            end.extend(1u32.to_le_bytes());
        }
        end.extend(END_SIGNATURE.to_le_bytes());
        end.extend(0u16.to_le_bytes());
        end.extend(0u16.to_le_bytes());
        end.extend((count.min(0xFFFF) as u16).to_le_bytes());
        end.extend((count.min(0xFFFF) as u16).to_le_bytes());
        end.extend((directory_size.min(LIMIT_32) as u32).to_le_bytes());
        end.extend((directory_offset.min(LIMIT_32) as u32).to_le_bytes());
        end.extend(0u16.to_le_bytes());
        self.out.write_all(&end)?;
        self.out.flush()?;
        Ok(self.out.inner)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use flate2::read::DeflateDecoder;
    use std::time::{Duration, UNIX_EPOCH};

    fn u16_at(bytes: &[u8], offset: usize) -> u16 {
        u16::from_le_bytes([bytes[offset], bytes[offset + 1]])
    }

    fn u32_at(bytes: &[u8], offset: usize) -> u32 {
        u32::from_le_bytes(bytes[offset..offset + 4].try_into().unwrap())
    }

    /// Reads entries through the central directory: (name, content, mode).
    pub fn read_archive(archive: &[u8]) -> Vec<(String, Vec<u8>, u32)> {
        let end = archive.len() - 22;
        assert_eq!(u32_at(archive, end), END_SIGNATURE);
        let count = u16_at(archive, end + 10) as usize;
        let mut offset = u32_at(archive, end + 16) as usize;
        let mut entries = Vec::new();
        for _ in 0..count {
            assert_eq!(u32_at(archive, offset), CENTRAL_HEADER_SIGNATURE);
            let crc = u32_at(archive, offset + 16);
            let compressed_size = u32_at(archive, offset + 20) as usize;
            let name_length = u16_at(archive, offset + 28) as usize;
            let extra_length = u16_at(archive, offset + 30) as usize;
            let mode = u32_at(archive, offset + 38) >> 16;
            let local = u32_at(archive, offset + 42) as usize;
            let name = String::from_utf8(archive[offset + 46..offset + 46 + name_length].to_vec())
                .unwrap();
            assert_eq!(u32_at(archive, local), LOCAL_HEADER_SIGNATURE);
            let data = local
                + 30
                + u16_at(archive, local + 26) as usize
                + u16_at(archive, local + 28) as usize;
            let mut content = Vec::new();
            DeflateDecoder::new(&archive[data..data + compressed_size])
                .read_to_end(&mut content)
                .unwrap();
            let mut check = flate2::Crc::new();
            check.update(&content);
            assert_eq!(check.sum(), crc, "{name}");
            entries.push((name, content, mode));
            offset += 46 + name_length + extra_length;
        }
        entries
    }

    #[test]
    fn writes_readable_archives() {
        let modified = UNIX_EPOCH + Duration::from_secs(1_700_000_000);
        let mut zip = ZipWriter::new(Vec::new());
        zip.add_file("a.txt", &b"hello hello hello"[..], 17, modified, 0o100644)
            .unwrap();
        zip.add_file("dir/żółw.bin", &[0u8; 5000][..], 5000, modified, 0o100755)
            .unwrap();
        zip.add_file("empty", &b""[..], 0, modified, 0o100644)
            .unwrap();
        let archive = zip.finish().unwrap();
        let entries = read_archive(&archive);
        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0].0, "a.txt");
        assert_eq!(entries[0].1, b"hello hello hello");
        assert_eq!(entries[1].0, "dir/żółw.bin");
        assert_eq!(entries[1].1, vec![0u8; 5000]);
        assert_eq!(entries[1].2, 0o100755);
        assert!(entries[2].1.is_empty());
    }

    #[test]
    fn encodes_dos_timestamps() {
        let time = UNIX_EPOCH + Duration::from_secs(1_700_000_000);
        let (dos_time, dos_date) = dos_date_time(time);
        assert_eq!(dos_date >> 9, 2023 - 1980);
        assert_eq!((dos_date >> 5) & 0xF, 11);
        assert_eq!(dos_date & 0x1F, 14);
        assert_eq!(dos_time >> 11, 22);
        assert_eq!((dos_time >> 5) & 0x3F, 13);
    }
}
