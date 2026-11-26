/**
 * Universal JSON-LD Structured Data Infrastructure for Cheap Reels (cheapreels.in)
 * Follows schema.org standards for Google Rich Snippets & AI Semantic Knowledge Graph
 * (Organization, WebSite, Product, Offer, BreadcrumbList, FAQPage, HowTo)
 */

export const PRIMARY_DOMAIN = 'https://www.cheapreels.in';

export function getOrganizationSchema(config = {}) {
  const storeName = config.storeName || 'Cheap Reels';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${PRIMARY_DOMAIN}/#organization`,
    'name': storeName,
    'alternateName': ['CheapReels', 'Cheap Reels Store', 'CheapReels.in'],
    'url': PRIMARY_DOMAIN,
    'logo': {
      '@type': 'ImageObject',
      'url': `${PRIMARY_DOMAIN}/logo.png`,
      'caption': `${storeName} Official Logo`
    },
    'image': `${PRIMARY_DOMAIN}/social-share.png`,
    'description': "India's premier digital store for ready-to-post 1080p Full HD watermark-free vertical reels bundles across 130+ viral niches with instant Google Drive cloud link access.",
    'foundingDate': '2024',
    'founder': {
      '@type': 'Person',
      'name': 'Vivek'
    },
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': '+91-7017324978',
        'contactType': 'customer service',
        'email': config.supportEmail || 'reelscheap@gmail.com',
        'availableLanguage': ['English', 'Hindi'],
        'areaServed': 'IN'
      }
    ],
    'sameAs': [
      'https://www.instagram.com/cheapreels_in?gwpx=dHoyeXJqdGdudTVj',
      'https://www.youtube.com'
    ],
    'priceRange': '₹29 - ₹999'
  };
}

export function getWebSiteSchema(config = {}) {
  const storeName = config.storeName || 'Cheap Reels';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${PRIMARY_DOMAIN}/#website`,
    'name': storeName,
    'url': PRIMARY_DOMAIN,
    'description': 'Download 2,50,000+ Ready-to-Post 1080p Full HD Viral Reels Bundles with Instant Google Drive Access.',
    'publisher': {
      '@id': `${PRIMARY_DOMAIN}/#organization`
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${PRIMARY_DOMAIN}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    'inLanguage': 'en-IN'
  };
}

export function getProductSchema(bundle, config = {}) {
  if (!bundle) return null;
  const storeName = config.storeName || 'Cheap Reels';
  const price = bundle.price || 39;
  const originalPrice = bundle.originalPrice || 799;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${PRIMARY_DOMAIN}/bundle/${bundle.id}#product`,
    'name': bundle.title,
    'image': [
      bundle.thumbnail || `${PRIMARY_DOMAIN}/brand-icon.png`
    ],
    'description': bundle.subtitle || `${bundle.title} - 100% watermark-free ready-to-post 1080p Full HD reels bundle with instant Google Drive download link.`,
    'sku': bundle.id,
    'mpn': bundle.id,
    'brand': {
      '@type': 'Brand',
      'name': storeName
    },
    'offers': {
      '@type': 'Offer',
      'url': `${PRIMARY_DOMAIN}/bundle/${bundle.id}`,
      'priceCurrency': 'INR',
      'price': price,
      'priceValidUntil': '2027-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': storeName
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'applicableCountry': 'IN',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 7,
        'returnMethod': 'https://schema.org/ReturnByMail',
        'returnFees': 'https://schema.org/FreeReturn'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': bundle.rating || 4.88,
      'bestRating': '5',
      'worstRating': '1',
      'reviewCount': bundle.reviewsCount || 240
    },
    'category': bundle.categoryLabel || bundle.category || 'Digital Media'
  };
}

export function getBreadcrumbListSchema(crumbs = []) {
  const items = [
    { name: 'Home', url: PRIMARY_DOMAIN },
    ...crumbs
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': crumb.url.startsWith('http') ? crumb.url : `${PRIMARY_DOMAIN}${crumb.url}`
    }))
  };
}

export function getFAQPageSchema(faqs = []) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };
}

export function getHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Download and Post Ready-Made Reels from Cheap Reels',
    'description': 'Simple 3-step guide to purchasing, downloading, and scheduling watermark-free vertical reels to your Instagram, YouTube Shorts, or Facebook pages.',
    'step': [
      {
        '@type': 'HowToStep',
        'position': 1,
        'name': 'Select Your Niche Bundle',
        'text': 'Browse through 130+ viral niches such as AI Reels, Motivation, Devotional, or Fitness, and click Buy Now.'
      },
      {
        '@type': 'HowToStep',
        'position': 2,
        'name': 'Complete Quick UPI QR Payment',
        'text': 'Scan the dynamic UPI QR code on your phone using PhonePe, Google Pay, or Paytm and authorize the ₹29 to ₹49 transaction.'
      },
      {
        '@type': 'HowToStep',
        'position': 3,
        'name': 'Access Google Drive Folder Instantly',
        'text': 'Your lifetime Google Drive cloud folder link unlocks on-screen in 5 seconds and is sent to your WhatsApp. Download clips directly or sync to your cloud storage.'
      }
    ]
  };
}
