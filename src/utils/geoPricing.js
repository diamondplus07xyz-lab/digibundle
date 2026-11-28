/**
 * Dynamic Geo-Pricing Engine for CheapReels.in
 * Indian visitors: INR (₹)
 * International / Out-of-India visitors: USD ($)
 * Specific Rule: GTA 6 is ₹99 for Indians, $19.99 USD for International.
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

export function calculateUsdTotal(items = [], inrTotal = 0) {
  if (!items || items.length === 0) {
    return Number((inrTotal || 149).toFixed(2));
  }

  let totalUsd = 0;
  items.forEach(it => {
    if (isGtaItem(it)) {
      totalUsd += 19.99;
    } else {
      totalUsd += Math.round(Number(it.price) || 49);
    }
  });

  // Apply Smart Combo Bulk Discounts for International Visitors (same tiers as INR cart)
  if (items.length === 2) {
    totalUsd = totalUsd * 0.85; // 15% Double-Bundle Combo
  } else if (items.length >= 3) {
    totalUsd = totalUsd * 0.75; // 25% Super Creator Combo
  }

  return Number(Math.max(1, totalUsd).toFixed(2));
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
        originalPrice: '49.99',
        formattedPrice: '$19.99 USD',
        formattedOriginalPrice: '$49.99 USD',
        discountPercent: 60,
        isGta: true
      };
    }
    return {
      currency: 'INR',
      symbol: '₹',
      price: 99,
      originalPrice: 799,
      formattedPrice: '₹99',
      formattedOriginalPrice: '₹799',
      intlNote: '$19.99 USD (Int\'l)',
      discountPercent: 88,
      isGta: true
    };
  }

  // Standard Non-GTA items
  if (isIntl) {
    const usdVal = Math.round(item.price || 49);
    const origUsd = Math.round(item.originalPrice || (usdVal * 2));
    return {
      currency: 'USD',
      symbol: '$',
      price: usdVal,
      originalPrice: origUsd,
      formattedPrice: `$${usdVal} USD`,
      formattedOriginalPrice: `$${origUsd} USD`,
      discountPercent: Math.round(((origUsd - usdVal) / origUsd) * 100),
      isGta: false
    };
  }

  return {
    currency: 'INR',
    symbol: '₹',
    price: item.price,
    originalPrice: item.originalPrice,
    formattedPrice: `₹${item.price}`,
    formattedOriginalPrice: `₹${item.originalPrice}`,
    intlNote: `$${Math.round(item.price)} USD (Int\'l)`,
    discountPercent: Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100),
    isGta: false
  };
}
