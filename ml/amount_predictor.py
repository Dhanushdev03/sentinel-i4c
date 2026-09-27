"""
SENTINEL-I4C: Cash-Out Amount Prediction Engine
Predicts likely withdrawal amount at candidate terminals.
Takes into account total chain amount, last hop amount, mule commission deductions,
channel withdrawal limits (ATM daily cap vs CSP transaction cap vs branch counters),
and transaction velocity.

NOTE: Prototype statistical estimation based on synthetic data.
"""

from typing import List, Dict
from pydantic import BaseModel
from simulator.fraud_simulator import SyntheticTransaction, FraudType


class AmountPredictionResult(BaseModel):
    predicted_min: float
    predicted_max: float
    point_estimate: float
    display_string: str  # e.g. "₹3.6L – ₹4.2L"
    confidence: float
    channel_constraints: Dict[str, str]
    rationale: str


def format_inr(val: float) -> str:
    """Formats amount in Indian numbering (Lakhs/Crores/Thousands)."""
    if val >= 10000000:
        return f"₹{val / 10000000:.2f} Cr"
    elif val >= 100000:
        return f"₹{val / 100000:.1f}L"
    elif val >= 1000:
        return f"₹{val / 1000:.0f}K"
    return f"₹{val:.0f}"


class AmountPredictor:
    """
    Estimates the net cash volume likely to be liquidated at the next physical point.
    """

    def predict(
        self,
        transactions: List[SyntheticTransaction],
        reported_initial_amount: float,
        fraud_type: FraudType = FraudType.UPI_FRAUD
    ) -> AmountPredictionResult:
        main_txs = [t for t in transactions if not t.is_noise]

        if main_txs:
            last_hop_amount = main_txs[-1].amount
            hop_count = len(main_txs)
        else:
            last_hop_amount = reported_initial_amount
            hop_count = 1

        # Mule commissions across hops typically reduce net available balance by 2-5% per hop
        decay_factor = max(0.70, 1.0 - (hop_count * 0.035))
        base_target = last_hop_amount * decay_factor

        amt_min = round(base_target * 0.88, 2)
        amt_max = round(base_target * 0.98, 2)
        point_est = round((amt_min + amt_max) / 2.0, 2)

        conf = min(0.92, 0.70 + (hop_count * 0.05))

        display_str = f"{format_inr(amt_min)} – {format_inr(amt_max)}"

        constraints = {
            "ATM": "Daily cash withdrawal cap (~₹20,000–₹40,000 per card; multiple cloned/mule cards utilized)",
            "CSP": "AePS / BC transaction limit (~₹10,000–₹50,000 per token per day)",
            "Branch": "Cheque / Counter withdrawal requires pre-arranged KYC/bearer identity"
        }

        rationale = (
            f"Based on last observed hop amount ({format_inr(last_hop_amount)}) across {hop_count} hops. "
            f"Accounting for ~{(1.0 - decay_factor) * 100:.1f}% estimated intermediary mule deductions."
        )

        return AmountPredictionResult(
            predicted_min=amt_min,
            predicted_max=amt_max,
            point_estimate=point_est,
            display_string=display_str,
            confidence=conf,
            channel_constraints=constraints,
            rationale=rationale
        )
