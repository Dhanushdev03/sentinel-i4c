"""
Predictions Router: Cash-Out Location, Time, Amount, and Explainability Endpoints
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.database import repo
from backend.auth import get_current_user, User
from simulator.fraud_simulator import FraudType, SimulationMode, CASH_POINTS_CATALOG

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


class PredictRequest(BaseModel):
    case_id: str
    reported_amount: float
    fraud_type: str = "UPI Fraud"
    state: str = "Maharashtra"
    district: str = "Mumbai"
    hops_count: int = 4


@router.post("", status_code=200)
def run_on_demand_prediction(req: PredictRequest, current_user: User = Depends(get_current_user)):
    try:
        ftype = FraudType(req.fraud_type)
    except ValueError:
        ftype = FraudType.UPI_FRAUD

    scenario = repo.simulator.generate_scenario(
        case_id=req.case_id,
        case_number=f"SIM-{req.case_id}",
        fraud_type=ftype,
        initial_amount=req.reported_amount,
        hops_count=req.hops_count,
        mode=SimulationMode.SUSPICIOUS,
        state=req.state,
        district=req.district
    )

    tgn = repo.tgn_engine.score_chain(scenario.transactions, scenario.candidate_cash_points)
    router_dec = repo.router.evaluate(scenario.transactions, tgn_entropy=tgn.entropy)
    geo = repo.geo_engine.evaluate(scenario.candidate_cash_points, scenario.transactions)
    t_res = repo.time_predictor.predict(scenario.transactions, fraud_type=ftype)
    a_res = repo.amount_predictor.predict(scenario.transactions, req.reported_amount, fraud_type=ftype)

    prediction = repo.fusion_engine.fuse(
        case_id=req.case_id,
        router=router_dec,
        tgn=tgn,
        geo=geo,
        candidate_points=scenario.candidate_cash_points,
        estimated_amount=a_res.point_estimate,
        time_min=t_res.time_window_min,
        time_max=t_res.time_window_max
    )

    top_point = repo.cash_points.get(prediction.locations[0].id) or CASH_POINTS_CATALOG[0]
    explanation = repo.explainability_engine.explain(
        prediction_id=prediction.id,
        case_id=req.case_id,
        transactions=scenario.transactions,
        top_location=top_point,
        top_probability=prediction.locations[0].probability,
        initial_amount=req.reported_amount
    )

    repo.predictions[req.case_id] = prediction.model_dump()
    repo.explanations[prediction.id] = explanation.model_dump()

    return {
        "prediction": prediction.model_dump(),
        "time_estimate": t_res.model_dump(),
        "amount_estimate": a_res.model_dump(),
        "explanation": explanation.model_dump(),
        "trace_confidence": router_dec.model_dump()
    }


@router.get("/{prediction_id}")
def get_prediction(prediction_id: str, current_user: User = Depends(get_current_user)):
    # Search by prediction ID or case ID
    for cid, pred in repo.predictions.items():
        if pred.get("id") == prediction_id or cid == prediction_id:
            return pred
    raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found")


@router.get("/{prediction_id}/explanation")
def get_prediction_explanation(prediction_id: str, current_user: User = Depends(get_current_user)):
    # Check directly by prediction id
    if prediction_id in repo.explanations:
        return repo.explanations[prediction_id]

    # Check if case id passed
    pred = repo.predictions.get(prediction_id)
    if pred and pred.get("id") in repo.explanations:
        return repo.explanations[pred["id"]]

    raise HTTPException(status_code=404, detail=f"Explanation for prediction {prediction_id} not found")
