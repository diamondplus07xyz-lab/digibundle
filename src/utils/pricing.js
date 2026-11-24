// Utility for calculating cart subtotal, smart combo discounts, and final pricing

export function calculateCartPricing(items = []) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      finalTotal: 0,
      comboBadge: '',
      itemsCount: 0,
      nextTierMessage: 'Add bundles to get combo discounts'
    };
  }

  const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  let discount = 0;
  let comboBadge = '';
  let nextTierMessage = '';

  if (items.length === 1) {
    discount = 0;
    nextTierMessage = '⚡ Add 1 more bundle to unlock 15% Combo Discount!';
  } else if (items.length === 2) {
    discount = Math.round(subtotal * 0.15); // 15% discount for 2 items
    comboBadge = '🔥 15% Double-Bundle Combo Applied!';
    nextTierMessage = '🚀 Add 1 more to unlock 25% Super Combo Discount!';
  } else if (items.length >= 3) {
    discount = Math.round(subtotal * 0.25); // 25% discount for 3+ items
    comboBadge = '🎉 25% Super Creator Combo Applied!';
    nextTierMessage = '✨ Maximum Bulk Discount Active!';
  }

  const finalTotal = Math.max(1, subtotal - discount);

  return {
    subtotal,
    discount,
    finalTotal,
    comboBadge,
    itemsCount: items.length,
    nextTierMessage
  };
}
