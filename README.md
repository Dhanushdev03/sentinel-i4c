# SENTINEL-I4C
### Predictive Cyber-Fraud Intervention & Intelligence Platform
*Smart India Hackathon (SIH) Prototype*

[![Status](https://img.shields.io/badge/Status-Operational%20Prototype-success)](#)
[![Simulation](https://img.shields.io/badge/Data%20Mode-Synthetic%20Simulation-amber)](#)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](#)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](#)

---

## 1. Problem Statement
In contemporary cyber-financial crime in India, once an unauthorized debit occurs via UPI or net banking, funds are rapidly dispersed through a layered hierarchy of synthetic and coerced "mule" accounts. Within **15 to 45 minutes**, the illicit funds are physically withdrawn at automated teller machines (ATMs) or customer service points (CSPs) before conventional FIR registration, bank lien notices, or manual investigations can be initiated.

Existing systems operate post-incident, relying on retrospective audits. **The golden hour of recovery is lost during digital-to-cash liquidation.**

---

## 2. The Solution: Sentinel-I4C
**SENTINEL-I4C** is a predictive cybercrime response platform that:
1. Reconstructs evolving multi-hop money-flow graphs in real time.
2. Evaluates dynamic graph signals to route inference between a **Temporal Graph Network (TGN)** trace engine and a **Geo-Temporal (ST-KDE + ST-GCN)** fallback engine.
3. Predicts the most likely physical cash-out location, estimated intervention time window, and withdrawal amount.
4. Generates local **SHAP-style explainability** and actionable **counterfactual explanations**.
5. Optimizes multi-agency police patrol and bank nodal officer interventions to maximize expected recovery.
6. Enforces **mandatory human-in-the-loop authorization** before logging outcome feedback into an adaptive learning loop.
7. Anchors all evidence into a tamper-evident **SHA-256 chained audit ledger** and downloadable **Prediction Passport**.

---

## 3. System Architecture

```
                  ┌─────────────────────────────────────┐
                  │    Cyber-Fraud Complaint Received   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │        Case Creation & Token        │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Transaction Stream Ingestion   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Dynamic Transaction Graph       │
                  │   (Neo4j Graph Topology & Flow)     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │        Trace Confidence Router      │
                  │  (Hops · Recency · Entropy · Noise) │
                  └──────────┬────────────────┬─────────┘
                             │                │
             HIGH CONFIDENCE │                │ LOW CONFIDENCE
             (>= 0.65)       ▼                ▼ (< 0.40)
                  ┌────────────────────┐   ┌────────────────────┐
                  │  TGN Trace Engine  │   │ Geo-Temporal Model │
                  │  (PyTorch Scoring) │   │ (ST-KDE + ST-GCN)  │
                  └──────────┬─────────┘   └──────────┬─────────┘
                             │                        │
                             └───────────┬────────────┘
                                         ▼
                  ┌─────────────────────────────────────┐
                  │     Fusion & Calibrated Ensemble    │
                  │   w_t·TGN + w_k·STKDE + w_g·STGCN   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │         Cash-Out Predictions       │
                  │   • Location (Top-3 Ranking)        │
                  │   • Time Window (e.g. 15–28 min)    │
                  │   • Amount (e.g. ₹3.6L – ₹4.2L)     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Explainability Engine          │
                  │    SHAP Factors + Counterfactual    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Intervention Optimizer         │
                  │    Expected Recovery = P · A · P_i  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Multi-Agency Alert Dispatch    │
                  │      (RED / AMBER / GREEN WebSocket)│
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │   Mandatory Human Verification      │
                  │   (Confirm / Override / Escalate)   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │   Outcome Feedback & Model Loop     │
                  │   (HIT / MISS / PARTIAL Recorded)   │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Chained SHA-256 Audit Ledger     │
                  │    & Case Evidence Passport PDF     │
                  └─────────────────────────────────────┘
```

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, WebSockets, Uvicorn |
| **Machine Learning** | PyTorch, Scikit-Learn, XGBoost, NetworkX, SHAP Formulation |
| **Databases** | PostgreSQL 16 + PostGIS, Neo4j 5.18, Redis 7 (with embedded fallback) |
| **Streaming** | Apache Kafka & Zookeeper |
| **Containerization**| Docker, Docker Compose multi-stage builds |
| **Security** | JWT (HS256), Role-Based Access Control (RBAC), SHA-256 Chained Hashes |

---

## 5. User Roles & Access Control

1. **LEA Officer (Law Enforcement)**: Case intake, transaction monitoring, alert acknowledgement, patrol dispatch authorization, outcome logging.
2. **Bank Fraud Analyst**: Real-time transaction stream triaging, terminal nodal officer surveillance liaison.
3. **Supervisor**: High-severity escalation approval, alert override, audit ledger oversight.
4. **System Administrator**: System health telemetry, model version management, cryptographic audit verification.

---

## 6. Mathematical Models & Algorithms

### 1. Dynamic Weight Fusion
$$\text{Final Score}(i) = w_t \cdot P_{\text{TGN}}(i) + w_k \cdot \text{ST-KDE}(i) + w_g \cdot \text{ST-GCN}(i)$$

### 2. Trace Confidence Routing
Dynamic routing assigns weights based on chain hop visibility, graph connectivity, and prediction entropy:
- **High Confidence ($\ge 0.65$)**: $w_t = 0.70$, $w_k = 0.18$, $w_g = 0.12$
- **Medium Confidence ($0.40 - 0.64$)**: $w_t = 0.50$, $w_k = 0.28$, $w_g = 0.22$
- **Low Confidence ($< 0.40$)**: $w_t = 0.25$, $w_k = 0.45$, $w_g = 0.30$

### 3. Intervention Expected Recovery
$$\mathbb{E}[\text{Recovery}_i] = P_{\text{location}}(i) \times A_{\text{predicted}} \times P_{\text{intercept}}(i)$$

---

## 7. Quick Start: Running the Platform

### Option A: Running via Docker Compose (Recommended for Full Stack)
Run the entire platform (FastAPI, React Frontend, PostgreSQL/PostGIS, Neo4j, Redis, Kafka, Zookeeper) with one command:

```bash
# 1. Clone & enter repository
cd d:/sentinel

# 2. Build and launch all containers
docker compose up --build
```
- **Web Dashboard**: `http://localhost:8443` or `http://localhost:3000`
- **FastAPI Backend & Interactive API Docs**: `http://localhost:8000/docs`
- **Neo4j Browser**: `http://localhost:7474` (Credentials: `neo4j / sentinel2024`)

---

### Option B: Running Locally (Development Mode)

#### 1. Backend & ML Engine
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Development Server
```bash
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

#### 3. Run Automated Unit & E2E Tests
```bash
# Run pytest test suite (all 20 unit and integration tests)
python -m pytest tests/ -v
```

---

## 8. Guided SIH Demo Walkthrough (30–60 Seconds)

1. Open the application at `http://localhost:8443`.
2. Click the **"RUN LIVE DEMO"** button in the top navigation bar.
3. Observe the automated 11-step sequence:
   - Complaint received for UPI Fraud ₹4.5L.
   - Case `CYB-2024-MH-00142` auto-created.
   - 7-hop transaction stream ingested with mule account layering.
   - Dynamic transaction graph rendered with animated money flow.
   - Trace confidence calculated at 81% (High Confidence $\rightarrow$ routes to TGN).
   - Cash-out predicted at **SBI ATM - Andheri West SV Road** (72.3% probability, 18–25 min window).
   - Local SHAP factors computed + counterfactual perturbation.
   - Red alert triggered and sent to Mumbai Police Patrol Alpha-4 and SBI Nodal Officer.
   - Officer action recorded (**ACKNOWLEDGE**).
   - Case outcome recorded (**HIT** with ₹4.1L cash recovered).
   - Feedback loop immediately updates simulation analytics.
4. Navigate to **Case Intelligence View** to see the complete end-to-end investigative story on one unified screen.
5. Navigate to **Evidence Passport** to inspect the SHA-256 sealed audit package.

---

## 9. Important Product Rules & Disclaimers

1. **Simulation Environment**: All identities, accounts (`VICT-XXXX`, `MUL-XXXX`, `TERM-XXXX`), transactions, and locations are synthetic mock records generated for demonstration purposes.
2. **No Autonomous Freezing**: Sentinel-I4C recommends actionable intelligence. It does **not** autonomously freeze bank accounts or seize funds. Human authorization is strictly mandatory.
3. **No False Real-World Claims**: This system does not claim active integration with production NCRP, RBI, or live core banking systems.
4. **Transparent Evaluation**: Metrics on the analytics dashboard are clearly marked **"SIMULATION METRICS"**.

---

## 10. Future Scope & Roadmap

- **Federated Learning**: Privacy-preserving model training across participating commercial banks without sharing raw customer PII.
- **NCRP API Gateway**: Direct certified integration with the National Cyber Crime Reporting Portal.
- **Drone & Smart City CCTV Automated Feeds**: Integration with smart city traffic control centers to verify ATM kiosks upon alert dispatch.
- **Section 65B Digital Certificate Automation**: Integration with certified e-sign HSMs for instant court-admissible forensic evidence passports.
