/**
 * Comprehensive Multi-Currency & Geolocation Engine for CheapReels.in
 * Automatic Country & Currency Localization:
 * - India: INR (₹49 to ₹299 range, GTA 6: ₹99)
 * - USA & Global: USD ($10 to $99 range, GTA 6: $19.99 USD)
 * - UK: GBP (£8 to £79 range, GTA 6: £15.99 GBP)
 * - Europe: EUR (€9 to €89 range, GTA 6: €17.99 EUR)
 * - Canada: CAD (CA$14 to CA$135 range, GTA 6: CA$26.99 CAD)
 * - Australia: AUD (A$15 to A$149 range, GTA 6: A$29.99 AUD)
 * - UAE: AED (39 AED to 360 AED range, GTA 6: 75 AED)
 * - Saudi Arabia: SAR (39 SAR to 370 SAR range, GTA 6: 75 SAR)
 * - Japan: JPY (¥1,500 to ¥15,000 range, GTA 6: ¥2,999 JPY)
 * - Brazil: BRL (R$ 50 to R$ 499 range, GTA 6: R$ 99 BRL)
 * - Mexico: MXN (MX$ 199 to MX$ 1,999 range, GTA 6: MX$ 399 MXN)
 * - Singapore: SGD (SG$14 to SG$135 range, GTA 6: SG$26.99 SGD)
 * - New Zealand: NZD (NZ$16 to NZ$159 range, GTA 6: NZ$32.99 NZD)
 * - South Africa: ZAR (R 180 to R 1,790 range, GTA 6: R 360 ZAR)
 * 
 * Strict Single-Currency Isolation: Visitors from a country ONLY see their country's currency.
 */

export const SUPPORTED_CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateFromUsd: 86.5,
    minPrice: 49,
    maxPrice: 299,
    gtaPrice: 99,
    gtaOriginal: 999,
    masterPrice: 299,
    masterOriginal: 2999,
    format: (amt) => `₹${Math.round(amt)}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateFromUsd: 1,
    minPrice: 10,
    maxPrice: 99,
    gtaPrice: 19.99,
    gtaOriginal: 79.99,
    masterPrice: 99,
    masterOriginal: 299,
    format: (amt) => `$${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} USD`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateFromUsd: 0.79,
    minPrice: 8,
    maxPrice: 79,
    gtaPrice: 15.99,
    gtaOriginal: 64.99,
    masterPrice: 79,
    masterOriginal: 249,
    format: (amt) => `£${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} GBP`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateFromUsd: 0.95,
    minPrice: 9,
    maxPrice: 89,
    gtaPrice: 17.99,
    gtaOriginal: 74.99,
    masterPrice: 89,
    masterOriginal: 279,
    format: (amt) => `€${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} EUR`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rateFromUsd: 1.40,
    minPrice: 14,
    maxPrice: 135,
    gtaPrice: 26.99,
    gtaOriginal: 109.99,
    masterPrice: 135,
    masterOriginal: 399,
    format: (amt) => `CA$${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} CAD`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rateFromUsd: 1.55,
    minPrice: 15,
    maxPrice: 149,
    gtaPrice: 29.99,
    gtaOriginal: 119.99,
    masterPrice: 149,
    masterOriginal: 449,
    format: (amt) => `A$${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} AUD`,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rateFromUsd: 3.67,
    minPrice: 39,
    maxPrice: 360,
    gtaPrice: 75,
    gtaOriginal: 299,
    masterPrice: 360,
    masterOriginal: 1099,
    format: (amt) => `${Math.round(amt)} AED`,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    rateFromUsd: 3.75,
    minPrice: 39,
    maxPrice: 370,
    gtaPrice: 75,
    gtaOriginal: 299,
    masterPrice: 370,
    masterOriginal: 1120,
    format: (amt) => `${Math.round(amt)} SAR`,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rateFromUsd: 152,
    minPrice: 1500,
    maxPrice: 15000,
    gtaPrice: 2999,
    gtaOriginal: 12000,
    masterPrice: 15000,
    masterOriginal: 45000,
    format: (amt) => `¥${Math.round(amt).toLocaleString()} JPY`,
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$ ',
    name: 'Brazilian Real',
    flag: '🇧🇷',
    rateFromUsd: 5.80,
    minPrice: 50,
    maxPrice: 499,
    gtaPrice: 99,
    gtaOriginal: 399,
    masterPrice: 499,
    masterOriginal: 1499,
    format: (amt) => `R$ ${Math.round(amt)} BRL`,
  },
  MXN: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    flag: '🇲🇽',
    rateFromUsd: 20.2,
    minPrice: 199,
    maxPrice: 1999,
    gtaPrice: 399,
    gtaOriginal: 1599,
    masterPrice: 1999,
    masterOriginal: 5999,
    format: (amt) => `MX$ ${Math.round(amt)} MXN`,
  },
  SGD: {
    code: 'SGD',
    symbol: 'SG$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    rateFromUsd: 1.35,
    minPrice: 14,
    maxPrice: 135,
    gtaPrice: 26.99,
    gtaOriginal: 109.99,
    masterPrice: 135,
    masterOriginal: 399,
    format: (amt) => `SG$${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} SGD`,
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    flag: '🇳🇿',
    rateFromUsd: 1.70,
    minPrice: 16,
    maxPrice: 159,
    gtaPrice: 32.99,
    gtaOriginal: 129.99,
    masterPrice: 159,
    masterOriginal: 479,
    format: (amt) => `NZ$${Number(amt).toFixed(amt % 1 === 0 ? 0 : 2)} NZD`,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R ',
    name: 'South African Rand',
    flag: '🇿🇦',
    rateFromUsd: 18.1,
    minPrice: 180,
    maxPrice: 1790,
    gtaPrice: 360,
    gtaOriginal: 1490,
    masterPrice: 1790,
    masterOriginal: 5400,
    format: (amt) => `R ${Math.round(amt)} ZAR`,
  }
};

export const COUNTRY_PROFILES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', lang: 'en', nativeLang: 'English / हिन्दी' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', lang: 'en', nativeLang: 'English' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', lang: 'en', nativeLang: 'English' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', lang: 'en', nativeLang: 'English / Français' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', lang: 'en', nativeLang: 'English' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', lang: 'de', nativeLang: 'Deutsch' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', lang: 'fr', nativeLang: 'Français' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', lang: 'es', nativeLang: 'Español' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', lang: 'it', nativeLang: 'Italiano' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', lang: 'en', nativeLang: 'Nederlands / English' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', lang: 'ar', nativeLang: 'العربية' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', lang: 'ar', nativeLang: 'العربية' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', lang: 'ja', nativeLang: '日本語' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', lang: 'pt', nativeLang: 'Português' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', lang: 'es', nativeLang: 'Español' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', lang: 'en', nativeLang: 'English' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', lang: 'en', nativeLang: 'English' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', lang: 'en', nativeLang: 'English' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'USD', lang: 'ru', nativeLang: 'Русский' }
];

const TIMEZONE_TO_COUNTRY = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Vienna': 'DE',
  'Europe/Zurich': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Brussels': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Lisbon': 'PT',
  'Europe/Dublin': 'GB',
  'Europe/Moscow': 'RU',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Detroit': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Asia/Dubai': 'AE',
  'Asia/Muscat': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Kuwait': 'SA',
  'Asia/Qatar': 'AE',
  'Asia/Tokyo': 'JP',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
  'Asia/Singapore': 'SG',
  'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA'
};

/**
 * Detect User Country
 */
export function detectUserCountry() {
  if (typeof window === 'undefined') return 'IN';

  try {
    // 1. URL Query Override (instant testing)
    const urlParams = new URLSearchParams(window.location.search);
    const qCountry = urlParams.get('country');
    if (qCountry) {
      const match = COUNTRY_PROFILES.find(c => c.code.toLowerCase() === qCountry.toLowerCase());
      if (match) return match.code;
      if (qCountry.toLowerCase() === 'uk') return 'GB';
    }
    const qCurrency = (urlParams.get('currency') || '').toUpperCase();
    if (qCurrency) {
      if (qCurrency === 'INR') return 'IN';
      if (qCurrency === 'GBP') return 'GB';
      if (qCurrency === 'EUR') return 'DE';
      if (qCurrency === 'CAD') return 'CA';
      if (qCurrency === 'AUD') return 'AU';
      if (qCurrency === 'AED') return 'AE';
      if (qCurrency === 'SAR') return 'SA';
      if (qCurrency === 'JPY') return 'JP';
      if (qCurrency === 'BRL') return 'BR';
      if (qCurrency === 'MXN') return 'MX';
      if (qCurrency === 'SGD') return 'SG';
      if (qCurrency === 'NZD') return 'NZ';
      if (qCurrency === 'ZAR') return 'ZA';
      if (qCurrency === 'USD') return 'US';
    }
    if (urlParams.get('intl') === '1') return 'US';

    // 2. Saved user preference
    const saved = localStorage.getItem('cheap_reels_user_country');
    if (saved && COUNTRY_PROFILES.some(c => c.code === saved)) {
      return saved;
    }

    // 3. Browser TimeZone detection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz) {
      if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) return 'IN';
      if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
      
      // Broader timezone matches
      if (tz.startsWith('Europe/')) return 'DE'; // Eurozone default
      if (tz.startsWith('America/')) {
        if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'CA';
        if (tz.includes('Sao_Paulo') || tz.includes('Buenos_Aires')) return 'BR';
        return 'US';
      }
      if (tz.startsWith('Australia/')) return 'AU';
      if (tz.startsWith('Asia/')) {
        if (tz.includes('Tokyo')) return 'JP';
        if (tz.includes('Dubai') || tz.includes('Abu_Dhabi')) return 'AE';
        if (tz.includes('Riyadh')) return 'SA';
        if (tz.includes('Singapore')) return 'SG';
      }
    }

    // 4. Browser Language Detection
    const navLang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
    if (navLang.includes('-in') || navLang === 'hi' || navLang === 'mr' || navLang === 'ta' || navLang === 'te') return 'IN';
    if (navLang.includes('-gb')) return 'GB';
    if (navLang.includes('-ca')) return 'CA';
    if (navLang.includes('-au')) return 'AU';
    if (navLang.includes('-de') || navLang.startsWith('de')) return 'DE';
    if (navLang.includes('-fr') || navLang.startsWith('fr')) return 'FR';
    if (navLang.includes('-es') || navLang.startsWith('es')) return 'ES';
    if (navLang.includes('-it') || navLang.startsWith('it')) return 'IT';
    if (navLang.includes('-ae') || navLang.startsWith('ar')) return 'AE';
    if (navLang.includes('-jp') || navLang.startsWith('ja')) return 'JP';
    if (navLang.includes('-br') || navLang.startsWith('pt')) return 'BR';

    // Default to India for domestic or US for international
    return 'US';
  } catch (e) {
    return 'IN';
  }
}

/**
 * Get Active Country Code
 */
export function getUserCountry() {
  return detectUserCountry();
}

/**
 * Get Active Currency Config
 */
export function getUserCurrency() {
  const country = getUserCountry();
  const profile = COUNTRY_PROFILES.find(p => p.code === country) || COUNTRY_PROFILES.find(p => p.code === 'US');
  const currencyCode = profile ? profile.currency : 'USD';
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
}

/**
 * Set User Country (user manually switches)
 */
export function setUserCountry(countryCode) {
  if (typeof window === 'undefined') return;
  try {
    const profile = COUNTRY_PROFILES.find(p => p.code === countryCode);
    if (profile) {
      localStorage.setItem('cheap_reels_user_country', profile.code);
      localStorage.setItem('cheap_reels_user_currency', profile.currency);
      localStorage.setItem('cheap_reels_user_lang', profile.lang);

      // Clear any URL query overrides so manual switcher always wins immediately
      try {
        const url = new URL(window.location.href);
        let changed = false;
        ['country', 'currency', 'intl', 'lang'].forEach(param => {
          if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            changed = true;
          }
        });
        if (changed) {
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('country_changed', { detail: profile }));
    }
  } catch (e) {}
}

/**
 * Boolean Check for International Visitors (Keeps 100% backward compatibility)
 */
export function isInternationalVisitor() {
  const country = getUserCountry();
  return country !== 'IN';
}

/**
 * Check if item is GTA 6
 */
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

/**
 * Base USD price for an item
 */
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

/**
 * Get item price in the active user currency
 */
export function getBundleLocalPrice(item, currencyCode = null) {
  const currency = currencyCode ? (SUPPORTED_CURRENCIES[currencyCode] || getUserCurrency()) : getUserCurrency();
  
  if (currency.code === 'INR') {
    if (isGtaItem(item)) return 99;
    return Math.min(299, Math.max(49, Number(item?.price) || 49));
  }

  if (isGtaItem(item)) {
    return currency.gtaPrice;
  }

  const usdPrice = getBundleUsdPrice(item);
  const rawLocal = usdPrice * currency.rateFromUsd;
  
  if (currency.code === 'USD') return usdPrice;
  if (currency.code === 'GBP' || currency.code === 'EUR' || currency.code === 'CAD' || currency.code === 'AUD' || currency.code === 'SGD' || currency.code === 'NZD') {
    return Number(Math.max(currency.minPrice, Math.min(currency.maxPrice, rawLocal)).toFixed(amt => amt % 1 === 0 ? 0 : 2));
  }
  
  return Math.round(Math.max(currency.minPrice, Math.min(currency.maxPrice, rawLocal)));
}

/**
 * Calculate Cart Total in USD (Backward compatibility for PayPal)
 */
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

/**
 * Calculate Cart Total in User's Active Currency
 */
export function calculateLocalTotal(items = [], currencyCode = null) {
  const currency = currencyCode ? (SUPPORTED_CURRENCIES[currencyCode] || getUserCurrency()) : getUserCurrency();

  if (!items || items.length === 0) {
    return currency.minPrice;
  }

  if (currency.code === 'INR') {
    let totalInr = 0;
    items.forEach(it => {
      totalInr += isGtaItem(it) ? 99 : Math.min(299, Math.max(49, Number(it?.price) || 49));
    });
    if (items.length === 2) totalInr = Math.round(totalInr * 0.9);
    else if (items.length >= 3) totalInr = Math.round(totalInr * 0.8);
    return Math.max(49, totalInr);
  }

  let totalLocal = 0;
  items.forEach(it => {
    totalLocal += Number(getBundleLocalPrice(it, currency.code)) || currency.minPrice;
  });

  if (items.length === 2) {
    totalLocal = totalLocal * 0.85;
  } else if (items.length >= 3) {
    totalLocal = totalLocal * 0.75;
  }

  if (['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'NZD'].includes(currency.code)) {
    return Number(Math.max(currency.minPrice, totalLocal).toFixed(2));
  }
  return Math.round(Math.max(currency.minPrice, totalLocal));
}

/**
 * Comprehensive Display Object for Components
 */
export function getItemPriceDisplay(item, forceInternational = false) {
  const currency = getUserCurrency();
  const isGta = isGtaItem(item);

  // If Indian visitor
  if (currency.code === 'INR' && !forceInternational) {
    if (isGta) {
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

    const inrPrice = Math.min(299, Math.max(49, Number(item?.price) || 49));
    const inrOriginal = item?.originalPrice && item.originalPrice > inrPrice 
      ? item.originalPrice 
      : Math.round(inrPrice * 10);

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

  // Non-INR Visitors (USD, GBP, EUR, CAD, AUD, AED, SAR, JPY, etc.)
  if (isGta) {
    return {
      currency: currency.code,
      symbol: currency.symbol,
      price: currency.gtaPrice,
      originalPrice: currency.gtaOriginal,
      formattedPrice: currency.format(currency.gtaPrice),
      formattedOriginalPrice: currency.format(currency.gtaOriginal),
      discountPercent: Math.round(((currency.gtaOriginal - currency.gtaPrice) / currency.gtaOriginal) * 100),
      isGta: true
    };
  }

  const localPrice = getBundleLocalPrice(item, currency.code);
  const origMultiplier = 4;
  const localOriginal = Math.round(localPrice * origMultiplier);

  return {
    currency: currency.code,
    symbol: currency.symbol,
    price: localPrice,
    originalPrice: localOriginal,
    formattedPrice: currency.format(localPrice),
    formattedOriginalPrice: currency.format(localOriginal),
    discountPercent: Math.round(((localOriginal - localPrice) / localOriginal) * 100),
    isGta: false
  };
}
