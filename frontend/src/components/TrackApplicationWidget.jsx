import React, { useState } from 'react';
import { 
  Search, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Banknote, 
  Building, 
  User, 
  ChevronRight, 
  Printer, 
  Download,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { api } from '../services/api';

export const TrackApplicationWidget = ({ onOpenDetails }) => {
  const [searchId, setSearchId] = useState('');
  const [searchedResult, setSearchedResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);

    try {
      const result = await api.trackApplication(searchId.trim());
      setSearchedResult(result);
    } catch (err) {
      setSearchedResult(null);
      setErrorMsg(err.message || 'No official application was found with this reference number.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTrack = (arn) => {
    setSearchId(arn);
    api.trackApplication(arn)
      .then(res => {
        setSearchedResult(res);
        setHasSearched(true);
        setErrorMsg('');
      })
      .catch(err => {
        setErrorMsg(err.message);
        setSearchedResult(null);
      });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Disbursed':
      case 'Credited':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {status}
          </span>
        );
      case 'Partially Disbursed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Partially Disbursed
          </span>
        );
      case 'Under Verification':
      case 'Under Review':
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Under Verification
          </span>
        );
      case 'Action Required':
      case 'Documents Required':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-orange-700" />
            Action Required
          </span>
        );
      case 'Rejected':
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <section className="py-12 bg-slate-50 min-h-[550px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold mb-2">
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>BenefitLens • Application & Sanction Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Track Application Scrutiny & Sanctions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Enter your genuine Application Reference Number (ARN) to review verification stages, approved sanction amounts, and official order receipts.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 max-w-xl mx-auto">
          <div className="flex items-center bg-white border border-slate-300 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Search className="w-5 h-5 text-teal-600 ml-2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. ARN-2026-48291 or ARN-2026-72814"
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-transparent border-none focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm shrink-0 disabled:opacity-50"
            >
              {loading ? 'Querying...' : 'Track Application'}
            </button>
          </div>

          {/* Quick Tracking Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span>Sample records:</span>
            <button
              type="button"
              onClick={() => handleQuickTrack('ARN-2026-48291')}
              className="font-mono font-semibold text-teal-700 hover:underline bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
            >
              ARN-2026-48291 (Approved & Sanctioned)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTrack('ARN-2026-72814')}
              className="font-mono font-semibold text-amber-700 hover:underline bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
            >
              ARN-2026-72814 (Under Verification)
            </button>
          </div>
        </form>

        {/* Results Area */}
        {hasSearched && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {searchedResult ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                {/* Result Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm font-bold bg-slate-100 text-slate-900 px-3 py-1 rounded-lg border border-slate-200">
                        {searchedResult.id}
                      </span>
                      {getStatusBadge(searchedResult.status)}
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{searchedResult.scheme_title}</h3>
                    <p className="text-xs text-slate-500">{searchedResult.scheme_ministry}</p>
                  </div>

                  <a
                    href={searchedResult.acknowledgement_proof_url || `/api/v1/applications/${searchedResult.id}/acknowledgement`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Print Official Receipt</span>
                  </a>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Applicant Name</span>
                    <span className="font-bold text-slate-900">{searchedResult.applicant_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Aadhaar (Protected)</span>
                    <span className="font-mono font-bold text-slate-900">{searchedResult.aadhaar_masked}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Sanctioned Amount</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {searchedResult.sanctioned_amount > 0 
                        ? `₹${searchedResult.sanctioned_amount.toLocaleString('en-IN')}` 
                        : 'Awaiting Sanction Order'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Submission Date</span>
                    <span className="font-bold text-slate-900">{searchedResult.applied_date}</span>
                  </div>
                </div>

                {/* Scrutiny Remarks */}
                {searchedResult.status_remarks && (
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">District Scrutiny Status:</span>
                      <p className="text-slate-700">{searchedResult.status_remarks}</p>
                    </div>
                  </div>
                )}

                {/* Timeline Progress */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                    Official Verification & Sanction Timeline
                  </h4>
                  <div className="space-y-4">
                    {(searchedResult.timeline || []).map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {step.status === 'completed' ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : step.status === 'current' ? (
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                              <Clock className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                              {step.step_number}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-slate-900">{step.title}</span>
                            <span className="text-[11px] font-mono text-slate-500">{step.date}</span>
                          </div>
                          <p className="text-xs text-slate-600">{step.details}</p>
                          {step.officer_name && (
                            <span className="text-[10px] text-slate-400 block mt-1">Verified by: {step.officer_name}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-600 shadow-sm">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Matching Record Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {errorMsg || 'Please double-check your Application Reference Number (ARN) or the mobile number entered during submission.'}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
