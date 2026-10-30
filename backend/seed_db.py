import sys
import datetime
import logging
from app.database import engine, Base, SessionLocal
from app.models.models import (
    User,
    CitizenProfile,
    Scheme,
    Application,
    ApplicationTimeline,
    BenefitPaymentRecord,
    BeneficiaryConfirmation,
    PaymentAuditLog,
    Notification,
    GrievanceTicket
)
from app.core.security import get_password_hash
from app.services.real_schemes_seed import GENUINE_GOVERNMENT_SCHEMES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_db")

def init_and_seed():
    logger.info("Dropping old tables and recreating BenefitLens schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("BenefitLens tables created successfully in PostgreSQL.")

    db = SessionLocal()
    try:
        # 1. Seed Schemes
        logger.info("Inserting genuine Central & State government schemes...")
        for s_data in GENUINE_GOVERNMENT_SCHEMES:
            # Determine standard default sanctioned amount based on scheme
            amt_default = 0.0
            if s_data["id"] == "pm-kisan":
                amt_default = 6000.0
            elif s_data["id"] == "pm-ayushman":
                amt_default = 500000.0
            elif s_data["id"] == "pm-awas-gramin":
                amt_default = 120000.0
            elif s_data["id"] == "pm-svanidhi":
                amt_default = 10000.0
            elif s_data["id"] == "post-matric-sc":
                amt_default = 12000.0
            elif s_data["id"] == "ladli-behna":
                amt_default = 15000.0
            elif s_data["id"] == "rythu-bharosa":
                amt_default = 13500.0
            elif s_data["id"] == "pudhumai-penn":
                amt_default = 12000.0
            elif s_data["id"] == "pm-vishwakarma":
                amt_default = 15000.0
            elif s_data["id"] == "atal-pension":
                amt_default = 5000.0
            elif s_data["id"] == "sukanya-samriddhi":
                amt_default = 15000.0
            elif s_data["id"] == "mudra-shishu":
                amt_default = 50000.0

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
                sanctioned_amount_default=amt_default,
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
                verified_source_url=s_data.get("official_portal_url", "https://www.myscheme.gov.in"),
                published_date="15 Jan 2026",
                total_disbursed=s_data.get("total_disbursed"),
                beneficiaries_count=s_data.get("beneficiaries_count")
            )
            db.add(scheme)
        db.commit()
        logger.info(f"Successfully seeded {len(GENUINE_GOVERNMENT_SCHEMES)} schemes.")

        # 2. Seed Default Accounts
        # Admin
        admin_user = User(
            name="Dr. Rameshwar Singh (IAS)",
            phone="9412000001",
            email="admin.benefitlens@gov.in",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)

        # Officer
        officer_user = User(
            name="Pooja Deshmukh (Verification Officer)",
            phone="9823011223",
            email="pooja.officer@mp.gov.in",
            hashed_password=get_password_hash("password123"),
            role="officer",
            is_active=True
        )
        db.add(officer_user)

        # Beneficiary (Citizen)
        citizen_user = User(
            name="Rajesh Kumar Verma",
            phone="9876543210",
            email="rajesh.verma@example.in",
            hashed_password=get_password_hash("password123"),
            role="citizen",
            is_active=True
        )
        db.add(citizen_user)
        db.commit()
        db.refresh(citizen_user)

        # Beneficiary Profile
        profile = CitizenProfile(
            user_id=citizen_user.id,
            state="Madhya Pradesh",
            district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            aadhaar_hash="salted_sha256_hash_4819_benefitlens",
            annual_income=180000.0,
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
                    "name": "Khasra / Khatauni Land Record (B-1)",
                    "type": "Land Title",
                    "status": "Verified",
                    "date": "2026-10-20",
                    "size": "2.4 MB",
                    "verifiedBy": "MP Bhulekh Revenue Gateway"
                },
                {
                    "name": "Tehsildar Income Certificate (Valid 2026-27)",
                    "type": "Income Proof",
                    "status": "Verified",
                    "date": "2026-09-15",
                    "size": "850 KB",
                    "verifiedBy": "Revenue Department Indore"
                },
                {
                    "name": "Aadhaar Card (e-KYC Verified)",
                    "type": "Identity Proof",
                    "status": "Verified",
                    "date": "2026-10-24",
                    "size": "1.2 MB",
                    "verifiedBy": "UIDAI e-Pramaan Gateway"
                }
            ]
        )
        db.add(profile)
        db.commit()

        # 3. Seed Applications demonstrating full tracking lifecycle
        # App 1: PM-KISAN (Approved, Sanctioned ₹6,000)
        app1 = Application(
            id="ARN-2026-48291",
            user_id=citizen_user.id,
            scheme_id="pm-kisan",
            applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=20),
            status="Approved",
            status_remarks="All land records & Aadhaar-NPCI verified. Sanction order released.",
            sanctioned_amount=6000.0,
            sanction_date=datetime.datetime.utcnow() - datetime.timedelta(days=12),
            sanction_order_number="SO-PMK-2026-48291",
            acknowledgement_proof_url="/api/v1/applications/ARN-2026-48291/acknowledgement",
            applicant_name="Rajesh Kumar Verma",
            applicant_phone="9876543210",
            applicant_state="Madhya Pradesh",
            applicant_district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            attached_docs=["Aadhaar Card (e-KYC Verified)", "Khatauni Land Record", "Bank Passbook (NPCI Seeded)"]
        )
        db.add(app1)
        db.flush()

        t1_1 = ApplicationTimeline(application_id=app1.id, step_number=1, title="Application Submitted Online", stage="Submission", date="08 Oct 2026", status="completed", details="Digital application registered on PM-KISAN Portal.", officer_name="Citizen Portal Automated Gateway")
        t1_2 = ApplicationTimeline(application_id=app1.id, step_number=2, title="Document Scrutiny & Land Record Verification", stage="Verification", date="12 Oct 2026", status="completed", details="Khatauni verified with MP Bhulekh.", officer_name="Pooja Deshmukh (Verification Officer)")
        t1_3 = ApplicationTimeline(application_id=app1.id, step_number=3, title="Aadhaar-NPCI Seeding Verification", stage="NPCI Seeding", date="14 Oct 2026", status="completed", details="Account reconciled on PFMS Aadhaar Payment Bridge.", officer_name="PFMS Automated Node")
        t1_4 = ApplicationTimeline(application_id=app1.id, step_number=4, title="Sanction Order & Direct Benefit Transfer", stage="Sanction", date="16 Oct 2026", status="completed", details="Sanction order #SO-PMK-2026-48291 approved for ₹6,000/yr.", officer_name="District Agriculture Officer")
        db.add_all([t1_1, t1_2, t1_3, t1_4])

        # App 2: Ayushman Bharat (Under Verification)
        app2 = Application(
            id="ARN-2026-72814",
            user_id=citizen_user.id,
            scheme_id="pm-ayushman",
            applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=5),
            status="Under Verification",
            status_remarks="Aadhaar e-KYC verified; awaiting District Health Nodal verification.",
            sanctioned_amount=500000.0,
            acknowledgement_proof_url="/api/v1/applications/ARN-2026-72814/acknowledgement",
            applicant_name="Rajesh Kumar Verma",
            applicant_phone="9876543210",
            applicant_state="Madhya Pradesh",
            applicant_district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            attached_docs=["Aadhaar Card (e-KYC Verified)", "Samagra Family Ration ID"]
        )
        db.add(app2)
        db.flush()

        t2_1 = ApplicationTimeline(application_id=app2.id, step_number=1, title="Application Submitted Online", stage="Submission", date="23 Oct 2026", status="completed", details="Application registered for Golden Card issuance.", officer_name="Citizen Portal Automated Gateway")
        t2_2 = ApplicationTimeline(application_id=app2.id, step_number=2, title="NHA / State Ration Database Scrutiny", stage="Verification", date="24 Oct 2026", status="current", details="Family member inclusion check against State Food & Civil Supplies database.", officer_name="Indore District Health Cell")
        t2_3 = ApplicationTimeline(application_id=app2.id, step_number=3, title="Digital Golden Card Approval", stage="Approval", date="Pending", status="pending", details="Awaiting nodal authorization.", officer_name="Chief Medical & Health Officer")
        db.add_all([t2_1, t2_2, t2_3])

        # App 3: PMAY-Gramin (Approved, Sanctioned ₹1,20,000)
        app3 = Application(
            id="ARN-2026-19385",
            user_id=citizen_user.id,
            scheme_id="pm-awas-gramin",
            applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=35),
            status="Approved",
            status_remarks="Sanction order issued for Pucca House Construction (₹1,20,000 in 3 installments).",
            sanctioned_amount=120000.0,
            sanction_date=datetime.datetime.utcnow() - datetime.timedelta(days=20),
            sanction_order_number="SO-PMAY-2026-19385",
            acknowledgement_proof_url="/api/v1/applications/ARN-2026-19385/acknowledgement",
            applicant_name="Rajesh Kumar Verma",
            applicant_phone="9876543210",
            applicant_state="Madhya Pradesh",
            applicant_district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            attached_docs=["Aadhaar Card", "MGNREGA Job Card", "Kutcha House Site Photo"]
        )
        db.add(app3)
        db.flush()

        # App 4: PM SVANidhi (Approved, Sanctioned ₹10,000)
        app4 = Application(
            id="ARN-2026-92817",
            user_id=citizen_user.id,
            scheme_id="pm-svanidhi",
            applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=15),
            status="Approved",
            status_remarks="Working capital micro-credit approved.",
            sanctioned_amount=10000.0,
            sanction_date=datetime.datetime.utcnow() - datetime.timedelta(days=10),
            sanction_order_number="SO-SVN-2026-92817",
            acknowledgement_proof_url="/api/v1/applications/ARN-2026-92817/acknowledgement",
            applicant_name="Rajesh Kumar Verma",
            applicant_phone="9876543210",
            applicant_state="Madhya Pradesh",
            applicant_district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            attached_docs=["Certificate of Vending", "Aadhaar Card"]
        )
        db.add(app4)
        db.flush()

        # App 5: Post-Matric Scholarship (Approved with Disputed Partial Disbursement)
        app5 = Application(
            id="ARN-2026-38190",
            user_id=citizen_user.id,
            scheme_id="post-matric-scholarship",
            applied_date=datetime.datetime.utcnow() - datetime.timedelta(days=40),
            status="Approved",
            status_remarks="Higher education scholarship sanctioned at ₹12,000.",
            sanctioned_amount=12000.0,
            sanction_date=datetime.datetime.utcnow() - datetime.timedelta(days=25),
            sanction_order_number="SO-SCH-2026-38190",
            acknowledgement_proof_url="/api/v1/applications/ARN-2026-38190/acknowledgement",
            applicant_name="Rajesh Kumar Verma",
            applicant_phone="9876543210",
            applicant_state="Madhya Pradesh",
            applicant_district="Indore",
            aadhaar_masked="XXXX-XXXX-4819",
            attached_docs=["College Bonafide Certificate", "OBC Caste Certificate", "Fee Receipt"]
        )
        db.add(app5)
        db.commit()

        # 4. Seed Benefit Payment Records (The core transparency data!)
        # Record 1: PM-KISAN (Fully Disbursed Installment 1)
        pay1 = BenefitPaymentRecord(
            application_id=app1.id,
            user_id=citizen_user.id,
            scheme_id="pm-kisan",
            installment_number=1,
            sanctioned_amount=2000.0,
            expected_amount=2000.0,
            amount=2000.0,
            amount_formatted="₹2,000",
            pending_amount=0.0,
            amount_reported_received=2000.0,
            discrepancy_amount=0.0,
            discrepancy_status="None",
            beneficiary_confirmation_status="Confirmed Received",
            beneficiary_confirmed_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            beneficiary_notes="Full payment of ₹2,000 credited on time into my SBI account.",
            payment_mode="DBT via PFMS (Aadhaar Payment Bridge)",
            disbursement_date=datetime.datetime.utcnow() - datetime.timedelta(days=4),
            status="Credited",
            verification_status="Independently Verified via PFMS Gateway & SBI Bank Reconciliation",
            verification_agency="Public Financial Management System (PFMS)",
            verification_evidence_ref="PFMS-AGRI-2026-0049182",
            data_source="Public Financial Management System (PFMS)",
            utr_number="UTR-SBI-2026-948102941",
            pfms_reference_id="PFMS-AGRI-2026-0049182",
            bank_account_masked="XXXX-XXXX-4102"
        )
        db.add(pay1)

        # Record 2: PM SVANidhi (Fully Disbursed Working Capital)
        pay2 = BenefitPaymentRecord(
            application_id=app4.id,
            user_id=citizen_user.id,
            scheme_id="pm-svanidhi",
            installment_number=1,
            sanctioned_amount=10000.0,
            expected_amount=10000.0,
            amount=10000.0,
            amount_formatted="₹10,000",
            pending_amount=0.0,
            amount_reported_received=10000.0,
            discrepancy_amount=0.0,
            discrepancy_status="None",
            beneficiary_confirmation_status="Confirmed Received",
            beneficiary_confirmed_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            beneficiary_notes="Working capital loan subsidy received in full.",
            payment_mode="Direct Bank Transfer via PFMS",
            disbursement_date=datetime.datetime.utcnow() - datetime.timedelta(days=8),
            status="Credited",
            verification_status="Independently Verified via PFMS Gateway",
            verification_agency="Public Financial Management System (PFMS)",
            verification_evidence_ref="PFMS-MOHUA-2026-881920",
            data_source="State Urban Development Agency (SUDA)",
            utr_number="UTR-PNB-2026-881920391",
            pfms_reference_id="PFMS-MOHUA-2026-881920",
            bank_account_masked="XXXX-XXXX-4102"
        )
        db.add(pay2)

        # Record 3: PMAY-Gramin Tranche 1 (Partial Disbursement: ₹40,000 out of ₹1,20,000)
        pay3 = BenefitPaymentRecord(
            application_id=app3.id,
            user_id=citizen_user.id,
            scheme_id="pm-awas-gramin",
            installment_number=1,
            sanctioned_amount=120000.0,
            expected_amount=40000.0,
            amount=40000.0,
            amount_formatted="₹40,000",
            pending_amount=80000.0,  # Demonstrates transparent pending amount tracking!
            amount_reported_received=40000.0,
            discrepancy_amount=0.0,
            discrepancy_status="None",
            beneficiary_confirmation_status="Confirmed Received",
            beneficiary_confirmed_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
            beneficiary_notes="Tranche 1 (Foundation level) received. Work in progress for plinth level inspection.",
            payment_mode="DBT via State Treasury & PFMS",
            disbursement_date=datetime.datetime.utcnow() - datetime.timedelta(days=14),
            status="Partially Disbursed",
            verification_status="Independently Verified via PFMS Gateway",
            verification_agency="Rural Housing Nodal Agency (RHNA)",
            verification_evidence_ref="PMAYG-TR-1-FOUNDATION",
            data_source="Ministry of Rural Development DBT Portal",
            utr_number="UTR-CBI-2026-771920381",
            pfms_reference_id="PFMS-RD-2026-7719203",
            bank_account_masked="XXXX-XXXX-4102"
        )
        db.add(pay3)

        # Record 4: Post-Matric Scholarship (Discrepancy: Sanctioned ₹12,000, Disbursed only ₹8,000)
        pay4 = BenefitPaymentRecord(
            application_id=app5.id,
            user_id=citizen_user.id,
            scheme_id="post-matric-scholarship",
            installment_number=1,
            sanctioned_amount=12000.0,
            expected_amount=12000.0,
            amount=8000.0,
            amount_formatted="₹8,000",
            pending_amount=4000.0,
            amount_reported_received=8000.0,
            discrepancy_amount=4000.0,  # Discrepancy amount clearly computed!
            discrepancy_status="Reported Shortfall",
            beneficiary_confirmation_status="Reported Partial Amount",
            beneficiary_confirmed_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            beneficiary_notes="Only received ₹8,000 in bank passbook. Remaining ₹4,000 college tuition component not credited.",
            payment_mode="DBT via PFMS",
            disbursement_date=datetime.datetime.utcnow() - datetime.timedelta(days=10),
            status="Disputed",
            verification_status="Awaiting Verification / Pending Gateway Confirmation",
            verification_agency="National Scholarship Portal (NSP)",
            verification_evidence_ref="NSP-RECON-DISPUTE-4000",
            data_source="National Scholarship Portal (NSP)",
            utr_number="UTR-BOI-2026-118291039",
            pfms_reference_id="PFMS-SCH-2026-118291",
            bank_account_masked="XXXX-XXXX-4102"
        )
        db.add(pay4)
        db.commit()

        # 5. Seed Beneficiary Confirmation Records
        conf1 = BeneficiaryConfirmation(
            user_id=citizen_user.id,
            payment_record_id=pay1.id,
            scheme_id="pm-kisan",
            application_id=app1.id,
            confirmation_status="Confirmed Received",
            amount_sanctioned=2000.0,
            amount_disbursed=2000.0,
            amount_received_reported=2000.0,
            discrepancy_amount=0.0,
            payment_date_reported="24 Oct 2026",
            bank_name_reported="State Bank of India",
            account_last4_reported="4102",
            beneficiary_notes="Credited correctly.",
            admin_status="Claim Reconciled",
            admin_notes="Bank UTR matched with PFMS payment log.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        conf2 = BeneficiaryConfirmation(
            user_id=citizen_user.id,
            payment_record_id=pay3.id,
            scheme_id="pm-awas-gramin",
            application_id=app3.id,
            confirmation_status="Confirmed Received",
            amount_sanctioned=120000.0,
            amount_disbursed=40000.0,
            amount_received_reported=40000.0,
            discrepancy_amount=0.0,
            payment_date_reported="14 Oct 2026",
            bank_name_reported="State Bank of India",
            account_last4_reported="4102",
            beneficiary_notes="First installment received. Construction commenced.",
            admin_status="Claim Reconciled",
            admin_notes="Stage 1 foundation verification completed.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
        )
        conf3 = BeneficiaryConfirmation(
            user_id=citizen_user.id,
            payment_record_id=pay4.id,
            scheme_id="post-matric-scholarship",
            application_id=app5.id,
            confirmation_status="Reported Partial Amount",
            amount_sanctioned=12000.0,
            amount_disbursed=8000.0,
            amount_received_reported=8000.0,
            discrepancy_amount=4000.0,
            payment_date_reported="18 Oct 2026",
            bank_name_reported="State Bank of India",
            account_last4_reported="4102",
            beneficiary_notes="Received ₹8,000 maintenance allowance; ₹4,000 non-refundable tuition fee missing.",
            admin_status="Under Investigation",
            admin_notes="Discrepancy flagged to district welfare officer for institute fee reconciliation.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add_all([conf1, conf2, conf3])

        # 6. Seed Transparent Payment Audit Trail
        log1 = PaymentAuditLog(
            payment_id=pay1.id,
            application_id=app1.id,
            action="SANCTION_AND_DISBURSEMENT_RECORDED",
            previous_status="Approved",
            new_status="Credited",
            actor_name="District Agriculture Officer",
            actor_role="Nodal Officer",
            remarks="Sanction order #SO-PMK-2026-48291 generated. 18th Installment ₹2,000 disbursed via PFMS APB.",
            evidence_reference="UTR-SBI-2026-948102941",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=4)
        )
        log2 = PaymentAuditLog(
            payment_id=pay1.id,
            application_id=app1.id,
            action="BENEFICIARY_CONFIRMATION_SUBMITTED",
            previous_status="Credited",
            new_status="Confirmed",
            actor_name="Rajesh Kumar Verma",
            actor_role="Beneficiary",
            remarks="Beneficiary self-reported full receipt of ₹2,000 in SBI account ending in 4102.",
            evidence_reference="CONF-2026-00192",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        log3 = PaymentAuditLog(
            payment_id=pay4.id,
            application_id=app5.id,
            action="DISCREPANCY_FLAGGED",
            previous_status="Credited",
            new_status="Disputed",
            actor_name="Rajesh Kumar Verma",
            actor_role="Beneficiary",
            remarks="Beneficiary reported ₹4,000 shortfall between sanctioned ₹12,000 and received ₹8,000.",
            evidence_reference="DISC-REP-2026-88192",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        log4 = PaymentAuditLog(
            payment_id=pay4.id,
            application_id=app5.id,
            action="DISCREPANCY_REVIEW_UPDATED",
            previous_status="Disputed",
            new_status="Under Investigation",
            actor_name="Pooja Deshmukh",
            actor_role="Verification Officer",
            remarks="Investigation initiated: Requesting college fee reconciliation statement.",
            evidence_reference="INV-MEMO-2026-4019",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        db.add_all([log1, log2, log3, log4])

        # 7. Seed Notifications
        notif1 = Notification(
            user_id=citizen_user.id,
            phone=citizen_user.phone,
            scheme_id="pm-kisan",
            notification_type="dbt_disbursement",
            title="Benefit Credited: ₹2,000",
            message="BenefitLens Alert: ₹2,000 under PM-KISAN credited to your bank account ending in 4102. UTR: UTR-SBI-2026-948102941. Please confirm receipt on BenefitLens portal.",
            gateway_status="Delivered",
            gateway_name="BenefitLens-SMS Gateway",
            gateway_response_id="BL-SMS-849102-ACK",
            is_read=True
        )
        notif2 = Notification(
            user_id=citizen_user.id,
            phone=citizen_user.phone,
            scheme_id="post-matric-sc",
            notification_type="discrepancy_alert",
            title="Discrepancy Under Investigation: ₹4,000",
            message="BenefitLens Grievance Alert: Your reported shortfall of ₹4,000 under Post-Matric Scholarship is currently Under Investigation by the District Welfare Officer.",
            gateway_status="Delivered",
            gateway_name="BenefitLens-SMS Gateway",
            gateway_response_id="BL-SMS-991823-ACK",
            is_read=False
        )
        db.add_all([notif1, notif2])

        db.commit()
        logger.info("Complete BenefitLens transparent dataset seeded successfully into PostgreSQL!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed()
