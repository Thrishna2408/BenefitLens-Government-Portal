import sys
from pathlib import Path

# Automatically ensure backend folder is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import logging
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import (
    User,
    CitizenProfile,
    Scheme,
    Application,
    ApplicationTimeline,
    BenefitPaymentRecord,
    Notification
)
from app.core.security import get_password_hash
from app.services.real_schemes_seed import GENUINE_GOVERNMENT_SCHEMES
from app.routers import auth, schemes, applications, benefit_payments, notifications, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("benefitlens")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BenefitLens: Transparent Government Benefit Disbursement Tracker with Sanction vs Disbursed Audit, Beneficiary Confirmation & PFMS Reconciliation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev and network flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(benefit_payments.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_db_seed():
    """
    Creates database tables and ensures real schemes and verified users are loaded in PostgreSQL.
    """
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    db = SessionLocal()
    try:
        # 1. Seed Genuine Government Schemes
        schemes_count = db.query(Scheme).count()
        if schemes_count == 0:
            logger.info("Seeding genuine central and state government schemes...")
            for s_data in GENUINE_GOVERNMENT_SCHEMES:
                scheme = Scheme(
                    id=s_data["id"],
                    title=s_data["title"],
                    code=s_data["code"],
                    ministry=s_data["ministry"],
                    level=s_data["level"],
                    state=s_data["state"],
                    category=s_data["category"],
                    benefit=s_data["benefit"],
                    benefit_type=s_data["benefit_type"],
                    short_description=s_data["short_description"],
                    full_description=s_data["full_description"],
                    official_portal_url=s_data["official_portal_url"],
                    deadline=s_data["deadline"],
                    min_age=s_data["min_age"],
                    max_age=s_data["max_age"],
                    max_income=s_data["max_income"],
                    eligible_occupations=s_data["eligible_occupations"],
                    eligible_genders=s_data["eligible_genders"],
                    eligible_categories=s_data["eligible_categories"],
                    eligible_states=s_data["eligible_states"],
                    criteria_list=s_data["criteria_list"],
                    documents_required=s_data["documents_required"],
                    popularity=s_data.get("popularity", 90),
                    active=True,
                    is_verified=True,
                    source_name=s_data.get("source_name", "myscheme.gov.in"),
                    total_disbursed=s_data.get("total_disbursed"),
                    beneficiaries_count=s_data.get("beneficiaries_count")
                )
                db.add(scheme)
            db.commit()
            logger.info(f"Seeded {len(GENUINE_GOVERNMENT_SCHEMES)} genuine government schemes.")

        # 2. Seed Default Citizens, Officer, and Admin
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            logger.info("Creating admin user...")
            admin_user = User(
                name="Dr. Rameshwar Singh (IAS)",
                phone="9412000001",
                email="admin.benefitlens@gov.in",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)

        officer_user = db.query(User).filter(User.role == "officer").first()
        if not officer_user:
            logger.info("Creating verification officer user...")
            officer_user = User(
                name="Pooja Deshmukh (Verification Officer)",
                phone="9823011223",
                email="pooja.officer@mp.gov.in",
                hashed_password=get_password_hash("password123"),
                role="officer",
                is_active=True
            )
            db.add(officer_user)

        citizen_user = db.query(User).filter(User.phone == "9876543210").first()
        if not citizen_user:
            logger.info("Creating default verified citizen user...")
            citizen_user = User(
                name="Rajesh Kumar Verma",
                phone="9876543210",
                email="rajesh.verma@example.in",
                hashed_password=get_password_hash("password123"),
                role="citizen",
                is_active=True
            )
            db.add(citizen_user)
            db.flush()

            citizen_profile = CitizenProfile(
                user_id=citizen_user.id,
                state="Madhya Pradesh",
                district="Indore",
                aadhaar_masked="XXXX-XXXX-4819",
                annual_income=240000.0,
                age=28,
                gender="Male",
                occupation="Farmer",
                education="Graduate",
                category="OBC",
                is_differently_abled=False,
                is_farmer=True,
                landholding_acres=2.5,
                ration_card_type="PHH",
                bank_name="State Bank of India",
                account_number_masked="XXXX-XXXX-4102",
                ifsc_code="SBIN0001842",
                documents_locker=[
                    {
                        "id": "doc-1",
                        "name": "Aadhaar Card (Verified)",
                        "type": "Identity Proof",
                        "status": "Verified",
                        "date": "2026-08-15",
                        "size": "1.2 MB",
                        "verifiedBy": "UIDAI e-Pramaan Gateway"
                    },
                    {
                        "id": "doc-2",
                        "name": "Income Certificate (FY 2025-26)",
                        "type": "Income Proof",
                        "status": "Verified",
                        "date": "2026-08-20",
                        "size": "850 KB",
                        "verifiedBy": "Tehsildar Revenue Office"
                    },
                    {
                        "id": "doc-3",
                        "name": "Khasra / Khatauni Land Record",
                        "type": "Land Proof",
                        "status": "Verified",
                        "date": "2026-09-02",
                        "size": "2.1 MB",
                        "verifiedBy": "Madhya Pradesh Bhulekh Portal"
                    }
                ]
            )
            db.add(citizen_profile)
            db.flush()

            # Seed Real Citizen Application
            app1 = Application(
                id="ARN-2026-48291",
                user_id=citizen_user.id,
                scheme_id="pm-kisan",
                applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=14),
                status="Approved",
                status_remarks="All criteria verified and sanctioned for DBT disbursement.",
                acknowledgement_proof_url="/api/v1/applications/ARN-2026-48291/acknowledgement",
                applicant_name="Rajesh Kumar Verma",
                applicant_phone="9876543210",
                applicant_state="Madhya Pradesh",
                applicant_district="Indore",
                aadhaar_masked="XXXX-XXXX-4819",
                attached_docs=[
                    "Aadhaar Card (e-KYC Verified)",
                    "Khasra/Khatauni Land Record",
                    "Bank Passbook (NPCI Seeded)"
                ]
            )
            db.add(app1)
            db.flush()

            t1 = ApplicationTimeline(
                application_id=app1.id,
                step_number=1,
                title="Application Submitted Online",
                stage="Submission",
                date="10 Oct 2026",
                status="completed",
                details="Digital application registered on PM-KISAN Portal with DigiLocker documents.",
                officer_name="Citizen Portal Automated Gateway"
            )
            t2 = ApplicationTimeline(
                application_id=app1.id,
                step_number=2,
                title="Document Scrutiny & Land Record Verification",
                stage="Verification",
                date="14 Oct 2026",
                status="completed",
                details="Khatauni ownership verified with MP Bhulekh database.",
                officer_name="Pooja Deshmukh (Verification Officer)"
            )
            t3 = ApplicationTimeline(
                application_id=app1.id,
                step_number=3,
                title="Aadhaar-NPCI Seeding Verification",
                stage="NPCI Seeding",
                date="17 Oct 2026",
                status="completed",
                details="Bank account verified on PFMS Aadhaar Payment Bridge.",
                officer_name="PFMS Automated Verification Node"
            )
            t4 = ApplicationTimeline(
                application_id=app1.id,
                step_number=4,
                title="Sanction Order & Direct Benefit Transfer",
                stage="Sanction",
                date="20 Oct 2026",
                status="completed",
                details="Sanction order #SO-2026-90412 generated. 18th Installment disbursed.",
                officer_name="District Agriculture Officer"
            )
            db.add_all([t1, t2, t3, t4])

            # Seed Real Benefit Payment (DBT money tracking)
            pay1 = BenefitPaymentRecord(
                application_id=app1.id,
                user_id=citizen_user.id,
                scheme_id="pm-kisan",
                installment_number=1,
                amount=2000.0,
                amount_formatted="₹2,000",
                payment_mode="DBT via PFMS (Aadhaar Payment Bridge)",
                disbursement_date=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                status="Credited",
                verification_status="Verified via PFMS Gateway & SBI Bank Reconciliation",
                utr_number="UTR-SBI-2026-948102941",
                pfms_reference_id="PFMS-AGRI-2026-0049182",
                bank_account_masked="XXXX-XXXX-4102"
            )
            db.add(pay1)

            # Seed Second Pending Application
            app2 = Application(
                id="ARN-2026-72814",
                user_id=citizen_user.id,
                scheme_id="pm-ayushman",
                applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                status="Under Verification",
                status_remarks="Aadhaar e-KYC verified; awaiting District Health Nodal verification.",
                acknowledgement_proof_url="/api/v1/applications/ARN-2026-72814/acknowledgement",
                applicant_name="Rajesh Kumar Verma",
                applicant_phone="9876543210",
                applicant_state="Madhya Pradesh",
                applicant_district="Indore",
                aadhaar_masked="XXXX-XXXX-4819",
                attached_docs=[
                    "Aadhaar Card (e-KYC Verified)",
                    "Samagra Family Ration ID"
                ]
            )
            db.add(app2)
            db.flush()

            t2_1 = ApplicationTimeline(
                application_id=app2.id,
                step_number=1,
                title="Application Submitted Online",
                stage="Submission",
                date="21 Oct 2026",
                status="completed",
                details="Application registered for Golden Card issuance.",
                officer_name="Citizen Portal Automated Gateway"
            )
            t2_2 = ApplicationTimeline(
                application_id=app2.id,
                step_number=2,
                title="NHA / State Ration Database Scrutiny",
                stage="Verification",
                date="22 Oct 2026",
                status="current",
                details="Family member inclusion check against State Food & Civil Supplies database.",
                officer_name="Indore District Health Cell"
            )
            db.add_all([t2_1, t2_2])

            # Seed Initial SMS Notification Log
            notif1 = Notification(
                user_id=citizen_user.id,
                phone=citizen_user.phone,
                scheme_id="pm-kisan",
                notification_type="dbt_disbursement",
                title="Benefit Credited: ₹2,000",
                message="Govt DBT Alert: ₹2,000 under PM-KISAN credited to your bank account ending in 4102. UTR: UTR-SBI-2026-948102941. Ref: GOVSMS",
                gateway_status="Delivered",
                gateway_name="NIC-Govt-SMS-Gateway",
                gateway_response_id="GOV-SMS-849102-ACK",
                is_read=False
            )
            db.add(notif1)

        db.commit()
        logger.info("Startup seed data verified successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during startup seed: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "portal": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BenefitLens Backend API",
        "database": "PostgreSQL (port 12345)",
        "security": "Aadhaar Masking & BCrypt Enabled",
        "sms_gateway": settings.SMS_GATEWAY_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
