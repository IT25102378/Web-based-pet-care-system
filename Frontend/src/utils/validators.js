// =============================================================================
// Shared form validation rules — used by every form so the same rule always
// produces the same message. Each validator returns an error message string,
// or null when the value is valid.
//
// These mirror the backend rules in
// Backend/.../validation/ValidationRules.java and the request DTO annotations.
// =============================================================================

export const PHONE_REGEX = /^0\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PERSON_NAME_REGEX = /^[\p{L}][\p{L} .,'-]*$/u;
export const PET_NAME_REGEX = /^[\p{L}\d][\p{L}\d .'()-]*$/u;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const PHONE_MESSAGE = 'Phone number must be exactly 10 digits and start with 0 (e.g. 0771234567)';
export const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include a letter and a number';

const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';

/** Today's date as yyyy-MM-dd in local time (for date inputs' min / max). */
export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function validateRequired(value, label) {
  return isBlank(value) ? `${label} is required` : null;
}

/** Free text with optional minimum / maximum length. */
export function validateText(value, { label, required = false, min = 0, max = Infinity } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  const len = String(value).trim().length;
  if (len < min) return `${label} must be at least ${min} characters`;
  if (len > max) return `${label} cannot be longer than ${max} characters`;
  return null;
}

/** Exactly 10 digits starting with 0. Spaces, dashes, letters and +94 are rejected, not stripped. */
export function validatePhone(value, { required = false, label = 'Phone number' } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  return PHONE_REGEX.test(String(value).trim()) ? null : PHONE_MESSAGE;
}

export function validateEmail(value, { required = true, label = 'Email address' } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  if (String(value).trim().length > 255) return `${label} cannot be longer than 255 characters`;
  return EMAIL_REGEX.test(String(value).trim()) ? null : 'Please enter a valid email address (e.g. name@example.com)';
}

export function validatePersonName(value, { required = true, label = 'Full name', min = 3, max = 150 } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  const v = String(value).trim();
  if (v.length < min) return `${label} must be at least ${min} characters`;
  if (v.length > max) return `${label} cannot be longer than ${max} characters`;
  return PERSON_NAME_REGEX.test(v) ? null : `${label} can only contain letters, spaces and . , ' -`;
}

export function validatePetName(value, { required = true, label = 'Pet name', max = 100 } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  const v = String(value).trim();
  if (v.length > max) return `${label} cannot be longer than ${max} characters`;
  return PET_NAME_REGEX.test(v) ? null : `${label} can only contain letters, numbers, spaces and . ' - ( )`;
}

export function validatePassword(value, { label = 'Password' } = {}) {
  if (isBlank(value)) return `${label} is required`;
  return PASSWORD_REGEX.test(String(value)) ? null : PASSWORD_MESSAGE;
}

export function validatePasswordMatch(password, confirm) {
  if (isBlank(confirm)) return 'Please confirm your password';
  return password === confirm ? null : 'Passwords do not match';
}

/**
 * Numeric range check.
 * @param {object} opts label, required, min, max, integer, greaterThanZero, unit
 */
export function validateNumber(value, { label, required = false, min, max, integer = false, greaterThanZero = false, unit = '' } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  const n = Number(value);
  const suffix = unit ? ` ${unit}` : '';
  if (Number.isNaN(n) || !Number.isFinite(n)) return `${label} must be a valid number`;
  if (integer && !Number.isInteger(n)) return `${label} must be a whole number`;
  if (greaterThanZero && n <= 0) return `${label} must be greater than 0${suffix}`;
  if (min !== undefined && max !== undefined && (n < min || n > max)) return `${label} must be between ${min} and ${max}${suffix}`;
  if (min !== undefined && n < min) return min === 0 ? `${label} cannot be negative` : `${label} must be at least ${min}${suffix}`;
  if (max !== undefined && n > max) return `${label} cannot be more than ${max}${suffix}`;
  return null;
}

/** Date must be today or earlier (e.g. date of birth, vaccination date, intake date). */
export function validateNotFutureDate(value, { label, required = false } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  return String(value) > todayISO() ? `${label} cannot be in the future` : null;
}

/** Date must be today or later (e.g. appointment date, follow-up date, expiry date). */
export function validateNotPastDate(value, { label, required = false } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  return String(value) < todayISO() ? `${label} cannot be in the past` : null;
}

/** `later` must be strictly after `earlier` (both yyyy-MM-dd). */
export function validateDateAfter(later, earlier, { label, otherLabel } = {}) {
  if (isBlank(later) || isBlank(earlier)) return null;
  return String(later) > String(earlier) ? null : `${label} must be after the ${otherLabel}`;
}

/** Date must fall within a window around today (e.g. a service log: one year back, one year ahead). */
export function validateDateWithin(value, { label, required = false, pastDays = 365, futureDays = 365 } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  if (String(value) < isoDaysFromToday(-pastDays)) return `${label} cannot be more than ${describeDays(pastDays)} in the past`;
  if (String(value) > isoDaysFromToday(futureDays)) return `${label} cannot be more than ${describeDays(futureDays)} in the future`;
  return null;
}

const describeDays = (days) => (days % 365 === 0 ? `${days / 365} year${days === 365 ? '' : 's'}` : `${days} days`);

/** yyyy-MM-dd for today plus `days` (negative for the past). */
export function isoDaysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Emergency contact: free text that must include a reachable phone number
 * (10 digits starting with 0), e.g. "Nimal Perera (Brother) - 0771234567".
 */
export function validateEmergencyContact(value, { required = false, label = 'Emergency contact', max = 200 } = {}) {
  if (isBlank(value)) return required ? `${label} is required` : null;
  const v = String(value).trim();
  if (v.length > max) return `${label} cannot be longer than ${max} characters`;
  if (v === 'Not provided') return null;
  return v.length >= 5 && /(?<!\d)0\d{9}(?!\d)/.test(v)
    ? null
    : `${label} must include a 10-digit phone number starting with 0 (e.g. Nimal Perera - 0771234567)`;
}

/** Age in whole years and months for a yyyy-MM-dd date of birth, or null when it is empty / in the future. */
export function ageFromBirthDate(dateOfBirth) {
  if (isBlank(dateOfBirth) || String(dateOfBirth) > todayISO()) return null;
  const [y, m, d] = String(dateOfBirth).split('-').map(Number);
  const now = new Date();
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** The age typed in must agree with the date of birth (one month of leeway). */
export function validateAgeMatchesBirthDate(ageYears, ageMonths, dateOfBirth) {
  const actual = ageFromBirthDate(dateOfBirth);
  if (!actual || isBlank(ageYears)) return null;
  const given = Number(ageYears) * 12 + (Number(ageMonths) || 0);
  return Math.abs(given - (actual.years * 12 + actual.months)) <= 1
    ? null
    : `Age does not match the date of birth - a pet born on ${dateOfBirth} is ${plural(actual.years, 'year')} and ${plural(actual.months, 'month')} old`;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Removes empty entries so `Object.keys(errors).length === 0` means "valid". */
export function collectErrors(candidates) {
  const errors = {};
  Object.entries(candidates).forEach(([field, message]) => {
    if (message) errors[field] = message;
  });
  return errors;
}

/** Convenience for number inputs: '' -> null so an empty box isn't sent as 0. */
export function numberOrNull(value) {
  return isBlank(value) ? null : Number(value);
}

/** Returns the first error message from a list of validator results, or null when all passed. */
export function firstError(...messages) {
  return messages.find((m) => Boolean(m)) || null;
}
