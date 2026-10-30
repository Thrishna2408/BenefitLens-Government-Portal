import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Banknote, 
  Building, 
  ShieldCheck, 
  RotateCcw,
  Layers,
  ChevronRight,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../services/api';

const STATES = [
  'Madhya Pradesh',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Uttar Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Bihar',
  'Karnataka',
  'Gujarat',
  'West Bengal'
];

export const EligibilityCalculator = ({ onApplyScheme }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calcData, setCalcData] = useState({
    age: 28,
    gender: 'Male',
    state: 'Madhya Pradesh',
    category: 'OBC',
    occupation: 'Farmer',
    annualIncome: 200000,
    hasLand: true,
    isStudent: false
  });

  const [matchedResults, setMatchedResults] = useState(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const results = await api.evaluateGuestEligibility({
        age: calcData.age,
        gender: calcData.gender,
        state: calcData.state,
        category: calcData.category,
        occupation: calcData.occupation,
        annualIncome: calcData.annualIncome
      });
      setMatchedResults(results);
      setStep(4);
    } catch (err) {
      console.error('Error evaluating eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMatchedResults(null);
  };

  return (
    <section className="py-12 bg-slate-50 min-h-[600px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>BenefitLens Deterministic Scheme Eligibility & Entitlement Estimator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Check Your Welfare Scheme Eligibility & Sanctions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Input demographic parameters to query official Central and State guidelines and determine exact sanctioned entitlement amounts tracked via DBT.
          </p>
        </div>

        {/* Stepper Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            {[
              { num: 1, title: 'Personal Demographics' },
              { num: 2, title: 'Income & Location' },
              { num: 3, title: 'Occupation & Category' },
              { num: 4, title: 'Eligible Schemes' }
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-semibold hidden md:inline ${
                  step === s.num ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. What is your age?
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="14"
                    max="85"
                    value={calcData.age}
                    onChange={(e) => setCalcData({ ...calcData, age: parseInt(e.target.value) })}
                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-lg font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200 min-w-16 text-center">
                    {calcData.age} yrs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Select your Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Transgender'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCalcData({ ...calcData, gender: g })}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        calcData.gender === g
                          ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. State of Residence
                </label>
                <select
                  value={calcData.state}
                  onChange={(e) => setCalcData({ ...calcData, state: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Total Annual Family Income (₹)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="30000"
                    max="1000000"
                    step="10000"
                    value={calcData.annualIncome}
                    onChange={(e) => setCalcData({ ...calcData, annualIncome: parseInt(e.target.value) })}
                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">₹30,000</span>
                    <span className="font-mono text-base font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                      ₹{calcData.annualIncome.toLocaleString('en-IN')} / year
                    </span>
                    <span className="text-slate-400">₹10,00,000+</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  5. Primary Occupation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Farmer',
                    'Agriculture Worker',
                    'Street Vendor',
                    'Daily Wage Earner',
                    'Self Employed',
                    'Student',
                    'Housewife',
                    'Unemployed'
                  ].map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setCalcData({ ...calcData, occupation: occ })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        calcData.occupation === occ
                          ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  6. Social Category / Caste
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['OBC', 'SC', 'ST', 'General', 'EWS'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCalcData({ ...calcData, category: c })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        calcData.category === c
                          ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCalculate}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <span>{loading ? 'Evaluating Rules...' : 'Calculate Eligible Schemes'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 4 && matchedResults && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Scheme Eligibility Audit Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Found {matchedResults.filter(r => r.is_eligible).length} fully eligible schemes for a {calcData.age} yr old {calcData.occupation} ({calcData.category}) in {calcData.state}.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recalculate</span>
                </button>
              </div>

              <div className="space-y-3">
                {matchedResults.map(({ scheme, is_eligible, match_percentage, eligible_reasons, unmet_criteria }) => (
                  <div 
                    key={scheme.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      is_eligible 
                        ? 'border-brand-200 bg-white ring-1 ring-brand-100'
                        : 'border-slate-200 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {scheme.level} Scheme
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            is_eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {is_eligible ? `${match_percentage}% Fully Eligible` : `${match_percentage}% Partial Match`}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{scheme.title}</h4>
                        <p className="text-xs text-slate-500">{scheme.ministry}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">{scheme.benefit}</span>
                        {scheme.sanctioned_amount_default > 0 && (
                          <span className="inline-block px-2 py-0.5 mt-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                            Sanctioned: ₹{scheme.sanctioned_amount_default.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 block">{scheme.benefit_type || scheme.benefitType}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 space-y-1">
                      {eligible_reasons.map((r, i) => (
                        <div key={i} className="flex items-center text-emerald-700">
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={scheme.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onApplyScheme(scheme)}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold"
                      >
                        Apply Online
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
