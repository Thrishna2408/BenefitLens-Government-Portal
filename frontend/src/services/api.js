// API Client for BenefitLens: Transparent Government Benefit Disbursement Tracker
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('benefitlens_token') || localStorage.getItem('benefit_govt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth & Profile
  async login(phone_or_email, password, role = 'citizen') {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_or_email, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed. Please check your credentials.');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('benefitlens_token', data.access_token);
    }
    return data;
  },

  async register(registrationData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed. Please check your details.');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('benefitlens_token', data.access_token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile session.');
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update citizen profile.');
    }
    return res.json();
  },

  logout() {
    localStorage.removeItem('benefitlens_token');
    localStorage.removeItem('benefit_govt_token');
  },

  // Schemes
  async getSchemes(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.level && params.level !== 'all') query.append('level', params.level);
    if (params.state && params.state !== 'all') query.append('state', params.state);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/schemes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch government schemes catalog.');
    return res.json();
  },

  async getPersonalizedSchemes() {
    const res = await fetch(`${BASE_URL}/schemes/personalized`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to calculate personalized eligible schemes.');
    return res.json();
  },

  async getSchemeDetail(id) {
    const res = await fetch(`${BASE_URL}/schemes/${id}`);
    if (!res.ok) throw new Error('Failed to retrieve scheme details.');
    return res.json();
  },

  async evaluateGuestEligibility(guestData) {
    const res = await fetch(`${BASE_URL}/schemes/evaluate-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    });
    if (!res.ok) throw new Error('Failed to evaluate guest eligibility.');
    return res.json();
  },

  // Applications
  async submitApplication(applicationData) {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(applicationData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit application.');
    }
    return res.json();
  },

  async getMyApplications() {
    const res = await fetch(`${BASE_URL}/applications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch citizen applications.');
    return res.json();
  },

  async trackApplication(idOrArn) {
    const res = await fetch(`${BASE_URL}/applications/track/${encodeURIComponent(idOrArn)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No application found with this reference number.');
    }
    return res.json();
  },

  // Money & DBT Tracking (BenefitLens Core Transparency)
  async getBenefitPayments() {
    const res = await fetch(`${BASE_URL}/benefit-payments`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch benefit disbursement records.');
    return res.json();
  },

  async submitBeneficiaryConfirmation(confirmationData) {
    const res = await fetch(`${BASE_URL}/benefit-payments/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(confirmationData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit beneficiary confirmation.');
    }
    return res.json();
  },

  async getMyConfirmations() {
    const res = await fetch(`${BASE_URL}/benefit-payments/confirmations`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async verifyPayment(paymentId) {
    const res = await fetch(`${BASE_URL}/benefit-payments/verify/${paymentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to verify payment with PFMS gateway.');
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.ok;
  },

  // Admin Portal & Monitoring
  async getAdminAnalytics() {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin metrics.');
    return res.json();
  },

  async getAdminApplications(statusFilter = 'All') {
    const res = await fetch(`${BASE_URL}/admin/applications?status_filter=${encodeURIComponent(statusFilter)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load verification queue.');
    return res.json();
  },

  async updateAppStatus(appId, status, remarks, officerName, sanctionedAmount) {
    const res = await fetch(`${BASE_URL}/admin/applications/${appId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        status, 
        remarks, 
        officer_name: officerName,
        sanctioned_amount: sanctionedAmount 
      })
    });
    if (!res.ok) throw new Error('Failed to update application status.');
    return res.json();
  },

  async getAdminConfirmations(statusFilter = 'All') {
    const res = await fetch(`${BASE_URL}/admin/confirmations?status_filter=${encodeURIComponent(statusFilter)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load beneficiary confirmations.');
    return res.json();
  },

  async reviewDiscrepancy(confId, reviewData) {
    const res = await fetch(`${BASE_URL}/admin/confirmations/${confId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error('Failed to submit discrepancy review.');
    return res.json();
  },

  async getAdminDisbursements(statusFilter = 'All') {
    const res = await fetch(`${BASE_URL}/admin/disbursements?status_filter=${encodeURIComponent(statusFilter)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load disbursement records.');
    return res.json();
  },

  async createDisbursement(disbursementData) {
    const res = await fetch(`${BASE_URL}/admin/disbursements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(disbursementData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to record disbursement.');
    }
    return res.json();
  },

  async updateDisbursement(paymentId, updateData) {
    const res = await fetch(`${BASE_URL}/admin/disbursements/${paymentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Failed to update disbursement record.');
    return res.json();
  },

  async getAdminAuditLogs() {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async createScheme(schemeData) {
    const res = await fetch(`${BASE_URL}/admin/schemes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(schemeData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add verified scheme.');
    }
    return res.json();
  },

  async getAdminSmsLogs() {
    const res = await fetch(`${BASE_URL}/admin/sms-logs`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async releaseDbtBatch() {
    const res = await fetch(`${BASE_URL}/admin/dbt-batch`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to execute DBT disbursement batch.');
    return res.json();
  }
};
