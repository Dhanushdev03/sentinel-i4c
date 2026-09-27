"""
SENTINEL-I4C Synthetic Fraud Scenario Generator
SIMULATION ONLY: Generates realistic synthetic money-flow chains, mule networks, and noise transactions.
"""

from .fraud_simulator import (
    FraudSimulator,
    SimulationMode,
    FraudScenario,
    SyntheticTransaction,
    SyntheticEntity,
    CASH_POINTS_CATALOG
)

__all__ = [
    "FraudSimulator",
    "SimulationMode",
    "FraudScenario",
    "SyntheticTransaction",
    "SyntheticEntity",
    "CASH_POINTS_CATALOG",
]
