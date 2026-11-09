import { getScoreTier } from './scoreUtils';

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatScore(score) {
  return typeof score === 'number' && !Number.isNaN(score) ? Math.round(score) : '—';
}

// Unified score tone derived from scoreUtils
export function scoreTone(score) {
  const tier = getScoreTier(score);
  return {
    label: tier.label,
    text: tier.text,
    bg: tier.bg,
    color: tier.color,
  };
}
