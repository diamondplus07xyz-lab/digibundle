import React, { useState, useEffect } from 'react';
import { Globe, X, Check, Search, Sparkles } from 'lucide-react';
import { COUNTRY_PROFILES, SUPPORTED_CURRENCIES, getUserCountry, setUserCountry } from '../utils/geoPricing';
import { SUPPORTED_LANGUAGES, detectUserLanguage, setLanguage, t } from '../utils/i18n';

export default function CountryLanguageSelector({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('country'); // 'country' | 'language'
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getUserCountry);
  const [selectedLang, setSelectedLang] = useState(detectUserLanguage);

  useEffect(() => {
    if (isOpen) {
      setSelectedCountry(getUserCountry());
      setSelectedLang(detectUserLanguage());
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCountries = COUNTRY_PROFILES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.currency.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCountry = (countryCode) => {
    setSelectedCountry(countryCode);
    setUserCountry(countryCode);
    
    // Also auto-switch language if user hasn't explicitly set another
    const profile = COUNTRY_PROFILES.find(p => p.code === countryCode);
    if (profile && profile.lang) {
      setSelectedLang(profile.lang);
      setLanguage(profile.lang);
    }
    
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSelectLanguage = (langCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const currentCountryObj = COUNTRY_PROFILES.find(c => c.code === selectedCountry) || COUNTRY_PROFILES[0];
  const currentCurrencyObj = SUPPORTED_CURRENCIES[currentCountryObj.currency] || SUPPORTED_CURRENCIES.USD;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">
                {t('switchCountry')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Current: {currentCountryObj.flag} {currentCountryObj.name} ({currentCurrencyObj.code}) · {currentLangObj.nativeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Country & Currency vs Language */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-3 bg-white">
          <button
            onClick={() => { setActiveTab('country'); setSearch(''); }}
            className={`pb-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'country' 
                ? 'border-indigo-600 text-indigo-600 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{currentCountryObj.flag} Country & Currency</span>
          </button>
          <button
            onClick={() => { setActiveTab('language'); setSearch(''); }}
            className={`pb-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'language' 
                ? 'border-indigo-600 text-indigo-600 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🌐 Language ({currentLangObj.name})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'country' ? 'Search country or currency (e.g. USA, Euro, GBP)...' : 'Search language (e.g. Spanish, Hindi)...'}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-4 space-y-1.5 flex-1 max-h-[50vh]">
          {activeTab === 'country' ? (
            filteredCountries.map((c) => {
              const isSelected = c.code === selectedCountry;
              const curr = SUPPORTED_CURRENCIES[c.currency] || SUPPORTED_CURRENCIES.USD;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelectCountry(c.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-200 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold">
                          {c.currency} ({curr.symbol.trim()})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Bundles start at {curr.format(curr.minPrice)}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            filteredLanguages.map((l) => {
              const isSelected = l.code === selectedLang;
              return (
                <button
                  key={l.code}
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-200 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{l.flag}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {l.nativeName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {l.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            🔒 Prices and currency are automatically formatted for your region with zero foreign exchange markup.
          </p>
        </div>
      </div>
    </div>
  );
}
