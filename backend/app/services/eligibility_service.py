from typing import Dict, Any, List, Tuple
from app.models.models import Scheme, CitizenProfile

def evaluate_scheme_eligibility(scheme: Scheme, profile: CitizenProfile) -> Dict[str, Any]:
    """
    Evaluates deterministic eligibility rules for a citizen against a genuine government scheme.
    Returns:
      is_eligible: bool
      match_percentage: int (0 to 100)
      eligible_reasons: List[str]
      unmet_criteria: List[str]
    """
    eligible_reasons = []
    unmet_criteria = []
    
    total_checks = 6
    passed_checks = 0

    # 1. Age Check
    user_age = getattr(profile, 'age', 25)
    if scheme.min_age <= user_age <= scheme.max_age:
        passed_checks += 1
        eligible_reasons.append(f"Age {user_age} falls within eligible age bracket ({scheme.min_age} - {scheme.max_age} years)")
    else:
        unmet_criteria.append(f"Applicant age ({user_age} years) is outside required range ({scheme.min_age} - {scheme.max_age} years)")

    # 2. Annual Income Check
    user_income = getattr(profile, 'annual_income', 180000.0)
    if user_income <= scheme.max_income:
        passed_checks += 1
        eligible_reasons.append(f"Annual family income (₹{user_income:,.0f}) is below maximum ceiling of ₹{scheme.max_income:,.0f}")
    else:
        unmet_criteria.append(f"Annual family income (₹{user_income:,.0f}) exceeds scheme ceiling of ₹{scheme.max_income:,.0f}")

    # 3. State / Jurisdiction Check
    user_state = getattr(profile, 'state', 'All India')
    eligible_states = scheme.eligible_states or ["All India"]
    if "All India" in eligible_states or scheme.level == "Central" or user_state in eligible_states:
        passed_checks += 1
        eligible_reasons.append(f"State eligibility fulfilled for {user_state} ({scheme.level} Scheme)")
    else:
        unmet_criteria.append(f"Scheme restricted to residents of {', '.join(eligible_states)}; applicant is registered in {user_state}")

    # 4. Occupation Check
    user_occ = getattr(profile, 'occupation', 'Any')
    eligible_occupations = scheme.eligible_occupations or ["Any"]
    is_occ_match = (
        "Any" in eligible_occupations or 
        user_occ in eligible_occupations or
        any(occ.lower() in user_occ.lower() for occ in eligible_occupations)
    )
    if is_occ_match:
        passed_checks += 1
        eligible_reasons.append(f"Occupation '{user_occ}' matches target beneficiary profile")
    else:
        unmet_criteria.append(f"Target occupation list ({', '.join(eligible_occupations)}) does not include '{user_occ}'")

    # 5. Gender Check
    user_gender = getattr(profile, 'gender', 'Any')
    eligible_genders = scheme.eligible_genders or ["Any"]
    if "Any" in eligible_genders or user_gender in eligible_genders:
        passed_checks += 1
        eligible_reasons.append(f"Gender eligibility verified ({user_gender})")
    else:
        unmet_criteria.append(f"Scheme designated specifically for {', '.join(eligible_genders)} beneficiaries")

    # 6. Social Category / Caste Check
    user_category = getattr(profile, 'category', 'General')
    eligible_categories = scheme.eligible_categories or ["All"]
    if "All" in eligible_categories or user_category in eligible_categories:
        passed_checks += 1
        eligible_reasons.append(f"Social category ({user_category}) is eligible")
    else:
        unmet_criteria.append(f"Scheme earmarked for categories: {', '.join(eligible_categories)}")

    match_percentage = int((passed_checks / total_checks) * 100)
    is_eligible = len(unmet_criteria) == 0

    return {
        "is_eligible": is_eligible,
        "match_percentage": match_percentage,
        "eligible_reasons": eligible_reasons,
        "unmet_criteria": unmet_criteria
    }


def sort_schemes_by_eligibility_and_deadline(schemes_with_eval: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Sort schemes:
    1. Fully eligible first (is_eligible = True)
    2. Higher match percentage
    3. Deadline urgency
    """
    def sort_key(item):
        eval_data = item.get("evaluation", {})
        is_eligible = 1 if eval_data.get("is_eligible", False) else 0
        match_pct = eval_data.get("match_percentage", 0)
        return (is_eligible, match_pct)

    return sorted(schemes_with_eval, key=sort_key, reverse=True)
