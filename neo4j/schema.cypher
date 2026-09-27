// ====================================================================
// SENTINEL-I4C Neo4j Cypher Schema Definitions
// Dynamic Transaction Graph & Entity Resolution
// ====================================================================

// 1. Constraints on Entity Nodes
CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (d:Device) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT upi_id_unique IF NOT EXISTS FOR (u:UPI) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT phone_id_unique IF NOT EXISTS FOR (p:Phone) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT atm_id_unique IF NOT EXISTS FOR (atm:ATM) REQUIRE atm.id IS UNIQUE;
CREATE CONSTRAINT csp_id_unique IF NOT EXISTS FOR (csp:CSP) REQUIRE csp.id IS UNIQUE;
CREATE CONSTRAINT branch_id_unique IF NOT EXISTS FOR (b:Branch) REQUIRE b.id IS UNIQUE;

// 2. Indexes for Fast Traversal & Temporal Filtering
CREATE INDEX account_bank_idx IF NOT EXISTS FOR (a:Account) ON (a.bank);
CREATE INDEX account_risk_idx IF NOT EXISTS FOR (a:Account) ON (a.risk_score);
CREATE INDEX transfer_time_idx IF NOT EXISTS FOR ()-[r:TRANSFER]-() ON (r.timestamp);
CREATE INDEX transfer_tx_idx IF NOT EXISTS FOR ()-[r:TRANSFER]-() ON (r.tx_id);
