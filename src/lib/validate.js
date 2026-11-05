import mongoose from 'mongoose';
import { CATEGORY_SLUGS } from '@/config/site';

export const isObjectId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id) && /^[a-f0-9]{24}$/i.test(id);

/** Trimmed string with control characters removed, or '' if not a string. */
export function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const isCategory = (v) => CATEGORY_SLUGS.includes(v);

export function intInRange(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}
