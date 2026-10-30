import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles, PhoneCall, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const FAQSection = ({ onOpenGrievance }) => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'What is BenefitLens and how does it make government welfare disbursement transparent?',
      a: 'BenefitLens is a transparent government benefit disbursement tracker. Unlike basic scheme directories, BenefitLens gives beneficiaries complete visibility into how much welfare amount was officially sanctioned, how much has been credited to their bank via Direct Benefit Transfer (DBT), how much remains pending, and whether any shortfall or discrepancy exists.'
    },
    {
      q: 'How does BenefitLens detect discrepancies between sanctioned and disbursed amounts?',
      a: 'BenefitLens performs automated mathematical audits on each payment record: Discrepancy = Sanctioned Amount - Amount Received. If the funds disbursed to your bank or reported received are less than the sanctioned sanction order amount, the record is immediately flagged with a high-priority "Discrepancy Detected" alert for administrative scrutiny.'
    },
    {
      q: 'What is the difference between Beneficiary Self-Reported Confirmation and PFMS Verified Status?',
      a: 'BenefitLens strictly maintains separation between citizen feedback and banking verification. "Beneficiary Confirmation" is what the beneficiary self-reports (confirming receipt or reporting an underpayment). "PFMS Verification Status" is the independent banking confirmation verified through the Public Financial Management System (PFMS), NPCI Aadhaar Payment Bridge, and State Treasury records.'
    },
    {
      q: 'What should I do if my bank account receives less than the sanctioned amount?',
      a: 'Log in to your BenefitLens Beneficiary Dashboard, locate the payment installment in your ledger, and click "Confirm / Report Discrepancy". Select "Shortfall / Discrepancy", enter the exact amount you received (e.g. ₹2,000 received out of ₹6,000 sanctioned), and attach your passbook note. This immediately registers a scrutiny case on the IAS Administrator Desk.'
    },
    {
      q: 'How are my Aadhaar number and sensitive bank details protected on BenefitLens?',
      a: 'BenefitLens complies with the Aadhaar Act 2016 and India DPDP Act. We never store 12-digit plaintext Aadhaar numbers or full unmasked bank account numbers. Only cryptographically hashed identifiers and masked display numbers (e.g., XXXX-XXXX-4819) are stored for deduplication and audit logging.'
    },
    {
      q: 'How can I track the exact stage of my submitted application?',
      a: 'Every application submitted through BenefitLens receives a unique Application Reference Number (ARN) such as BL-2026-89412. You can track this instantly in the Track Application tool to monitor desk verification, sanction approval, sanction order number issuance, and PFMS payment queue status.'
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>BenefitLens Knowledge Base & Transparency FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Learn how BenefitLens calculates sanctions, tracks DBT disbursals, and protects citizen welfare rights.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex justify-between items-center space-x-4 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-brand-600' : ''
                  }`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="mt-10 p-6 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Encountering an unresolved payment delay or shortfall?</h4>
              <p className="text-xs text-slate-600">National BenefitLens Helpdesk available 24x7 toll-free at <strong>1800-11-7788</strong>.</p>
            </div>
          </div>

          <button
            onClick={onOpenGrievance}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-sm flex items-center space-x-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span>Escalate Discrepancy</span>
          </button>
        </div>

      </div>
    </section>
  );
};
