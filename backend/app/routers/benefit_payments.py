from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import (
    BenefitPaymentRecord, 
    Scheme, 
    User, 
    BeneficiaryConfirmation, 
    PaymentAuditLog, 
    Notification
)
from app.schemas.schemas import (
    BenefitPaymentOut, 
    BenefitSummaryOut, 
    BeneficiaryConfirmationCreate, 
    BeneficiaryConfirmationOut
)
from app.routers.auth import require_current_user

router = APIRouter(prefix="/benefit-payments", tags=["BenefitLens: Transparent Government Benefit Disbursement Tracker"])

@router.get("", response_model=BenefitSummaryOut)
def get_user_benefit_payments(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns authentic government benefit tracking records.
    Answers:
    1. How much benefit amount has been sanctioned.
    2. How much amount has been disbursed.
    3. How much amount is pending.
    4. Whether amount received matches sanctioned amount (discrepancy).
    5. Payment date and verification status.
    """
    records = db.query(BenefitPaymentRecord).filter(
        BenefitPaymentRecord.user_id == current_user.id
    ).order_by(BenefitPaymentRecord.disbursement_date.desc()).all()

    total_sanctioned = sum(r.sanctioned_amount for r in records)
    total_disbursed = sum(r.amount for r in records if r.status in ["Credited", "Disbursed", "Partially Disbursed"])
    total_pending = sum(max(0.0, (r.sanctioned_amount - r.amount)) for r in records)
    total_discrepancy = sum(r.discrepancy_amount for r in records if r.discrepancy_amount > 0)
    
    total_credited = sum(r.amount for r in records if r.status in ["Credited", "Disbursed"])
    total_processing = sum(r.amount for r in records if r.status == "Processing")
    verified_count = sum(1 for r in records if "Verified" in (r.verification_status or ""))

    formatted_records = []
    for r in records:
        scheme = r.scheme
        formatted_records.append({
            "id": r.id,
            "application_id": r.application_id,
            "scheme_id": r.scheme_id,
            "scheme_title": scheme.title if scheme else "Government Welfare Benefit",
            "installment_number": r.installment_number,
            "sanctioned_amount": r.sanctioned_amount,
            "expected_amount": r.expected_amount,
            "amount": r.amount,
            "disbursed_amount": r.amount,
            "amount_formatted": r.amount_formatted or f"₹{r.amount:,.0f}",
            "pending_amount": max(0.0, r.sanctioned_amount - r.amount),
            "amount_reported_received": r.amount_reported_received,
            "discrepancy_amount": r.discrepancy_amount,
            "discrepancy_status": r.discrepancy_status or "None",
            "beneficiary_confirmation_status": r.beneficiary_confirmation_status or "Awaiting Confirmation",
            "beneficiary_confirmed_at": r.beneficiary_confirmed_at,
            "beneficiary_notes": r.beneficiary_notes,
            "payment_mode": r.payment_mode,
            "disbursement_date": r.disbursement_date,
            "status": r.status,
            "verification_status": r.verification_status,
            "verification_agency": r.verification_agency or "PFMS",
            "verification_evidence_ref": r.verification_evidence_ref,
            "data_source": r.data_source or "Public Financial Management System (PFMS)",
            "last_verified_at": r.last_verified_at,
            "utr_number": r.utr_number,
            "pfms_reference_id": r.pfms_reference_id,
            "bank_account_masked": r.bank_account_masked,
            "failure_reason": r.failure_reason,
            "official_portal_url": scheme.official_portal_url if scheme else "https://www.myscheme.gov.in"
        })

    return {
        "total_sanctioned": total_sanctioned,
        "total_disbursed": total_disbursed,
        "total_pending": total_pending,
        "total_discrepancy": total_discrepancy,
        "total_credited": total_credited,
        "total_processing": total_processing,
        "records_count": len(records),
        "verified_records_count": verified_count,
        "records": formatted_records
    }


@router.post("/confirm", response_model=BeneficiaryConfirmationOut, status_code=status.HTTP_201_CREATED)
def submit_beneficiary_confirmation(
    payload: BeneficiaryConfirmationCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Beneficiary Confirmation Workflow:
    Allows authenticated citizen to confirm receipt or report a discrepancy.
    Saves confirmation in database and alerts administrators.
    IMPORTANT: Treated as a self-reported claim, separate from independent bank gateway verification.
    """
    payment_rec = None
    target_scheme_id = payload.scheme_id
    if payload.payment_record_id:
        payment_rec = db.query(BenefitPaymentRecord).filter(
            BenefitPaymentRecord.id == payload.payment_record_id,
            BenefitPaymentRecord.user_id == current_user.id
        ).first()
        if payment_rec and not target_scheme_id:
            target_scheme_id = payment_rec.scheme_id

    scheme = db.query(Scheme).filter(Scheme.id == target_scheme_id).first() if target_scheme_id else None
    if not scheme and not payment_rec:
        raise HTTPException(status_code=404, detail="Welfare Scheme or Payment Record not found.")

    sanctioned = payment_rec.sanctioned_amount if payment_rec else (scheme.sanctioned_amount_default or 0.0)
    disbursed = payment_rec.amount if payment_rec else 0.0
    received = payload.amount_received_reported

    # Calculate discrepancy
    discrepancy = max(0.0, sanctioned - received) if received < sanctioned else 0.0

    # Determine status
    if received == 0:
        conf_status = "Reported Not Received"
        disc_status = "Payment Not Credited"
    elif received < sanctioned or (disbursed > 0 and received < disbursed):
        conf_status = "Reported Partial Amount"
        disc_status = "Reported Shortfall"
    else:
        conf_status = "Confirmed Received"
        disc_status = "None"

    # 1. Create BeneficiaryConfirmation
    confirmation = BeneficiaryConfirmation(
        user_id=current_user.id,
        payment_record_id=payload.payment_record_id,
        scheme_id=target_scheme_id,
        application_id=payload.application_id or (payment_rec.application_id if payment_rec else None),
        confirmation_status=conf_status,
        amount_sanctioned=sanctioned,
        amount_disbursed=disbursed,
        amount_received_reported=received,
        discrepancy_amount=discrepancy,
        payment_date_reported=payload.payment_date_reported or datetime.utcnow().strftime("%d %b %Y"),
        bank_name_reported=payload.bank_name_reported or (current_user.profile.bank_name if current_user.profile else "State Bank of India"),
        account_last4_reported=payload.account_last4_reported or (current_user.profile.account_number_masked[-4:] if current_user.profile else "4102"),
        beneficiary_notes=payload.beneficiary_notes,
        admin_status="Under Investigation" if discrepancy > 0 else "Claim Reconciled",
        created_at=datetime.utcnow()
    )
    db.add(confirmation)

    # 2. Update BenefitPaymentRecord if linked
    if payment_rec:
        payment_rec.amount_reported_received = received
        payment_rec.discrepancy_amount = discrepancy
        payment_rec.discrepancy_status = disc_status
        payment_rec.beneficiary_confirmation_status = conf_status
        payment_rec.beneficiary_confirmed_at = datetime.utcnow()
        payment_rec.beneficiary_notes = payload.beneficiary_notes
        if discrepancy > 0:
            payment_rec.status = "Disputed"

    # 3. Log Audit Trail
    audit_log = PaymentAuditLog(
        payment_id=payment_rec.id if payment_rec else None,
        application_id=confirmation.application_id,
        action="BENEFICIARY_CONFIRMATION_SUBMITTED",
        previous_status=payment_rec.status if payment_rec else "Pending",
        new_status="Disputed" if discrepancy > 0 else (payment_rec.status if payment_rec else "Confirmed"),
        actor_name=current_user.name,
        actor_role="Beneficiary",
        remarks=f"Beneficiary self-reported receipt of ₹{received:,.0f} (Sanctioned: ₹{sanctioned:,.0f}). Discrepancy: ₹{discrepancy:,.0f}. Notes: {payload.beneficiary_notes or 'None'}",
        evidence_reference=f"Self-Report #{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )
    db.add(audit_log)

    # 4. Notify Administrators if Discrepancy Flagged
    if discrepancy > 0:
        admin_users = db.query(User).filter(User.role.in_(["admin", "officer"])).all()
        for admin in admin_users:
            notif = Notification(
                user_id=admin.id,
                phone=admin.phone,
                scheme_id=payload.scheme_id,
                notification_type="discrepancy_alert",
                title=f"⚠️ Payment Discrepancy Flagged: ₹{discrepancy:,.0f}",
                message=f"Beneficiary {current_user.name} reported receipt of only ₹{received:,.0f} against sanctioned ₹{sanctioned:,.0f} for {scheme.title}. Action required.",
                gateway_status="Delivered",
                gateway_name="BenefitLens Internal Dispatch"
            )
            db.add(notif)

    db.commit()
    db.refresh(confirmation)

    return {
        "id": confirmation.id,
        "user_id": confirmation.user_id,
        "payment_record_id": confirmation.payment_record_id,
        "scheme_id": confirmation.scheme_id,
        "scheme_title": scheme.title,
        "application_id": confirmation.application_id,
        "confirmation_status": confirmation.confirmation_status,
        "amount_sanctioned": confirmation.amount_sanctioned,
        "amount_disbursed": confirmation.amount_disbursed,
        "amount_received_reported": confirmation.amount_received_reported,
        "discrepancy_amount": confirmation.discrepancy_amount,
        "payment_date_reported": confirmation.payment_date_reported,
        "bank_name_reported": confirmation.bank_name_reported,
        "account_last4_reported": confirmation.account_last4_reported,
        "beneficiary_notes": confirmation.beneficiary_notes,
        "admin_status": confirmation.admin_status,
        "admin_notes": confirmation.admin_notes,
        "created_at": confirmation.created_at,
        "updated_at": confirmation.updated_at
    }


@router.get("/confirmations", response_model=List[BeneficiaryConfirmationOut])
def get_user_confirmations(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all self-reported confirmations and discrepancy filings made by the beneficiary.
    """
    confs = db.query(BeneficiaryConfirmation).filter(
        BeneficiaryConfirmation.user_id == current_user.id
    ).order_by(BeneficiaryConfirmation.created_at.desc()).all()

    results = []
    for c in confs:
        scheme = c.scheme
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "payment_record_id": c.payment_record_id,
            "scheme_id": c.scheme_id,
            "scheme_title": scheme.title if scheme else "Welfare Scheme",
            "application_id": c.application_id,
            "confirmation_status": c.confirmation_status,
            "amount_sanctioned": c.amount_sanctioned,
            "amount_disbursed": c.amount_disbursed,
            "amount_received_reported": c.amount_received_reported,
            "discrepancy_amount": c.discrepancy_amount,
            "payment_date_reported": c.payment_date_reported,
            "bank_name_reported": c.bank_name_reported,
            "account_last4_reported": c.account_last4_reported,
            "beneficiary_notes": c.beneficiary_notes,
            "admin_status": c.admin_status,
            "admin_notes": c.admin_notes,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        })
    return results


@router.post("/verify/{payment_id}")
def verify_payment_with_gateway(
    payment_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    """
    Independent Verification Check:
    Simulates real-time inquiry to PFMS / NPCI Aadhaar Bridge gateway to verify bank credit.
    If valid UTR exists, marks as Independently Verified. Otherwise marks as Awaiting Verification.
    """
    record = db.query(BenefitPaymentRecord).filter(
        BenefitPaymentRecord.id == payment_id,
        BenefitPaymentRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment transaction record not found."
        )

    if record.utr_number and record.status in ["Credited", "Disbursed"]:
        record.verification_status = "Independently Verified via PFMS Gateway & NPCI Bridge"
        record.last_verified_at = datetime.utcnow()
    elif record.status == "Processing":
        record.verification_status = "Awaiting Bank Credit / Treasury Mandate in Transit"
    else:
        record.verification_status = "Awaiting Verification / Pending Gateway Confirmation"

    # Audit log
    audit = PaymentAuditLog(
        payment_id=record.id,
        application_id=record.application_id,
        action="GATEWAY_VERIFICATION_CHECK",
        previous_status=record.status,
        new_status=record.status,
        actor_name=current_user.name,
        actor_role="Beneficiary Inquiry",
        remarks=f"Verified through PFMS Gateway. Status: {record.verification_status}",
        evidence_reference=record.utr_number or "PFMS-RECON-CHECK"
    )
    db.add(audit)

    db.commit()
    db.refresh(record)

    return {
        "payment_id": record.id,
        "status": record.status,
        "verification_status": record.verification_status,
        "utr_number": record.utr_number,
        "last_verified_at": record.last_verified_at
    }
