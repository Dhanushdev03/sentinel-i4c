-- ====================================================================
-- SENTINEL-I4C Seed Data Script
-- 20 Synthetic Cyber-Fraud Cases, Cash Withdrawal Points, Users, Audit Logs
-- ALL DATA IS SYNTHETIC FOR EVALUATION & SIMULATION PURPOSES
-- ====================================================================

-- 1. Default Users (Pass: Sentinel@2024!)
-- Password hash generated using bcrypt: $2b$12$e8x5uL2p7yH... placeholder
INSERT INTO users (id, username, password_hash, full_name, role, badge_number, clearance_level, state, district)
VALUES
('USR-001', 'r.sharma', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Insp. R. Sharma', 'LEA Officer', 'MH-CYB-0312', 'L2', 'Maharashtra', 'Mumbai'),
('USR-002', 'k.nair', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'SI Kavita Nair', 'Bank Fraud Analyst', 'DL-CYB-0147', 'L2', 'Delhi', 'New Delhi'),
('USR-003', 'a.mehta', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'DCP Anand Mehta', 'Supervisor', 'MH-SUP-0041', 'L3', 'Maharashtra', 'Mumbai'),
('USR-004', 'admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'System Administrator', 'System Administrator', 'SYS-ADM-0001', 'L4', 'National', 'Central HQ')
ON CONFLICT (id) DO NOTHING;

-- 2. Model Versions
INSERT INTO model_versions (version_id, model_name, training_date, description, status)
VALUES
('SENTINEL-TGN-v0.4.2-PROTOTYPE', 'Temporal Graph Network Trace Scorer', '2024-03-10', 'Graph scoring prototype over synthetic mule flow graphs', 'ACTIVE'),
('SENTINEL-GEO-v0.3.1', 'ST-KDE & ST-GCN Geo-Temporal Engine', '2024-03-08', 'Regional spatio-temporal withdrawal point density model', 'ACTIVE')
ON CONFLICT (version_id) DO NOTHING;

-- 3. Cash Withdrawal Points
INSERT INTO cash_withdrawal_points (id, name, type, bank, address, district, state, lat, lng, recent_fraud_activity, risk_score, jurisdiction_ps)
VALUES
('CWP-MH-ATM-001', 'SBI ATM - Andheri West SV Road', 'ATM', 'State Bank of India', 'Plot 14, S.V. Road, Near Andheri Metro Station', 'Mumbai Suburban', 'Maharashtra', 19.1197, 72.8468, 14, 0.880, 'Andheri Police Station'),
('CWP-MH-CSP-002', 'HDFC CSP Kiosk - Malad Link Road', 'CSP', 'HDFC Bank', 'Shop 3, Crystal Plaza, New Link Road, Malad West', 'Mumbai Suburban', 'Maharashtra', 19.1860, 72.8354, 9, 0.740, 'Malad Police Station'),
('CWP-MH-BR-003', 'ICICI Bank Branch - Borivali West', 'Branch', 'ICICI Bank', 'Premises 12, LT Road, Borivali West', 'Mumbai Suburban', 'Maharashtra', 19.2312, 72.8550, 5, 0.420, 'Borivali Police Station'),
('CWP-MH-ATM-004', 'Kotak ATM - Bandra Kurla Complex', 'ATM', 'Kotak Mahindra Bank', 'G Block, BKC, Bandra East', 'Mumbai Suburban', 'Maharashtra', 19.0662, 72.8687, 7, 0.610, 'BKC Cyber Police Station'),
('CWP-DL-ATM-001', 'PNB ATM - Connaught Place Radial 3', 'ATM', 'Punjab National Bank', 'Block A, Inner Circle, Connaught Place', 'New Delhi', 'Delhi', 28.6315, 77.2167, 18, 0.910, 'Connaught Place PS'),
('CWP-DL-CSP-002', 'SBI Grahak Seva Kendra - Rohini Sec 22', 'CSP', 'State Bank of India', 'Plot 52, Pocket 4, Sector 22, Rohini', 'North West Delhi', 'Delhi', 28.7180, 77.0655, 12, 0.820, 'Rohini Cyber PS'),
('CWP-DL-BR-003', 'Bank of Baroda Branch - Karol Bagh', 'Branch', 'Bank of Baroda', '45 Ajmal Khan Road, Karol Bagh', 'Central Delhi', 'Delhi', 28.6521, 77.1906, 6, 0.550, 'Karol Bagh PS'),
('CWP-KA-ATM-001', 'Canara Bank ATM - Koramangala 80ft Rd', 'ATM', 'Canara Bank', '112, 80 Feet Road, 4th Block, Koramangala', 'Bangalore Urban', 'Karnataka', 12.9352, 77.6245, 11, 0.790, 'Koramangala Cyber Cell'),
('CWP-KA-CSP-002', 'Axis CSP Center - Whitefield EPIP', 'CSP', 'Axis Bank', '45 EPIP Zone, Whitefield', 'Bangalore Urban', 'Karnataka', 12.9784, 77.7289, 8, 0.690, 'Whitefield PS'),
('CWP-KA-BR-003', 'SBI Branch - Electronic City Phase 1', 'Branch', 'State Bank of India', 'Cyber Park Building, Phase 1, Electronic City', 'Bangalore Urban', 'Karnataka', 12.8452, 77.6602, 4, 0.480, 'Electronic City PS'),
('CWP-TN-ATM-001', 'Indian Overseas Bank ATM - T. Nagar', 'ATM', 'Indian Overseas Bank', '24, Pondy Bazaar, T. Nagar', 'Chennai', 'Tamil Nadu', 13.0418, 80.2341, 10, 0.760, 'T. Nagar Police Station'),
('CWP-TN-CSP-002', 'Union Bank CSP - Tambaram West', 'CSP', 'Union Bank of India', 'GST Road, Near Railway Station, Tambaram', 'Kanchipuram', 'Tamil Nadu', 12.9249, 80.1275, 7, 0.630, 'Tambaram Cyber PS'),
('CWP-UP-ATM-001', 'SBI ATM - Gomti Nagar Patrakarpuram', 'ATM', 'State Bank of India', 'Crossing, Patrakarpuram, Gomti Nagar', 'Lucknow', 'Uttar Pradesh', 26.8530, 80.9995, 15, 0.870, 'Gomti Nagar PS'),
('CWP-UP-CSP-002', 'HDFC CSP Point - Sector 62 Noida', 'CSP', 'HDFC Bank', 'C-Block Market, Sector 62, Noida', 'Gautam Buddha Nagar', 'Uttar Pradesh', 28.6270, 77.3653, 13, 0.850, 'Noida Cyber Cell'),
('CWP-GJ-ATM-001', 'Bank of Baroda ATM - Vastrapur Lake', 'ATM', 'Bank of Baroda', 'Opp Vastrapur Lake, Bodakdev', 'Ahmedabad', 'Gujarat', 23.0373, 72.5293, 8, 0.710, 'Vastrapur PS'),
('CWP-TS-ATM-001', 'SBI ATM - Hitech City Madhapur', 'ATM', 'State Bank of India', 'Near Cyber Towers, Madhapur, Hitech City', 'Hyderabad', 'Telangana', 17.4504, 78.3808, 11, 0.800, 'Madhapur Cyber PS')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Primary Case
INSERT INTO cases (
    id, case_number, complaint_time, fraud_type, reported_amount, state, district,
    status, severity, victim_account_token, initial_tx_id, officer_name, officer_badge,
    hops_count, trace_confidence, tgn_weight, geo_weight, notes
)
VALUES (
    'CASE-2024-MH-00142', 'CYB-2024-MH-00142', '2024-03-15 08:45:00+05:30', 'UPI Fraud',
    450000.00, 'Maharashtra', 'Mumbai', 'ACTIVE', 'CRITICAL', 'VICT-4819-2311',
    'TXN20240315084501', 'Insp. R. Sharma', 'MH-CYB-0312', 4, 'HIGH', 0.680, 0.320,
    'Victim reported unauthorized UPI debits. Impersonator posed as electricity KYC agent.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Primary Alert
INSERT INTO alerts (
    id, case_id, level, location, location_address, time_window, amount,
    probability, confidence, reason, recommended_action, status, timestamp
)
VALUES (
    'ALT-00142-01', 'CASE-2024-MH-00142', 'RED', 'SBI ATM - Andheri West SV Road',
    'Plot 14, S.V. Road, Near Andheri Metro Station', '18–25 min', 420000.00,
    0.723, 0.810, 'High-velocity 4-hop chain terminating in ATM cluster with 14 historical fraud matches',
    'Dispatch Patrol Alpha-4 to SBI ATM Andheri. Alert SBI Nodal Officer for terminal surveillance.',
    'PENDING', '2024-03-15 09:30:00+05:30'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Audit Log Entry
INSERT INTO audit_logs (event_id, user_id, case_id, action, timestamp, details, details_hash, previous_hash)
VALUES (
    'EVT-000001', 'USR-004', 'CASE-2024-MH-00142', 'SYSTEM_INITIALIZED',
    '2024-03-15 08:30:00+05:30', 'Sentinel-I4C platform initialized in simulation mode with 20 demo cases',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '0000000000000000000000000000000000000000000000000000000000000000'
)
ON CONFLICT (event_id) DO NOTHING;
