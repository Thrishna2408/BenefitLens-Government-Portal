import React from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  FileCheck2, 
  Banknote, 
  Users2,
  Building,
  CheckCircle2,
  Scale,
  Eye,
  AlertTriangle,
  Receipt
} from 'lucide-react';

export const HeroSection = ({ 
  searchQuery, 
  setSearchQuery, 
  onStartCalculator, 
  onStartTracker, 
  onSelectCategory 
}) => {
  const quickTags = [
    { label: 'PM-KISAN ₹6,000 Support', cat: 'Agriculture' },
    { label: 'Ayushman ₹5L Health Cover', cat: 'Healthcare' },
    { label: 'PMAY-G ₹1.2L Housing Grant', cat: 'Housing' },
    { label: 'PM SVANidhi Micro-Credit', cat: 'MSME & Business' },
    { label: 'Post-Matric Scholarship', cat: 'Education' },
    { label: 'Ladli Behna ₹1,250/mo DBT', cat: 'Women & Child' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white pt-12 pb-20 border-b border-slate-800">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Trust & Transparency Ribbon */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-card text-xs font-semibold text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-teal-300 font-bold">BenefitLens Transparency Engine</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Sanctioned vs Disbursed Audit</span>
            <span className="text-slate-500">•</span>
            <span className="text-teal-400 font-bold">Citizen Verified</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center mt-7 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.12]">
            Benefit<span className="text-teal-400">Lens</span>: Transparent Government <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Benefit Disbursement Tracker
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-300 font-medium tracking-wide">
            Making Government Benefits Transparent, Traceable, and Accountable.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Know exactly which benefits you are eligible for, how much amount was sanctioned, how much was disbursed, how much is pending, and verify whether the money received matches official records.
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-card rounded-2xl bg-white/10 backdrop-blur-md border border-slate-700 p-2 focus-within:ring-2 focus-within:ring-teal-400 focus-within:border-teal-400 transition-all">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-teal-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, or entitlement (e.g. Kisan, Housing, Ayushman, Scholarship)..."
              className="w-full px-3 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent border-none focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                const el = document.getElementById('schemes-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm transition-all shadow-subtle shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onSelectCategory(tag.cat)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-teal-900/60 text-slate-300 hover:text-teal-200 border border-slate-700 transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Call-to-Action Hub */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <button
            onClick={onStartCalculator}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-card flex items-center justify-center space-x-2 group hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Check My Benefit Eligibility</span>
            <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onStartTracker}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700 shadow-subtle flex items-center justify-center space-x-2"
          >
            <FileCheck2 className="w-4 h-4 text-teal-400" />
            <span>Track Application & Sanction</span>
          </button>
        </div>

        {/* 4 Pillars Transparency Ribbon */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 shadow-subtle flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">Sanction vs Disbursed</p>
              <p className="text-[11px] text-slate-400">Exact pending balance tracking</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 shadow-subtle flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">Citizen Confirmation</p>
              <p className="text-[11px] text-slate-400">Self-report receipt & discrepancies</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 shadow-subtle flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">PFMS Reconciliation</p>
              <p className="text-[11px] text-slate-400">Independent bank gateway audits</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60 shadow-subtle flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">Discrepancy Redressal</p>
              <p className="text-[11px] text-slate-400">Admin scrutiny & audit trail</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
