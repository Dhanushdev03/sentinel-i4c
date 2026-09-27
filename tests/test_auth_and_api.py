"""
Unit Tests: Authentication, RBAC, and Core API Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth import hash_password, verify_password, create_access_token

client = TestClient(app)


def test_password_hashing():
    pw = "Sentinel@2024!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation():
    token = create_access_token({"sub": "r.sharma", "role": "LEA Officer", "clearance": "L2"})
    assert isinstance(token, str)
    assert len(token) > 20


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["tgn_engine"] == "ONLINE"


def test_list_cases_api():
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 20
    assert any(c["id"] in ("CASE-SNTL-2026-0042", "CASE-2024-MH-00142") for c in cases)


def test_case_detail_and_graph_api():
    res = client.get("/api/cases/CASE-SNTL-2026-0042")
    assert res.status_code == 200
    case = res.json()
    assert case["id"] == "CASE-SNTL-2026-0042"
    assert "prediction" in case
    assert "alert" in case

    graph_res = client.get("/api/cases/CASE-SNTL-2026-0042/graph")
    assert graph_res.status_code == 200
    graph = graph_res.json()
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0


def test_analytics_api():
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert data["dataset_label"] == "SIMULATION METRICS"
    assert "model_comparison" in data
