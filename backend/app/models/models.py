from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="citizen")  # citizen, officer, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    benefit_payments = relationship("BenefitPaymentRecord", back_populates="user", cascade="all, delete-orphan")
    confirmations = relationship("BeneficiaryConfirmation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    grievances = relationship("GrievanceTicket", back_populates="user", cascade="all, delete-orphan")


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    state = Column(String(100), default="Madhya Pradesh")
    district = Column(String(100), default="Indore")
    
    # Aadhaar privacy compliance: never store raw 12 digits
    aadhaar_masked = Column(String(20), default="XXXX-XXXX-0000")
    aadhaar_hash = Column(String(64), index=True, nullable=True)
    
    annual_income = Column(Float, default=180000.0)
    age = Column(Integer, default=28)
    gender = Column(String(20), default="Male")  # Male, Female, Transgender, Any
    occupation = Column(String(100), default="Farmer")
    education = Column(String(100), default="Graduate")
    category = Column(String(50), default="OBC")  # General, OBC, SC, ST, EWS
    
    is_differently_abled = Column(Boolean, default=False)
    is_farmer = Column(Boolean, default=True)
    landholding_acres = Column(Float, default=2.5)
    ration_card_type = Column(String(50), default="PHH")  # AAY, PHH, NPHH, None
    
    bank_name = Column(String(100), default="State Bank of India")
    account_number_masked = Column(String(30), default="XXXX-XXXX-4102")
    ifsc_code = Column(String(20), default="SBIN0001842")
    
    documents_locker = Column(JSON, default=list)  # list of verified documents
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String(80), primary_key=True, index=True)  # e.g., 'pm-kisan'
    title = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    ministry = Column(String(255), nullable=False)
    level = Column(String(50), default="Central")  # Central, State, UT
    state = Column(String(100), default="All India")  # All India or specific State
    category = Column(String(100), nullable=False, index=True)
    benefit = Column(String(255), nullable=False)
    benefit_type = Column(String(150), nullable=False)
    sanctioned_amount_default = Column(Float, default=0.0)  # Standard statutory amount
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    
    official_portal_url = Column(String(300), nullable=False)
    deadline = Column(String(50), default="31 Dec 2026")
    
    # Deterministic Eligibility Criteria Rules
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=100)
    max_income = Column(Float, default=9999999.0)
    eligible_occupations = Column(JSON, default=list)  # ['Farmer', 'Agriculture Worker', 'Any']
    eligible_genders = Column(JSON, default=list)      # ['Any', 'Female', 'Male']
    eligible_categories = Column(JSON, default=list)   # ['All', 'SC', 'ST', 'OBC', 'General', 'EWS']
    eligible_states = Column(JSON, default=list)       # ['All India'] or specific state names
    criteria_list = Column(JSON, default=list)         # human-readable bullet points
    
    documents_required = Column(JSON, default=list)
    popularity = Column(Integer, default=90)
    active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    source_name = Column(String(100), default="myscheme.gov.in")
    verified_source_url = Column(String(300), default="https://www.myscheme.gov.in")
    published_date = Column(String(50), default="15 Jan 2026")
    total_disbursed = Column(String(100), default="Verified by Ministry")
    beneficiaries_count = Column(String(100), default="Direct Transfer")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="scheme")
    benefit_payments = relationship("BenefitPaymentRecord", back_populates="scheme")
    confirmations = relationship("BeneficiaryConfirmation", back_populates="scheme")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(50), primary_key=True, index=True)  # ARN e.g., 'ARN-2026-48291'
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(80), ForeignKey("schemes.id"), nullable=False, index=True)
    
    applied_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="Submitted")  # Submitted, Under Verification, Approved, Rejected, Action Required
    status_remarks = Column(Text, default="Application submitted and queued for scrutiny.")
    acknowledgement_proof_url = Column(String(300), nullable=True)
    
    sanctioned_amount = Column(Float, default=0.0)
    sanction_date = Column(DateTime, nullable=True)
    sanction_order_number = Column(String(100), nullable=True)
    
    applicant_name = Column(String(150), nullable=False)
    applicant_phone = Column(String(20), nullable=False)
    applicant_state = Column(String(100), nullable=False)
    applicant_district = Column(String(100), nullable=False)
    aadhaar_masked = Column(String(20), nullable=False)
    
    attached_docs = Column(JSON, default=list)
    formData = Column(JSON, default=dict)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
    timeline = relationship("ApplicationTimeline", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationTimeline.step_number")
    benefit_payments = relationship("BenefitPaymentRecord", back_populates="application", cascade="all, delete-orphan")


class ApplicationTimeline(Base):
    __tablename__ = "application_timelines"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, default=1)
    title = Column(String(150), nullable=False)
    stage = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    status = Column(String(30), default="completed")  # completed, current, pending
    details = Column(Text, nullable=True)
    officer_name = Column(String(150), nullable=True)

    application = relationship("Application", back_populates="timeline")


class BenefitPaymentRecord(Base):
    __tablename__ = "benefit_payment_records"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(80), ForeignKey("schemes.id"), nullable=False, index=True)
    
    installment_number = Column(Integer, default=1)
    
    # Financial Amounts Breakdown
    sanctioned_amount = Column(Float, default=0.0)      # Amount officially approved
    expected_amount = Column(Float, default=0.0)        # Official installment expected
    amount = Column(Float, nullable=False)              # Disbursed amount released by government
    amount_formatted = Column(String(50), nullable=False)  # e.g., '₹2,000'
    pending_amount = Column(Float, default=0.0)         # sanctioned_amount - amount
    
    # Beneficiary Self-Reported Confirmation
    amount_reported_received = Column(Float, nullable=True)  # Beneficiary claim
    discrepancy_amount = Column(Float, default=0.0)     # Difference between expected/disbursed and received
    discrepancy_status = Column(String(50), default="None") # None, Reported Shortfall, Reported Not Received, Under Investigation, Resolved
    beneficiary_confirmation_status = Column(String(50), default="Awaiting Confirmation") # Awaiting Confirmation, Confirmed Received, Discrepancy Reported
    beneficiary_confirmed_at = Column(DateTime, nullable=True)
    beneficiary_notes = Column(Text, nullable=True)

    payment_mode = Column(String(100), default="DBT via PFMS")  # PFMS, Aadhaar Payment Bridge (APB), Direct Bank Transfer
    disbursement_date = Column(DateTime, default=datetime.utcnow)
    
    # Official Payment Status
    status = Column(String(50), default="Credited")  # Credited, Processing, Pending, Partially Disbursed, Disputed, Failed
    verification_status = Column(String(150), default="Independently Verified via PFMS Gateway")  # 'Independently Verified via PFMS Gateway', 'Awaiting Verification', 'Awaiting Gateway Confirmation'
    verification_agency = Column(String(150), default="Public Financial Management System (PFMS)")
    verification_evidence_ref = Column(String(200), nullable=True)
    data_source = Column(String(150), default="Public Financial Management System (PFMS)")
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    
    utr_number = Column(String(100), nullable=True)
    pfms_reference_id = Column(String(100), nullable=True)
    bank_account_masked = Column(String(30), default="XXXX-XXXX-4102")
    failure_reason = Column(Text, nullable=True)

    user = relationship("User", back_populates="benefit_payments")
    scheme = relationship("Scheme", back_populates="benefit_payments")
    application = relationship("Application", back_populates="benefit_payments")
    confirmations = relationship("BeneficiaryConfirmation", back_populates="payment_record", cascade="all, delete-orphan")


class BeneficiaryConfirmation(Base):
    __tablename__ = "beneficiary_confirmations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    payment_record_id = Column(Integer, ForeignKey("benefit_payment_records.id", ondelete="CASCADE"), nullable=True, index=True)
    scheme_id = Column(String(80), ForeignKey("schemes.id"), nullable=False, index=True)
    application_id = Column(String(50), nullable=True)
    
    confirmation_status = Column(String(50), default="Confirmed Received")  # Confirmed Received, Reported Partial Amount, Reported Not Received, Discrepancy Reported
    amount_sanctioned = Column(Float, default=0.0)
    amount_disbursed = Column(Float, default=0.0)
    amount_received_reported = Column(Float, default=0.0)
    discrepancy_amount = Column(Float, default=0.0)
    payment_date_reported = Column(String(50), nullable=True)
    bank_name_reported = Column(String(100), nullable=True)
    account_last4_reported = Column(String(10), nullable=True)
    beneficiary_notes = Column(Text, nullable=True)
    
    admin_status = Column(String(50), default="Pending Scrutiny")  # Pending Scrutiny, Under Investigation, Claim Reconciled, Claim Disputed
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="confirmations")
    scheme = relationship("Scheme", back_populates="confirmations")
    payment_record = relationship("BenefitPaymentRecord", back_populates="confirmations")


class PaymentAuditLog(Base):
    __tablename__ = "payment_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, nullable=True, index=True)
    application_id = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)  # DISBURSEMENT_RECORDED, CONFIRMATION_SUBMITTED, DISCREPANCY_FLAGGED, GATEWAY_RECONCILED, STATUS_CHANGED
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    actor_name = Column(String(150), nullable=False)
    actor_role = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    evidence_reference = Column(String(200), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    scheme_id = Column(String(80), nullable=True)
    
    notification_type = Column(String(50), default="new_scheme_alert")  # new_scheme_alert, application_update, dbt_disbursement, discrepancy_alert
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    gateway_status = Column(String(50), default="Delivered")  # Delivered, Sent, Failed
    gateway_name = Column(String(50), default="BenefitLens-SMS Gateway")
    gateway_response_id = Column(String(100), nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class GrievanceTicket(Base):
    __tablename__ = "grievance_tickets"

    id = Column(String(50), primary_key=True, index=True)  # e.g. 'GRV-2026-9182'
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(String(50), nullable=True)
    
    category = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Open")  # Open, In Review, Resolved, Closed
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="grievances")
