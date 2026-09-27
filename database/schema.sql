-- ====================================================================
-- SENTINEL-I4C PostgreSQL / PostGIS Schema
-- Predictive Cyber-Fraud Intervention & Intelligence Platform
-- SIMULATION DATA STORAGE ONLY - NOT CONNECTED TO PRODUCTION BANKING/GOV SYSTEMS
-- ====================================================================

-- Enable PostGIS extension if available
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    full_name VARCHAR(256) NOT NULL,
    role VARCHAR(64) NOT NULL, -- LEA Officer, Bank Fraud Analyst, Supervisor, System Administrator
    badge_number VARCHAR(64) NOT NULL,
    clearance_level VARCHAR(16) NOT NULL, -- L1, L2, L3, L4
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Model Versions
CREATE TABLE IF NOT EXISTS model_versions (
    version_id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(128) NOT NULL,
    training_date VARCHAR(64) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- 3. Cases
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(64) UNIQUE NOT NULL,
    complaint_time TIMESTAMP WITH TIME ZONE NOT NULL,
    fraud_type VARCHAR(64) NOT NULL,
    reported_amount NUMERIC(14, 2) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, RESOLVED, CLOSED, PENDING
    severity VARCHAR(32) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
    victim_account_token VARCHAR(64) NOT NULL,
    initial_tx_id VARCHAR(64) NOT NULL,
    officer_name VARCHAR(128),
    officer_badge VARCHAR(64),
    hops_count INT DEFAULT 0,
    trace_confidence VARCHAR(32) DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    tgn_weight NUMERIC(4, 3) DEFAULT 0.680,
    geo_weight NUMERIC(4, 3) DEFAULT 0.320,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Entities (Accounts, Mules, Terminals, Devices)
CREATE TABLE IF NOT EXISTS entities (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    entity_type VARCHAR(32) NOT NULL, -- VICTIM, MULE, TERMINAL, ATM, CSP, BRANCH
    label VARCHAR(128) NOT NULL,
    tokenized_account VARCHAR(64) NOT NULL,
    bank VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    tx_count INT DEFAULT 1,
    risk_score NUMERIC(4, 3) DEFAULT 0.500
);

-- 5. Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    from_account VARCHAR(64) NOT NULL,
    to_account VARCHAR(64) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    channel VARCHAR(32) NOT NULL, -- UPI, IMPS, NEFT, ATM, CSP, RTGS
    risk_score NUMERIC(4, 3) NOT NULL,
    hop INT NOT NULL,
    is_noise BOOLEAN DEFAULT FALSE,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    from_bank VARCHAR(128) NOT NULL,
    to_bank VARCHAR(128) NOT NULL,
    device_id VARCHAR(64)
);

-- 6. Cash Withdrawal Points (ATMs, CSPs, Branches)
CREATE TABLE IF NOT EXISTS cash_withdrawal_points (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL, -- ATM, CSP, Branch
    bank VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    recent_fraud_activity INT DEFAULT 0,
    risk_score NUMERIC(4, 3) DEFAULT 0.500,
    jurisdiction_ps VARCHAR(256) NOT NULL
);

-- 7. Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    model_version VARCHAR(64) NOT NULL,
    trace_confidence VARCHAR(32) NOT NULL,
    w_tgn NUMERIC(4, 3) NOT NULL,
    w_stkde NUMERIC(4, 3) NOT NULL,
    w_stgcn NUMERIC(4, 3) NOT NULL,
    time_window_min INT NOT NULL,
    time_window_max INT NOT NULL,
    amount_min NUMERIC(14, 2) NOT NULL,
    amount_max NUMERIC(14, 2) NOT NULL,
    expected_recovery NUMERIC(14, 2) NOT NULL,
    input_hash VARCHAR(64) NOT NULL
);

-- 8. Candidate Predicted Locations
CREATE TABLE IF NOT EXISTS candidate_locations (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(64) REFERENCES predictions(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    location_id VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    bank VARCHAR(128) NOT NULL,
    probability NUMERIC(5, 4) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    eta_min INT NOT NULL,
    expected_recovery NUMERIC(14, 2) NOT NULL,
    tgn_score NUMERIC(5, 4) NOT NULL,
    stkde_score NUMERIC(5, 4) NOT NULL,
    stgcn_score NUMERIC(5, 4) NOT NULL,
    fusion_score NUMERIC(5, 4) NOT NULL
);

-- 9. Explanations (SHAP & Counterfactual)
CREATE TABLE IF NOT EXISTS explanations (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(64) REFERENCES predictions(id) ON DELETE CASCADE,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    factors_json JSONB NOT NULL,
    counterfactual TEXT NOT NULL,
    counterfactual_effect TEXT NOT NULL,
    local_fidelity_score NUMERIC(4, 3) DEFAULT 0.940
);

-- 10. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    level VARCHAR(16) NOT NULL, -- RED, AMBER, GREEN
    location VARCHAR(256) NOT NULL,
    location_address TEXT NOT NULL,
    time_window VARCHAR(64) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    probability NUMERIC(5, 4) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, ACKNOWLEDGED, ESCALATED, RESOLVED, OVERRIDDEN
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    officer_id VARCHAR(64),
    officer_action VARCHAR(64),
    officer_note TEXT,
    response_time_min NUMERIC(6, 2)
);

-- 11. Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    prediction_id VARCHAR(64) REFERENCES predictions(id) ON DELETE CASCADE,
    priority_level INT NOT NULL,
    location_id VARCHAR(64) NOT NULL,
    expected_recovery NUMERIC(14, 2) NOT NULL,
    intercept_success_prob NUMERIC(5, 4) NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    eta_min INT NOT NULL,
    urgency VARCHAR(32) NOT NULL,
    assigned_patrol_unit VARCHAR(128) NOT NULL,
    recommended_police_action TEXT NOT NULL,
    recommended_bank_action TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PROPOSED'
);

-- 12. Outcomes & Feedback Loop
CREATE TABLE IF NOT EXISTS outcomes (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(64) UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    result VARCHAR(32) NOT NULL, -- HIT, MISS, PARTIAL
    actual_location VARCHAR(256) NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_amount NUMERIC(14, 2) NOT NULL,
    cash_recovered NUMERIC(14, 2) NOT NULL,
    officer_comments TEXT,
    recorded_by VARCHAR(64) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit Log (Chained Tamper-Evident SHA-256 Hashes)
CREATE TABLE IF NOT EXISTS audit_logs (
    event_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    case_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL,
    details_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_severity ON cases(severity);
CREATE INDEX IF NOT EXISTS idx_cases_fraud_type ON cases(fraud_type);
CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_account);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_account);
CREATE INDEX IF NOT EXISTS idx_alerts_case_id ON alerts(case_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_cwp_state_dist ON cash_withdrawal_points(state, district);
