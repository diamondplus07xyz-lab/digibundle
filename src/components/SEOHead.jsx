import React, { useEffect } from 'react';
import { 
  PRIMARY_DOMAIN,
  getOrganizationSchema, 
  getWebSiteSchema, 
  getProductSchema, 
  getBreadcrumbListSchema, 
  getFAQPageSchema, 
  getHowToSchema 
} from '../utils/seoStructuredData';

export default function SEOHead({ 
  config = {}, 
  activeCategory = 'all', 
  activeBundle = null, 
  searchQuery = '',
  categories = [],
  faqs = []
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Determine Dynamic Title & Description
    let pageTitle = config.seoTitle || 'Cheap Reels | 2,50,000+ Ready-to-Post HD Reels Bundles starting @ ₹29';
    let pageDescription = config.seoDescription || 'Download 2,50,000+ ready-to-post 1080p Full HD watermark-free vertical reels bundles across 130+ viral niches. Instant Google Drive cloud link access at flat 95% OFF!';
    let canonicalPath = '/';
    let breadcrumbs = [];

    if (activeBundle) {
      pageTitle = `${activeBundle.title} | Cheap Reels`;
      pageDescription = `Get ${activeBundle.clipCount || '1000+'} 1080p Full HD ${activeBundle.title}. No watermark, instant Google Drive link at just ₹${activeBundle.price}. Full commercial rights included.`;
      canonicalPath = `/bundle/${activeBundle.id}`;
      breadcrumbs = [
        { name: activeBundle.categoryLabel || 'Bundles', url: `/category/${activeBundle.category}` },
        { name: activeBundle.title, url: `/bundle/${activeBundle.id}` }
      ];
    } else if (activeCategory && activeCategory !== 'all') {
      const catObj = categories.find(c => c.id === activeCategory);
      const catName = catObj ? catObj.label : activeCategory;
      pageTitle = `${catName} Bundles (1080p Full HD Watermark Free) | Cheap Reels`;
      pageDescription = `Download premium viral ${catName} ready-to-post vertical video bundles. 100% watermark-free with instant Google Drive links starting at ₹29.`;
      canonicalPath = `/category/${activeCategory}`;
      breadcrumbs = [
        { name: catName, url: `/category/${activeCategory}` }
      ];
    } else if (searchQuery) {
      pageTitle = `Search: "${searchQuery}" Reels Bundles | Cheap Reels`;
      pageDescription = `Find viral 1080p Full HD ready-to-post reels bundles matching "${searchQuery}". Instant Google Drive delivery in 5 seconds.`;
    }

    // 2. Set Document Title
    document.title = pageTitle;

    // 3. Helper to update or create meta tags
    const setMetaTag = (selector, attr, attrVal, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('meta[name="description"]', 'name', 'description', pageDescription);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', config.seoKeywords || 'reels bundle, viral reels, instagram reels pack, motivation reels, ai fitness reels, cheap reels download, watermark free reels 1080p, shorts bundle');
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="google-site-verification"]', 'name', 'google-site-verification', '52iB3jq7O_eOpTnutctWvgYo0yqXIIKMWIpZDpVwyZw');

    // Canonical Link
    const fullCanonicalUrl = `${PRIMARY_DOMAIN}${canonicalPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // Open Graph & Social Cards Image (Guaranteed Absolute URL for WhatsApp, Facebook, X previews)
    const rawImage = activeBundle?.thumbnail || `${PRIMARY_DOMAIN}/social-share.png`;
    const fullOgImage = rawImage.startsWith('http') ? rawImage : `${PRIMARY_DOMAIN}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    // Open Graph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', pageDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', fullOgImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', activeBundle ? 'product' : 'website');

    // Twitter
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', pageDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', fullOgImage);

    // 4. Inject JSON-LD Structured Data
    const schemas = [
      getOrganizationSchema(config),
      getWebSiteSchema(config),
      getHowToSchema()
    ];

    if (activeBundle) {
      schemas.push(getProductSchema(activeBundle, config));
    }

    if (breadcrumbs.length > 0) {
      schemas.push(getBreadcrumbListSchema(breadcrumbs));
    }

    if (faqs && faqs.length > 0) {
      schemas.push(getFAQPageSchema(faqs));
    }

    // Remove old injected JSON-LD
    const oldScripts = document.querySelectorAll('script[data-seo="cheapreels-jsonld"]');
    oldScripts.forEach(s => s.remove());

    // Inject clean structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'cheapreels-jsonld');
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);

  }, [config, activeCategory, activeBundle, searchQuery, categories, faqs]);

  return null;
}
