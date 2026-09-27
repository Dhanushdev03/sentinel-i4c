// ====================================================================
// SENTINEL-I4C Neo4j Seed Data Script
// Reconstructs the 4-Hop Money Flow Graph for CYB-2024-MH-00142
// ====================================================================

// 1. Create Core Nodes
MERGE (v:Account {id: "VICT-4819-2311", label: "Victim Account", type: "VICTIM", bank: "State Bank of India", risk_score: 0.15, state: "Maharashtra", district: "Mumbai"})
MERGE (m1:Account {id: "MUL-100-2311", label: "Mule Layer 1", type: "MULE", bank: "HDFC Bank", risk_score: 0.45, state: "Maharashtra", district: "Mumbai"})
MERGE (m2:Account {id: "MUL-200-2311", label: "Mule Layer 2", type: "MULE", bank: "ICICI Bank", risk_score: 0.62, state: "Maharashtra", district: "Mumbai"})
MERGE (m3:Account {id: "MUL-300-2311", label: "Mule Layer 3", type: "MULE", bank: "Kotak Mahindra Bank", risk_score: 0.78, state: "Maharashtra", district: "Mumbai"})
MERGE (term:Account {id: "TERM-200-2311", label: "Terminal Cashout Account", type: "TERMINAL", bank: "Axis Bank", risk_score: 0.92, state: "Maharashtra", district: "Mumbai"})

// Devices
MERGE (d1:Device {id: "DEV-E8F1A04B", model: "Redmi Note 12", imei_hash: "3a9f01bc", is_rooted: true})
MERGE (d2:Device {id: "DEV-7C2D90FA", model: "Samsung Galaxy M14", imei_hash: "7f4c029d", is_rooted: false})

// UPI Identifiers
MERGE (u1:UPI {id: "mule.trans1@okhdfc", vpa: "mule.trans1@okhdfc"})
MERGE (u2:UPI {id: "fast.payout2@icici", vpa: "fast.payout2@icici"})

// Withdrawal Points
MERGE (atm1:ATM {id: "CWP-MH-ATM-001", name: "SBI ATM - Andheri West SV Road", bank: "State Bank of India", lat: 19.1197, lng: 72.8468, risk_score: 0.88})
MERGE (csp1:CSP {id: "CWP-MH-CSP-002", name: "HDFC CSP Kiosk - Malad Link Road", bank: "HDFC Bank", lat: 19.1860, lng: 72.8354, risk_score: 0.74})

// 2. Connect Transactions (Layering Chain)
MERGE (v)-[:TRANSFER {tx_id: "TXN00142-01", amount: 450000.0, channel: "UPI", timestamp: "2024-03-15T08:45:00Z", risk_score: 0.42}]->(m1)
MERGE (m1)-[:TRANSFER {tx_id: "TXN00142-02", amount: 435000.0, channel: "IMPS", timestamp: "2024-03-15T08:56:00Z", risk_score: 0.58}]->(m2)
MERGE (m2)-[:TRANSFER {tx_id: "TXN00142-03", amount: 422000.0, channel: "UPI", timestamp: "2024-03-15T09:07:00Z", risk_score: 0.72}]->(m3)
MERGE (m3)-[:TRANSFER {tx_id: "TXN00142-04", amount: 410000.0, channel: "IMPS", timestamp: "2024-03-15T09:18:00Z", risk_score: 0.89}]->(term)

// Connect Devices and UPIs
MERGE (m2)-[:USED_DEVICE {last_used: "2024-03-15T09:07:00Z"}]->(d1)
MERGE (m3)-[:USED_DEVICE {last_used: "2024-03-15T09:18:00Z"}]->(d1)
MERGE (m1)-[:LOGGED_IN {timestamp: "2024-03-15T08:55:00Z"}]->(u1)
MERGE (m2)-[:LOGGED_IN {timestamp: "2024-03-15T09:05:00Z"}]->(u2)

// Connect Terminal to Predicted Cash-Out Point
MERGE (term)-[:CASH_OUT {status: "PREDICTED", predicted_amount: 410000.0, probability: 0.723, window: "18-25 min"}]->(atm1);
