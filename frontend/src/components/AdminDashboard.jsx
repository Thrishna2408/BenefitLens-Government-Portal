import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Banknote,
  Building2,
  Users,
  PlusCircle,
  Search,
  Filter,
  ChevronRight,
  X,
  Check,
  Eye,
  Send,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Bell,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Scale,
  CheckCheck,
  History,
  FileCheck2,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import { EligibilityCalculator } from './EligibilityCalculator';
import { FAQSection } from './FAQSection';
import { GrievanceModal } from './GrievanceModal';
import { HeroSection } from './HeroSection';
import { SchemeCatalog } from './SchemeCatalog';
import { SchemeDetailsModal } from './SchemeDetailsModal';
import { TrackApplicationWidget } from './TrackApplicationWidget';

export const AdminDashboard = ({ user }) => {
  // Tabs: 'disbursements', 'confirmations', 'queue', 'audit', 'schemes', 'sms'
  const [adminTab, setAdminTab] = useState('disbursements');
  const [disbursementFilter, setDisbursementFilter] = useState('All');
  const [appFilter, setAppFilter] = useState('All');
  const [confFilter, setConfFilter] = useState('All');

  const [analytics, setAnalytics] = useState({
    total_schemes: 12,
    active_schemes: 12,
    total_citizens: 1,
    total_applications: 5,
    approved_applications: 4,
    pending_applications: 1,
    total_sms_sent: 2,
    total_sanctioned: 138000,
    total_dbt_disbursed: 50000,
    total_disbursed: 50000,
    total_pending: 88000,
    reported_discrepancies_count: 1,
    verified_disbursements_count: 3,
    awaiting_verification_count: 1,
    dbt_formatted: '₹50,000',
    sanctioned_formatted: '₹1,38,000',
    pending_formatted: '₹88,000'
  });

  const [disbursements, setDisbursements] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [schemesList, setSchemesList] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Review & Action Modal
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [sanctionAmountInput, setSanctionAmountInput] = useState(2000);

  // Discrepancy Review Modal
  const [reviewConfModal, setReviewConfModal] = useState(null);
  const [reviewConfStatus, setReviewConfStatus] = useState('Under Investigation');
  const [reviewConfNotes, setReviewConfNotes] = useState('');

  // Update Disbursement Modal
  const [editDisbursementModal, setEditDisbursementModal] = useState(null);
  const [editDisbForm, setEditDisbForm] = useState({
    status: 'Credited',
    verification_status: 'Independently Verified via PFMS Gateway',
    utr_number: '',
    pfms_reference_id: '',
    data_source: 'Public Financial Management System (PFMS)',
    remarks: ''
  });

  // Add Scheme Modal
  const [newSchemeModal, setNewSchemeModal] = useState(false);
  const [schemeForm, setSchemeForm] = useState({
    id: '',
    title: '',
    code: '',
    ministry: 'Ministry of Social Justice & Empowerment',
    level: 'Central',
    state: 'All India',
    category: 'Social Security',
    benefit: '₹3,000 / month',
    benefit_type: 'Direct Benefit Transfer (DBT)',
    sanctioned_amount_default: 3000.0,
    short_description: '',
    full_description: '',
    official_portal_url: 'https://myscheme.gov.in',
    deadline: '31 Dec 2026',
    min_age: 18,
    max_age: 65,
    max_income: 300000.0,
    eligible_occupations: ['Any'],
    eligible_genders: ['Any'],
    eligible_categories: ['All'],
    eligible_states: ['All India'],
    criteria_list: ['Bonafide citizen of India', 'Annual income under ₹3 Lakhs'],
    documents_required: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook'],
    source_name: 'myscheme.gov.in'
  });

  useEffect(() => {
    loadAllAdminData();
  }, [disbursementFilter, appFilter, confFilter]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [stats, apps, disbs, confs, audits, schemes, sms] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminApplications(appFilter),
        api.getAdminDisbursements(disbursementFilter),
        api.getAdminConfirmations(confFilter),
        api.getAdminAuditLogs(),
        api.getSchemes(),
        api.getAdminSmsLogs()
      ]);

      if (stats) setAnalytics(stats);
      if (apps) setApplications(apps);
      if (disbs) setDisbursements(disbs);
      if (confs) setConfirmations(confs);
      if (audits) setAuditLogs(audits);
      if (schemes) setSchemesList(schemes);
      if (sms) setSmsLogs(sms);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.updateAppStatus(
        appId,
        newStatus,
        remarksInput,
        user?.name || 'Dr. Rameshwar Singh (IAS)',
        newStatus === 'Approved' ? parseFloat(sanctionAmountInput) : null
      );
      alert(`Application ${appId} status updated to ${newStatus}. Notification sent.`);
      setReviewModalApp(null);
      setRemarksInput('');
      loadAllAdminData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleReviewDiscrepancy = async (e) => {
    e.preventDefault();
    if (!reviewConfModal) return;
    try {
      await api.reviewDiscrepancy(reviewConfModal.id, {
        admin_status: reviewConfStatus,
        admin_notes: reviewConfNotes
      });
      alert(`Confirmation #${reviewConfModal.id} reviewed and updated to ${reviewConfStatus}.`);
      setReviewConfModal(null);
      setReviewConfNotes('');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to review discrepancy: ' + err.message);
    }
  };

  const handleSaveDisbursementEdit = async (e) => {
    e.preventDefault();
    if (!editDisbursementModal) return;
    try {
      await api.updateDisbursement(editDisbursementModal.id, editDisbForm);
      alert('Disbursement record updated successfully.');
      setEditDisbursementModal(null);
      loadAllAdminData();
    } catch (err) {
      alert('Failed to update disbursement: ' + err.message);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      await api.createScheme({
        ...schemeForm,
        sanctioned_amount_default: parseFloat(schemeForm.sanctioned_amount_default) || 0
      });
      alert('Verified Government Scheme added. Automatic SMS alerts evaluated and dispatched to eligible citizens.');
      setNewSchemeModal(false);
      loadAllAdminData();
    } catch (err) {
      alert('Failed to add scheme: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Credited':
      case 'Disbursed':
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            {status}
          </span>
        );
      case 'Partially Disbursed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
            <Clock className="w-3 h-3 mr-1 text-sky-600" />
            Partially Disbursed
          </span>
        );
      case 'Disputed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            Discrepancy Reported
          </span>
        );
      case 'Processing':
      case 'Under Verification':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            {status}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- HEADER --- */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Nodal Administrator & Officer Monitoring Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Benefit<span className="text-teal-400">Lens</span> Disbursement Administration
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitor transparent benefit disbursement batches, cross-reference PFMS reconciliation records, investigate beneficiary discrepancy filings, and audit the complete payment pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setNewSchemeModal(true)}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Verified Scheme</span>
            </button>
            <button
              onClick={loadAllAdminData}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* --- 6 AGGREGATE TRANSPARENCY METRICS CARDS (Calculated from PostgreSQL) --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Sanctioned</span>
            <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
              ₹{analytics.total_sanctioned?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-brand-700 font-semibold block mt-0.5">Approved Entitlements</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Disbursed</span>
            <span className="text-xl font-black text-emerald-700 mt-1 block font-mono">
              ₹{analytics.total_disbursed?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Treasury Releases</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">Pending Balance</span>
            <span className="text-xl font-black text-sky-700 mt-1 block font-mono">
              ₹{analytics.total_pending?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">Tranches in Pipeline</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Reported Discrepancies</span>
            <span className="text-xl font-black text-rose-700 mt-1 block font-mono">
              {analytics.reported_discrepancies_count}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Citizen Claims Under Scrutiny</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">PFMS Reconciled</span>
            <span className="text-xl font-black text-teal-700 mt-1 block font-mono">
              {analytics.verified_disbursements_count}
            </span>
            <span className="text-[10px] text-teal-600 font-semibold block mt-0.5">Gateway Verified</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Schemes</span>
            <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
              {analytics.total_schemes}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{analytics.total_citizens} Beneficiaries</span>
          </div>

        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none bg-white p-1 rounded-2xl shadow-xs">
          {[
            { id: 'disbursements', label: 'Payment Records & Filters', count: disbursements.length, icon: Banknote },
            { id: 'confirmations', label: 'Beneficiary Confirmations & Discrepancies', count: confirmations.length, icon: CheckCheck },
            { id: 'queue', label: 'Application Verification Queue', count: applications.length, icon: FileText },
            { id: 'audit', label: 'Transparent Audit Trail', count: auditLogs.length, icon: History },
            { id: 'schemes', label: 'Verified Schemes Catalog', count: schemesList.length, icon: Building2 },
            { id: 'sms', label: 'SMS Gateway Dispatch Logs', count: smsLogs.length, icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`py-2.5 px-4 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex items-center space-x-2 ${adminTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${adminTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* --- TAB 1: DISBURSEMENT MANAGEMENT & FILTERS (Week 7) --- */}
        {/* ============================================================ */}
        {adminTab === 'disbursements' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900">Government Benefit Disbursement Records</h2>
                <p className="text-xs text-slate-500">
                  Filter and manage payment statuses: Pending, Approved, Partially Disbursed, Disbursed, Disputed, Unverified.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                <span className="text-xs text-slate-400 font-semibold mr-1">Filter:</span>
                {['All', 'Disbursed', 'Partially Disbursed', 'Disputed', 'Pending', 'Unverified'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDisbursementFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${disbursementFilter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Beneficiary & Phone</th>
                    <th className="p-4">Scheme & Inst.</th>
                    <th className="p-4">Sanctioned</th>
                    <th className="p-4">Disbursed</th>
                    <th className="p-4">Pending</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4">Bank Ref (UTR)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disbursements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">No records found matching filter.</td>
                    </tr>
                  ) : (
                    disbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{d.beneficiary_name}</span>
                          <span className="text-[10px] text-slate-500">+91 {d.beneficiary_phone?.slice(-10)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800 block">{d.scheme_title}</span>
                          <span className="text-[10px] text-slate-400">Installment #{d.installment_number}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          ₹{d.sanctioned_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          ₹{d.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono font-bold text-sky-700">
                          ₹{d.pending_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(d.status)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${d.verification_status?.includes('Verified')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                            {d.verification_status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-700">
                          {d.utr_number || d.pfms_reference_id || 'Pending Generation'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setEditDisbursementModal(d);
                              setEditDisbForm({
                                status: d.status,
                                verification_status: d.verification_status,
                                utr_number: d.utr_number || '',
                                pfms_reference_id: d.pfms_reference_id || '',
                                data_source: d.data_source || 'Public Financial Management System (PFMS)',
                                remarks: ''
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-[11px]"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 2: BENEFICIARY CONFIRMATIONS & DISCREPANCY SCRUTINY --- */}
        {/* ============================================================ */}
        {adminTab === 'confirmations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900">Beneficiary Confirmation & Discrepancy Queue</h2>
                <p className="text-xs text-slate-500">
                  Scrutinize self-reported citizen payment claims. Reconcile reported shortfalls with bank gateway transfer records.
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                {['All', 'Under Investigation', 'Claim Reconciled', 'Pending Scrutiny'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setConfFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${confFilter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Claim ID & Date</th>
                    <th className="p-4">Scheme</th>
                    <th className="p-4">Sanctioned</th>
                    <th className="p-4">Reported Received</th>
                    <th className="p-4">Discrepancy Shortfall</th>
                    <th className="p-4">Beneficiary Notes</th>
                    <th className="p-4">Scrutiny Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {confirmations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">No confirmations matching criteria.</td>
                    </tr>
                  ) : (
                    confirmations.map((c) => (
                      <tr key={c.id} className={`hover:bg-slate-50 ${c.discrepancy_amount > 0 ? 'bg-rose-50/20' : ''}`}>
                        <td className="p-4 font-mono">
                          <span className="font-bold text-slate-900 block">#{c.id}</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {c.scheme_title}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          ₹{c.amount_sanctioned?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          ₹{c.amount_received_reported?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`font-mono font-bold ${c.discrepancy_amount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            ₹{c.discrepancy_amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs text-slate-600 italic">
                          "{c.beneficiary_notes || 'Confirmed without remarks'}"
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.admin_status === 'Claim Reconciled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}>
                            {c.admin_status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setReviewConfModal(c);
                              setReviewConfStatus(c.admin_status);
                              setReviewConfNotes(c.admin_notes || '');
                            }}
                            className="px-3 py-1 bg-brand-50 hover:bg-brand-100 rounded text-brand-800 font-bold text-[11px]"
                          >
                            Scrutinize
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 3: APPLICATION VERIFICATION & SANCTION QUEUE --- */}
        {/* ============================================================ */}
        {adminTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-slate-900">Application Scrutiny & Sanction Pipeline</h2>
                <p className="text-xs text-slate-500">Approve citizen scheme applications and trigger statutory Direct Benefit Transfer (DBT) sanctions.</p>
              </div>

              <div className="flex items-center space-x-1.5">
                {['All', 'Submitted', 'Under Verification', 'Approved', 'Action Required'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setAppFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${appFilter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">ARN & Date</th>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Scheme</th>
                    <th className="p-4">Masked Aadhaar</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Sanctioned</th>
                    <th className="p-4 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-brand-700">
                        {app.id}
                        <span className="text-[10px] text-slate-400 block font-normal">{app.applied_date}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{app.applicant_name}</span>
                        <span className="text-[10px] text-slate-500">{app.applicant_state}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {app.scheme_title}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {app.aadhaar_masked}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-700">
                        {app.sanctioned_amount > 0 ? `₹${app.sanctioned_amount.toLocaleString('en-IN')}` : 'Pending Sanction'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setReviewModalApp(app);
                            setRemarksInput(app.status_remarks || '');
                            setSanctionAmountInput(app.sanctioned_amount || 2000);
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold"
                        >
                          Review Desk
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
        {/* --- TAB 4: TRANSPARENT PAYMENT AUDIT TRAIL --- */}
        {/* ============================================================ */}
        {adminTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Public Accountability & Payment Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable chronological record of all status changes, disbursement releases, and discrepancy filings.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action Event</th>
                    <th className="p-4">Actor & Role</th>
                    <th className="p-4">Transition</th>
                    <th className="p-4">Audit Assessment & Remarks</th>
                    <th className="p-4">Evidence Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{log.actor_name}</span>
                        <span className="text-[10px] text-teal-700 font-medium">{log.actor_role}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-400">{log.previous_status || 'Initiated'}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-bold text-slate-800">{log.new_status}</span>
                      </td>
                      <td className="p-4 max-w-sm text-slate-700 leading-relaxed">
                        {log.remarks}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {log.evidence_reference || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 5: SCHEMES CATALOG --- */}
        {/* ============================================================ */}
        {adminTab === 'schemes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-slate-900">Verified Welfare Schemes Registry</h2>
                <p className="text-xs text-slate-500">Sourced directly from verified government portals (myscheme.gov.in, india.gov.in).</p>
              </div>
              <button
                onClick={() => setNewSchemeModal(true)}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                + Add Scheme
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemesList.map((scheme) => (
                <div key={scheme.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                        {scheme.level} Scheme • {scheme.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Source: {scheme.source_name}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base mb-1">{scheme.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{scheme.ministry}</p>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 mb-2">
                      Entitlement: {scheme.benefit}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{scheme.short_description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Deadline: <strong>{scheme.deadline}</strong></span>
                    <a
                      href={scheme.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- TAB 6: SMS LOGS --- */}
        {/* ============================================================ */}
        {adminTab === 'sms' && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">National SMS Gateway Transmission Logs</h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Notification Title</th>
                    <th className="p-4">Message Body</th>
                    <th className="p-4">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold">+91 {log.phone?.slice(-10)}</td>
                      <td className="p-4 font-bold text-slate-900">{log.title}</td>
                      <td className="p-4 max-w-sm font-mono text-[11px] text-slate-700">{log.message}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {log.gateway_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- DESK SCRUTINY MODAL --- */}
      {reviewModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {reviewModalApp.id}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">Official Desk Scrutiny</h3>
              </div>
              <button onClick={() => setReviewModalApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <p><strong>Applicant:</strong> {reviewModalApp.applicant_name} (+91 {reviewModalApp.applicant_phone?.slice(-10)})</p>
              <p><strong>Scheme:</strong> {reviewModalApp.scheme_title}</p>
              <p><strong>Masked Aadhaar:</strong> {reviewModalApp.aadhaar_masked}</p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sanctioned Entitlement Amount (₹):</label>
                <input
                  type="number"
                  value={sanctionAmountInput}
                  onChange={(e) => setSanctionAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Scrutiny Assessment Notes (Sent via SMS):</label>
                <textarea
                  rows={3}
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleUpdateStatus(reviewModalApp.id, 'Action Required')}
                className="px-3 py-1.5 bg-orange-50 text-orange-800 rounded-lg text-xs font-bold"
              >
                Request Docs
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(reviewModalApp.id, 'Rejected')}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(reviewModalApp.id, 'Approved')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Approve & Sanction DBT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DISCREPANCY REVIEW MODAL --- */}
      {reviewConfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                  Discrepancy Scrutiny #{reviewConfModal.id}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">Investigate Beneficiary Shortfall</h3>
              </div>
              <button onClick={() => setReviewConfModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewDiscrepancy} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong>Scheme:</strong> {reviewConfModal.scheme_title}</p>
                <p><strong>Sanctioned:</strong> ₹{reviewConfModal.amount_sanctioned?.toLocaleString('en-IN')}</p>
                <p><strong>Beneficiary Reported Received:</strong> ₹{reviewConfModal.amount_received_reported?.toLocaleString('en-IN')}</p>
                <p className="text-rose-700 font-bold"><strong>Reported Shortfall:</strong> ₹{reviewConfModal.discrepancy_amount?.toLocaleString('en-IN')}</p>
                <p className="italic text-slate-600">"Beneficiary Note: {reviewConfModal.beneficiary_notes || 'None'}"</p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Investigation Decision Status *</label>
                <select
                  value={reviewConfStatus}
                  onChange={(e) => setReviewConfStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Under Investigation">Under Investigation (Auditing Bank Gateway)</option>
                  <option value="Claim Reconciled">Claim Reconciled (Balance Released & Reconciled)</option>
                  <option value="Claim Disputed">Claim Disputed (Bank Transfer Confirmed Complete)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Nodal Officer Findings & Remarks *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewConfNotes}
                  onChange={(e) => setReviewConfNotes(e.target.value)}
                  placeholder="Document the gateway audit details, bank response, or remedial action taken..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewConfModal(null)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Investigation Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT DISBURSEMENT MODAL --- */}
      {editDisbursementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  Payment #{editDisbursementModal.id}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">Update Disbursement Record</h3>
              </div>
              <button onClick={() => setEditDisbursementModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisbursementEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Payment Status</label>
                  <select
                    value={editDisbForm.status}
                    onChange={(e) => setEditDisbForm({ ...editDisbForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Credited">Credited</option>
                    <option value="Partially Disbursed">Partially Disbursed</option>
                    <option value="Processing">Processing</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Verification Status</label>
                  <select
                    value={editDisbForm.verification_status}
                    onChange={(e) => setEditDisbForm({ ...editDisbForm, verification_status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Independently Verified via PFMS Gateway">Independently Verified via PFMS Gateway</option>
                    <option value="Independently Verified via State Treasury">Independently Verified via State Treasury</option>
                    <option value="Awaiting Verification / Pending Gateway Confirmation">Awaiting Verification / Pending Gateway Confirmation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Bank UTR Reference Number</label>
                <input
                  type="text"
                  value={editDisbForm.utr_number}
                  onChange={(e) => setEditDisbForm({ ...editDisbForm, utr_number: e.target.value })}
                  placeholder="e.g. UTR-SBI-2026-948102941"
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Audit Notes / Officer Remarks</label>
                <textarea
                  rows={2}
                  value={editDisbForm.remarks}
                  onChange={(e) => setEditDisbForm({ ...editDisbForm, remarks: e.target.value })}
                  placeholder="Supporting justification for status update..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditDisbursementModal(null)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD NEW SCHEME MODAL --- */}
      {newSchemeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Add Verified Government Scheme</h3>
              <button onClick={() => setNewSchemeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Scheme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pradhan Mantri Fasal Bima Yojana"
                  value={schemeForm.title}
                  onChange={(e) => setSchemeForm({ ...schemeForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PMFBY-GOV"
                    value={schemeForm.code}
                    onChange={(e) => setSchemeForm({ ...schemeForm, code: e.target.value, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Sanction Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={schemeForm.sanctioned_amount_default}
                    onChange={(e) => setSchemeForm({ ...schemeForm, sanctioned_amount_default: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Portal URL (myscheme.gov.in / ministry) *</label>
                <input
                  type="url"
                  required
                  value={schemeForm.official_portal_url}
                  onChange={(e) => setSchemeForm({ ...schemeForm, official_portal_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Benefit Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹5,000 / hectare crop damage compensation"
                  value={schemeForm.benefit}
                  onChange={(e) => setSchemeForm({ ...schemeForm, benefit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setNewSchemeModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Add Scheme & Dispatch Alerts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

