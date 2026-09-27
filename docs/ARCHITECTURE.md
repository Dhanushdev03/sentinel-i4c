# SENTINEL-I4C: System Architecture Specification

## 1. System Overview

**SENTINEL-I4C** is an SIH-ready predictive cyber-fraud intervention and intelligence platform designed to ingest cyber-fraud complaints, reconstruct dynamic transaction graphs across mule layering hops, predict physical cash-out locations, estimate intervention windows and amounts, provide mathematical explainability (SHAP + counterfactuals), and optimize law enforcement intervention.

> **CRITICAL SIMULATION DISCLAIMER**  
> All data used in Sentinel-I4C (accounts, IFSCs, transactions, suspect tokens, ATM locations) is **100% SYNTHETIC**. This platform does NOT connect to real NCRP, RBI, bank, or government databases, nor does it autonomously freeze bank accounts. Predictions are operational recommendations requiring mandatory human verification.

---

## 2. End-to-End Workflow Architecture

```
[Cyber-Fraud Complaint Received]
              ↓
      [Case Creation]
              ↓
  [Transaction Stream Ingestion]
              ↓
 [Dynamic Transaction Graph (Neo4j)]
              ↓
   [Trace Confidence Router]
   ┌──────────┴──────────┐
   ↓                     ↓
[HIGH CONFIDENCE]    [LOW CONFIDENCE]
   ↓                     ↓
[TGN Trace Engine]   [Geo-Temporal Fallback]
 (Temporal Graph)     (ST-KDE + ST-GCN)
   └──────────┬──────────┘
              ↓
   [Fusion & Calibration]
  (w_t·TGN + w_k·STKDE + w_g·STGCN)
              ↓
    [Cash-Out Prediction]
   ┌──────────┼──────────┐
   ↓          ↓          ↓
Location     Time      Amount
   └──────────┬──────────┘
              ↓
       [Explainability]
    (SHAP + Counterfactual)
              ↓
  [Intervention Optimizer]
 (Expected Recovery Ranking)
              ↓
    [Police / Bank Alert]
    (RED / AMBER / GREEN)
              ↓
  [Human-in-the-Loop Action]
 (Confirm / Override / Escalate)
              ↓
     [Outcome Feedback]
    (Hit / Miss / Partial)
              ↓
     [Feedback Loop &]
    [Model Improvement]
```

---

## 3. Core Subsystems

### A. Synthetic Fraud Scenario Generator (`simulator/`)
- Simulates realistic multi-hop mule layering (2–5 hops) with peeling chains, commission deductions (2%–6%), and noise transaction injection.
- Operating Modes:
  - `NORMAL`: Standard delays, 2–3 hops, minimal noise.
  - `SUSPICIOUS`: Rapid inter-hop velocity (3–8 min), 3–4 hops.
  - `ADVERSARIAL`: Deliberate smurfing, 4–5 hops, 8–10 decoy transactions.

### B. Dynamic Transaction Graph (`neo4j/` & Network Engine)
- Entities: `Account`, `Device`, `UPI`, `Phone`, `ATM`, `CSP`, `Branch`.
- Relationships: `TRANSFER`, `LOGGED_IN`, `USED_DEVICE`, `CASH_OUT`.
- Graph analytics extract in-degree, out-degree, temporal dispersion latency, and community clustering.

### C. TGN Trace Engine (`ml/tgn_trace.py`)
- Prototype Temporal Graph Scoring based on PyTorch.
- Inputs: transaction amount, timestamp deltas, node degree, interaction velocity, hop depth, and historical terminal transition probabilities.
- Outputs candidate transition probabilities and prediction entropy.

### D. Trace Confidence Router (`ml/confidence_router.py`)
- Evaluates:
  1. Observed mule hops
  2. Transaction recency
  3. Node novelty
  4. Model entropy
  5. Graph connectivity
- Dynamic weight assignment:
  - `HIGH CONFIDENCE` (>= 0.65): $w_{tgn} = 0.70$, $w_{geo} = 0.30$
  - `MEDIUM CONFIDENCE` (0.40–0.64): $w_{tgn} = 0.50$, $w_{geo} = 0.50$
  - `LOW CONFIDENCE` (< 0.40): $w_{tgn} = 0.25$, $w_{geo} = 0.75$

### E. Geo-Temporal Engine (`ml/geo_temporal.py`)
- **ST-KDE**: Gaussian spatial kernel over candidate withdrawal terminals combined with temporal exponential decay of historical fraud occurrences.
- **ST-GCN**: Spatial proximity graph connecting ATMs, CSPs, and Branches (< 12 km), aggregating risk and operational affinity (hour-of-day, day-of-week).

### F. Fusion & Calibration Engine (`ml/fusion.py`)
- Combines model logits:
  $$\text{Final Score} = w_t \cdot \text{TGN} + w_k \cdot \text{ST-KDE} + w_g \cdot \text{ST-GCN}$$
- Calibrated using temperature-scaled Softmax ($T = 1.2$).
- Outputs Top-3 ranked candidate locations.

### G. Explainability & Counterfactuals (`ml/explainability.py`)
- Computes local SHAP attributions directly from model inputs (mule transfer volume, dispersion velocity, historical fraud index, proximity, noise dilution).
- Generates actionable counterfactuals (e.g. impact of a 20% reduction in transfer amount or 40% drop in velocity).

### H. Intervention Optimizer (`ml/intervention.py`)
- Calculates:
  $$\text{Expected Recovery} = \text{Probability} \times \text{Amount} \times \text{Intercept Success Probability}$$
- Ranks Priority 1, 2, and 3 targets with assigned patrol unit dispatch, estimated response ETA, and bank nodal officer action.

### I. Prediction Passport (`backend/prediction_passport.py`)
- Tamper-evident evidence log with SHA-256 integrity seal, input snapshot hash, factor attributions, and officer actions for post-incident auditing.

### J. Chained Audit Ledger (`backend/audit.py`)
- Cryptographic hash-chaining ($H_i = \text{SHA256}(E_i \parallel H_{i-1})$) ensuring full non-repudiation and immediate detection of unauthorized database modifications.
