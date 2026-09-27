# SENTINEL-I4C: REST & WebSocket API Specification

## Base URL
- Local: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Authentication Endpoints

### 1. `POST /api/auth/login`
Authenticates user and returns JWT bearer token.
- **Request Body**:
  ```json
  {
    "username": "r.sharma",
    "password": "Sentinel@2024!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": "USR-001",
      "username": "r.sharma",
      "full_name": "Insp. R. Sharma",
      "role": "LEA Officer",
      "badge_number": "MH-CYB-0312",
      "clearance_level": "L2",
      "state": "Maharashtra",
      "district": "Mumbai"
    }
  }
  ```

### 2. `GET /api/auth/me`
Returns authenticated user profile.

---

## Case Management Endpoints

### 3. `GET /api/cases`
Lists all cases with optional filters:
- Query parameters: `status`, `severity`, `fraud_type`, `state`

### 4. `POST /api/cases`
Creates a new cyber-fraud case and starts synthetic stream.
- **Request Body**:
  ```json
  {
    "fraud_type": "UPI Fraud",
    "reported_amount": 450000.0,
    "state": "Maharashtra",
    "district": "Mumbai"
  }
  ```

### 5. `GET /api/cases/{id}`
Returns complete case record including transactions, graph nodes, predictions, and alerts.

### 6. `POST /api/cases/{id}/simulate`
Triggers full end-to-end simulation stream for the case.

### 7. `GET /api/cases/{id}/graph`
Returns nodes (`VICTIM`, `MULE`, `TERMINAL`, `ATM`) and edges for graph visualization.

---

## Predictive ML Endpoints

### 8. `POST /api/predictions`
Runs on-demand inference over arbitrary input parameters.

### 9. `GET /api/predictions/{id}`
Returns Top-3 predicted cash-out points, time window, and amount estimate.

### 10. `GET /api/predictions/{id}/explanation`
Returns local SHAP feature attributions and counterfactual perturbations.

---

## Alerting & Human-in-the-Loop

### 11. `GET /api/alerts`
Lists active multi-agency alerts (`RED`, `AMBER`, `GREEN`).

### 12. `PUT /api/alerts/{id}/action`
Records human officer intervention action.
- **Request Body**:
  ```json
  {
    "action": "ACKNOWLEDGE",
    "officer_note": "Patrol dispatched to SBI ATM Andheri."
  }
  ```

---

## Outcome & Feedback Loop

### 13. `POST /api/outcomes`
Submits post-intervention feedback.
- **Request Body**:
  ```json
  {
    "case_id": "CASE-2024-MH-00142",
    "result": "HIT",
    "actual_location": "SBI ATM - Andheri West SV Road",
    "actual_amount": 410000.0,
    "cash_recovered": 395000.0,
    "officer_comments": "Suspect intercepted while withdrawing cash."
  }
  ```

---

## Evidence & Audit

### 14. `GET /api/evidence/{case_id}`
Exports Prediction Passport with SHA-256 integrity seal.

### 15. `GET /api/audit`
Returns chained audit ledger entries.

### 16. `POST /api/audit/verify`
Mathematically validates the unbroken integrity of the SHA-256 hash chain.

---

## WebSocket API

### `ws://localhost:8000/ws/cases/{case_id}`
Streams real-time transaction events:
- Client message: `{"type": "START_STREAM"}`
- Server emissions:
  - `{"type": "TRANSACTION_EVENT", "index": 1, "total": 7, "transaction": {...}}`
  - `{"type": "PREDICTION_EVENT", "prediction": {...}, "alert": {...}}`
