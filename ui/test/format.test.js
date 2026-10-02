import { expect, test } from 'imp/test'
import {
  formatFileSize,
  formatOctalPermissions,
  formatPermissions,
  formatRelativeTime,
  pluralize,
} from '../src/lib/format.js'

test('formats sizes with one decimal below a hundred units', () => {
  expect(formatFileSize(0)).toEqual('0 B')
  expect(formatFileSize(1536)).toEqual('1.5 KB')
  expect(formatFileSize(150 * 1024)).toEqual('150 KB')
  expect(formatFileSize(5 * 1024 ** 3)).toEqual('5 GB')
  expect(formatFileSize(null)).toEqual('')
})

test('renders unix modes like ls', () => {
  expect(formatPermissions(0o755, false, false)).toEqual('-rwxr-xr-x')
  expect(formatPermissions(0o40775, true, false)).toEqual('drwxrwxr-x')
  expect(formatPermissions(0o777, false, true)).toEqual('lrwxrwxrwx')
  expect(formatPermissions(0o4755, false, false)).toEqual('-rwsr-xr-x')
  expect(formatPermissions(0o1777, true, false)).toEqual('drwxrwxrwt')
  expect(formatPermissions(null, false, false)).toEqual('')
  expect(formatOctalPermissions(0o100644)).toEqual('0644')
})

test('describes the age of a timestamp', () => {
  const now = Date.parse('2026-10-02T12:00:00Z')
  expect(formatRelativeTime('2026-10-02T11:59:50Z', now)).toEqual('just now')
  expect(formatRelativeTime('2026-10-02T11:00:00Z', now)).toEqual('1 hour ago')
  expect(formatRelativeTime('2026-09-29T12:00:00Z', now)).toEqual('3 days ago')
  expect(formatRelativeTime(null, now)).toEqual('')
})

test('pluralizes a count', () => {
  expect(pluralize(1, 'file')).toEqual('1 file')
  expect(pluralize(3, 'folder')).toEqual('3 folders')
})
