import { formatDate } from '@angular/common';

/**
 * Convert various inputs (Date, ISO string, etc.) to a local 'YYYY-MM-DD' string suitable for sending as LocalDate.
 * Returns undefined when input cannot be parsed.
 */
export function formatToLocalDateString(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  let d: Date | null = null;
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) d = parsed;
  } else if (v instanceof Date) {
    if (!isNaN(v.getTime())) d = v;
  } else {
    try {
      const coerced = new Date((v as any));
      if (!isNaN(coerced.getTime())) d = coerced;
    } catch {
      d = null;
    }
  }
  if (!d) return undefined;
  // Use Angular's formatDate to produce deterministic yyyy-MM-dd
  return formatDate(d, 'yyyy-MM-dd', 'en-US');
}

/**
 * Parse a 'YYYY-MM-DD' local date string into a Date (local) object.
 * Returns null when string is invalid.
 */
export function parseIsoLocalDate(s?: string): Date | null {
  if (!s) return null;
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mm = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mm, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mm || dt.getDate() !== d) return null;
  return dt;
}
