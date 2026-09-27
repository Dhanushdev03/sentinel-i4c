"""
Unit Tests: Synthetic Fraud Scenario Generator
"""

import pytest
from simulator.fraud_simulator import (
    FraudSimulator,
    SimulationMode,
    FraudType,
    CASH_POINTS_CATALOG
)


def test_scenario_generation_basic():
    sim = FraudSimulator(seed=123)
    scenario = sim.generate_scenario(
        case_id="TEST-CASE-01",
        case_number="TEST-CYB-001",
        fraud_type=FraudType.UPI_FRAUD,
        initial_amount=350000.0,
        hops_count=3,
        mode=SimulationMode.NORMAL,
        state="Maharashtra",
        district="Mumbai"
    )

    assert scenario.case_id == "TEST-CASE-01"
    assert scenario.hops_count == 3
    assert scenario.victim_account.startswith("VICT")
    assert scenario.terminal_account.startswith("TERM")

    main_txs = [t for t in scenario.transactions if not t.is_noise]
    noise_txs = [t for t in scenario.transactions if t.is_noise]

    assert len(main_txs) == 3
    assert len(noise_txs) >= 3

    # Verify money flow order
    assert main_txs[0].from_account == scenario.victim_account
    assert main_txs[-1].to_account == scenario.terminal_account


def test_simulation_modes():
    sim = FraudSimulator(seed=456)

    # Adversarial mode has more noise and lower trace confidence hint
    adv_scenario = sim.generate_scenario(
        case_id="TEST-CASE-ADV",
        case_number="CYB-ADV-01",
        fraud_type=FraudType.INVESTMENT_SCAM,
        initial_amount=1000000.0,
        hops_count=5,
        mode=SimulationMode.ADVERSARIAL
    )
    noise_count = len([t for t in adv_scenario.transactions if t.is_noise])
    assert noise_count >= 8
    assert adv_scenario.trace_confidence_hint == "LOW"


def test_cash_points_catalog_integrity():
    assert len(CASH_POINTS_CATALOG) >= 10
    for cp in CASH_POINTS_CATALOG:
        assert cp.id.startswith("CWP-")
        assert cp.lat > 0
        assert cp.lng > 0
        assert cp.risk_score >= 0.0 and cp.risk_score <= 1.0
