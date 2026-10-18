"""Validated, explainable research advisor. Scores are not admission probabilities.

The bundled stream rules, career profiles and university cutoffs are research
configuration, not an authoritative or annually verified admissions dataset.
"""
from copy import deepcopy
from difflib import get_close_matches
import math
from career_pathways import CATALOG as CAREER_CATALOG, PROFILES, extend_careers, career_plan, future_path_steps, career_journey
from al_subjects import CATALOG, canonical_subject, combination_issues, course_subject_check

RULE_VERSION = "advisor-rules-2.6"
HANDBOOK = "https://www.ugc.ac.lk/downloads/admissions/Handbook_2025_26/student_handbook_english.pdf"
STREAM_DEGREES = {
    "Biological Science": {"Medicine", "Dental", "Nursing", "Pharmacy", "Bio Science", "Agriculture", "Veterinary Science"},
    "Physical Science": {"Engineering", "IT", "Computer Science", "Mathematics", "Physical Science", "Architecture", "Quantity Surveying"},
    "Commerce": {"Business", "Management", "Accounting", "Finance"},
    "Arts": {"Arts", "Law", "Education", "Social Sciences", "Fine Arts"},
    "Engineering Technology": {"IT", "Engineering Technology"},
    "Bio Systems Technology": {"IT", "Biosystems Technology"},
}
# These named courses accept applicants from multiple subject streams; the
# individual subject/grade checks still apply before a route is supported.
for _stream in STREAM_DEGREES:
    STREAM_DEGREES[_stream].add("IT")
    if _stream not in ("Engineering Technology", "Bio Systems Technology"):
        STREAM_DEGREES[_stream].update({"Law", "Architecture"})
    if _stream in ("Physical Science", "Commerce", "Arts"):
        STREAM_DEGREES[_stream].add("Quantity Surveying")

STREAM_ALIASES = {"Bio Science": "Biological Science", "Biology": "Biological Science",
    "Physical Sciences": "Physical Science", "Commerce Stream": "Commerce", "Art Stream": "Arts",
    "Humanities": "Arts", "Biosystems Technology": "Bio Systems Technology"}
DISTRICTS = ("Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam",
    "Ratnapura", "Trincomalee", "Vavuniya")
TRAITS = {"analytical_thinking": "analytical_skill", "creativity": "creativity", "leadership": "leadership",
    "communication": "communication_skill", "problem_solving": "problem_solving", "teamwork": "teamwork",
    "adaptability": "adaptability", "attention_to_detail": "attention_to_detail",
    "entrepreneurial_mindset": "entrepreneurial_mindset", "risk_taking": "risk_taking"}
TRAIT_KEYS = {"analytical": "analytical_skill", "communication": "communication_skill"}
PRIORITIES = {"Very Important": 5, "Important": 4, "Moderate": 3, "Not Important": 2, "Irrelevant": 1,
    "Very High": 5, "High": 4, "Medium": 3, "Low": 2, "Very Low": 1}
LIFESTYLE_FIELDS = {"stressTolerance": "stress_tolerance", "workLifeBalance": "work_life_balance_priority",
    "familyAttachment": "family_attachment_level", "salaryExpectation": "financial_stability_need",
    "careerGrowth": "career_sustainability_priority", "socialImpact": "social_impact_priority",
    "travelTolerance": "travel_tolerance"}
ENUMS = {"preferred_location": ("Urban", "Suburban", "Rural", "Any"),
    "work_environment": ("Office", "Remote", "Hybrid", "Field"),
    "social_interaction": ("Introvert", "Extrovert", "Ambivert"),
    "predicted_improvement": ("Low", "Medium", "High", "Very High")}
DIRECT_DEGREES = {"Doctor": {"Medicine"}, "Dentist": {"Dental"}, "Nurse": {"Nursing"},
    "Pharmacist": {"Pharmacy"}, "Veterinarian": {"Veterinary Science"}, "Lawyer": {"Law"},
    "Architect": {"Architecture"}, "Civil Engineer": {"Engineering"}, "Mechanical Engineer": {"Engineering"},
    "Biomedical Engineer": {"Engineering"}, "Teacher": {"Education"},
    "Psychologist": {"Psychology"}, "Pilot": set(), "Police Officer": set()}
VOCATIONAL = {
    "Electrician": {"route": "Electrical vocational qualification and supervised practical training",
        "skills": {"electrical_safety": .9, "fault_diagnosis": .8, "practical_skills": .85}},
    "Chef": {"route": "Culinary qualification, food safety training and supervised kitchen experience",
        "skills": {"culinary_skills": .9, "food_safety": .9, "time_management": .8}},
    "Pilot": {"route": "Approved flight training, medical assessment and the required pilot licence",
        "skills": {"navigation": .9, "safety": .95, "communication": .8}},
    "Police Officer": {"route": "Published recruitment criteria, selection and police training",
        "skills": {"communication": .8, "physical_fitness": .85, "ethics": .9}},
}


class ValidationError(ValueError):
    def __init__(self, fields, status=400, code="validation_error"):
        super().__init__("Review the profile field errors below.")
        self.fields, self.status, self.code = fields, status, code

    def as_dict(self):
        return {"error": str(self), "code": self.code, "field_errors": self.fields}


def _number(value, minimum, maximum):
    if isinstance(value, bool) or not isinstance(value, (str, int, float)):
        raise ValueError("A finite number is required.")
    try:
        number = float(value)
    except (ValueError, OverflowError):
        raise ValueError("A finite number is required.") from None
    if not math.isfinite(number) or not minimum <= number <= maximum:
        raise ValueError(f"Enter a finite value between {minimum} and {maximum}.")
    return number


def _canonical(value, choices):
    if not isinstance(value, str) or len(value) > 120 or not value.strip():
        return None
    return next((item for item in choices if item.casefold() == value.strip().casefold()), None)


def validate_profile(payload, careers, knowledge_only=False):
    if not isinstance(payload, dict):
        raise ValidationError({"body": "Send a JSON object."})
    errors, profile = {}, {}
    job = _canonical(payload.get("dream_job"), careers)
    if not job:
        suggestions = get_close_matches(str(payload.get("dream_job", "")), sorted(careers), n=3, cutoff=.45)
        raise ValidationError({"dream_job": {"message": "Choose a supported career; no unrelated career is substituted.",
            "suggestions": suggestions, "supported_values": sorted(careers)}},
            status=422 if isinstance(payload.get("dream_job"), str) and payload["dream_job"].strip() else 400,
            code="unsupported_career" if payload.get("dream_job") else "validation_error")
    profile["dream_job"] = job
    full = not knowledge_only or any(key in payload for key in ("stream", "district", "z_score"))
    if full:
        streams = {**{k: k for k in STREAM_DEGREES}, **STREAM_ALIASES}
        stream = _canonical(payload.get("stream"), streams)
        if stream:
            profile["stream"] = streams[stream]
        else:
            errors["stream"] = {"message": "Choose a supported A/L stream.", "supported_values": list(STREAM_DEGREES)}
        district = _canonical(payload.get("district"), DISTRICTS)
        if district:
            profile["district"] = district
        else:
            errors["district"] = "Choose one of Sri Lanka's 25 districts."
        try:
            profile["z_score"] = _number(payload.get("z_score"), -4, 4)
        except ValueError as exc:
            errors["z_score"] = str(exc)
    for key in ("personality_scores", "skill_scores", "lifestyle_preferences", "subject_grades"):
        value = payload.get(key, {})
        if not isinstance(value, dict):
            errors[key] = "Send an object with named values."
            continue
        if len(value) > 50:
            errors[key] = "Too many entries."
            continue
        profile[key] = deepcopy(value)
    for key in set(TRAITS.values()) | set(LIFESTYLE_FIELDS.values()) | {"innovation_interest"}:
        if key in payload:
            value = payload[key]
            if key in LIFESTYLE_FIELDS.values() and isinstance(value, str) and value in PRIORITIES:
                value = PRIORITIES[value]
            try:
                profile[key] = _number(value, 0, 5)
            except ValueError as exc:
                errors[key] = str(exc)
    for trait, value in profile.get("personality_scores", {}).items():
        if trait not in TRAITS:
            errors[f"personality_scores.{trait}"] = "Unknown personality trait."
            continue
        try:
            normalized = _number(value, 0, 10)
            profile["personality_scores"][trait] = normalized
            # The original 0–10 answers take priority over rounded model features.
            profile[TRAITS[trait]] = normalized / 2
        except ValueError as exc:
            errors[f"personality_scores.{trait}"] = str(exc)
    for skill, value in profile.get("skill_scores", {}).items():
        if not isinstance(skill, str) or not skill.strip() or len(skill) > 80:
            errors["skill_scores"] = "Use short skill names."
            continue
        try:
            profile["skill_scores"][skill] = _number(value, 0, 10)
        except ValueError as exc:
            errors[f"skill_scores.{skill}"] = str(exc)
    lifestyle = profile.get("lifestyle_preferences", {})
    for key in lifestyle:
        if key not in set(LIFESTYLE_FIELDS) | {"locationPreference", "workEnvironment", "socialInteraction"}:
            errors[f"lifestyle_preferences.{key}"] = "Unknown lifestyle preference."
    for alias, key in LIFESTYLE_FIELDS.items():
        if alias in lifestyle:
            value = lifestyle[alias]
            if not isinstance(value, str) or value not in PRIORITIES:
                errors[f"lifestyle_preferences.{alias}"] = "Choose a supported preference."
            else:
                profile[key] = float(PRIORITIES[value])
    for alias, key in {"locationPreference": "preferred_location", "workEnvironment": "work_environment",
                       "socialInteraction": "social_interaction"}.items():
        if alias in lifestyle:
            profile[key] = lifestyle[alias]
    for key, values in ENUMS.items():
        value = profile.get(key, payload.get(key))
        if value is not None:
            canonical = _canonical(value, values)
            if canonical:
                profile[key] = canonical
            else:
                errors[key] = {"message": "Choose a supported value.", "supported_values": list(values)}
    grades = profile.get("subject_grades", {})
    normalized = {}
    for subject, grade in grades.items():
        canonical = canonical_subject(subject)
        if canonical in normalized:
            errors["subject_grades"] = "The same subject cannot be supplied under two names."
        normalized[canonical] = grade
    grades = profile["subject_grades"] = normalized
    if profile.get("stream"):
        issues = combination_issues(profile["stream"], grades)
        if issues:
            errors["subject_grades"] = {"message": "Review the subject combination for your selected stream.", "issues": issues, "source": CATALOG["source"]}
    if len(grades) > 3:
        errors["subject_grades"] = "Provide at most three A/L subject grades."
    for subject, grade in grades.items():
        if not isinstance(subject, str) or not subject.strip() or len(subject) > 100 or grade not in ("A", "B", "C", "S", "F"):
            errors["subject_grades"] = "Provide named subjects with A, B, C, S or F grades."
    for key, maximum in (("common_general_test", 100), ("age", 120), ("predicted_potential_z_score", 4)):
        if key in payload and payload[key] not in (None, ""):
            try:
                profile[key] = _number(payload[key], -4 if key == "predicted_potential_z_score" else 0, maximum)
            except ValueError as exc:
                errors[key] = str(exc)
    if errors:
        raise ValidationError(errors)
    profile["profile_available"] = full
    return profile


def _mean(values):
    values = [value for value in values if value is not None]
    return sum(values) / len(values) if values else None


def _bounded(value):
    return round(max(0.0, min(1.0, float(value))), 6)


def evaluate_proof(node):
    """Evaluate explicit AND/OR subgoals using true/false/unknown evidence."""
    children = node.get("children", [])
    for child in children:
        evaluate_proof(child)
    if node.get("operator") and children:
        values = [child["supported"] for child in children]
        if node["operator"] == "AND":
            node["supported"] = False if False in values else None if None in values else True
        else:
            node["supported"] = True if True in values else None if None in values else False
    node.setdefault("supported", None)
    node["status"] = "supported_by_supplied_evidence" if node["supported"] is True else "requirement_gap" if node["supported"] is False else "evidence_required"
    return node


class AdvisorEngine:
    def __init__(self, careers, universities, predictor):
        self.careers = extend_careers(careers)
        for job, rule in VOCATIONAL.items():
            self.careers.setdefault(job, {})
            self.careers[job]["vocational_route"] = rule["route"]
            if job in ("Chef", "Electrician"):
                self.careers[job]["degree_paths"] = {}  # Fine Arts is not a culinary/electrical qualification.
            self.careers[job].setdefault("required_skills", rule["skills"])
        self.universities, self.predictor = universities, predictor

    def validate(self, payload, knowledge_only=False):
        return validate_profile(payload, self.careers, knowledge_only)

    def _profile_evidence(self, career, profile):
        skills, traits, lifestyle = [], [], []
        for skill, target in career.get("required_skills", {}).items():
            answer = profile.get("skill_scores", {}).get(skill)
            actual = answer / 10 if answer is not None else None
            skills.append({"skill": skill, "target": target, "current": actual,
                "gap": round(max(0, target - actual), 6) if actual is not None else None,
                "match": _bounded(actual / target) if actual is not None and target else None,
                "evidence": "self_reported" if actual is not None else "not_assessed"})
        for trait, target in career.get("personality_traits", {}).items():
            answer = profile.get(TRAIT_KEYS.get(trait, trait))
            actual = answer / 5 if answer is not None else None
            traits.append({"trait": trait, "target": target, "current": actual,
                "gap": round(max(0, target - actual), 6) if actual is not None else None,
                "match": _bounded(actual / target) if actual is not None and target else None,
                "evidence": "self_reported" if actual is not None else "not_assessed"})
        desired = career.get("lifestyle_profile", {})
        for key, target_key in (("work_life_balance_priority", "work_life_balance"),
            ("family_attachment_level", "family_friendly"), ("financial_stability_need", "salary_potential"),
            ("career_sustainability_priority", "career_growth"), ("social_impact_priority", "social_impact")):
            if key in profile and target_key in desired:
                score = 1 - profile[key] / 5 * (1 - desired[target_key])
                lifestyle.append({"factor": target_key, "match": _bounded(score), "basis": "configured_career_profile"})
        if "stress_tolerance" in profile and "stress_level" in desired:
            lifestyle.append({"factor": "stress_match", "match": _bounded(1 - max(0, desired["stress_level"] - profile["stress_tolerance"] / 5)), "basis": "configured_career_profile"})
        return skills, traits, lifestyle

    def _university_options(self, degree, profile):
        result = {"government": [], "private": []}
        minimum_failed = any(grade == "F" for grade in profile.get("subject_grades", {}).values())
        general_failed = profile.get("common_general_test", 100) < 30
        subject_check = course_subject_check(degree, profile.get("subject_grades", {}))
        for sector in result:
            for name, uni in self.universities.get(sector, {}).items():
                if degree not in uni.get("degrees", []):
                    continue
                cutoff = uni.get("z_score_requirements", {}).get(degree)
                uses_central_admission = sector == 'government' and uni.get('admission_route') != 'institution_specific'
                known_cutoff = uses_central_admission and isinstance(cutoff, (float, int)) and not isinstance(cutoff, bool) and math.isfinite(cutoff)
                cutoff = cutoff if known_cutoff else None
                margin = round(profile["z_score"] - cutoff, 6) if known_cutoff else None
                readiness = _bounded(.5 + margin / 2) if known_cutoff else None
                status = ("meets_reference" if margin >= 0 else "below_reference") if sector == "government" and known_cutoff else "institution_verification_required"
                if sector == "government" and uni.get('admission_route') != 'institution_specific' and (minimum_failed or general_failed or subject_check["supported"] is False):
                    status, readiness = "minimum_requirements_not_met", 0.0
                result[sector].append({
                    "name": name, "degree": degree, "sector": sector,
                    "location": uni.get("location"), "coordinates": uni.get("coordinates"),
                    "coordinate_source": uni.get('coordinate_source'), "coordinate_basis": uni.get('coordinate_basis'),
                    "available_degrees": [degree], "z_score_requirement": cutoff,
                    "z_score_requirements": {degree: cutoff} if known_cutoff else {}, "z_score_gap": round(max(0, -margin), 6) if known_cutoff else None,
                    "z_score_margin": margin, "readiness_score": readiness,
                    "subject_prerequisites": subject_check,
                    "admission_probability": None, "eligibility_status": status,
                    "eligibility_confirmed": False, "reference_status": "unverified_research_reference",
                    "district": profile["district"], "district_bonus_applied": 0,
                    "explanation": "Reference cutoff comparison only; verify current district-specific rules and course prerequisites with the institution." if known_cutoff else "A related study area is listed; specific programme, entry route and current admission requirements must be verified with the institution.",
                    "website": uni.get('website'), "admission_route": uni.get('admission_route'),
                    "programme_source": uni.get('programme_source'),
                    "entry_requirements_status": 'unverified_reference' if known_cutoff else 'verification_required',
                    "tuition_fee_range": {degree: uni.get("tuition_fee_range", {}).get(degree)} if sector == "private" else {},
                    "facilities": uni.get("facilities", []), "specialties": uni.get("specialties", []),
                })
            result[sector].sort(key=lambda uni: (uni['readiness_score'] is None, -(uni['readiness_score'] or 0), uni['name']))
        return result

    @staticmethod
    def _trained_model_recommendation(model, recommendations):
        result = {'status': 'unavailable', 'degree': None, 'model_probability': None, 'university': None,
                  'degree_source': 'trained_classifier', 'university_source': 'degree_course_catalog',
                  'imputed_features': model.get('imputed_features', []), 'calibrated': False}
        if not model.get('available'):
            return result
        candidates = [rec for rec in recommendations if rec['goal_relation'] in ('direct', 'related')
                      and rec['subject_prerequisites']['supported'] is not False
                      and isinstance(model.get('probabilities', {}).get(rec['degree']), (int, float))
                      and math.isfinite(model['probabilities'][rec['degree']]) and model['probabilities'][rec['degree']] > 0]
        if not candidates:
            result['status'] = 'no_supported_pathway'
            return result
        direct_candidates = [rec for rec in candidates if rec['goal_relation'] == 'direct']
        candidates = direct_candidates or candidates
        best = min(candidates, key=lambda rec: (-model['probabilities'][rec['degree']], rec['degree']))
        options = best['university_options']['government'] + best['university_options']['private']
        meets = [uni for uni in options if uni['eligibility_status'] == 'meets_reference']
        unknown = [uni for uni in options if uni['eligibility_status'] == 'institution_verification_required']
        university = next(iter(meets or unknown), None)
        result.update(status='available', degree=best['degree'], model_probability=model['probabilities'][best['degree']],
                      selection_policy='direct_career_pathways_first_then_highest_model_probability',
                      goal_relation=best['goal_relation'], university=deepcopy(university),
                      university_selection_basis='stored_cutoff_match' if meets else 'programme_match_requires_verification' if unknown else 'no_suitable_catalog_option',
                      subject_prerequisites=best['subject_prerequisites'])
        return result

    @staticmethod
    def _combined_university_options(recommendations):
        """Preserve degree-specific evidence while listing each institution once."""
        combined = {"government": {}, "private": {}}
        for recommendation in recommendations:
            for sector in combined:
                for option in recommendation['university_options'][sector]:
                    name = option['name']
                    if name not in combined[sector]:
                        combined[sector][name] = {**deepcopy(option), 'matched_degrees': [], 'degree_matches': [], 'available_degrees': [], 'z_score_requirements': {}, 'tuition_fee_range': {}}
                    item = combined[sector][name]
                    degree = option['degree']
                    if degree in item['matched_degrees']:
                        continue
                    item['matched_degrees'].append(degree)
                    item['available_degrees'].append(degree)
                    item['degree_matches'].append({**deepcopy(option), 'goal_relation': recommendation['goal_relation']})
                    item['z_score_requirements'].update(option.get('z_score_requirements', {}))
                    item['tuition_fee_range'].update(option.get('tuition_fee_range', {}))
        # Insertion order follows the degree ranking, then its institution ranking.
        return {sector: list(options.values()) for sector, options in combined.items()}

    def recommend(self, profile, include_scenarios=True):
        job = profile["dream_job"]
        career = self.careers[job]
        skills, traits, lifestyle = self._profile_evidence(career, profile)
        model = self.predictor.prediction_evidence(profile)
        allowed = STREAM_DEGREES[profile["stream"]]
        direct = career.get("direct_degrees", DIRECT_DEGREES.get(job, set(career.get("degree_paths", {}))))
        candidates = set(career.get("degree_paths", {})) | allowed
        # Incompatible degrees remain in the trace, never silently forced into results.
        rejected = sorted(set(career.get("degree_paths", {})) - allowed)
        ranked = []
        weights = {"goal_alignment": .35, "academic_readiness": .25, "personality": .15,
                   "lifestyle": .10, "skills": .10, "model_evidence": .05}
        for degree in sorted(candidates & allowed):
            alignment = career.get("degree_paths", {}).get(degree, 0.0)
            subject_check = course_subject_check(degree, profile.get("subject_grades", {}))
            options = self._university_options(degree, profile)
            all_options = options["government"] + options["private"]
            academic = 0.0 if subject_check["supported"] is False else max((item["readiness_score"] for item in all_options if item['readiness_score'] is not None), default=None)
            factors = {"goal_alignment": alignment, "academic_readiness": academic,
                "personality": _mean([item["match"] for item in traits]),
                "lifestyle": _mean([item["match"] for item in lifestyle]),
                "skills": _mean([item["match"] for item in skills]),
                "model_evidence": model.get("probabilities", {}).get(degree) if model.get("available") and not model.get("imputed_features") else None}
            included_weight = sum(weights[key] for key, value in factors.items() if value is not None)
            score = sum(weights[key] * value for key, value in factors.items() if value is not None) / included_weight
            evidence = model.get("probabilities", {}).get(degree)
            # RF output is explicitly separate; synthetic model confidence cannot override goal requirements.
            relation = "direct" if alignment > 0 and degree in direct else "related" if alignment > 0 else "alternative"
            observed = [item for item in all_options if item["eligibility_status"] == "meets_reference"]
            best = observed[0] if observed else None
            reasons = [f"{degree} is a {relation} pathway for {job} in the configured career rules."]
            if not observed:
                reasons.append("Related institutions are listed below; current programme admission requirements need verification." if all_options else "No institution in the current catalog is mapped to this degree pathway.")
            if relation != "direct":
                reasons.append("This degree alone does not establish the qualifications required for the selected career.")
            ranked.append({"degree": degree, "overall_score": _bounded(score), "suitability_score": _bounded(score),
                "probability": _bounded(score), "score_type": "heuristic_suitability_not_probability",
                "model_probability": evidence, "goal_relation": relation,
                "subject_prerequisites": subject_check,
                "score_breakdown": [{"factor": key, "value": value, "weight": weights[key],
                    "effective_weight": round(weights[key] / included_weight, 6) if value is not None else 0,
                    "contribution": round(weights[key] * value / included_weight, 6) if value is not None else 0,
                    "status": "observed" if value is not None else "not_assessed"} for key, value in factors.items()],
                "skill_match": {item["skill"]: item["match"] for item in skills if item["match"] is not None},
                "personality_match": {item["trait"]: item["match"] for item in traits if item["match"] is not None},
                "lifestyle_compatibility": {item["factor"]: item["match"] for item in lifestyle},
                "academic_feasibility": {"z_score_feasibility": academic, "district_adjustment": None,
                    "threshold_gap": min((item["z_score_gap"] for item in all_options if item['z_score_gap'] is not None), default=None)},
                "university_options": options, "university": best["name"] if best else None,
                "universityLocation": best["location"] if best else None,
                "universityType": best["sector"].title() if best else None,
                "admissionProbability": None, "readiness_score": best["readiness_score"] if best else None,
                "explanation": " ".join(reasons), "reasons": reasons,
                "roadmap": ["Verify current admission and subject requirements", f"Complete the relevant {degree} qualification",
                    "Build an assessed portfolio or supervised practical experience", "Verify any professional registration requirements"],
                "roadmap_stages": [
                    {"id": "entry_requirements", "status": "verification_required", "degree": degree,
                     "checks": ["current_admission_rules", "subject_requirements", "institution_recognition"]},
                    {"id": "qualification", "status": "planned", "degree": degree, "goal_relation": relation,
                     "duration_years": None, "institution": best["name"] if best else None},
                    {"id": "skills_and_practice", "status": "assessment_required" if any(item["current"] is None for item in skills) else "planned",
                     "skills": skills},
                    {"id": "professional_requirements", "status": "verification_required", "career": job,
                     "professional_verification_required": job in DIRECT_DEGREES or job in VOCATIONAL or (PROFILES[job]["routeType"] == "professional" or bool(PROFILES[job].get("registrationNote")))},
                    {"id": "career_entry", "status": "planned", "career": job,
                     "checks": ["assessed_portfolio_or_supervised_experience", "employer_requirements"]},
                ],
            })
        for rec in ranked:
            plan = career_plan(job, rec["degree"], rec["goal_relation"], rec["university"],
                subject_check=course_subject_check('Medicine', profile.get('subject_grades', {})) if job == 'Doctor' else None,
                stream=profile['stream'])
            rec["career_plan"] = plan
            rec["roadmap_stages"] = plan["roadmap_stages"]
            rec["roadmap"] = [stage["description"] for stage in plan["roadmap_stages"]]
        ranked.sort(key=lambda rec: (rec["goal_relation"] != "direct", rec["goal_relation"] == "alternative",
            -rec["suitability_score"], rec["degree"]))
        if career.get("vocational_route") and not career.get("degree_paths"):
            ranked = []
        top = ranked[:4]
        trained_model_recommendation = self._trained_model_recommendation(model, ranked)
        # Keep the model-selected pathway accessible to the degree cards and map.
        model_degree = trained_model_recommendation['degree']
        if model_degree and not any(rec['degree'] == model_degree for rec in top):
            top = top[:3] + [next(rec for rec in ranked if rec['degree'] == model_degree)]
        direct_available = any(rec["goal_relation"] == "direct" for rec in ranked)
        unmet = []
        if not direct_available and not (career.get("vocational_route") and not career.get("degree_paths")):
            unmet.append({"code": "no_direct_degree_path", "required_degrees": sorted(direct),
                "message": "Review the required professional or vocational route; a related degree is not an equivalent qualification."})
        if not (career.get("vocational_route") and not career.get("degree_paths")) and (any(g == "F" for g in profile.get("subject_grades", {}).values()) or profile.get("common_general_test", 100) < 30):
            unmet.append({"code": "minimum_requirements_not_met", "message": "Resolve the supplied minimum-entry requirement gaps before applying."})
        direct_subject_checks = [course_subject_check(degree, profile.get("subject_grades", {})) for degree in sorted(direct) if degree in allowed]
        if direct_subject_checks and all(check["supported"] is False for check in direct_subject_checks):
            unmet.append({"code": "direct_subject_requirements_not_met", "message": "The supplied subjects or grades do not meet the checked UGC prerequisites for the direct goal routes."})
        warnings = [
            {"code": "unverified_admissions_reference", "message": "Bundled cutoffs, fees and stream rules are research references; current district/year-specific eligibility is not verified.", "source": HANDBOOK},
            {"code": "uncalibrated_scores", "message": "Suitability and cutoff readiness are heuristic comparisons, not probabilities of admission or career success."},
        ]
        missing = ["skill_scores"] if any(item["current"] is None for item in skills) else []
        if len(profile.get("subject_grades", {})) != 3:
            missing.append("complete_subject_grades")
        if "common_general_test" not in profile:
            missing.append("common_general_test")
        if any(item["match"] is None for item in traits):
            missing.append("personality_scores")
        if not lifestyle:
            missing.append("lifestyle_preferences")
        trace = [
            {"rule": "goal", "status": "resolved", "goal": job},
            {"rule": "qualification_paths", "status": "resolved", "degree_paths": career.get("degree_paths", {}), "vocational_route": career.get("vocational_route")},
            {"rule": "stream_constraint", "status": "evaluated", "stream": profile["stream"], "excluded_degrees": rejected, "basis": "provisional_research_rules"},
            {"rule": "profile_evidence", "status": "partial" if missing else "supplied", "missing": missing},
            {"rule": "institution_match", "status": "reference_only", "district": profile["district"], "district_bonus_applied": 0},
        ]
        backward = {"goal": job, "personalized": True, "rule_version": RULE_VERSION,
            "inference_trace": trace, "requirements": {"direct_degrees": sorted(direct),
                "vocational_route": career.get("vocational_route"), "professional_verification_required": job in DIRECT_DEGREES or job in VOCATIONAL or (PROFILES[job]["routeType"] == "professional" or bool(PROFILES[job].get("registrationNote")))},
            "subject_checks": direct_subject_checks,
            "subject_rule_version": CATALOG["version"],
            "skill_gaps": sorted(skills, key=lambda item: -(item["gap"] or 0)),
            "personality_gaps": sorted(traits, key=lambda item: -(item["gap"] or 0)),
            "lifestyle_tradeoffs": lifestyle, "unmet_requirements": unmet,
            "pathways": [{"degree": item["degree"], "relation": item["goal_relation"], "score": item["suitability_score"]} for item in ranked],
            "key_skills": list(career.get("required_skills", {})),
            "required_education": career.get("vocational_route") or ", ".join(sorted(direct)),
            "career_path_steps": future_path_steps(job),
            "career_journey": career_journey(job),
            "journey_version": CAREER_CATALOG['journey_version'],
            "career_path": " → ".join(career_journey(job)['forward']),
            "salary_range": None, "timeline": "Depends on the qualification, institution and professional requirements."}
        grades = profile.get("subject_grades", {})
        backward["goal_proof"] = evaluate_proof({"id": "current_goal_readiness", "operator": "AND", "children": [
            {"id": "qualification_route_available", "operator": "OR", "children": [
                {"id": degree, "supported": degree in allowed, "basis": "provisional_stream_rules"} for degree in sorted(direct)
            ] if direct else [{"id": "vocational_requirements", "supported": None}]},
            {"id": "academic_entry_evidence", "operator": "AND", "children": [
                {"id": "course_subject_prerequisites", "operator": "OR", "children": [
                    {"id": check["degree"], "supported": check["supported"], "subject_check": check} for check in direct_subject_checks
                ]},
                {"id": "exam_sitting_and_attempts", "supported": None, "basis": "not_collected"},
                {"id": "complete_subject_grades", "supported": all(grade != "F" for grade in grades.values()) if len(grades) == 3 else False if "F" in grades.values() else None},
                {"id": "common_general_test", "supported": profile["common_general_test"] >= 30 if "common_general_test" in profile else None},
                {"id": "current_course_eligibility", "supported": None, "basis": "official_verification_required"},
            ]},
            {"id": "required_skill_readiness", "operator": "AND", "children": [
                {"id": item["skill"], "supported": item["gap"] <= 0 if item["gap"] is not None else None,
                 "current": item["current"], "target": item["target"], "basis": item["evidence"]} for item in skills
            ]},
            {"id": "qualification_and_professional_verification", "supported": None},
        ]})
        if career.get("vocational_route") and not career.get("degree_paths"):
            # University A/L/General Test conditions are not universal NVQ or
            # apprenticeship entry conditions. The actual provider decides.
            backward["goal_proof"]["children"][1] = {
                "id": "training_provider_entry_requirements", "supported": None,
                "basis": "provider_specific_training_requirements_not_verified"}
            backward["goal_proof"] = evaluate_proof(backward["goal_proof"])
            missing = [field for field in missing if field not in ("complete_subject_grades", "common_general_test")]
            missing.append("training_provider_entry_requirements")
            for step in trace:
                if step["rule"] == "profile_evidence":
                    step["missing"] = missing
                    step["status"] = "partial" if missing else "supplied"
        response = {"schema_version": "2.0", "rule_version": RULE_VERSION,
            "method": "goal_directed_rules_with_model_evidence" if model.get("available") else "goal_directed_rules",
            "best_degree": top[0]["degree"] if top else None, "recommendations": top,
            "trained_model_recommendation": trained_model_recommendation,
            "best_direct_degree": next((item["degree"] for item in ranked if item["goal_relation"] == "direct"), None),
            "goal_status": "subject_requirements_not_met" if direct_subject_checks and all(check["supported"] is False for check in direct_subject_checks) else "direct_path_available" if direct_available else "vocational_route" if career.get("vocational_route") else "requires_qualification_review",
            "ranking_policy": "Direct goal pathways first, related pathways second, alternatives third; descending suitability within each group.",
            "university_recommendations": self._combined_university_options(top),
            "university_recommendation_scope": "all_displayed_degree_pathways",
            "backward_analysis": backward, "validation": {"normalized_stream": profile["stream"], "district": profile["district"],
                "subject_catalog_version": CATALOG["version"],
                "missing_evidence": missing, "data_completeness": round(max(0, (5 - len(missing)) / 5), 2)},
            "warnings": warnings, "model_info": {**model, "method_label": "Goal-directed multi-factor research advisor",
                "description": "Explicit career requirements and provisional stream constraints precede weighted evidence scoring.",
                "confidence_score": model.get("top_probability"), "accuracy_note": "Any model probability is uncalibrated and derived from a synthetic training dataset, not real admissions outcomes.",
                "factors_used": ["Career degree pathways", "Stream constraints", "Reference cutoff comparison", "Supplied personality and lifestyle answers", "Assessed skills when supplied"],
                "universities_analyzed": sum(len(group) for group in self.universities.values()),
                "total_university_database": sum(len(group) for group in self.universities.values())},
        }
        response["career_plan"] = career_plan(job,
            subject_check=course_subject_check('Medicine', profile.get('subject_grades', {})) if job == 'Doctor' else None,
            stream=profile['stream'])
        backward['backward_steps'] = response['career_plan']['backward_steps']
        backward['future_path_version'] = CAREER_CATALOG.get('future_path_version')
        if job == 'Doctor':
            backward['entry_route_status'] = response['career_plan']['entry_route_status']
        response["career_catalog_version"] = CAREER_CATALOG["version"]
        actions = self._actions(profile, top, skills, unmet)
        response["action_plan"] = actions
        response["counterfactual_guidance"] = {
            "skill_improvement": "Assess the required career skills before interpreting a skill gap." if missing and not profile.get("skill_scores") else "Prioritize the measured skill gaps in the action plan.",
            "z_score_improvement": "Use the degree-specific reference cutoff gaps, not a universal target Z-score."}
        if include_scenarios:
            response["counterfactual_scenarios"] = self._scenarios(profile, response)
        return response

    def _actions(self, profile, recommendations, skills, unmet):
        actions = [{"priority": 1, "action": "Verify current admission rules", "reason": "The bundled references are not current official admission decisions.", "source": HANDBOOK}]
        if PROFILES[profile["dream_job"]]["routeType"] == "vocational":
            actions = [{"priority": 1, "action": "Verify training provider entry requirements",
                "reason": "Requirements vary by provider and qualification.",
                "source": PROFILES[profile["dream_job"]].get("sources", [{"url": "https://www.tvec.gov.lk/"}])[0]["url"]}]
        if unmet:
            actions.append({"priority": 1, "action": "Resolve the qualification-path requirements", "reason": unmet[0]["message"]})
        for item in sorted(skills, key=lambda s: -(s["gap"] or 0))[:3]:
            actions.append({"priority": 2, "action": f"Assess {item['skill']}" if item["current"] is None else f"Develop {item['skill']}",
                "reason": "Not yet assessed" if item["current"] is None else "Self-reported gap to the configured career target", "gap": item["gap"]})
        if recommendations:
            gap = recommendations[0]["academic_feasibility"]["threshold_gap"]
            if gap is not None and gap > 0:
                actions.append({"priority": 2, "action": "Review the reference Z-score gap", "gap": gap,
                    "target_z_score": round(profile["z_score"] + gap, 6), "reason": "This target is only a reference comparison, not an admission guarantee."})
        return actions

    def _scenarios(self, profile, baseline):
        scenarios, changes = [], []
        if profile["z_score"] < 4:
            changes.append(("z_score_plus_0_2", "z_score", profile["z_score"], min(4, round(profile["z_score"] + .2, 6))))
        potential = profile.get("predicted_potential_z_score")
        if potential is not None and potential > profile["z_score"]:
            changes.append(("reported_potential_z_score", "z_score", profile["z_score"], potential))
        for gap in baseline["backward_analysis"]["skill_gaps"]:
            if gap["gap"] is not None and gap["gap"] > 0:
                changes.append(("largest_skill_gap", f"skill_scores.{gap['skill']}", gap["current"] * 10, gap["target"] * 10))
                break
        for scenario_id, field, before, after_value in changes:
            changed = deepcopy(profile)
            if field.startswith("skill_scores."):
                changed["skill_scores"][field.split(".", 1)[1]] = after_value
            else:
                changed[field] = after_value
            after = self.recommend(changed, include_scenarios=False)
            before_by_degree = {rec["degree"]: rec for rec in baseline["recommendations"]}
            comparisons = []
            for rec in after["recommendations"]:
                old = before_by_degree.get(rec["degree"])
                if old:
                    comparisons.append({"degree": rec["degree"], "before": old["suitability_score"], "after": rec["suitability_score"],
                        "score_change": round(rec["suitability_score"] - old["suitability_score"], 6)})
            scenarios.append({"id": scenario_id, "changes": {field: {"from": before, "to": after_value}},
                "comparison": comparisons, "basis": "recomputed_with_same_rules", "admission_guaranteed": False})
        return scenarios

    def backward(self, profile):
        if profile["profile_available"]:
            result = self.recommend(profile)
            return {"dream_job": profile["dream_job"], "backward_analysis": result["backward_analysis"],
                "counterfactual_scenarios": result["counterfactual_scenarios"], "action_plan": result["action_plan"], "career_plan": result["career_plan"], "source": RULE_VERSION}
        career = self.careers[profile["dream_job"]]
        direct = career.get("direct_degrees", DIRECT_DEGREES.get(profile["dream_job"], set(career.get("degree_paths", {}))))
        plan = career_plan(profile['dream_job'])
        return {"dream_job": profile["dream_job"], "source": RULE_VERSION,
            "career_plan": plan,
            "backward_analysis": {"goal": profile["dream_job"], "personalized": False,
                "backward_steps": plan['backward_steps'], "future_path_version": CAREER_CATALOG.get('future_path_version'),
                "career_path_steps": future_path_steps(profile['dream_job']),
                "career_journey": career_journey(profile['dream_job']),
                "journey_version": CAREER_CATALOG['journey_version'],
                "career_path": " → ".join(career_journey(profile['dream_job'])['forward']),
                "required_education": career.get("vocational_route") or ", ".join(sorted(direct)),
                "key_skills": list(career.get("required_skills", {})), "requirements": {"degree_paths": career.get("degree_paths", {}), "direct_degrees": sorted(direct), "vocational_route": career.get("vocational_route")},
                "missing_evidence": ["stream", "z_score", "district", "skill_scores"], "inference_trace": [{"rule": "goal", "status": "resolved", "goal": profile["dream_job"]}]}}
