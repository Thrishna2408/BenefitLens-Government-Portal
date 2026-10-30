import React, { useState } from 'react';
import { X, Send, ShieldAlert, CheckCircle2, FileText, Scale, AlertTriangle } from 'lucide-react';

export const GrievanceModal = ({ isOpen, onClose }) => {
  const [complaintName, setComplaintName] = useState('Rajesh Kumar Verma');
  const [refId, setRefId] = useState('');
  const [category, setCategory] = useState('Disbursed Amount Mismatch with Sanctioned Order');
  const [details, setDetails] = useState('');
  const [ticketId, setTicketId] = useState(null);

  if (!isOpen) return null;

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    const newTicket = `BL-GRIEV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newTicket);
  };

  const handleDone = () => {
    setTicketId(null);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                BenefitLens Payment Discrepancy Escalation
              </h3>
              <p className="text-[11px] text-slate-500">
                Direct Submission to Department Nodal Officers & PFMS Audit Cell
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!ticketId ? (
          <form onSubmit={handleSubmitGrievance} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Beneficiary Legal Name</label>
              <input
                type="text"
                required
                value={complaintName}
                onChange={(e) => setComplaintName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Scheme Application Reference Number (ARN) or Sanction Order #
              </label>
              <input
                type="text"
                placeholder="e.g. BL-2026-89412 or SO-PMK-2026-0891"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grievance Nature / Discrepancy Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="Disbursed Amount Mismatch with Sanctioned Order">
                  Disbursed Amount Mismatch (Received less than sanctioned amount)
                </option>
                <option value="Delay in DBT Credit after Department Sanction">
                  Delay in DBT Bank Credit (Sanction order issued but bank uncredited)
                </option>
                <option value="Pending Installment Not Disbursed">
                  Subsequent Installment Missing or Halted
                </option>
                <option value="PFMS Bank Account Mapping / NPCI Error">
                  PFMS / NPCI Aadhaar-Seeded Account Rejection
                </option>
                <option value="Wrong Beneficiary Account Credited">
                  Wrong Bank Account Credited
                </option>
                <option value="Application Status Stalled Without Reason">
                  Application Under Desk Scrutiny for More Than 30 Days
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Statement & Discrepancy Breakdown
              </label>
              <textarea
                rows="4"
                required
                placeholder="Specify the sanctioned amount, bank passbook entry amount, transaction date, and UTR number if available..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
              ></textarea>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                All submitted discrepancy reports are bound by the Citizen Charter with a statutory turnaround timeline of 7 working days.
              </span>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Nodal Desk</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Discrepancy Escalation Lodged</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your case has been registered on BenefitLens and forwarded to the designated Nodal Disbursing Officer.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-xs mx-auto">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Docket Reference Number</p>
              <p className="text-base font-mono font-bold text-brand-700 mt-0.5">{ticketId}</p>
            </div>

            <button
              onClick={handleDone}
              className="px-6 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
            >
              Done & Return
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
