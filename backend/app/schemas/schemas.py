from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

# --- Auth & User Schemas ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., pattern=r'^[6-9]\d{9}$')
    email: Optional[str] = None
    password: str = Field(..., min_length=6)
    
    # Beneficiary Profile details for scheme eligibility and benefit tracking
    state: str = "Madhya Pradesh"
    district: str = "Indore"
    aadhaar_number: Optional[str] = None  # Processed securely, masked, never stored raw
    annual_income: float = Field(default=180000.0, ge=0)
    age: int = Field(default=28, ge=0, le=120)
    gender: str = "Male"
    occupation: str = "Farmer"
    education: str = "Graduate"
    category: str = "OBC"
    
    is_differently_abled: bool = False
    is_farmer: bool = True
    landholding_acres: float = 2.5
    ration_card_type: str = "PHH"
    
    bank_name: Optional[str] = "State Bank of India"
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = "SBIN0001842"


class UserLogin(BaseModel):
    phone_or_email: str
    password: Optional[str] = None
    role: str = "citizen"
    otp: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class CitizenProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    category: Optional[str] = None
    is_differently_abled: Optional[bool] = None
    is_farmer: Optional[bool] = None
    landholding_acres: Optional[float] = None
    ration_card_type: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None


class CitizenProfileOut(BaseModel):
    state: str
    district: str
    aadhaar_masked: str
    annual_income: float
    age: int
    gender: str
    occupation: str
    education: str
    category: str
    is_differently_abled: bool
    is_farmer: bool
    landholding_acres: float
    ration_card_type: str
    bank_name: str
    account_number_masked: str
    ifsc_code: str
    documents_locker: List[Any] = []

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    role: str
    profile: Optional[CitizenProfileOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Scheme Schemas ---

class SchemeBase(BaseModel):
    id: str
    title: str
    code: str
    ministry: str
    level: str = "Central"
    state: str = "All India"
    category: str
    benefit: str
    benefit_type: str
    sanctioned_amount_default: float = 0.0
    short_description: str
    full_description: str
    official_portal_url: str
    deadline: str = "31 Dec 2026"
    
    min_age: int = 0
    max_age: int = 100
    max_income: float = 9999999.0
    eligible_occupations: List[str] = []
    eligible_genders: List[str] = []
    eligible_categories: List[str] = []
    eligible_states: List[str] = ["All India"]
    criteria_list: List[str] = []
    documents_required: List[str] = []
    
    popularity: int = 90
    active: bool = True
    is_verified: bool = True
    source_name: str = "myscheme.gov.in"
    verified_source_url: Optional[str] = "https://www.myscheme.gov.in"
    published_date: Optional[str] = "15 Jan 2026"
    total_disbursed: Optional[str] = None
    beneficiaries_count: Optional[str] = None


class SchemeOut(SchemeBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SchemeEligibilityMatch(BaseModel):
    scheme: SchemeOut
    is_eligible: bool
    match_percentage: int
    eligible_reasons: List[str]
    unmet_criteria: List[str]


# --- Application Schemas ---

class ApplicationCreate(BaseModel):
    scheme_id: str
    fullName: str
    mobileNumber: str
    state: str
    district: str
    aadhaarNumber: Optional[str] = None
    annualIncome: Optional[str] = None
    occupation: Optional[str] = None
    socialCategory: Optional[str] = None
    bankName: Optional[str] = None
    accountNumber: Optional[str] = None
    ifscCode: Optional[str] = None
    attachedDocs: List[str] = []
    declarationAgreed: bool = True


class TimelineStageOut(BaseModel):
    step_number: int
    title: str
    stage: str
    date: str
    status: str
    details: Optional[str] = None
    officer_name: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: str
    scheme_id: str
    scheme_title: Optional[str] = None
    scheme_ministry: Optional[str] = None
    applied_date: datetime
    status: str
    status_remarks: Optional[str] = None
    sanctioned_amount: float = 0.0
    sanction_order_number: Optional[str] = None
    acknowledgement_proof_url: Optional[str] = None
    applicant_name: str
    applicant_phone: str
    applicant_state: str
    applicant_district: str
    aadhaar_masked: str
    attached_docs: List[Any] = []
    timeline: List[TimelineStageOut] = []

    class Config:
        from_attributes = True


# --- BenefitLens Payment Tracking & Transparency Schemas ---

class BenefitPaymentOut(BaseModel):
    id: int
    application_id: Optional[str] = None
    scheme_id: str
    scheme_title: Optional[str] = None
    installment_number: int
    sanctioned_amount: float = 0.0
    expected_amount: float = 0.0
    amount: float  # disbursed amount
    disbursed_amount: float = 0.0  # alias
    amount_formatted: str
    pending_amount: float = 0.0
    amount_reported_received: Optional[float] = None
    discrepancy_amount: float = 0.0
    discrepancy_status: str = "None"
    beneficiary_confirmation_status: str = "Awaiting Confirmation"
    beneficiary_confirmed_at: Optional[datetime] = None
    beneficiary_notes: Optional[str] = None
    payment_mode: str
    disbursement_date: datetime
    status: str  # Credited, Processing, Pending, Partially Disbursed, Disputed, Failed
    verification_status: str  # Independently Verified via PFMS Gateway / Awaiting Verification
    verification_agency: Optional[str] = "PFMS"
    verification_evidence_ref: Optional[str] = None
    data_source: Optional[str] = "PFMS"
    last_verified_at: Optional[datetime] = None
    utr_number: Optional[str] = None
    pfms_reference_id: Optional[str] = None
    bank_account_masked: str
    failure_reason: Optional[str] = None
    official_portal_url: Optional[str] = None

    class Config:
        from_attributes = True


class BenefitSummaryOut(BaseModel):
    total_sanctioned: float
    total_disbursed: float
    total_pending: float
    total_discrepancy: float
    total_credited: float
    total_processing: float
    records_count: int
    verified_records_count: int
    records: List[BenefitPaymentOut]


class BeneficiaryConfirmationCreate(BaseModel):
    payment_record_id: Optional[int] = None
    scheme_id: Optional[str] = None
    application_id: Optional[str] = None
    confirmation_status: str = "Confirmed Received"  # Confirmed Received, Reported Partial Amount, Reported Not Received, Discrepancy Reported
    amount_received_reported: float
    payment_date_reported: Optional[str] = None
    bank_name_reported: Optional[str] = None
    account_last4_reported: Optional[str] = None
    beneficiary_notes: Optional[str] = None


class BeneficiaryConfirmationOut(BaseModel):
    id: int
    user_id: int
    payment_record_id: Optional[int] = None
    scheme_id: str
    scheme_title: Optional[str] = None
    application_id: Optional[str] = None
    confirmation_status: str
    amount_sanctioned: float
    amount_disbursed: float
    amount_received_reported: float
    discrepancy_amount: float
    payment_date_reported: Optional[str] = None
    bank_name_reported: Optional[str] = None
    account_last4_reported: Optional[str] = None
    beneficiary_notes: Optional[str] = None
    admin_status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DiscrepancyReviewInput(BaseModel):
    admin_status: str  # 'Under Investigation', 'Claim Reconciled', 'Claim Disputed'
    admin_notes: str


class DisbursementCreateInput(BaseModel):
    application_id: Optional[str] = None
    user_id: int
    scheme_id: str
    installment_number: int = 1
    sanctioned_amount: float
    expected_amount: float
    amount: float
    payment_mode: str = "DBT via PFMS"
    status: str = "Credited"
    verification_status: str = "Independently Verified via PFMS Gateway"
    data_source: str = "Public Financial Management System (PFMS)"
    utr_number: Optional[str] = None
    pfms_reference_id: Optional[str] = None
    bank_account_masked: Optional[str] = "XXXX-XXXX-4102"


class PaymentAuditLogOut(BaseModel):
    id: int
    payment_id: Optional[int] = None
    application_id: Optional[str] = None
    action: str
    previous_status: Optional[str] = None
    new_status: str
    actor_name: str
    actor_role: str
    remarks: Optional[str] = None
    evidence_reference: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Notification Schemas ---

class NotificationOut(BaseModel):
    id: int
    user_id: int
    phone: str
    scheme_id: Optional[str] = None
    notification_type: str
    title: str
    message: str
    gateway_status: str
    gateway_name: str
    gateway_response_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Grievance Schemas ---

class GrievanceCreate(BaseModel):
    application_id: Optional[str] = None
    category: str
    subject: str
    description: str


class GrievanceOut(BaseModel):
    id: str
    category: str
    subject: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
