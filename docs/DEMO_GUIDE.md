# SENTINEL-I4C: SIH Judging & Demonstration Guide

## Demonstration Narrative (30–60 Second Pitch)

> *"Honorable Jury, across India cybercrime victims lose hundreds of crores each year. The golden hour of cyber-fraud intervention is not months later in court, but within 15 to 30 minutes of the first UPI debit—before mule syndicates liquidate digital money at physical ATMs or CSP kiosks. Sentinel-I4C is the first predictive platform that traces money-flow chains in real-time, forecasts the next physical cash-out point, and equips law enforcement and bank nodal officers to intercept cash before it disappears."*

---

## Step-by-Step Live Demo Execution

### Step 1: Landing Screen
- Open Sentinel-I4C at `http://localhost:8443` (or Vite preview).
- Point out the **"From Complaint to Intervention"** header and cyber-intelligence dark theme.
- Click **"START DEMO"** or **"OPEN DASHBOARD"**.

### Step 2: Trigger Guided Live Demo
- Click the prominent **"RUN LIVE DEMO"** button in the top navigation bar.
- The guided progress pill will advance through all 11 stages:
  1. **Complaint Received**: UPI Fraud ₹4.5L reported by victim.
  2. **Case Creation**: Case `CYB-2024-MH-00142` auto-provisioned.
  3. **Transaction Stream**: 7 multi-hop transactions ingested.
  4. **Dynamic Graph**: Visualizes money flow across 4 mule hops with edge widths proportional to amounts.
  5. **Trace Confidence**: High confidence calculated (81%) $\rightarrow$ routes 68% weight to TGN Trace Engine.
  6. **TGN Trace Engine Execution**: Scores candidate next terminals.
  7. **Cash-Out Prediction**: Forecasts **SBI ATM - Andheri West SV Road** (72.3% probability, window 18–25 min).
  8. **SHAP Explainability**: Top 6 feature attributions displayed (mule volume, velocity, ATM history) + counterfactual perturbation.
  9. **Red Alert Triggered**: Multi-agency dispatch to Mumbai Police Patrol Alpha-4 and SBI Nodal Officer.
  10. **Human-in-the-Loop Action**: Officer clicks **"CONFIRM / ACKNOWLEDGE"**.
  11. **Outcome Recorded**: Record HIT $\rightarrow$ ₹4.1L recovered $\rightarrow$ feedback loop immediately updates model analytics.

### Step 3: Key Views to Showcase to Judges
1. **Case Intelligence View** (`/cases/CASE-2024-MH-00142`):
   - The master screen showing Complaint $\rightarrow$ Money Flow $\rightarrow$ Mule Network $\rightarrow$ Trace Confidence $\rightarrow$ Predicted Location $\rightarrow$ Time $\rightarrow$ Amount $\rightarrow$ Why (SHAP) $\rightarrow$ Expected Recovery $\rightarrow$ Alert $\rightarrow$ Officer Action $\rightarrow$ Outcome.
2. **Dynamic Transaction Graph**:
   - Interactive nodes (Victim, Mule, Terminal, ATM). Click any node to see entity risk indicators, first seen/last seen, bank, and transaction counts.
3. **Live Threat Map**:
   - Regional geospatial view showing ATMs, CSP kiosks, bank branches, and predicted cash-out hotspots.
4. **Prediction Passport**:
   - Downloadable case evidence package with SHA-256 tamper-evident integrity seal.
5. **Chained Audit Log**:
   - Cryptographically linked event ledger verifying that no case record has been altered.
