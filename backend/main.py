"""
SENTINEL-I4C: Predictive Cyber-Fraud Intervention & Intelligence Platform
Main FastAPI Backend Server & WebSocket Streamer
"""

import asyncio
import json
from contextlib import asynccontextmanager
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import repo
from backend.routers import (
    cases,
    predict,
    alerts,
    interventions,
    outcomes,
    analytics,
    audit,
    map as map_router,
    evidence,
    auth
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("SENTINEL-I4C BACKEND ENGINE INITIALIZED")
    print("Mode: SIMULATION / HACKATHON DEMO (Synthetic Data Only)")
    print(f"Loaded Cases: {len(repo.cases)} | Cash Points: {len(repo.cash_points)}")
    print("=" * 60)
    yield
    print("SENTINEL-I4C Server Shutting Down")


app = FastAPI(
    title="SENTINEL-I4C API",
    description="Predictive Cyber-Fraud Intervention & Intelligence Platform (Prototype)",
    version="0.4.2",
    lifespan=lifespan
)

# Enable CORS for Vite frontend running on any port (8443, 5173, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(predict.router)
app.include_router(alerts.router)
app.include_router(interventions.router)
app.include_router(outcomes.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(map_router.router)
app.include_router(evidence.router)


@app.get("/")
def root():
    return {
        "platform": "SENTINEL-I4C",
        "title": "Predictive Cyber-Fraud Intervention & Intelligence Platform",
        "status": "OPERATIONAL",
        "mode": "SIMULATION",
        "docs_url": "/docs",
        "cases_count": len(repo.cases),
        "disclaimer": "Prototype for demonstration only. Uses synthetic transaction and terminal data."
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "tgn_engine": "ONLINE",
        "geo_temporal_engine": "ONLINE",
        "fusion_engine": "ONLINE",
        "trace_confidence_router": "ONLINE",
        "database": "EMBEDDED_MEMORY_STORE",
        "simulation_mode": True
    }


# Active WebSocket connections per case
active_case_connections: Dict[str, List[WebSocket]] = {}


@app.websocket("/ws/cases/{case_id}")
async def websocket_case_stream(websocket: WebSocket, case_id: str):
    """
    WebSocket endpoint for real-time transaction streaming and dynamic alert dispatch.
    """
    await websocket.accept()
    if case_id not in active_case_connections:
        active_case_connections[case_id] = []
    active_case_connections[case_id].append(websocket)

    case = repo.get_case(case_id)
    transactions = repo.transactions.get(case_id, [])

    try:
        # Send initial status
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "case_id": case_id,
            "total_transactions": len(transactions),
            "trace_confidence": case.get("trace_confidence", "HIGH") if case else "HIGH"
        })

        # Listen for client triggers or stream simulated transaction steps
        while True:
            data = await websocket.receive_text()
            message = json.loads(data) if data else {}
            msg_type = message.get("type", "PING")

            if msg_type == "START_STREAM":
                # Stream transactions sequentially
                for idx, tx in enumerate(transactions):
                    await asyncio.sleep(0.6)  # Stream pacing
                    await websocket.send_json({
                        "type": "TRANSACTION_EVENT",
                        "index": idx + 1,
                        "total": len(transactions),
                        "transaction": tx,
                        "hop": tx.get("hop", -1)
                    })

                # Stream Prediction Event
                if case and case.get("prediction"):
                    await asyncio.sleep(0.5)
                    await websocket.send_json({
                        "type": "PREDICTION_EVENT",
                        "prediction": case["prediction"],
                        "alert": case.get("alert")
                    })

            elif msg_type == "PING":
                await websocket.send_json({"type": "PONG", "timestamp": str(asyncio.get_event_loop().time())})

    except WebSocketDisconnect:
        if case_id in active_case_connections and websocket in active_case_connections[case_id]:
            active_case_connections[case_id].remove(websocket)
    except Exception as e:
        if case_id in active_case_connections and websocket in active_case_connections[case_id]:
            active_case_connections[case_id].remove(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
