// =============================================================================
// Stock level of an inventory item as a percentage of its minimum threshold.
//
//   currentStock 5,  minStockThreshold 10  ->  50   (half of the minimum)
//   currentStock 20, minStockThreshold 10  ->  200  (twice the minimum)
//
// Used to sort the Stock Level column, so items closest to running out come
// first in ascending order no matter how many units each one is counted in.
// It is recalculated from the current values every time, so editing the stock
// or the threshold changes an item's position straight away.
// =============================================================================
export function stockPercentage(item) {
  const current = Number(item.currentStock) || 0;
  const minimum = Number(item.minStockThreshold) || 0;
  // With no minimum set the item can never be low, so it sorts after every other item
  if (minimum <= 0) return current > 0 ? Infinity : 0;
  return (current / minimum) * 100;
}
