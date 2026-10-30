import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  HeartPulse, 
  Users, 
  GraduationCap, 
  Home, 
  Briefcase, 
  ShieldCheck, 
  LayoutGrid, 
  ArrowRight, 
  Filter, 
  MapPin, 
  CheckCircle, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

const iconMap = {
  LayoutGrid,
  Sprout,
  HeartPulse,
  Users,
  GraduationCap,
  Home,
  Briefcase,
  ShieldCheck
};

export const SchemeCatalog = ({ 
  schemes = [], 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  onOpenSchemeDetails,
  onQuickApply
}) => {
  const [levelFilter, setLevelFilter] = useState('All'); // 'All', 'Central', 'State'
  const [selectedState, setSelectedState] = useState('All');

  const statesList = [
    'All',
    'Madhya Pradesh',
    'Tamil Nadu',
    'Telangana',
    'Andhra Pradesh',
    'Uttar Pradesh',
    'Maharashtra',
    'Rajasthan',
    'Bihar',
    'Karnataka',
    'Gujarat'
  ];

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Category check
      if (selectedCategory !== 'all') {
        const catStr = (s.category || '').toLowerCase();
        if (!catStr.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }
      // Level check
      if (levelFilter !== 'All' && s.level !== levelFilter) {
        return false;
      }
      // State check
      if (selectedState !== 'All' && s.state !== selectedState && s.state !== 'All India') {
        return false;
      }
      // Query check
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const titleMatch = (s.title || '').toLowerCase().includes(q);
        const descMatch = (s.short_description || s.shortDescription || '').toLowerCase().includes(q);
        const minMatch = (s.ministry || '').toLowerCase().includes(q);
        const codeMatch = (s.code || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !minMatch && !codeMatch) {
          return false;
        }
      }
      return true;
    });
  }, [schemes, selectedCategory, levelFilter, selectedState, searchQuery]);

  return (
    <section id="schemes-catalog" className="py-12 bg-slate-50 min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Result Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Government Scheme Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              National & State Welfare Schemes Directory
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Directly queried from verified government portals (myscheme.gov.in, pmkisan.gov.in, scholarships.gov.in).
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredSchemes.length}</strong> verified schemes</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || LayoutGrid;
            const isSelected = selectedCategory === cat.id || (cat.id === 'all' && selectedCategory === 'all');
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar (Level & State) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-3">
          
          {/* Level Filter Buttons */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Level:
            </span>
            {['All', 'Central', 'State'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  levelFilter === lvl
                    ? 'bg-slate-800 text-slate-50 font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lvl === 'All' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>

          {/* State Dropdown Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600" />
              Jurisdiction:
            </span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All States (Pan-India)' : st}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Schemes Grid */}
        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => {
              const minAge = scheme.min_age !== undefined ? scheme.min_age : (scheme.eligibility?.minAge ?? 18);
              const maxAge = scheme.max_age !== undefined ? scheme.max_age : (scheme.eligibility?.maxAge ?? 75);
              const benefitType = scheme.benefit_type || scheme.benefitType || 'Welfare Assistance';
              const shortDesc = scheme.short_description || scheme.shortDescription || '';
              const docs = scheme.documents_required || scheme.documents || [];

              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        scheme.level === 'Central'
                          ? 'bg-brand-50 text-brand-800 border border-brand-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {scheme.level} Scheme • {scheme.state}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {scheme.category}
                      </span>
                    </div>

                    {/* Ministry */}
                    <p className="text-xs text-slate-500 font-medium truncate mb-1">
                      {scheme.ministry}
                    </p>

                    {/* Scheme Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug mb-2">
                      {scheme.title}
                    </h3>

                    {/* Benefit Card Ribbon */}
                    <div className="bg-gradient-to-r from-brand-50 via-teal-50/50 to-slate-50 border border-brand-200/60 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
                          Official Welfare Entitlement
                        </p>
                        {scheme.sanctioned_amount_default > 0 && (
                          <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                            Sanctioned: ₹{scheme.sanctioned_amount_default.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {scheme.benefit}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                        {benefitType}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {shortDesc}
                    </p>

                    {/* Eligibility Quick Tags */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-500">Eligibility:</span>
                        <span className="text-slate-800 font-medium truncate">
                          Age {minAge}-{maxAge} yrs • Max Income: ₹{(scheme.max_income || scheme.eligibility?.maxIncome || 300000).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-500">Documents:</span>
                        <span className="text-slate-700 truncate">
                          {docs.slice(0, 2).join(', ')}{docs.length > 2 ? ` +${docs.length - 2} more` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons Footer */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center space-x-2">
                    <button
                      onClick={() => onOpenSchemeDetails(scheme)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors text-center shadow-xs"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => onQuickApply(scheme)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-xs flex items-center justify-center space-x-1 group/btn"
                    >
                      <span>Apply Online</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching schemes found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or clearing selected category and jurisdiction filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setLevelFilter('All');
                setSelectedState('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
