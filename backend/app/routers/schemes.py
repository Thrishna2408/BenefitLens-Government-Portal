from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Scheme, User
from app.schemas.schemas import SchemeOut, SchemeEligibilityMatch
from app.routers.auth import get_current_user
from app.services.eligibility_service import evaluate_scheme_eligibility, sort_schemes_by_eligibility_and_deadline

router = APIRouter(prefix="/schemes", tags=["Government Schemes & Eligibility"])

@router.get("", response_model=List[SchemeOut])
def list_schemes(
    category: Optional[str] = Query(None, description="Category filter (e.g. Agriculture, Healthcare, etc.)"),
    level: Optional[str] = Query(None, description="Central or State"),
    state: Optional[str] = Query(None, description="Specific state name"),
    search: Optional[str] = Query(None, description="Search keyword in title, ministry or description"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.active == True)

    if category and category.lower() != "all":
        query = query.filter(Scheme.category.ilike(f"%{category}%"))

    if level and level.lower() != "all":
        query = query.filter(Scheme.level.ilike(level))

    if state and state.lower() not in ["all", "all india"]:
        query = query.filter((Scheme.state == "All India") | (Scheme.state.ilike(f"%{state}%")))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Scheme.title.ilike(search_filter)) |
            (Scheme.ministry.ilike(search_filter)) |
            (Scheme.short_description.ilike(search_filter)) |
            (Scheme.code.ilike(search_filter))
        )

    return query.order_by(Scheme.popularity.desc()).all()


@router.get("/personalized")
def get_personalized_schemes(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Identifies schemes for which the user may be eligible based on their registration details.
    Sorts schemes by eligibility (fully eligible first), match percentage, and application deadline.
    """
    schemes = db.query(Scheme).filter(Scheme.active == True).all()

    if not current_user or not current_user.profile:
        # Return schemes with default citizen parameters
        results = []
        for s in schemes:
            results.append({
                "scheme": SchemeOut.from_orm(s),
                "is_eligible": True,
                "match_percentage": 90,
                "eligible_reasons": ["National priority scheme open to eligible citizens"],
                "unmet_criteria": []
            })
        return results

    profile = current_user.profile
    evaluated_list = []

    for s in schemes:
        eval_result = evaluate_scheme_eligibility(s, profile)
        evaluated_list.append({
            "scheme": SchemeOut.from_orm(s),
            "is_eligible": eval_result["is_eligible"],
            "match_percentage": eval_result["match_percentage"],
            "eligible_reasons": eval_result["eligible_reasons"],
            "unmet_criteria": eval_result["unmet_criteria"],
            "deadline": s.deadline
        })

    # Sort schemes: eligible first, higher match % first, then deadline
    sorted_schemes = sort_schemes_by_eligibility_and_deadline(
        [{"evaluation": item, **item} for item in evaluated_list]
    )

    # Clean response
    return [
        {
            "scheme": item["scheme"],
            "is_eligible": item["is_eligible"],
            "match_percentage": item["match_percentage"],
            "eligible_reasons": item["eligible_reasons"],
            "unmet_criteria": item["unmet_criteria"]
        }
        for item in sorted_schemes
    ]


@router.get("/{scheme_id}", response_model=SchemeOut)
def get_scheme_detail(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Government scheme with ID '{scheme_id}' was not found in the verified registry."
        )
    return scheme


@router.post("/evaluate-guest")
def evaluate_guest_eligibility(
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Public eligibility calculator for guest citizens.
    Accepts age, state, annualIncome, occupation, gender, category.
    """
    schemes = db.query(Scheme).filter(Scheme.active == True).all()
    
    # Create pseudo profile
    class PseudoProfile:
        pass
    p = PseudoProfile()
    p.age = int(payload.get("age", 25))
    p.annual_income = float(payload.get("annualIncome", 200000))
    p.state = payload.get("state", "Madhya Pradesh")
    p.occupation = payload.get("occupation", "Farmer")
    p.gender = payload.get("gender", "Male")
    p.category = payload.get("category", "OBC")

    results = []
    for s in schemes:
        eval_res = evaluate_scheme_eligibility(s, p)
        results.append({
            "scheme": SchemeOut.from_orm(s),
            "is_eligible": eval_res["is_eligible"],
            "match_percentage": eval_res["match_percentage"],
            "eligible_reasons": eval_res["eligible_reasons"],
            "unmet_criteria": eval_res["unmet_criteria"]
        })

    # Sort results
    sorted_results = sorted(
        results,
        key=lambda x: (1 if x["is_eligible"] else 0, x["match_percentage"]),
        reverse=True
    )

    return sorted_results
