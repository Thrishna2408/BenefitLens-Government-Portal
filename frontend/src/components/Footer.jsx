import React from 'react';
import { ShieldCheck, Phone, Mail, Globe, Eye, CheckCircle2, FileCheck2, Scale } from 'lucide-react';

export const Footer = ({ onOpenGrievance, onStartCalculator, onStartTracker, setActiveView }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand & Optical Lens Emblem info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Benefit<span className="text-teal-400">Lens</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent Government Benefit Disbursement Tracker. Making welfare sanctions, DBT payments, pending balances, and citizen confirmation auditable and fraud-proof.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Public Financial Management System (PFMS) Aligned</span>
            </div>
          </div>

          {/* Col 2: Citizen Transparency Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Transparency Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors">
                  Welfare Schemes Directory
                </button>
              </li>
              <li>
                <button onClick={onStartCalculator} className="hover:text-white transition-colors">
                  Eligibility & Entitlement Estimator
                </button>
              </li>
              <li>
                <button onClick={onStartTracker} className="hover:text-white transition-colors">
                  Track Application & Payment Orders
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('profile')} className="hover:text-white transition-colors">
                  Beneficiary Dashboard & Discrepancy Reporter
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('admin')} className="hover:text-white transition-colors">
                  PFMS Audit & Discrepancy Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Welfare Sectors Tracked */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Tracked Benefit Programs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>PM-KISAN DBT Samman Nidhi</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Ayushman Bharat PM-JAY Cashless Cover</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>PMAY-Gramin Pucca Housing Grants</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Post-Matric Scholarships for SC/ST/OBC</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>State Ladli Behna & Rythu Bandhu</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Helplines & Grievances */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Grievance & Toll-Free
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>1800-11-7788 (Toll-Free)</span>
              </div>
              <p className="text-[11px] text-slate-400">National DBT Helpline & Discrepancy Escalation Cell</p>
              <div className="pt-2">
                <button
                  onClick={onOpenGrievance}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-teal-400" />
                  <span>Report Payment Discrepancy</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom micro footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 BenefitLens: Transparent Government Benefit Disbursement Tracker</p>
          <div className="flex space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Aadhaar Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">PFMS Integration Terms</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Open Audit Data Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
