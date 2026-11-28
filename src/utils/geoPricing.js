/**
 * Dynamic Geo-Pricing Engine for CheapReels.in
 * Strict Country-Specific Currency Isolation:
 * - Indian visitors: INR (₹49 to ₹299 range) ONLY. No USD shown.
 * - International / Out-of-India visitors: USD ($10 to $99 range) ONLY. No INR shown.
 * - Specific Rule: GTA 6 is ₹99 for Indians, $19.99 USD for International.
 */

export function isInternationalVisitor() {
  if (typeof window === 'undefined') return false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('country') === 'us' || urlParams.get('currency') === 'usd' || urlParams.get('intl') === '1') return true;
    if (urlParams.get('country') === 'in' || urlParams.get('currency') === 'inr') return false;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (!tz) return false;
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function isGtaItem(item) {
  if (!item) return false;
  const id = String(item.id || '').toLowerCase();
  const title = String(item.title || '').toLowerCase();
  return id === 'bundle-1795711028475' || 
         id === 'bundle-127' || 
         id === 'special-offer-banner' || 
         id.includes('gta') || 
         title.includes('gta') || 
         title.includes('grand theft auto');
}

export function getBundleUsdPrice(item) {
  if (!item) return 10;
  if (isGtaItem(item)) return 19.99;
  
  if (item.usdPrice) {
    return Math.min(99, Math.max(10, Number(item.usdPrice)));
  }

  const inr = Number(item.price) || 49;
  if (inr <= 49) return 10;
  if (inr <= 79) return 15;
  if (inr <= 99) return 20;
  if (inr <= 119) return 29;
  if (inr <= 179) return 49;
  if (inr <= 249) return 79;
  return 99; // for inr >= 299 (Master Vault)
}

export function calculateUsdTotal(items = [], inrTotal = 0) {
  if (!items || items.length === 0) {
    return 10;
  }

  let totalUsd = 0;
  items.forEach(it => {
    totalUsd += getBundleUsdPrice(it);
  });

  // Apply Smart Combo Bulk Discounts for International Visitors
  if (items.length === 2) {
    totalUsd = totalUsd * 0.85; // 15% Double-Bundle Combo
  } else if (items.length >= 3) {
    totalUsd = totalUsd * 0.75; // 25% Super Creator Combo
  }

  return Number(Math.max(10, totalUsd).toFixed(2));
}

export function getItemPriceDisplay(item, forceInternational = false) {
  const isIntl = forceInternational || isInternationalVisitor();
  const isGta = isGtaItem(item);

  if (isGta) {
    if (isIntl) {
      return {
        currency: 'USD',
        symbol: '$',
        price: '19.99',
        originalPrice: '79.99',
        formattedPrice: '$19.99 USD',
        formattedOriginalPrice: '$79.99 USD',
        discountPercent: 75,
        isGta: true
      };
    }
    return {
      currency: 'INR',
      symbol: '₹',
      price: 99,
      originalPrice: 999,
      formattedPrice: '₹99',
      formattedOriginalPrice: '₹999',
      discountPercent: 90,
      isGta: true
    };
  }

  // Standard Non-GTA items
  const inrPrice = Math.min(299, Math.max(49, Number(item?.price) || 49));
  const inrOriginal = item?.originalPrice && item.originalPrice > inrPrice 
    ? item.originalPrice 
    : Math.round(inrPrice * 10);
  const usdPrice = getBundleUsdPrice(item);
  let origUsd = 49;
  if (usdPrice >= 79) origUsd = 199;
  else if (usdPrice >= 49) origUsd = 149;
  else if (usdPrice >= 29) origUsd = 99;
  else if (usdPrice >= 20) origUsd = 69;
  else if (usdPrice >= 15) origUsd = 59;
  if (usdPrice >= 99) origUsd = 299;

  if (isIntl) {
    return {
      currency: 'USD',
      symbol: '$',
      price: usdPrice,
      originalPrice: origUsd,
      formattedPrice: `$${usdPrice} USD`,
      formattedOriginalPrice: `$${origUsd} USD`,
      discountPercent: Math.round(((origUsd - usdPrice) / origUsd) * 100),
      isGta: false
    };
  }

  return {
    currency: 'INR',
    symbol: '₹',
    price: inrPrice,
    originalPrice: inrOriginal,
    formattedPrice: `₹${inrPrice}`,
    formattedOriginalPrice: `₹${inrOriginal}`,
    discountPercent: Math.round(((inrOriginal - inrPrice) / inrOriginal) * 100),
    isGta: false
  };
}
