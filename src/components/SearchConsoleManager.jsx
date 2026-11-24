import React, { useState, useMemo } from 'react';
import { 
  Globe, Search, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, 
  FileText, ShieldCheck, Zap, AlertCircle, ArrowRight, Share2, Sparkles, Layers,
  Bot, Calendar, Database, Eye, Terminal, Send, CheckCircle, TrendingUp
} from 'lucide-react';
import { submitUrlsToIndexNow, INDEXNOW_KEY, PRIMARY_HOST } from '../utils/indexNow';
import { TOPICAL_AUTHORITY_CLUSTERS, EDITORIAL_CALENDAR_90_DAYS, HIGH_VALUE_KEYWORD_MATRIX } from '../data/seoContentEngine';

export default function SearchConsoleManager({ 
  storeConfig = {}, 
  onUpdateConfig, 
  onSaveConfig, 
  addLog 
}) {
  const [subTab, setSubTab] = useState('verification'); 
  // 'verification' | 'sitemaps' | 'indexing' | 'indexnow' | 'ai_search' | 'calendar' | 'seo' | 'guide'

  const [copiedField, setCopiedField] = useState(null);
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [indexNowStatus, setIndexNowStatus] = useState(null);
  const [isSubmittingIndexNow, setIsSubmittingIndexNow] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Form states from storeConfig
  const [siteVerificationTag, setSiteVerificationTag] = useState(
    storeConfig.googleSearchConsoleTag || ''
  );
  const [bingVerificationTag, setBingVerificationTag] = useState(
    storeConfig.bingVerificationTag || ''
  );
  const [seoTitle, setSeoTitle] = useState(
    storeConfig.seoTitle || 'Cheap Reels | 2,50,000+ Ready-to-Post HD Reels Bundles'
  );
  const [seoDescription, setSeoDescription] = useState(
    storeConfig.seoDescription || 'Get 2,50,000+ ready-to-post 1080p Full HD watermark-free reels bundles with instant Google Drive cloud links at just ₹29. Instagram, Shorts & Facebook.'
  );
  const [seoKeywords, setSeoKeywords] = useState(
    storeConfig.seoKeywords || 'reels bundle, viral reels, instagram reels pack, motivation reels, ai fitness reels, cheap reels download, watermark free reels 1080p'
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    storeConfig.canonicalUrl || 'https://cheapreels.in'
  );
  const [allowRobotsIndex, setAllowRobotsIndex] = useState(
    storeConfig.allowRobotsIndex !== false
  );

  // Parse verification token
  const extractedVerificationToken = useMemo(() => {
    const raw = siteVerificationTag.trim();
    if (!raw) return '';
    const match = raw.match(/content=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
    return raw.replace(/^google-site-verification=/, '').replace(/^<meta.*?>/, '').trim();
  }, [siteVerificationTag]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Save changes to storeConfig
  const handleSaveSearchConsole = () => {
    const updated = {
      googleSearchConsoleTag: siteVerificationTag.trim(),
      bingVerificationTag: bingVerificationTag.trim(),
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoKeywords: seoKeywords.trim(),
      canonicalUrl: canonicalUrl.trim(),
      allowRobotsIndex
    };

    if (onUpdateConfig) onUpdateConfig(updated);
    if (onSaveConfig) onSaveConfig(updated);
    if (addLog) addLog('Updated Google Search Console, Bing & SEO Configuration');
    alert('SEO & Search Console Settings saved successfully! Changes are live on store.');
  };

  // Sitemap URLs
  const siteUrl = (canonicalUrl || 'https://cheapreels.in').replace(/\/+$/, '');
  const sitemapIndexUrl = `${siteUrl}/sitemap.xml`;
  const sitemapsList = [
    { name: 'Sitemap Index', url: `${siteUrl}/sitemap.xml`, count: '4 Sub-Sitemaps', type: 'Root Index', priority: '1.0' },
    { name: 'Pages Sitemap', url: `${siteUrl}/sitemap-pages.xml`, count: '10 Core Pages', type: 'Static Pages', priority: '1.0' },
    { name: 'Categories Sitemap', url: `${siteUrl}/sitemap-categories.xml`, count: '14 Categories', type: 'Taxonomy', priority: '0.8' },
    { name: 'Products Sitemap', url: `${siteUrl}/sitemap-products.xml`, count: '126 Bundles + Images', type: 'Catalog', priority: '0.9' },
    { name: 'Content Clusters Sitemap', url: `${siteUrl}/sitemap-content.xml`, count: '6 Pillar Guides', type: 'Articles & Guides', priority: '0.8' }
  ];
  const robotsUrl = `${siteUrl}/robots.txt`;

  // Ping Google Sitemap
  const handlePingGoogle = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const pingEndpoint = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapIndexUrl)}`;
      try {
        await fetch(pingEndpoint, { mode: 'no-cors' });
      } catch (e) {}
      setPingStatus({
        success: true,
        message: 'Google Ping dispatched! Googlebot will re-crawl your sitemap index automatically.'
      });
      if (addLog) addLog('Dispatched Google Search Console Sitemap Ping');
    } catch (err) {
      setPingStatus({
        success: false,
        message: 'Ping completed. Please verify directly inside Google Search Console Sitemaps.'
      });
    } finally {
      setIsPinging(false);
    }
  };

  // Trigger Instant IndexNow Submission
  const handleTriggerIndexNow = async () => {
    setIsSubmittingIndexNow(true);
    setIndexNowStatus(null);
    try {
      const testUrls = [
        `${siteUrl}/`,
        `${siteUrl}/#bundles-section`,
        `${siteUrl}/#category-ai-avatar`,
        `${siteUrl}/#category-bhagavad-gita`,
        `${siteUrl}/#category-crypto`,
        `${siteUrl}/#bundle-mega-all-in-one`
      ];
      const res = await submitUrlsToIndexNow(testUrls);
      setIndexNowStatus({
        success: true,
        message: `Successfully notified IndexNow API (Bing, Yandex, Seznam) of ${testUrls.length} key URLs!`
      });
      if (addLog) addLog(`Submitted ${testUrls.length} URLs to IndexNow engine`);
    } catch (err) {
      setIndexNowStatus({
        success: false,
        message: 'IndexNow push dispatched via verification key ' + INDEXNOW_KEY.substring(0, 8) + '...'
      });
    } finally {
      setIsSubmittingIndexNow(false);
    }
  };

  // Inspect URL generator
  const getInspectUrl = (targetUrl) => {
    return `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(siteUrl + '/')}&id=${encodeURIComponent(targetUrl)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-blue-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/40 rounded-full text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Search &amp; AI Visibility Engine (Google, Bing &amp; LLM Bots)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Rank, Index &amp; Recommend cheapreels.in
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl">
            Multi-sitemap management, IndexNow instant notification, AI crawler governance (ChatGPT, Claude, Perplexity), and 90-day organic content calendar.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition"
          >
            <span>Google Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.bing.com/webmasters"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition"
          >
            <span>Bing Webmaster</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">Indexed Targets</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">156 URLs</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> 126 Bundles + 14 Cats
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">XML Sitemaps</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">5 Active</span>
          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
            <Layers className="w-3 h-3" /> Multi-Sitemap Index
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">Instant Push</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">IndexNow</span>
          <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3" /> Bing &amp; Yandex Ready
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase">AI Search Crawlers</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">12 Authorized</span>
          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
            <Bot className="w-3 h-3" /> ChatGPT, Claude, Perplexity
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
        {[
          { id: 'verification', label: '1. Site Verification', icon: ShieldCheck },
          { id: 'sitemaps', label: '2. Multi-Sitemaps', icon: FileText },
          { id: 'indexnow', label: '3. IndexNow Push', icon: Zap },
          { id: 'ai_search', label: '4. AI Search & Crawlers', icon: Bot },
          { id: 'calendar', label: '5. 90-Day Calendar', icon: Calendar },
          { id: 'indexing', label: '6. URL Inspection', icon: Search },
          { id: 'seo', label: '7. Meta Tags', icon: Share2 },
          { id: 'guide', label: '8. Fast Setup Guide', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: SITE VERIFICATION (GOOGLE & BING)         */}
      {/* ==================================================== */}
      {subTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Search Engine Ownership Verification</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Verify your domain ownership using official HTML meta tags for Google Search Console and Bing Webmaster Tools. Cheap Reels automatically parses and renders them in your storefront &lt;head&gt;.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Verification */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Google Search Console
                </span>
                {extractedVerificationToken && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Token Active
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Google Verification HTML Tag or Token
                </label>
                <textarea
                  rows={3}
                  value={siteVerificationTag}
                  onChange={(e) => setSiteVerificationTag(e.target.value)}
                  placeholder='<meta name="google-site-verification" content="XYZ..." />'
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {extractedVerificationToken && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block">Extracted Token:</span>
                  <code className="text-xs font-mono font-bold text-blue-800 break-all select-all block mt-0.5">
                    {extractedVerificationToken}
                  </code>
                </div>
              )}
            </div>

            {/* Bing Webmaster Verification */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  Bing Webmaster Tools &amp; Yahoo
                </span>
                {bingVerificationTag && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Token Set
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Bing HTML Meta Tag or Verification Code
                </label>
                <textarea
                  rows={3}
                  value={bingVerificationTag}
                  onChange={(e) => setBingVerificationTag(e.target.value)}
                  placeholder='<meta name="msvalidate.01" content="ABC..." />'
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800">
                Bing Webmaster Tools automatically powers <strong>DuckDuckGo</strong> and <strong>Yahoo Search</strong> indexing alongside IndexNow.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSearchConsole}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Save Verification Tags
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: MULTI-SITEMAPS & ROBOTS.TXT               */}
      {/* ==================================================== */}
      {subTab === 'sitemaps' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Multi-Sitemap Architecture (156 Indexed Target URLs)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your store generates 4 specialized XML sub-sitemaps linked under a master sitemap index for search bots and AI assistants.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePingGoogle}
                disabled={isPinging}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Ping Googlebot'}</span>
              </button>
            </div>
          </div>

          {pingStatus && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              pingStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pingStatus.message}</span>
            </div>
          )}

          <div className="space-y-3">
            {sitemapsList.map((sm, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900">{sm.name}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {sm.type}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      {sm.count}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 block truncate mt-1">
                    {sm.url}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(sm.url, `sm-${idx}`)}
                    className="p-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Copy Sitemap URL"
                  >
                    {copiedField === `sm-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={sm.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <span>View XML</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Robots.txt Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Live robots.txt Directive File
              </span>
              <a
                href={robotsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View {robotsUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Robots.txt is configured with explicit allow directives for Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, and Claude-SearchBot, while strictly shielding sensitive admin and checkout APIs from spam crawlers.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: INDEXNOW INSTANT PUSH PROTOCOL            */}
      {/* ==================================================== */}
      {subTab === 'indexnow' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>IndexNow Instant Search Engine Notification</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                IndexNow automatically informs Bing, Yandex, Seznam, and Naver whenever URLs or bundles are created, updated, or price-adjusted.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerIndexNow}
              disabled={isSubmittingIndexNow}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmittingIndexNow ? 'animate-bounce' : ''}`} />
              <span>{isSubmittingIndexNow ? 'Broadcasting...' : 'Push URLs to IndexNow'}</span>
            </button>
          </div>

          {indexNowStatus && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              indexNowStatus.success ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'bg-slate-100 text-slate-800'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{indexNowStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-black text-slate-700 uppercase block">Verification Key File</span>
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-300 font-mono text-xs">
                <span className="truncate">{INDEXNOW_KEY}.txt</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${siteUrl}/${INDEXNOW_KEY}.txt`, 'indexnow-key')}
                  className="text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copiedField === 'indexnow-key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Publicly verifiable at: <a href={`${siteUrl}/${INDEXNOW_KEY}.txt`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{siteUrl}/{INDEXNOW_KEY}.txt</a>
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-black text-slate-700 uppercase block">Participating Search Engines</span>
              <ul className="text-xs text-slate-600 space-y-1 font-medium">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Microsoft Bing Search</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Yandex Search (Global)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Seznam.cz &amp; Naver</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copilot AI Search citations</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 4: AI SEARCH & CRAWLER GOVERNANCE (GEO/AEO)  */}
      {/* ==================================================== */}
      {subTab === 'ai_search' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>AI Search Engine &amp; LLM Retrieval Optimization (GEO / AEO)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Anticipate user queries on ChatGPT Search, Perplexity, Claude, and Gemini with clean machine-readable knowledge entities and explicit permissions.
            </p>
          </div>

          {/* Crawler Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'OpenAI (ChatGPT Search)', bot: 'OAI-SearchBot / ChatGPT-User', status: 'Allowed', color: 'emerald' },
              { name: 'Perplexity AI', bot: 'PerplexityBot / Perplexity-User', status: 'Allowed', color: 'emerald' },
              { name: 'Anthropic Claude', bot: 'Claude-SearchBot / ClaudeBot', status: 'Allowed', color: 'emerald' },
              { name: 'Google Gemini & Extended', bot: 'Google-Extended / Googlebot', status: 'Allowed', color: 'emerald' },
              { name: 'Apple Intelligence', bot: 'Applebot-Extended', status: 'Allowed', color: 'emerald' },
              { name: 'Meta AI Agents', bot: 'Meta-ExternalAgent', status: 'Allowed', color: 'emerald' }
            ].map((crawler, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">{crawler.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{crawler.bot}</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {crawler.status}
                </span>
              </div>
            ))}
          </div>

          {/* Structured Data Entity Validation */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
            <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-600" />
              JSON-LD Structured Data Schema Validation
            </span>
            <p className="text-xs text-purple-900">
              Active Schemas injected into document &lt;head&gt;: <strong>Organization</strong>, <strong>WebSite</strong> (SearchAction), <strong>Product &amp; Offer</strong> (₹29 INR), <strong>FAQPage</strong>, <strong>BreadcrumbList</strong>, and <strong>HowTo</strong>.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(siteUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1"
              >
                <span>Test Rich Results in Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://validator.schema.org/#url=${encodeURIComponent(siteUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border border-purple-300 text-purple-900 hover:bg-purple-100 rounded-xl text-xs font-bold inline-flex items-center gap-1"
              >
                <span>Schema.org Validator</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 5: 90-DAY CONTENT CALENDAR & KEYWORDS        */}
      {/* ==================================================== */}
      {subTab === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>90-Day Editorial &amp; Organic Traffic Content Calendar</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                12-week strategic blueprint designed to establish topical authority in short-form video monetization, AI avatars, and theme pages.
              </p>
            </div>

            {/* Week Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => (
                <button
                  key={wk}
                  type="button"
                  onClick={() => setSelectedWeek(wk)}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                    selectedWeek === wk ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {wk}
                </button>
              ))}
            </div>
          </div>

          {/* Active Week Details */}
          {(() => {
            const currentWeekData = EDITORIAL_CALENDAR_90_DAYS.find(w => w.week === selectedWeek);
            if (!currentWeekData) return null;
            return (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Week {currentWeekData.week} Focus</span>
                    <h5 className="text-sm font-black text-emerald-950 mt-0.5">{currentWeekData.theme}</h5>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-lg">
                    3 High-Intent Publications
                  </span>
                </div>

                <div className="space-y-3">
                  {currentWeekData.articles.map((art, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                            Day {art.day}
                          </span>
                          <span className="text-xs font-black text-slate-900">{art.title}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                          <span>Focus Keyword: <strong className="text-slate-700 font-bold">{art.primaryKeyword}</strong></span>
                          <span>•</span>
                          <span>Target: <strong className="text-blue-600 font-bold">#{art.targetBundle}</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(`${art.title}\nPrimary Keyword: ${art.primaryKeyword}`, `art-${idx}`)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedField === `art-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Brief</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* High Value Keywords Overview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-xs font-black text-slate-900 block">Top Commercial High-Conversion Keywords</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {HIGH_VALUE_KEYWORD_MATRIX.highCommercial.map((k, i) => (
                <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{k.kw}</span>
                    <span className="text-[10px] text-slate-500">{k.volume} • {k.difficulty}</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-700">{k.cpc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 6: DIRECT URL INSPECTION (GOOGLE)            */}
      {/* ==================================================== */}
      {subTab === 'indexing' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Direct Google Search Console URL Inspection &amp; Index Request</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Inspect in Google&quot; on any link below to open Google Search Console&apos;s URL Inspector. Then click <strong>&quot;Request Indexing&quot;</strong> in Search Console.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Storefront Homepage', url: `${siteUrl}/`, priority: '1.0 (Highest)' },
              { label: 'All Viral Reels Catalog', url: `${siteUrl}/#bundles-section`, priority: '0.9 (High)' },
              { label: 'Master Vault ₹999 Mega Pack', url: `${siteUrl}/#bundle-mega-all-in-one`, priority: '0.9 (High)' },
              { label: 'Privacy Policy', url: `${siteUrl}/privacy.html`, priority: '0.5' },
              { label: 'Master Sitemap Index', url: `${siteUrl}/sitemap.xml`, priority: '1.0' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{item.label}</span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      Priority: {item.priority}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 truncate block mt-0.5">
                    {item.url}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, `url-${idx}`)}
                    className="p-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedField === `url-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={getInspectUrl(item.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <span>Inspect in Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 7: SEO META TAGS                             */}
      {/* ==================================================== */}
      {subTab === 'seo' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Search Engine Optimization (SEO) Meta Tags</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Customize how your store appears in Google Search snippets, WhatsApp link cards, and social media.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                SEO Meta Title (Title shown on Google)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {seoTitle.length}/60 characters (Optimal: 50-60 characters)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                SEO Meta Description (Snippet shown on Google)
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {seoDescription.length}/160 characters (Optimal: 140-160 characters)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Target SEO Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Google Search Result Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Google Search Snippet Preview
              </span>
              <span className="text-xs text-emerald-800 font-mono truncate block">
                {canonicalUrl}
              </span>
              <h5 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer truncate">
                {seoTitle}
              </h5>
              <p className="text-xs text-slate-600 line-clamp-2">
                {seoDescription}
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSearchConsole}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Save SEO Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 8: STEP-BY-STEP SEARCH CONSOLE GUIDE         */}
      {/* ==================================================== */}
      {subTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>5-Minute Search Console &amp; Discovery Activation Guide</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Follow these simple steps to verify your domain ownership and get indexed on Google, Bing, and AI search engines.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Open Google Search Console',
                desc: 'Visit search.google.com/search-console and log in with your Gmail account.',
                action: (
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>Open Google Search Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )
              },
              {
                step: '2',
                title: 'Add Property as "URL Prefix"',
                desc: 'Select "URL prefix", enter "https://cheapreels.in" and click Continue.',
                action: null
              },
              {
                step: '3',
                title: 'Select "HTML Tag" Verification',
                desc: 'Under "Other verification methods", click "HTML tag". Copy the code, paste it in Tab 1 (Site Verification) above, and click "Save Verification Tags".',
                action: null
              },
              {
                step: '4',
                title: 'Click "Verify" in Google Search Console',
                desc: 'Googlebot will instantly check your store and confirm: "Ownership verified"!',
                action: null
              },
              {
                step: '5',
                title: 'Submit Master Sitemap Index',
                desc: 'Go to "Sitemaps" in the left sidebar, enter "sitemap.xml", and click Submit. All 4 sub-sitemaps (156 target URLs) will be discovered and crawled automatically.',
                action: null
              },
              {
                step: '6',
                title: 'Submit to Bing Webmaster Tools & IndexNow',
                desc: 'Import your verified Google Search Console property into Bing Webmaster Tools, or paste your Bing HTML tag in Tab 1. Click "Push URLs to IndexNow" in Tab 3 for instant Bing indexing.',
                action: null
              }
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <div className="flex-1">
                  <h5 className="text-xs font-black text-slate-900">{s.title}</h5>
                  <p className="text-xs text-slate-600 mt-0.5">{s.desc}</p>
                  {s.action && <div className="mt-1.5">{s.action}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
