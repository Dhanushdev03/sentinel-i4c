"""
Unit Tests: Time & Amount Prediction Engines
"""

import pytest
from simulator.fraud_simulator import FraudSimulator, FraudType
from ml.time_predictor import TimePredictor
from ml.amount_predictor import AmountPredictor


def test_time_prediction():
    sim = FraudSimulator(seed=505)
    scenario_early = sim.generate_scenario(case_id="TIME-01", case_number="CYB-TIME-01", hops_count=2)
    scenario_late = sim.generate_scenario(case_id="TIME-02", case_number="CYB-TIME-02", hops_count=4)

    predictor = TimePredictor()
    early_res = predictor.predict(scenario_early.transactions, FraudType.UPI_FRAUD)
    late_res = predictor.predict(scenario_late.transactions, FraudType.UPI_FRAUD)

    assert early_res.time_window_min < early_res.time_window_max
    assert late_res.time_window_min < late_res.time_window_max
    # Advanced hop count has more urgent / shorter remaining time window
    assert late_res.point_estimate_min < early_res.point_estimate_min


def test_amount_prediction():
    sim = FraudSimulator(seed=606)
    scenario = sim.generate_scenario(
        case_id="AMT-01",
        case_number="CYB-AMT-01",
        initial_amount=500000.0,
        hops_count=3
    )
    predictor = AmountPredictor()
    res = predictor.predict(scenario.transactions, 500000.0, FraudType.UPI_FRAUD)

    assert res.predicted_min <= res.predicted_max
    assert res.point_estimate > 0
    assert "₹" in res.display_string
    assert "ATM" in res.channel_constraints
