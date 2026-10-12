// =============================================================================
// Currency helpers — PetNexus works in Sri Lankan Rupees (LKR) everywhere.
// Use these instead of hard-coding a "$" so every page shows money the same way.
// =============================================================================

export const CURRENCY_CODE = 'LKR';
export const CURRENCY_SYMBOL = 'Rs.';

/** Label suffix for form fields, e.g. "Unit Cost (Rs.)". */
export const CURRENCY_LABEL = `(${CURRENCY_SYMBOL})`;

/**
 * Formats a number as Sri Lankan Rupees: 72000 -> "Rs. 72,000", 1500.5 -> "Rs. 1,500.50".
 * Whole amounts show no decimals; null / non-numeric input shows "Rs. 0".
 */
export const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${CURRENCY_SYMBOL} 0`;
  const hasCents = Math.abs(amount % 1) > 0;
  const text = amount.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL} ${text}`;
};
