"""
SENTINEL-I4C Machine Learning & Predictive Analytics Engine
Components:
- TGN Trace Engine (Prototype Temporal Graph Scoring)
- Trace Confidence Router
- Geo-Temporal Engine (ST-KDE + ST-GCN)
- Fusion & Calibration Engine
- Time & Amount Estimators
- Explainability (SHAP Factors + Counterfactuals)
- Intervention Optimizer
"""

from .tgn_trace import TGNTraceEngine, TGNScores
from .confidence_router import TraceConfidenceRouter, RouterDecision, TraceConfidenceLevel
from .geo_temporal import GeoTemporalEngine, GeoScores
from .fusion import FusionEngine, PredictionResult, CandidateLocation
from .time_predictor import TimePredictor, TimePredictionResult
from .amount_predictor import AmountPredictor, AmountPredictionResult
from .explainability import ExplainabilityEngine, ExplanationResult, ShapFactor
from .intervention import InterventionOptimizer, InterventionPlan, InterventionPriority

__all__ = [
    "TGNTraceEngine",
    "TGNScores",
    "TraceConfidenceRouter",
    "RouterDecision",
    "TraceConfidenceLevel",
    "GeoTemporalEngine",
    "GeoScores",
    "FusionEngine",
    "PredictionResult",
    "CandidateLocation",
    "TimePredictor",
    "TimePredictionResult",
    "AmountPredictor",
    "AmountPredictionResult",
    "ExplainabilityEngine",
    "ExplanationResult",
    "ShapFactor",
    "InterventionOptimizer",
    "InterventionPlan",
    "InterventionPriority",
]
