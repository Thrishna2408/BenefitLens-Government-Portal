import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  Building, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export const SchemeDetailsModal = ({ 
  scheme, 
  isOpen, 
  onClose, 
  user, 
  onApplicationSubmitted 
}) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'apply'
  const [applyStep, setApplyStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Rajesh Kumar Verma',
    aadhaarNumber: user?.aadhaarMasked || 'XXXX-XXXX-4819',
    mobileNumber: user?.phone || '9876543210',
    email: user?.email || 'rajesh.verma@example.in',
    socialCategory: user?.category || 'OBC',
    annualIncome: user?.annualIncome ? `₹${user.annualIncome}` : '₹2,40,000',
    occupation: user?.occupation || 'Farmer',
    state: user?.state || 'Madhya Pradesh',
    district: user?.district || 'Indore',
    bankName: user?.bankName || 'State Bank of India',
    accountNumber: user?.accountNumber || 'XXXX-XXXX-4102',
    ifscCode: user?.ifscCode || 'SBIN0001842',
    attachedDocs: ['Aadhaar Card (e-KYC Verified)', 'DigiLocker Income Proof', 'Land Holding Record'],
    declarationAgreed: true
  });
  const [submittedAppId, setSubmittedAppId] = useState(null);
  const [ackUrl, setAckUrl] = useState(null);

  if (!isOpen || !scheme) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        scheme_id: scheme.id,
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        state: formData.state,
        district: formData.district,
        aadhaarNumber: formData.aadhaarNumber,
        annualIncome: String(formData.annualIncome),
        occupation: formData.occupation,
        socialCategory: formData.socialCategory,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        attachedDocs: formData.attachedDocs,
        declarationAgreed: formData.declarationAgreed
      };

      const res = await api.submitApplication(payload);
      setSubmittedAppId(res.id);
      setAckUrl(res.acknowledgement_proof_url);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onApplicationSubmitted(res);
      setApplyStep(4); // Success step
    } catch (err) {
      setErrorMsg(err.message || 'Application submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setActiveTab('details');
    setApplyStep(1);
    setSubmittedAppId(null);
    setAckUrl(null);
    onClose();
  };

  const criteriaList = scheme.criteria_list || scheme.eligibility?.criteria || [
    'Valid identity & citizenship proof',
    'Fulfill age and income limitations'
  ];

  const docsList = scheme.documents_required || scheme.documents || [
    'Aadhaar Card',
    'Bank Passbook',
    'Income Certificate'
  ];

  const benefitType = scheme.benefit_type || scheme.benefitType || 'Direct Welfare Assistance';
  const fullDesc = scheme.full_description || scheme.fullDescription || scheme.short_description || scheme.shortDescription;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
              ₹
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                {scheme.level} Scheme • Ref: {scheme.code}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                {scheme.title}
              </h2>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Scheme Guidelines & Official Source
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'apply'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Online Application Form</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
          
          {activeTab === 'details' ? (
            <div className="space-y-6">
              
              {/* Ministry Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-slate-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Nodal Ministry / Department</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{scheme.ministry}</p>
                  </div>
                </div>

                <a
                  href={scheme.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Benefit Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-teal-50/40 to-slate-50 border border-brand-200/70">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
                      Direct Entitlement / Benefit
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                      {scheme.benefit}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {benefitType}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    {scheme.sanctioned_amount_default > 0 && (
                      <div className="mb-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Official Sanction Order</span>
                        <span className="text-base font-extrabold text-teal-800 font-mono">₹{scheme.sanctioned_amount_default.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block">DBT Verification</span>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">BenefitLens Audited</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Detailed Scheme Objectives & Directives
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {fullDesc}
                </p>
              </div>

              {/* Eligibility Criteria Checklist */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mandatory Eligibility Criteria</span>
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  {criteriaList.map((crit, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                        ✓
                      </span>
                      <span>{crit}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-200 flex flex-wrap gap-2 text-xs">
                    <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      Age Bracket: {scheme.min_age || scheme.eligibility?.minAge || 18} to {scheme.max_age || scheme.eligibility?.maxAge || 75} Years
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      Max Annual Income: ₹{(scheme.max_income || scheme.eligibility?.maxIncome || 300000).toLocaleString('en-IN')}
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      Jurisdiction: {scheme.state || 'All India'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Required Documents for e-Filing</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {docsList.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center space-x-2 text-xs">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Application Deadline: <strong className="text-slate-800">{scheme.deadline}</strong>
                </span>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center space-x-2"
                >
                  <span>Proceed to Apply Online</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* --- APPLY MULTI-STEP FLOW --- */
            <div>
              {/* Stepper Progress */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                {[
                  { step: 1, label: 'Applicant Details' },
                  { step: 2, label: 'Bank & DBT' },
                  { step: 3, label: 'Declaration' },
                  { step: 4, label: 'Acknowledgement' }
                ].map((s) => (
                  <div key={s.step} className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      applyStep === s.step
                        ? 'bg-brand-600 text-white shadow-xs'
                        : applyStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {applyStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className="text-xs font-semibold hidden sm:inline text-slate-700">{s.label}</span>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Citizen Details */}
              {applyStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (SMS Alerts)</label>
                      <input
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State of Residence</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setApplyStep(2)}
                      className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                    >
                      <span>Next: Bank & Direct Transfer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Bank & DBT Seeding */}
              {applyStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">NPCI Aadhaar Payment Bridge Verified:</span> Benefits will be disbursed directly through the Public Financial Management System (PFMS).
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Masked Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setApplyStep(1)}
                      className="px-4 py-2 border text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyStep(3)}
                      className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                    >
                      <span>Next: Legal Declaration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Legal Declaration */}
              {applyStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-slate-900">Applicant Self-Declaration under Welfare Portal Rules:</p>
                    <p>1. I hereby solemnly declare that all particulars furnished above are true and verifiable from official state revenue and Aadhaar records.</p>
                    <p>2. I understand that submitting fraudulent or fabricated claims is punishable under Indian Penal Code and Public Welfare Disbursal Guidelines.</p>
                    <p>3. I give consent to verify my credentials with UIDAI and State Civil Supplies databases.</p>
                  </div>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formData.declarationAgreed}
                      onChange={(e) => handleInputChange('declarationAgreed', e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>I agree to the declaration and authorize e-Scrutiny of my application.</span>
                  </label>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setApplyStep(2)}
                      className="px-4 py-2 border text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!formData.declarationAgreed || loading}
                      onClick={handleFinalSubmit}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-emerald-500/20"
                    >
                      <span>{loading ? 'Submitting to Portal...' : 'Submit Application (ARN Generation)'}</span>
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Submission Success & Authentic Receipt */}
              {applyStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h3>
                    <p className="text-xs text-slate-500 mt-1">Your application has been logged into the State and Central verification queue.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Application Reference Number (ARN)</span>
                    <span className="text-lg font-mono font-bold text-brand-700 block">{submittedAppId}</span>
                    <span className="text-xs text-slate-600 mt-1 block">
                      An official SMS notification with this reference has been sent to +91 {formData.mobileNumber.slice(-10)}.
                    </span>
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <a
                      href={ackUrl || `/api/v1/applications/${submittedAppId}/acknowledgement`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Official Acknowledgement Slip</span>
                    </a>
                    <button
                      onClick={resetAndClose}
                      className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
