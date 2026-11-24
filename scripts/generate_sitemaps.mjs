/**
 * Automated XML Sitemap Generator for Cheap Reels Store (cheapreels.in)
 * Generates Google & Bing compliant XML Sitemap Index + 4 specialized sub-sitemaps:
 * 1. sitemap-pages.xml (Core static pages & policies)
 * 2. sitemap-categories.xml (13+ Viral Niches & Categories)
 * 3. sitemap-products.xml (All 126+ Individual Reel Bundles with Image extensions)
 * 4. sitemap-content.xml (AEO Answer Hubs & Creator Guides)
 */

import fs from 'fs';
import path from 'path';
import { initialBundles, categories } from '../src/data/bundles.js';

const PRIMARY_DOMAIN = 'https://www.cheapreels.in';
const TODAY = new Date().toISOString().split('T')[0];
const PUBLIC_DIR = path.resolve('public');

function escapeXml(unsafe = '') {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. Generate sitemap-pages.xml
function generatePagesSitemap() {
  const pages = [
    { loc: `${PRIMARY_DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${PRIMARY_DOMAIN}/pricing`, priority: '0.9', changefreq: 'daily' },
    { loc: `${PRIMARY_DOMAIN}/how-it-works`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${PRIMARY_DOMAIN}/reviews`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${PRIMARY_DOMAIN}/faq`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${PRIMARY_DOMAIN}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${PRIMARY_DOMAIN}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${PRIMARY_DOMAIN}/privacy.html`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${PRIMARY_DOMAIN}/terms`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${PRIMARY_DOMAIN}/refund`, priority: '0.5', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const p of pages) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(p.loc)}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), xml, 'utf8');
  console.log(`[OK] Generated sitemap-pages.xml (${pages.length} URLs)`);
}

// 2. Generate sitemap-categories.xml
function generateCategoriesSitemap() {
  const activeCategories = categories.filter(c => c.id !== 'all');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const cat of activeCategories) {
    const loc = `${PRIMARY_DOMAIN}/category/${cat.id}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-categories.xml'), xml, 'utf8');
  console.log(`[OK] Generated sitemap-categories.xml (${activeCategories.length} URLs)`);
}

// 3. Generate sitemap-products.xml (With Image Extensions)
function generateProductsSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const b of initialBundles) {
    const loc = `${PRIMARY_DOMAIN}/bundle/${b.id}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    if (b.thumbnail) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(b.thumbnail)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(b.title)}</image:title>\n`;
      xml += `      <image:caption>${escapeXml(b.subtitle || b.title)}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-products.xml'), xml, 'utf8');
  console.log(`[OK] Generated sitemap-products.xml (${initialBundles.length} Bundles with Images)`);
}

// 4. Generate sitemap-content.xml (Guides, AEO answers & Resources)
function generateContentSitemap() {
  const contentGuides = [
    { slug: 'how-to-grow-instagram-reels-fast', title: 'How to Grow on Instagram Using 1080p Ready-to-Post Reels' },
    { slug: 'best-ai-reels-bundles-2026', title: 'Best AI Reels Collections for Viral YouTube Shorts & Reels' },
    { slug: 'watermark-free-reels-guide', title: 'Why Watermark-Free HD Reels Are Essential for Content Creators' },
    { slug: 'monetize-instagram-theme-pages', title: 'Complete Blueprint to Monetizing Instagram Theme Pages in 30 Days' },
    { slug: 'viral-motivation-reels-strategy', title: 'Viral Motivation & Mindset Reels Strategy for High Engagement' },
    { slug: 'ai-animal-reels-growth-hack', title: 'AI Animal & Funny Cat Reels: The Viral Growth Secret' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const g of contentGuides) {
    const loc = `${PRIMARY_DOMAIN}/guide/${g.slug}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-content.xml'), xml, 'utf8');
  console.log(`[OK] Generated sitemap-content.xml (${contentGuides.length} Educational Guides)`);
}

// 5. Generate Root sitemap.xml (Sitemap Index)
function generateSitemapIndex() {
  const sitemaps = [
    `${PRIMARY_DOMAIN}/sitemap-pages.xml`,
    `${PRIMARY_DOMAIN}/sitemap-categories.xml`,
    `${PRIMARY_DOMAIN}/sitemap-products.xml`,
    `${PRIMARY_DOMAIN}/sitemap-content.xml`
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const s of sitemaps) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${escapeXml(s)}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }
  xml += `</sitemapindex>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[OK] Generated master sitemap.xml Index with ${sitemaps.length} sub-sitemaps!`);
}

// Run all
console.log('--- STARTING XML SITEMAP GENERATION FOR CHEAPREELS.IN ---');
generatePagesSitemap();
generateCategoriesSitemap();
generateProductsSitemap();
generateContentSitemap();
generateSitemapIndex();
console.log('--- SITEMAP GENERATION COMPLETED SUCCESSFULLY ---');
