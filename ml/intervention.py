"""
SENTINEL-I4C: Intervention Optimizer
Calculates Expected Recovery for each candidate cash-out location:
Expected Recovery = Probability × Cash Amount × Intercept Success Probability

Incorporates:
- Distance to location
- Patrol vehicle availability / dispatch ETA
- Police jurisdiction PS
- Urgency tier

IMPORTANT RULES:
- DO NOT automatically freeze accounts.
- The system ONLY recommends action to verified LEA and bank analysts.
"""

from enum import Enum
from typing import List
from pydantic import BaseModel, Field
from .fusion import CandidateLocation


class UrgencyTier(str, Enum):
    IMMEDIATE = "IMMEDIATE"  # ETA < 15m
    HIGH = "HIGH"            # ETA 15-30m
    ROUTINE = "ROUTINE"      # ETA > 30m


class InterventionPriority(BaseModel):
    priority_level: int  # 1, 2, 3
    location_id: str
    location_name: str
    location_type: str
    address: str
    bank: str
    expected_recovery: float
    probability: float
    intercept_success_prob: float
    distance_km: float
    eta_min: int
    urgency: UrgencyTier
    jurisdiction_ps: str
    assigned_patrol_unit: str
    recommended_police_action: str
    recommended_bank_action: str


class InterventionPlan(BaseModel):
    case_id: str
    prediction_id: str
    priorities: List[InterventionPriority]
    total_potential_recovery: float
    best_option_summary: str
    mandatory_human_notice: str = (
        "RECOMMENDATION ONLY: No autonomous account freezing or physical enforcement "
        "is executed. Requires explicit LEA Officer and Bank Fraud Analyst authorization."
    )


class InterventionOptimizer:
    """
    Ranks intervention options to maximize recovered funds while accounting for
    operational dispatch constraints.
    """

    def optimize(
        self,
        case_id: str,
        prediction_id: str,
        candidates: List[CandidateLocation],
        predicted_amount: float
    ) -> InterventionPlan:
        priorities: List[InterventionPriority] = []

        patrol_units = [
            "Patrol Vehicle Unit Alpha-4 (Cyber Van)",
            "Interceptor Unit Bravo-2 (Motorcycle Quick Response)",
            "Local Beat Unit Charlie-7"
        ]

        for idx, cand in enumerate(candidates[:3]):
            # Intercept success probability models dispatch arrival before cash-out
            # Faster ETA + shorter distance -> higher intercept chance
            distance_factor = max(0.25, 1.0 - (cand.distance_km / 25.0))
            eta_factor = max(0.20, 1.0 - (cand.eta_min / 35.0))
            intercept_p = round(0.5 * distance_factor + 0.5 * eta_factor, 3)

            # Expected Recovery = Probability * Amount * Intercept Success Probability
            exp_rec = round(cand.probability * predicted_amount * intercept_p, 2)

            urgency = (
                UrgencyTier.IMMEDIATE if cand.eta_min <= 15
                else (UrgencyTier.HIGH if cand.eta_min <= 28 else UrgencyTier.ROUTINE)
            )

            patrol_assigned = patrol_units[idx % len(patrol_units)]

            rec_police = (
                f"Dispatch {patrol_assigned} to {cand.name} ({cand.address}). "
                f"Monitor CCTV feed & verify suspect matching tokenized mule profile."
            )

            rec_bank = (
                f"Notify {cand.bank} Nodal Officer to place temporary surveillance on "
                f"terminal ID {cand.id} and stand by for debit hold authorization."
            )

            priorities.append(InterventionPriority(
                priority_level=idx + 1,
                location_id=cand.id,
                location_name=cand.name,
                location_type=cand.type,
                address=cand.address,
                bank=cand.bank,
                expected_recovery=exp_rec,
                probability=cand.probability,
                intercept_success_prob=intercept_p,
                distance_km=cand.distance_km,
                eta_min=cand.eta_min,
                urgency=urgency,
                jurisdiction_ps=cand.jurisdiction_ps,
                assigned_patrol_unit=patrol_assigned,
                recommended_police_action=rec_police,
                recommended_bank_action=rec_bank
            ))

        # Sort by expected recovery descending
        priorities.sort(key=lambda p: p.expected_recovery, reverse=True)
        for i, p in enumerate(priorities):
            p.priority_level = i + 1

        top_choice = priorities[0] if priorities else None
        summary = (
            f"Priority 1 target is {top_choice.location_name} with estimated recovery of "
            f"₹{top_choice.expected_recovery:,.2f} ({top_choice.probability * 100:.1f}% probability, "
            f"ETA {top_choice.eta_min} min)."
        ) if top_choice else "No valid targets."

        tot_recovery = round(sum(p.expected_recovery for p in priorities), 2)

        return InterventionPlan(
            case_id=case_id,
            prediction_id=prediction_id,
            priorities=priorities,
            total_potential_recovery=tot_recovery,
            best_option_summary=summary
        )
