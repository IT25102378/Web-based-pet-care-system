// =============================================================================
// Shared validation rules.
//
// Each rule is defined here once and imported wherever a value is checked, so
// the same wording and the same limits apply across every form. The backend
// keeps a matching copy in com.petnexus.backend.validation.ValidationRules.
// =============================================================================

/**
 * An address with no spaces, one @, and a dot in the part after it.
 * Deliberately permissive: the goal is to catch a typo before the form is
 * submitted, not to police which addresses exist.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shown whenever an email fails the rule above. */
export const EMAIL_MESSAGE =
  'Enter a valid email address, for example name@example.com, and try again';

/**
 * Checks an email against the shared rule.
 * Returns an error message, or null when the address is acceptable.
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email address is required';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return EMAIL_MESSAGE;
  }
  return null;
}

/** Minimum number of characters in a password. */
export const PASSWORD_MIN_LENGTH = 6;

/** At least six characters, containing at least one letter and one digit. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

/** Shown whenever a password fails the rule above. */
export const PASSWORD_MESSAGE =
  'Password must be at least 6 characters and include at least one letter and one number';

/**
 * Checks a password against the shared rule.
 * Returns an error message, or null when the password is acceptable.
 */
export function validatePassword(password) {
  if (!password || !PASSWORD_PATTERN.test(password)) {
    return PASSWORD_MESSAGE;
  }
  return null;
}

/**
 * Checks that a password and its confirmation are identical.
 * Returns an error message, or null when they match.
 */
export function validatePasswordConfirmation(password, confirmation) {
  if (password !== confirmation) {
    return 'Passwords do not match';
  }
  return null;
}
