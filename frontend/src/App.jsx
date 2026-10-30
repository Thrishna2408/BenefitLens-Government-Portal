
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EligibilityCalculator } from './components/EligibilityCalculator';
import { TrackApplicationWidget } from './components/TrackApplicationWidget';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';
import { GrievanceModal } from './components/GrievanceModal';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';

export function App() {
  const [activeView, setActiveView] = useState('home');
  const [user, setUser] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);

  const isStaff = ['admin', 'officer'].includes(
    String(user?.role || '').toLowerCase()
  );

  // Initialize application
  useEffect(() => {
    initializeAppData();
  }, []);

  const initializeAppData = async () => {
    try {
      // Load schemes from backend
      try {
        const schemesData = await api.getSchemes();
        setSchemes(Array.isArray(schemesData) ? schemesData : []);
      } catch (schemeErr) {
        console.error('Failed to load schemes:', schemeErr);
        setSchemes([]);
      }

      // Check existing login session
      const token =
        localStorage.getItem('benefitlens_token') ||
        localStorage.getItem('benefit_govt_token');

      if (token) {
        try {
          const meData = await api.getMe();
          setUser(meData);

          const userApps = await api.getMyApplications();
          setApplications(Array.isArray(userApps) ? userApps : []);

          if (['admin', 'officer'].includes(
            String(meData?.role || '').toLowerCase()
          )) {
            setActiveView('admin');
          } else {
            setActiveView('profile');
          }

        } catch (authErr) {
          console.error('Authentication session expired:', authErr);
          api.logout();
          setUser(null);
          setApplications([]);
          setActiveView('home');
        }
      } else {
        setUser(null);
        setApplications([]);
        setActiveView('home');
      }

    } catch (err) {
      console.error('Failed to initialize application:', err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setApplications([]);
    setActiveView('home');
    setSelectedSchemeForModal(null);
    alert('You have been signed out from BenefitLens.');
  };

  const handleLoginSuccess = async (newUser) => {
    setUser(newUser);

    try {
      const userApps = await api.getMyApplications();
      setApplications(Array.isArray(userApps) ? userApps : []);
    } catch (err) {
      console.error('Unable to load applications:', err);
      setApplications([]);
    }

    const role = String(newUser?.role || '').toLowerCase();

    if (role === 'admin' || role === 'officer') {
      setActiveView('admin');
    } else {
      setActiveView('profile');
    }

    setAuthModalOpen(false);
  };

  const handleApplicationSubmitted = (newApp) => {
    setApplications(prev => [newApp, ...prev]);
  };

  const handleQuickApply = (scheme) => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setSelectedSchemeForModal(scheme);
  };

  const handleTrackFromProfile = () => {
    setActiveView('tracker');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-semibold">
          Loading BenefitLens...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">

      {/* Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenGrievance={() => setGrievanceModalOpen(true)}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />

      {/* Main Content */}
      <main className="flex-1">

        {/* Public landing page */}
        {!user && activeView === 'home' && (
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
              <h1 className="font-display font-black text-4xl md:text-5xl text-slate-900">
                Benefit<span className="text-teal-600">Lens</span>
              </h1>

              <p className="mt-4 text-slate-600 text-base md:text-lg">
                Transparent Government Benefit Disbursement Tracker
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your beneficiary account or register to get started.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>

                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-subtle"
                >
                  Register Beneficiary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiary Dashboard */}
        {user && !isStaff && activeView === 'profile' && (
          <ProfileView
            user={user}
            setUser={setUser}
            applications={applications}
            onTrackApp={handleTrackFromProfile}
            onApplyScheme={handleQuickApply}
          />
        )}

        {/* Beneficiary Application Tracker */}
        {user && !isStaff && activeView === 'tracker' && (
          <TrackApplicationWidget
            applications={applications}
            onOpenDetails={(scheme) => setSelectedSchemeForModal(scheme)}
          />
        )}

        {/* Eligibility Calculator */}
        {user && activeView === 'calculator' && (
          <EligibilityCalculator
            onApplyScheme={handleQuickApply}
          />
        )}

        {/* Admin and Officer Dashboard */}
        {user && isStaff && activeView === 'admin' && (
          <AdminDashboard
            schemes={schemes}
            setSchemes={setSchemes}
            applications={applications}
            setApplications={setApplications}
            user={user}
          />
        )}

      </main>

      {/* Scheme Details Modal */}
      <SchemeDetailsModal
        scheme={selectedSchemeForModal}
        isOpen={!!selectedSchemeForModal}
        onClose={() => setSelectedSchemeForModal(null)}
        user={user}
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Public Grievance Modal */}
      <GrievanceModal
        isOpen={grievanceModalOpen}
        onClose={() => setGrievanceModalOpen(false)}
      />

    </div>
  );
}

export default App;
