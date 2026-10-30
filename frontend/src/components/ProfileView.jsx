import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  Building, 
  Banknote, 
  Sparkles, 
  ArrowRight, 
  Edit3, 
  Save, 
  ExternalLink,
  Lock,
  PlusCircle,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Bell,
  Check,
  AlertTriangle,
  FileCheck2,
  Scale,
  CheckCheck,
  HelpCircle,
  X,
  MessageSquare,
  History
} from 'lucide-react';
import { api } from '../services/api';

export const ProfileView = ({ 
  user, 
  setUser, 
  applications = [], 
  onTrackApp, 
  onApplyScheme 
}) => {
  // Tabs: 'transparency', 'ledger', 'confirmations', 'matches', 'applications', 'locker', 'details'
  const [activeTab, setActiveTab] = useState('transparency'); 
  const [isEditing, setIsEditing] = useState(false);

  // BenefitLens Financial & Transparency State
  const [benefitData, setBenefitData] = useState({
    total_sanctioned: 0,
    total_disbursed: 0,
    total_pending: 0,
    total_discrepancy: 0,
    total_credited: 0,
    total_processing: 0,
    records_count: 0,
    verified_records_count: 0,
    records: []
  });
  const [benefitLoading, setBenefitLoading] = useState(false);

  // Beneficiary Confirmations State
  const [confirmations, setConfirmations] = useState([]);

  // Personalized Schemes State
  const [personalizedSchemes, setPersonalizedSchemes] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Confirmation / Discrepancy Modal State
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [selectedRecordForConfirm, setSelectedRecordForConfirm] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    amount_received_reported: '',
    payment_date_reported: new Date().toISOString().split('T')[0],
    bank_name_reported: user?.bankName || 'State Bank of India',
    account_last4_reported: user?.accountNumber ? user.accountNumber.slice(-4) : '4102',
    confirmation_status: 'Confirmed Received',
    beneficiary_notes: ''
  });
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  // Edit Profile State
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    occupation: user?.occupation || 'Farmer',
    annualIncome: user?.annualIncome || 180000,
    age: user?.age || 28,
    gender: user?.gender || 'Male',
    state: user?.state || 'Madhya Pradesh',
    district: user?.district || 'Indore',
    category: user?.category || 'OBC',
    bankName: user?.bankName || 'State Bank of India',
    accountNumber: user?.accountNumber || 'XXXX-XXXX-4102',
    ifscCode: user?.ifscCode || 'SBIN0001842'
  });

  useEffect(() => {
    loadBenefitPayments();
    loadConfirmations();
    loadPersonalizedSchemes();
  }, []);

  const loadBenefitPayments = async () => {
    setBenefitLoading(true);
    try {
      const data = await api.getBenefitPayments();
      setBenefitData(data);
    } catch (err) {
      console.error('Failed to load benefit payments:', err);
    } finally {
      setBenefitLoading(false);
    }
  };

  const loadConfirmations = async () => {
    try {
      const data = await api.getMyConfirmations();
      setConfirmations(data);
    } catch (err) {
      console.error('Failed to load confirmations:', err);
    }
  };

  const loadPersonalizedSchemes = async () => {
    setMatchesLoading(true);
    try {
      const matches = await api.getPersonalizedSchemes();
      setPersonalizedSchemes(matches);
    } catch (err) {
      console.error('Failed to evaluate personalized schemes:', err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleOpenConfirmModal = (record) => {
    setSelectedRecordForConfirm(record);
    setConfirmForm({
      amount_received_reported: record.amount || record.sanctioned_amount || '',
      payment_date_reported: new Date().toISOString().split('T')[0],
      bank_name_reported: user?.bankName || 'State Bank of India',
      account_last4_reported: user?.accountNumber ? user.accountNumber.slice(-4) : '4102',
      confirmation_status: 'Confirmed Received',
      beneficiary_notes: ''
    });
    setConfirmationModalOpen(true);
  };

  const handleSubmitConfirmation = async (e) => {
    e.preventDefault();
    if (!selectedRecordForConfirm) return;
    setConfirmSubmitting(true);
    try {
      const payload = {
        payment_record_id: selectedRecordForConfirm.id,
        scheme_id: selectedRecordForConfirm.scheme_id,
        application_id: selectedRecordForConfirm.application_id,
        confirmation_status: confirmForm.confirmation_status,
        amount_received_reported: parseFloat(confirmForm.amount_received_reported) || 0,
        payment_date_reported: confirmForm.payment_date_reported,
        bank_name_reported: confirmForm.bank_name_reported,
        account_last4_reported: confirmForm.account_last4_reported,
        beneficiary_notes: confirmForm.beneficiary_notes
      };

      await api.submitBeneficiaryConfirmation(payload);
      alert('Your payment confirmation has been saved and logged in the transparent audit trail.');
      setConfirmationModalOpen(false);
      loadBenefitPayments();
      loadConfirmations();
    } catch (err) {
      alert(err.message || 'Failed to submit confirmation.');
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const handleVerifyGateway = async (paymentId) => {
    try {
      const res = await api.verifyPayment(paymentId);
      alert(`PFMS Gateway Response: ${res.verification_status}`);
      loadBenefitPayments();
    } catch (err) {
      alert('Verification inquiry failed: ' + err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(editFormData);
      setUser(prev => ({
        ...prev,
        ...editFormData
      }));
      setIsEditing(false);
      alert('Beneficiary profile updated successfully.');
      loadPersonalizedSchemes();
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Credited':
      case 'Disbursed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            {status}
          </span>
        );
      case 'Partially Disbursed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 mr-1 text-sky-600" />
            Partially Disbursed
          </span>
        );
      case 'Disputed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            Discrepancy Reported
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            In Treasury Processing
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            Pending Sanction
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- BENEFICIARY BANNER --- */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-card ring-2 ring-brand-100 shrink-0">
              {user?.avatarInitials || user?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
                <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  e-KYC Verified Beneficiary
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span>Phone: <strong className="text-slate-700">+91 {user?.phone?.slice(-10)}</strong></span>
                <span>•</span>
                <span>Masked Aadhaar: <strong className="text-slate-700">{user?.aadhaarMasked || 'XXXX-XXXX-4819'}</strong></span>
                <span>•</span>
                <span>Jurisdiction: <strong className="text-slate-700">{user?.district}, {user?.state}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={loadBenefitPayments}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold flex items-center space-x-1.5 border border-brand-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              <span>View Profile</span>
            </button>
          </div>
        </div>

        {/* --- ATTENTION ALERT BANNER IF DISCREPANCY DETECTED --- */}
        {benefitData.total_discrepancy > 0 && (
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-4 mb-6 shadow-xs flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 text-sm">Payment Discrepancy Needs Attention</span>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  Shortfall: ₹{benefitData.total_discrepancy.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-rose-700 mt-1">
                A shortfall between the officially sanctioned amount and your self-reported bank credit has been detected on one or more welfare benefits. The nodal welfare officer has been alerted and an audit investigation is currently in progress.
              </p>
            </div>
          </div>
        )}

        {/* --- 5 PROMINENT CORE TRANSPARENCY KPI CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          
          {/* Card 1: Total Sanctioned */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Sanctioned</span>
              <Scale className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              ₹{benefitData.total_sanctioned.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-brand-700 font-medium mt-1 block">
              Approved Government Entitlement
            </span>
          </div>

          {/* Card 2: Total Disbursed */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Disbursed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              ₹{benefitData.total_disbursed.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Released from Govt Treasury
            </span>
          </div>

          {/* Card 3: Total Pending */}
          <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Total Pending</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              ₹{benefitData.total_pending.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-sky-600 font-medium mt-1 block">
              Sanctioned minus Disbursed
            </span>
          </div>

          {/* Card 4: Discrepancy Amount */}
          <div className={`p-4 rounded-2xl border shadow-xs relative overflow-hidden ${
            benefitData.total_discrepancy > 0 
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                benefitData.total_discrepancy > 0 ? 'text-rose-800' : 'text-slate-500'
              }`}>
                Discrepancy Amount
              </span>
              <AlertTriangle className={`w-4 h-4 ${
                benefitData.total_discrepancy > 0 ? 'text-rose-600' : 'text-slate-400'
              }`} />
            </div>
            <span className={`text-2xl font-black mt-1.5 block ${
              benefitData.total_discrepancy > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              ₹{benefitData.total_discrepancy.toLocaleString('en-IN')}
            </span>
            <span className={`text-[11px] font-medium mt-1 block ${
              benefitData.total_discrepancy > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}>
              {benefitData.total_discrepancy > 0 ? 'Flagged for Resolution' : 'Zero Discrepancy'}
            </span>
          </div>

          {/* Card 5: Verification Rate */}
          <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">PFMS Gateway Audit</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1.5 block">
              {benefitData.records_count > 0 
                ? `${Math.round((benefitData.verified_records_count / benefitData.records_count) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-[11px] text-teal-700 font-medium mt-1 block">
              {benefitData.verified_records_count} of {benefitData.records_count} Records Reconciled
            </span>
          </div>

        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none bg-white p-1 rounded-2xl shadow-xs">
          {[
            { id: 'transparency', label: 'Sanction vs Received Comparison', icon: Scale },
            { id: 'ledger', label: 'Payment Ledger & Audit Trail', count: benefitData.records_count, icon: Banknote },
            { id: 'confirmations', label: 'Beneficiary Confirmations', count: confirmations.length, icon: CheckCheck },
            { id: 'matches', label: 'Eligible Schemes for You', count: personalizedSchemes.filter(p => p.is_eligible).length, icon: Sparkles },
            { id: 'applications', label: 'My Applications', count: applications.length, icon: FileText },
            { id: 'details', label: 'Beneficiary Profile & KYC', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* --- TAB 1: SANCTIONED VS RECEIVED COMPARISON (Week 1 & 5) --- */}
        {/* ============================================================ */}
        {activeTab === 'transparency' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Sanctioned versus Received Comparison</h2>
                  <p className="text-xs text-slate-500">
                    Transparent comparison between officially approved government sanctions, treasury disbursements, and self-reported bank credits.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-brand-600 mr-1.5"></span>Sanctioned</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>Disbursed</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-1.5"></span>Received</span>
                </div>
              </div>

              {benefitData.records.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No benefit disbursement records found.</div>
              ) : (
                <div className="space-y-4 mt-6">
                  {benefitData.records.map((r) => {
                    const sanctioned = r.sanctioned_amount || r.amount;
                    const disbursed = r.amount;
                    const received = r.amount_reported_received !== null && r.amount_reported_received !== undefined 
                      ? r.amount_reported_received 
                      : disbursed;
                    const pending = Math.max(0, sanctioned - disbursed);
                    const discrepancy = r.discrepancy_amount || 0;
                    const pctDisbursed = Math.min(100, Math.round((disbursed / (sanctioned || 1)) * 100));

                    return (
                      <div 
                        key={r.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          discrepancy > 0 
                            ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-100' 
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-bold font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                Installment #{r.installment_number}
                              </span>
                              {getStatusBadge(r.status)}
                              {r.beneficiary_confirmation_status === 'Confirmed Received' && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                                  <Check className="w-3 h-3 mr-0.5" /> Confirmed by You
                                </span>
                              )}
                              {r.beneficiary_confirmation_status === 'Reported Partial Amount' && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-0.5" /> Discrepancy Reported
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-black text-slate-900">{r.scheme_title}</h3>
                            <p className="text-xs text-slate-500">
                              Disbursed on {new Date(r.disbursement_date).toLocaleDateString()} via {r.payment_mode} • A/c: {r.bank_account_masked}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleOpenConfirmModal(r)}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs flex items-center space-x-1.5"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Confirm / Report Discrepancy</span>
                            </button>
                            <button
                              onClick={() => handleVerifyGateway(r.id)}
                              className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 flex items-center space-x-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                              <span>Verify PFMS</span>
                            </button>
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 mb-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-semibold block">Sanctioned Amount</span>
                            <span className="text-sm font-bold text-slate-900">₹{sanctioned.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block">Govt Disbursed</span>
                            <span className="text-sm font-bold text-emerald-700">₹{disbursed.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block">Reported Received</span>
                            <span className={`text-sm font-bold ${
                              received < sanctioned ? 'text-amber-700' : 'text-slate-900'
                            }`}>
                              ₹{received.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold block">Pending / Discrepancy</span>
                            <span className={`text-sm font-bold ${
                              discrepancy > 0 ? 'text-rose-600' : (pending > 0 ? 'text-sky-600' : 'text-emerald-600')
                            }`}>
                              {discrepancy > 0 
                                ? `₹${discrepancy.toLocaleString('en-IN')} Shortfall` 
                                : (pending > 0 ? `₹${pending.toLocaleString('en-IN')} Pending` : 'Nil (100% Paid)')}
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                            <span>Disbursement Progress: {pctDisbursed}% of Sanctioned Released</span>
                            <span>{pctDisbursed === 100 ? 'Fully Disbursed' : `₹${pending.toLocaleString('en-IN')} Remaining`}</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full ${discrepancy > 0 ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full transition-all duration-500`}
                              style={{ width: `${pctDisbursed}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Discrepancy & Verification Notes */}
                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">Official Gateway Verification:</span>
                            <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded ${
                              r.verification_status?.includes('Verified') 
                                ? 'bg-emerald-50 text-emerald-800' 
                                : 'bg-amber-50 text-amber-800'
                            }`}>
                              {r.verification_status}
                            </span>
                          </div>
                          <div className="font-mono text-slate-500">
                            Ref: {r.utr_number || r.pfms_reference_id || 'Awaiting Bank Generation'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 2: DETAILED PAYMENT LEDGER & AUDIT TRAIL --- */}
        {/* ============================================================ */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900">Official Government Payment Ledger</h2>
                <p className="text-xs text-slate-500">Chronological audit trail of all Direct Benefit Transfers (DBT) and statutory sanctions.</p>
              </div>
              <button
                onClick={loadBenefitPayments}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-query Records</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Scheme & Installment</th>
                    <th className="p-4">Sanctioned</th>
                    <th className="p-4">Disbursed</th>
                    <th className="p-4">Pending</th>
                    <th className="p-4">Payment Route</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verification Audit</th>
                    <th className="p-4">Bank Ref (UTR)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benefitData.records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{r.scheme_title}</span>
                        <span className="text-[10px] text-slate-500">Installment #{r.installment_number}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        ₹{(r.sanctioned_amount || r.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-700">
                        ₹{r.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-600">
                        ₹{Math.max(0, (r.sanctioned_amount || r.amount) - r.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-slate-600">
                        {r.payment_mode}
                        <span className="text-[10px] font-mono text-slate-400 block">{r.bank_account_masked}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.verification_status?.includes('Verified') 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {r.verification_status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-700">
                        {r.utr_number || r.pfms_reference_id || 'Pending'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenConfirmModal(r)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-[11px] mr-1.5"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleVerifyGateway(r.id)}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded text-brand-800 font-bold text-[11px]"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 3: BENEFICIARY CONFIRMATIONS & DISCREPANCIES (Week 2) --- */}
        {/* ============================================================ */}
        {activeTab === 'confirmations' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Your Self-Reported Confirmations & Discrepancies</h2>
                <p className="text-xs text-slate-500">
                  IMPORTANT: Beneficiary confirmations are citizen self-reported claims recorded in the transparency registry. They trigger official scrutiny and are kept distinct from independent bank gateway verifications.
                </p>
              </div>
              <button
                onClick={loadConfirmations}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Claims</span>
              </button>
            </div>

            {confirmations.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                You haven't submitted any receipt confirmations or discrepancy reports yet.
              </div>
            ) : (
              <div className="space-y-4">
                {confirmations.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{c.scheme_title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.confirmation_status === 'Confirmed Received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.confirmation_status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Reported on {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/60 mb-2">
                      <div>
                        <span className="text-slate-500 block">Sanctioned:</span>
                        <span className="font-bold text-slate-900">₹{c.amount_sanctioned?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Disbursed:</span>
                        <span className="font-bold text-slate-900">₹{c.amount_disbursed?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Reported Received:</span>
                        <span className="font-bold text-slate-900">₹{c.amount_received_reported?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Discrepancy:</span>
                        <span className={`font-bold ${c.discrepancy_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹{c.discrepancy_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {c.beneficiary_notes && (
                      <p className="text-xs text-slate-700 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/60 mb-2">
                        "<strong>Your Notes:</strong> {c.beneficiary_notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-semibold">Admin Scrutiny Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          c.admin_status === 'Claim Reconciled' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.admin_status}
                        </span>
                      </div>
                      {c.admin_notes && (
                        <span className="text-slate-600 text-[11px]">Officer: {c.admin_notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 4: PERSONALISED ELIGIBLE SCHEMES --- */}
        {/* ============================================================ */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personalised Scheme Recommendations</h2>
                <p className="text-xs text-slate-500">
                  Calculated against your registered age ({user?.age} yrs), income (₹{user?.annualIncome?.toLocaleString('en-IN')}), occupation ({user?.occupation}), and social category ({user?.category}).
                </p>
              </div>
              <button
                onClick={loadPersonalizedSchemes}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {matchesLoading ? (
              <div className="p-12 text-center text-slate-400">Evaluating deterministic eligibility criteria against genuine scheme databases...</div>
            ) : personalizedSchemes.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border text-center text-slate-500">No schemes found matching your profile.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalizedSchemes.map(({ scheme, is_eligible, match_percentage, eligible_reasons, unmet_criteria }) => (
                  <div 
                    key={scheme.id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                      is_eligible ? 'border-teal-300 ring-1 ring-teal-100' : 'border-slate-200 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                          {scheme.level} Scheme • {scheme.category}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          is_eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {is_eligible ? <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" /> : null}
                          <span>{is_eligible ? `${match_percentage}% Fully Eligible` : `${match_percentage}% Match`}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1">{scheme.title}</h3>
                      <p className="text-xs text-slate-500 mb-3">{scheme.ministry}</p>

                      <div className="p-3 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200/60 rounded-xl mb-3">
                        <span className="text-[10px] font-bold uppercase text-teal-900 tracking-wider block">Official Entitlement</span>
                        <span className="text-sm font-black text-slate-900">{scheme.benefit}</span>
                        <span className="text-[11px] text-teal-800 block mt-0.5">{scheme.benefit_type}</span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <span className="text-[11px] font-bold text-slate-700 block">Eligibility Breakdown:</span>
                        {eligible_reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-start text-xs text-emerald-700">
                            <Check className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5 text-emerald-600" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Deadline: <strong className="text-slate-800">{scheme.deadline}</strong>
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={scheme.official_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => onApplyScheme(scheme)}
                          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 5: MY APPLICATIONS & STATUS --- */}
        {/* ============================================================ */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900">Your Submitted Applications</h2>
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No applications submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-brand-700">{app.id}</span>
                        {getStatusBadge(app.status)}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{app.scheme_title || app.scheme_id}</h4>
                      <p className="text-xs text-slate-500">
                        Applied on {new Date(app.applied_date).toLocaleDateString()} • {app.status_remarks}
                      </p>
                    </div>
                    <button
                      onClick={() => onTrackApp(app.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Track Scrutiny Stages</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 6: BENEFICIARY PROFILE & KYC DETAILS --- */}
        {/* ============================================================ */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Beneficiary Profile & Direct Bank Mapping</h2>
                <p className="text-xs text-slate-500">Registered demographic parameters and bank coordinates for direct welfare credits.</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-brand-50 hover:bg-brand-100 rounded-xl text-xs font-bold text-brand-800 border border-brand-200"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    value={editFormData.annualIncome}
                    onChange={(e) => setEditFormData({ ...editFormData, annualIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={editFormData.bankName}
                    onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Full Legal Name</span>
                  <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Registered Mobile Number</span>
                  <span className="text-sm font-bold text-slate-900">+91 {user?.phone}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Aadhaar (Privacy Masked)</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{user?.aadhaarMasked || 'XXXX-XXXX-4819'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Annual Family Income</span>
                  <span className="text-sm font-bold text-slate-900">₹{user?.annualIncome?.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Occupation & Category</span>
                  <span className="text-sm font-bold text-slate-900">{user?.occupation} ({user?.category})</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Bank Account & IFSC</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{user?.bankName} ({user?.ifscCode})</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* --- CONFIRMATION & DISCREPANCY FILING MODAL (Week 2 & 5) --- */}
      {/* ============================================================ */}
      {confirmationModalOpen && selectedRecordForConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  Beneficiary Confirmation
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Confirm Benefit Receipt or Report Shortfall
                </h3>
              </div>
              <button onClick={() => setConfirmationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scheme & Sanction Overview */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs space-y-1">
              <p><strong>Scheme:</strong> {selectedRecordForConfirm.scheme_title}</p>
              <p><strong>Sanctioned Amount:</strong> ₹{(selectedRecordForConfirm.sanctioned_amount || selectedRecordForConfirm.amount).toLocaleString('en-IN')}</p>
              <p><strong>Treasury Disbursed:</strong> ₹{selectedRecordForConfirm.amount.toLocaleString('en-IN')}</p>
              <p><strong>Disbursement Route:</strong> {selectedRecordForConfirm.payment_mode}</p>
            </div>

            <form onSubmit={handleSubmitConfirmation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Confirmation Type *
                </label>
                <select
                  value={confirmForm.confirmation_status}
                  onChange={(e) => setConfirmForm({ ...confirmForm, confirmation_status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Confirmed Received">Full Amount Received in Bank</option>
                  <option value="Reported Partial Amount">Partial Amount Received (Report Shortfall)</option>
                  <option value="Reported Not Received">Zero Amount Received (Missing Payment)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Amount Actually Credited into Your Bank (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={confirmForm.amount_received_reported}
                  onChange={(e) => setConfirmForm({ ...confirmForm, amount_received_reported: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm"
                  placeholder="e.g. 2000"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Check your bank SMS or passbook entry for the exact credit amount.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Date Received</label>
                  <input
                    type="date"
                    value={confirmForm.payment_date_reported}
                    onChange={(e) => setConfirmForm({ ...confirmForm, payment_date_reported: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Bank Account Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={confirmForm.account_last4_reported}
                    onChange={(e) => setConfirmForm({ ...confirmForm, account_last4_reported: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Beneficiary Remarks / Discrepancy Explanation:
                </label>
                <textarea
                  rows={3}
                  value={confirmForm.beneficiary_notes}
                  onChange={(e) => setConfirmForm({ ...confirmForm, beneficiary_notes: e.target.value })}
                  placeholder="If you received less than sanctioned, describe the missing amount or any transaction note..."
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>

              {/* Legal Transparency Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Legal Notice:</strong> Your submission is recorded as a self-reported citizen claim in the BenefitLens audit trail. In case of discrepancy, the district nodal officer is alerted to investigate with bank gateway logs.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs disabled:opacity-50"
                >
                  {confirmSubmitting ? 'Recording Claim...' : 'Submit Confirmation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
