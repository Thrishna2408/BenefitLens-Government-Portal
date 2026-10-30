import React, { useState } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Lock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  ArrowRight,
  Fingerprint,
  FileCheck2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { api } from '../services/api';

const INDIAN_STATES = [
  'Madhya Pradesh',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Uttar Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Bihar',
  'Gujarat',
  'Karnataka',
  'West Bengal',
  'Odisha',
  'Kerala',
  'Punjab',
  'Haryana',
  'Assam'
];

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [role, setRole] = useState('citizen'); // 'citizen', 'officer', 'admin'
  const [authMethod, setAuthMethod] = useState('password'); // 'otp' or 'password'
  
  // Login fields
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // Extended Citizen Registration Fields for Scheme Eligibility
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: 'Madhya Pradesh',
    district: 'Indore',
    aadhaarNumber: '',
    annualIncome: 180000,
    age: 26,
    gender: 'Male',
    occupation: 'Farmer',
    education: 'Graduate',
    category: 'OBC',
    isDifferentlyAbled: false,
    isFarmer: true,
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: 'SBIN0001842'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegChange = (field, val) => {
    setRegForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtpValue('4829'); // Simulated official OTP
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(phone, password, role);
        onLoginSuccess(res.user);
        onClose();
      } else {
        // Register Mode
        if (!regForm.name || !regForm.phone || !regForm.password) {
          setErrorMsg('Please provide your name, mobile number, and password.');
          setLoading(false);
          return;
        }

        const payload = {
          name: regForm.name.trim(),
          phone: regForm.phone.trim(),
          email: regForm.email ? regForm.email.trim() : null,
          password: regForm.password,
          state: regForm.state,
          district: regForm.district,
          aadhaar_number: regForm.aadhaarNumber,
          annual_income: parseFloat(regForm.annualIncome) || 0,
          age: parseInt(regForm.age) || 25,
          gender: regForm.gender,
          occupation: regForm.occupation,
          education: regForm.education,
          category: regForm.category,
          is_differently_abled: regForm.isDifferentlyAbled,
          is_farmer: regForm.isFarmer,
          bank_name: regForm.bankName,
          account_number: regForm.accountNumber,
          ifsc_code: regForm.ifscCode
        };

        const res = await api.register(payload);
        alert('Citizen account registered successfully! Check your SMS for eligibility alerts.');
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (selectedRole) => {
    setErrorMsg('');
    setLoading(true);
    try {
      let targetPhone = '9876543210';
      let targetPwd = 'password123';
      if (selectedRole === 'admin') {
        targetPhone = '9412000001';
        targetPwd = 'admin123';
      } else if (selectedRole === 'officer') {
        targetPhone = '9823011223';
        targetPwd = 'password123';
      }

      const res = await api.login(targetPhone, targetPwd, selectedRole);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-teal-950 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">BenefitLens Secure Gateway</h2>
              <p className="text-xs text-teal-200">Transparent Government Benefit Disbursement Tracking Portal</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 max-w-sm">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-brand-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-brand-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              New Beneficiary Registration
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {mode === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Portal Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setRole('citizen'); setPhone('9876543210'); setPassword('password123'); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'citizen'
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold shadow-xs ring-1 ring-brand-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('officer'); setPhone('9823011223'); setPassword('password123'); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'officer'
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold shadow-xs ring-1 ring-brand-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Officer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('admin'); setPhone('9412000001'); setPassword('admin123'); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'admin'
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold shadow-xs ring-1 ring-brand-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Identifier Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number or Govt Email
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210 or official email"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${role.toUpperCase()}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Fast Demo Role Access */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">Quick Demonstration Access</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('citizen')}
                    className="py-2 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 border border-transparent rounded-xl text-xs font-semibold text-slate-700 transition-all text-center"
                  >
                    <div className="font-bold">Rajesh Verma</div>
                    <div className="text-[10px] text-slate-500">Beneficiary (Farmer)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('officer')}
                    className="py-2 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 border border-transparent rounded-xl text-xs font-semibold text-slate-700 transition-all text-center"
                  >
                    <div className="font-bold">Pooja Deshmukh</div>
                    <div className="text-[10px] text-slate-500">Nodal Officer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="py-2 px-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 border border-transparent rounded-xl text-xs font-semibold text-slate-700 transition-all text-center"
                  >
                    <div className="font-bold">Dr. Rameshwar Singh</div>
                    <div className="text-[10px] text-slate-500">IAS Admin (Audit)</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* --- EXTENDED REGISTRATION FORM --- */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aadhaar Privacy & Security Guaranteed:</span> Under the Aadhaar Act, your 12-digit number is never stored in plaintext. Only masked last-4 digits (<span className="font-mono">XXXX-XXXX-XXXX</span>) and encrypted hashes are saved for deduplication.
                </div>
              </div>

              {/* Grid 1: Basic Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Sharma"
                      value={regForm.name}
                      onChange={(e) => handleRegChange('name', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (For SMS Alerts) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={regForm.phone}
                      onChange={(e) => handleRegChange('phone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Password and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={regForm.password}
                      onChange={(e) => handleRegChange('password', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Number (Optional / Secure)</label>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      maxLength={14}
                      placeholder="12-digit Aadhaar number"
                      value={regForm.aadhaarNumber}
                      onChange={(e) => handleRegChange('aadhaarNumber', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State of Residence *</label>
                  <select
                    value={regForm.state}
                    onChange={(e) => handleRegChange('state', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indore / Madurai / Warangal"
                    value={regForm.district}
                    onChange={(e) => handleRegChange('district', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Grid 4: Eligibility Determinants (Income, Age, Gender, Category) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10000}
                    value={regForm.annualIncome}
                    onChange={(e) => handleRegChange('annualIncome', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={regForm.age}
                    onChange={(e) => handleRegChange('age', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => handleRegChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={regForm.category}
                    onChange={(e) => handleRegChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="General">General</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>

              {/* Grid 5: Occupation & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation *</label>
                  <select
                    value={regForm.occupation}
                    onChange={(e) => handleRegChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="Farmer">Farmer (Cultivable Land)</option>
                    <option value="Agriculture Worker">Agricultural Laborer</option>
                    <option value="Street Vendor">Street Vendor / Hawker</option>
                    <option value="Daily Wage Earner">Daily Wage Worker</option>
                    <option value="Self Employed">Self Employed / Micro-Enterprise</option>
                    <option value="Student">Student</option>
                    <option value="Housewife">Homemaker / Housewife</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level *</label>
                  <select
                    value={regForm.education}
                    onChange={(e) => handleRegChange('education', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  >
                    <option value="Below 10th">Below 10th Standard</option>
                    <option value="10th Pass">10th Matriculation Pass</option>
                    <option value="12th Pass">12th Higher Secondary Pass</option>
                    <option value="Diploma / ITI">Diploma / ITI Certificate</option>
                    <option value="Graduate">Undergraduate Degree</option>
                    <option value="Post Graduate">Post Graduate / Professional</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Citizen Profile...' : 'Complete Registration & Discover Eligible Schemes'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
