export function formatRelativeTime(
  timestampSec: number,
  nowSec: number = Math.floor(Date.now() / 1000),
): string {
  const delta = nowSec - timestampSec;
  if (delta < 60) return 'just now';
  if (delta < 3600) {
    const m = Math.floor(delta / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (delta < 86400) {
    const h = Math.floor(delta / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (delta < 86400 * 30) {
    const d = Math.floor(delta / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(delta / (86400 * 30));
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
