import { formatRelativeTime } from './formatRelativeTime.js';

const NOW = 1_700_000_000;

describe('formatRelativeTime', () => {
  it('returns "just now" for <60s deltas', () => {
    expect(formatRelativeTime(NOW - 5, NOW)).toBe('just now');
    expect(formatRelativeTime(NOW - 59, NOW)).toBe('just now');
  });

  it('returns minutes for <60min deltas', () => {
    expect(formatRelativeTime(NOW - 60, NOW)).toBe('1 minute ago');
    expect(formatRelativeTime(NOW - 60 * 5, NOW)).toBe('5 minutes ago');
    expect(formatRelativeTime(NOW - 60 * 59, NOW)).toBe('59 minutes ago');
  });

  it('returns hours for <24h deltas', () => {
    expect(formatRelativeTime(NOW - 3600, NOW)).toBe('1 hour ago');
    expect(formatRelativeTime(NOW - 3600 * 5, NOW)).toBe('5 hours ago');
  });

  it('returns days for <30d deltas', () => {
    expect(formatRelativeTime(NOW - 86400, NOW)).toBe('1 day ago');
    expect(formatRelativeTime(NOW - 86400 * 7, NOW)).toBe('7 days ago');
  });

  it('returns months for older deltas', () => {
    expect(formatRelativeTime(NOW - 86400 * 35, NOW)).toBe('1 month ago');
    expect(formatRelativeTime(NOW - 86400 * 100, NOW)).toBe('3 months ago');
  });

  it('clamps future timestamps to "just now"', () => {
    expect(formatRelativeTime(NOW + 60, NOW)).toBe('just now');
  });
});
