//! Dates formatted like `Date.prototype.toISOString()`.

use std::time::{SystemTime, UNIX_EPOCH};

/// Civil date from days since 1970-01-01 (Howard Hinnant's algorithm).
fn civil_from_days(days: i64) -> (i64, u32, u32) {
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let month = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let year = yoe + era * 400 + i64::from(month <= 2);
    (year, month, day)
}

/// `new Date(millis).toISOString()`.
pub fn iso_string(millis: i64) -> String {
    let days = millis.div_euclid(86_400_000);
    let day_millis = millis.rem_euclid(86_400_000);
    let (year, month, day) = civil_from_days(days);
    let seconds = day_millis / 1000;
    format!(
        "{year:04}-{month:02}-{day:02}T{:02}:{:02}:{:02}.{:03}Z",
        seconds / 3600,
        seconds / 60 % 60,
        seconds % 60,
        day_millis % 1000
    )
}

pub fn iso_string_from_system_time(time: SystemTime) -> String {
    let millis = match time.duration_since(UNIX_EPOCH) {
        Ok(elapsed) => elapsed.as_millis() as i64,
        Err(err) => -(err.duration().as_millis() as i64),
    };
    iso_string(millis)
}

/// Pieces of a timestamp for zip headers: (year, month, day, hour, minute, second).
pub fn civil_time(time: SystemTime) -> (i64, u32, u32, u32, u32, u32) {
    let seconds = time
        .duration_since(UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs() as i64)
        .unwrap_or(0);
    let (year, month, day) = civil_from_days(seconds.div_euclid(86_400));
    let day_seconds = seconds.rem_euclid(86_400) as u32;
    (
        year,
        month,
        day,
        day_seconds / 3600,
        day_seconds / 60 % 60,
        day_seconds % 60,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_iso_strings() {
        assert_eq!(iso_string(0), "1970-01-01T00:00:00.000Z");
        assert_eq!(iso_string(1_791_811_426_123), "2026-10-12T13:23:46.123Z");
        assert_eq!(iso_string(951_782_400_000), "2000-02-29T00:00:00.000Z");
        assert_eq!(iso_string(-1), "1969-12-31T23:59:59.999Z");
    }
}
