
import React, { useState } from 'react';
import {
  Building2,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Scale
} from 'lucide-react';

export const Navbar = ({
  activeView,
  setActiveView,
  user,
  onOpenAuth,
  onLogout,
  onOpenGrievance,
  selectedLanguage,
  setSelectedLanguage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' }
  ];

  const isStaff = ['admin', 'officer'].includes(
    String(user?.role || '').toLowerCase()
  );

  const openDashboard = () => {
    setActiveView(isStaff ? 'admin' : 'profile');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle transition-all">

      {/* Top Micro Bar - Authenticated Users */}
      {user && (
        <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">

            <span className="inline-flex items-center text-teal-400 font-semibold tracking-wide">
              <Building2 className="w-3.5 h-3.5 mr-1 text-teal-400" />
              BenefitLens • Transparent Government Benefit Disbursement Tracker
            </span>

            <span className="hidden md:inline-block text-slate-600">•</span>

            <span className="hidden lg:inline-block text-slate-400">
              Making Government Benefits Transparent, Traceable, and Accountable
            </span>

            <div className="ml-auto flex items-center space-x-4">

              <span className="hidden sm:inline-block text-slate-400 text-[11px]">
                Toll-Free Helpline:
                <strong className="text-white"> 1800-11-7788</strong>
              </span>

              <button
                onClick={onOpenGrievance}
                className="text-slate-300 hover:text-teal-300 transition-colors underline-offset-2 hover:underline text-xs"
              >
                Public Grievance
              </button>

              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs"
                >
                  <Globe className="w-3 h-3 text-teal-400" />
                  <span>
                    {languages.find(l => l.code === selectedLanguage)?.label.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-modal py-1 z-50">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${selectedLanguage === lang.code
                          ? 'text-teal-400 font-semibold bg-slate-800/80'
                          : 'text-slate-300'
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* BenefitLens Logo */}
          <div
            onClick={openDashboard}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white flex items-center justify-center shadow-card group-hover:scale-105 transition-transform duration-200 ring-2 ring-brand-100">

              <div className="absolute inset-1 rounded-lg border border-white/30"></div>

              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <circle cx="11" cy="11" r="3.5" fill="currentColor" fillOpacity="0.3" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-2xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                  Benefit<span className="text-teal-600">Lens</span>
                </span>

                <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-teal-200">
                  Transparency
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                Disbursement & Sanction Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">

              {isStaff ? (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${activeView === 'admin'
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  <span>Admin Monitoring</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('profile')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${activeView === 'profile'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                >
                  <Scale className="w-4 h-4 text-teal-600" />
                  <span>Beneficiary Dashboard</span>
                </button>
              )}

            </nav>
          )}

          {/* Right Action and Authentication Area */}
          <div className="hidden sm:flex items-center space-x-3">

            {user ? (
              <div className="relative">

                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-full bg-slate-100 border border-slate-200 hover:border-brand-300 transition-all text-left shadow-subtle"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {user.name || 'User'}
                    </span>

                    <span className="text-[10px] text-teal-700 font-medium capitalize flex items-center">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-teal-600 inline" />
                      {user.role}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-700 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.avatarInitials || user.name?.charAt(0) || 'U'}
                  </div>

                  <ChevronDown className="w-4 h-4 text-slate-400 pr-0.5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-modal py-2 z-50">

                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">
                        Authenticated Account
                      </p>

                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name || 'User'}
                      </p>

                      <p className="text-xs text-slate-600 truncate">
                        {user.email || user.phone}
                      </p>

                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md">
                        {user.role} Portal
                      </span>
                    </div>

                    <button
                      onClick={openDashboard}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800 flex items-center space-x-2 transition-colors"
                    >
                      {isStaff ? (
                        <>
                          <LayoutDashboard className="w-4 h-4 text-brand-600" />
                          <span>Admin Dashboard</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4 text-teal-600" />
                          <span>Beneficiary Dashboard</span>
                        </>
                      )}
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-subtle flex items-center space-x-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Register Beneficiary</span>
                </button>

              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-2">

            {user && (
              <button
                onClick={openDashboard}
                className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center"
              >
                {user.avatarInitials || user.name?.charAt(0) || 'U'}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen
                ? <X className="w-6 h-6" />
                : <Menu className="w-6 h-6" />
              }
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">

          {user && (
            isStaff ? (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-brand-50 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                <span>Admin Monitoring</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveView('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-brand-50 flex items-center space-x-2"
              >
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Beneficiary Dashboard</span>
              </button>
            )
          )}

          <div className="pt-4 border-t border-slate-200 flex flex-col space-y-2">

            {!user ? (
              <>
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-300 text-slate-800 text-center"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-bold bg-brand-600 text-white text-center shadow-sm"
                >
                  Register Beneficiary
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 text-center"
              >
                Sign Out
              </button>
            )}

          </div>
        </div>
      )}

    </header>
  );
};
