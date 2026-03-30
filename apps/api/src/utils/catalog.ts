export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCompactCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

export function formatDurationLabel(durationSec: number) {
  const safeDuration = Math.max(durationSec, 0);
  const minutes = Math.floor(safeDuration / 60);
  const seconds = safeDuration % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatPlayLabel(playCount: number) {
  return `${formatCompactCount(playCount)} plays`;
}

export function formatPriceLabel(priceCents: number) {
  return `$${(priceCents / 100).toFixed(0)}`;
}

export function formatEventDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    hour12: true
  }).format(date);
}

export function formatReleaseNote(releaseAt: Date) {
  const now = Date.now();
  const diffDays = Math.round((releaseAt.getTime() - now) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${diffDays} days to release`;
  if (diffDays === 1) return '1 day to release';
  if (diffDays === 0) return 'Releasing today';
  if (diffDays === -1) return 'Released yesterday';
  return 'Recently released';
}

export function deriveTrackTag(playCount: number, town?: string | null) {
  if (playCount >= 10_000) return 'Editorial pick';
  if (playCount >= 8_000) return 'Rising now';
  if (playCount >= 5_000 && town) return `Hot in ${town}`;
  return 'Fresh upload';
}
