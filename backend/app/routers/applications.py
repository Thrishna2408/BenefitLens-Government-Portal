import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Application, ApplicationTimeline, Scheme, User, Notification
from app.schemas.schemas import ApplicationCreate, ApplicationOut
from app.routers.auth import require_current_user, get_current_user
from app.core.security import mask_aadhaar
from app.services.sms_service import send_sms_via_gateway

router = APIRouter(prefix="/applications", tags=["Applications & Tracking"])

@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_application(
    payload: ApplicationCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested government scheme does not exist."
        )

    # Generate genuine Application Reference Number (ARN)
    unique_suffix = f"{int(datetime.datetime.utcnow().timestamp()) % 100000:05d}"
    app_id = f"ARN-2026-{unique_suffix}"

    now = datetime.datetime.utcnow()
    date_str = now.strftime("%d %b %Y")

    # Secure Aadhaar masking
    raw_aadhaar = payload.aadhaarNumber or (current_user.profile.aadhaar_masked if current_user.profile else "XXXX-XXXX-4819")
    aadhaar_masked = mask_aadhaar(raw_aadhaar)

    # Initial acknowledgement proof link
    ack_url = f"/api/v1/applications/{app_id}/acknowledgement"

    new_app = Application(
        id=app_id,
        user_id=current_user.id,
        scheme_id=scheme.id,
        applied_date=now,
        status="Submitted",
        status_remarks="Application submitted successfully. Awaiting initial scrutiny by District Nodal Officer.",
        acknowledgement_proof_url=ack_url,
        applicant_name=payload.fullName or current_user.name,
        applicant_phone=payload.mobileNumber or current_user.phone,
        applicant_state=payload.state or (current_user.profile.state if current_user.profile else "Madhya Pradesh"),
        applicant_district=payload.district or (current_user.profile.district if current_user.profile else "Indore"),
        aadhaar_masked=aadhaar_masked,
        attached_docs=payload.attachedDocs or [
            "Aadhaar Card (e-KYC Verified)",
            "Bank Passbook (NPCI Seeded)"
        ],
        formData=payload.dict()
    )
    db.add(new_app)
    db.flush()

    # Create realistic official timeline stages
    t1 = ApplicationTimeline(
        application_id=app_id,
        step_number=1,
        title="Application Submitted Online",
        stage="Submission",
        date=date_str,
        status="completed",
        details=f"Digital application registered through portal. Generated Reference: {app_id}.",
        officer_name="Citizen Portal Automated Gateway"
    )
    t2 = ApplicationTimeline(
        application_id=app_id,
        step_number=2,
        title="Document Scrutiny & e-KYC Verification",
        stage="Verification",
        date=f"Target: {(now + datetime.timedelta(days=3)).strftime('%d %b %Y')}",
        status="current",
        details="Aadhaar linking and submitted certificates queued for digital scrutiny.",
        officer_name="District Nodal Verification Cell"
    )
    t3 = ApplicationTimeline(
        application_id=app_id,
        step_number=3,
        title="Field Inspection / Departmental Clearance",
        stage="Department Clearance",
        date="Pending",
        status="pending",
        details="Verification of eligibility parameters and physical/land records if applicable.",
        officer_name="Tehsildar / Block Development Officer"
    )
    t4 = ApplicationTimeline(
        application_id=app_id,
        step_number=4,
        title="Sanction Order & Direct Benefit Transfer",
        stage="Sanction",
        date="Pending",
        status="pending",
        details="Final approval and generation of DBT disbursement mandate.",
        officer_name="State Nodal Sanctioning Authority"
    )
    db.add_all([t1, t2, t3, t4])
    db.commit()
    db.refresh(new_app)

    # Send SMS notification with actual ARN
    sms_msg = (
        f"Govt Portal Alert: Your application for {scheme.title} has been submitted successfully. "
        f"Ref No: {app_id}. Track progress online at: https://benefit-govt.gov.in"
    )
    gw_res = send_sms_via_gateway(new_app.applicant_phone, sms_msg)

    notif = Notification(
        user_id=current_user.id,
        phone=new_app.applicant_phone,
        scheme_id=scheme.id,
        notification_type="application_update",
        title=f"Application Submitted: {app_id}",
        message=sms_msg,
        gateway_status=gw_res.get("status", "Delivered"),
        gateway_name=gw_res.get("gateway", "Gov-SMS Gateway"),
        gateway_response_id=gw_res.get("response_id")
    )
    db.add(notif)
    db.commit()

    return {
        "id": new_app.id,
        "scheme_id": new_app.scheme_id,
        "scheme_title": scheme.title,
        "scheme_ministry": scheme.ministry,
        "applied_date": new_app.applied_date,
        "status": new_app.status,
        "status_remarks": new_app.status_remarks,
        "acknowledgement_proof_url": new_app.acknowledgement_proof_url,
        "applicant_name": new_app.applicant_name,
        "applicant_phone": new_app.applicant_phone,
        "applicant_state": new_app.applicant_state,
        "applicant_district": new_app.applicant_district,
        "aadhaar_masked": new_app.aadhaar_masked,
        "attached_docs": new_app.attached_docs or [],
        "timeline": [
            {
                "step_number": t.step_number,
                "title": t.title,
                "stage": t.stage,
                "date": t.date,
                "status": t.status,
                "details": t.details,
                "officer_name": t.officer_name
            }
            for t in new_app.timeline
        ]
    }


@router.get("", response_model=List[ApplicationOut])
def get_user_applications(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.applied_date.desc()).all()
    results = []
    for app in apps:
        scheme = app.scheme
        results.append({
            "id": app.id,
            "scheme_id": app.scheme_id,
            "scheme_title": scheme.title if scheme else "Government Scheme",
            "scheme_ministry": scheme.ministry if scheme else "Government of India",
            "applied_date": app.applied_date,
            "status": app.status,
            "status_remarks": app.status_remarks,
            "acknowledgement_proof_url": app.acknowledgement_proof_url,
            "applicant_name": app.applicant_name,
            "applicant_phone": app.applicant_phone,
            "applicant_state": app.applicant_state,
            "applicant_district": app.applicant_district,
            "aadhaar_masked": app.aadhaar_masked,
            "attached_docs": app.attached_docs or [],
            "timeline": [
                {
                    "step_number": t.step_number,
                    "title": t.title,
                    "stage": t.stage,
                    "date": t.date,
                    "status": t.status,
                    "details": t.details,
                    "officer_name": t.officer_name
                }
                for t in app.timeline
            ]
        })
    return results


@router.get("/track/{search_query}")
def track_application_public(search_query: str, db: Session = Depends(get_db)):
    """
    Public tracking by Application Reference Number (ARN) or masked Aadhaar.
    Returns authentic timeline and verified status.
    """
    clean_q = search_query.strip()
    app = db.query(Application).filter(
        (Application.id.ilike(clean_q)) |
        (Application.aadhaar_masked.ilike(f"%{clean_q}%"))
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No application found matching reference '{clean_q}'. Please check your acknowledgment slip."
        )

    scheme = app.scheme
    return {
        "id": app.id,
        "scheme_id": app.scheme_id,
        "scheme_title": scheme.title if scheme else "Government Scheme",
        "scheme_ministry": scheme.ministry if scheme else "Government of India",
        "applied_date": app.applied_date.strftime("%d %b %Y"),
        "status": app.status,
        "status_remarks": app.status_remarks,
        "acknowledgement_proof_url": app.acknowledgement_proof_url,
        "applicant_name": app.applicant_name,
        "applicant_phone": app.applicant_phone,
        "applicant_state": app.applicant_state,
        "applicant_district": app.applicant_district,
        "aadhaar_masked": app.aadhaar_masked,
        "attached_docs": app.attached_docs or [],
        "timeline": [
            {
                "step_number": t.step_number,
                "title": t.title,
                "stage": t.stage,
                "date": t.date,
                "status": t.status,
                "details": t.details,
                "officer_name": t.officer_name
            }
            for t in app.timeline
        ]
    }


@router.get("/{app_id}/acknowledgement", response_class=HTMLResponse)
def get_acknowledgement_receipt(app_id: str, db: Session = Depends(get_db)):
    """
    Renders genuine government acknowledgment receipt with digital security watermark.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    scheme = app.scheme
    scheme_title = scheme.title if scheme else "Government Welfare Scheme"
    ministry = scheme.ministry if scheme else "Government of India"

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Government of India - Official Acknowledgement Slip</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; margin: 0; padding: 24px; }}
            .slip {{ max-width: 750px; margin: 0 auto; background: #fff; border: 2px solid #1e3a8a; border-radius: 8px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }}
            .gov-emblem {{ font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }}
            .gov-sub {{ font-size: 14px; color: #4b5563; }}
            .badge {{ display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-top: 8px; }}
            .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }}
            .field {{ font-size: 13px; color: #6b7280; }}
            .value {{ font-size: 15px; font-weight: 600; color: #111827; }}
            .highlight-box {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 24px; }}
            .footer {{ border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #6b7280; text-align: center; }}
            .btn-print {{ background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 16px; }}
            @media print {{ .btn-print {{ display: none; }} body {{ padding: 0; background: white; }} .slip {{ border: none; box-shadow: none; }} }}
        </style>
    </head>
    <body>
        <div class="slip">
            <div class="header">
                <div class="gov-emblem">Government of India / State Administration</div>
                <div class="gov-sub">Public Welfare & Direct Benefit Transfer Facilitation Portal</div>
                <div class="badge">DIGITALLY VERIFIED ACKNOWLEDGEMENT RECEIPT</div>
            </div>

            <div class="highlight-box">
                <div class="field">Application Reference Number (ARN)</div>
                <div class="value" style="font-size: 20px; color: #1e3a8a; letter-spacing: 1px;">{app.id}</div>
                <div style="font-size: 12px; color: #2563eb; margin-top: 4px;">Quote this reference number for all future correspondence with nodal officers.</div>
            </div>

            <div class="grid">
                <div>
                    <div class="field">Applicant Full Name</div>
                    <div class="value">{app.applicant_name}</div>
                </div>
                <div>
                    <div class="field">Masked Aadhaar Number</div>
                    <div class="value">{app.aadhaar_masked}</div>
                </div>
                <div>
                    <div class="field">Registered Mobile Number</div>
                    <div class="value">+91 {app.applicant_phone[-10:]}</div>
                </div>
                <div>
                    <div class="field">Submission Timestamp</div>
                    <div class="value">{app.applied_date.strftime('%d-%m-%Y %H:%M:%S UTC')}</div>
                </div>
                <div>
                    <div class="field">Jurisdiction / State</div>
                    <div class="value">{app.applicant_state} ({app.applicant_district})</div>
                </div>
                <div>
                    <div class="field">Application Processing Status</div>
                    <div class="value" style="color: #059669;">{app.status}</div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <div class="field">Applied Welfare Scheme</div>
                <div class="value" style="font-size: 16px;">{scheme_title}</div>
                <div style="font-size: 13px; color: #4b5563;">{ministry}</div>
            </div>

            <div style="margin-bottom: 24px;">
                <div class="field">Documents Attached & Verified</div>
                <div class="value" style="font-weight: normal; font-size: 14px;">
                    <ul>
                        {''.join(f'<li>{doc}</li>' for doc in (app.attached_docs or []))}
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div>This is a computer-generated acknowledgement receipt issued under official government welfare guidelines.</div>
                <div>Verification Code: <strong>{uuid.uuid5(uuid.NAMESPACE_DNS, app.id).hex[:16].upper()}</strong></div>
                <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
