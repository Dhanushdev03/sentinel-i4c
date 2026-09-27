"""
SENTINEL-I4C Synthetic Fraud Scenario Generator
Simulates realistic mule account layering, peeling chains, noise transactions, and cash-out points.
NOTE: All generated data is purely SYNTHETIC for prototype and hackathon evaluation.
"""

import random
import hashlib
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SimulationMode(str, Enum):
    NORMAL = "NORMAL"
    SUSPICIOUS = "SUSPICIOUS"
    ADVERSARIAL = "ADVERSARIAL"

class FraudType(str, Enum):
    UPI_FRAUD = "UPI Fraud"
    PHISHING = "Phishing"
    INVESTMENT_SCAM = "Investment Scam"
    JOB_SCAM = "Job Scam"
    LOAN_SCAM = "Loan Scam"
    SOCIAL_ENGINEERING = "Social Engineering"
    OTHER = "Other"

class CashPointType(str, Enum):
    ATM = "ATM"
    CSP = "CSP"
    BRANCH = "Branch"

class CashWithdrawalPoint(BaseModel):
    id: str
    name: str
    type: CashPointType
    bank: str
    address: str
    district: str
    state: str
    lat: float
    lng: float
    recent_fraud_activity: int = 0
    risk_score: float = 0.5
    jurisdiction_ps: str = "Cyber Police Station"

class SyntheticEntity(BaseModel):
    id: str
    entity_type: str  # VICTIM, MULE, TERMINAL, ATM, CSP, BRANCH, DEVICE, UPI_ID
    label: str
    tokenized_account: str
    bank: str
    state: str
    district: str
    first_seen: str
    last_seen: str
    total_amount: float
    tx_count: int
    risk_score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SyntheticTransaction(BaseModel):
    id: str
    case_id: str
    timestamp: str
    from_account: str
    to_account: str
    amount: float
    channel: str  # UPI, IMPS, NEFT, ATM, CSP, RTGS
    risk_score: float
    hop: int
    is_noise: bool
    state: str
    district: str
    from_bank: str
    to_bank: str
    device_id: Optional[str] = None
    ip_hash: Optional[str] = None
    upi_ref: Optional[str] = None

class FraudScenario(BaseModel):
    case_id: str
    case_number: str
    fraud_type: FraudType
    initial_amount: float
    mode: SimulationMode
    hops_count: int
    created_at: str
    victim_account: str
    terminal_account: str
    transactions: List[SyntheticTransaction]
    entities: List[SyntheticEntity]
    candidate_cash_points: List[CashWithdrawalPoint]
    actual_cash_point: Optional[CashWithdrawalPoint] = None
    actual_cash_out_time: Optional[str] = None
    actual_amount: Optional[float] = None
    trace_confidence_hint: str = "HIGH"

# Comprehensive Indian Bank List
INDIAN_BANKS = [
    ("State Bank of India", "SBIN"),
    ("HDFC Bank", "HDFC"),
    ("ICICI Bank", "ICIC"),
    ("Punjab National Bank", "PUNB"),
    ("Bank of Baroda", "BARB"),
    ("Kotak Mahindra Bank", "KKBK"),
    ("Axis Bank", "UTIB"),
    ("Canara Bank", "CNRB"),
    ("Union Bank of India", "UBIN"),
    ("IndusInd Bank", "INDB")
]

# Realistic Synthetic Cash Withdrawal Points across Major Cybercrime Hotspots in India
CASH_POINTS_CATALOG: List[CashWithdrawalPoint] = [
    # Maharashtra / Mumbai
    CashWithdrawalPoint(
        id="CWP-MH-ATM-001", name="SBI ATM - Andheri West SV Road", type=CashPointType.ATM, bank="State Bank of India",
        address="Plot 14, S.V. Road, Near Andheri Metro Station", district="Mumbai Suburban", state="Maharashtra",
        lat=19.1197, lng=72.8468, recent_fraud_activity=14, risk_score=0.88, jurisdiction_ps="Andheri Police Station"
    ),
    CashWithdrawalPoint(
        id="CWP-MH-CSP-002", name="HDFC CSP Kiosk - Malad Link Road", type=CashPointType.CSP, bank="HDFC Bank",
        address="Shop 3, Crystal Plaza, New Link Road, Malad West", district="Mumbai Suburban", state="Maharashtra",
        lat=19.1860, lng=72.8354, recent_fraud_activity=9, risk_score=0.74, jurisdiction_ps="Malad Police Station"
    ),
    CashWithdrawalPoint(
        id="CWP-MH-BR-003", name="ICICI Bank Branch - Borivali West", type=CashPointType.BRANCH, bank="ICICI Bank",
        address="Premises 12, LT Road, Borivali West", district="Mumbai Suburban", state="Maharashtra",
        lat=19.2312, lng=72.8550, recent_fraud_activity=5, risk_score=0.42, jurisdiction_ps="Borivali Police Station"
    ),
    CashWithdrawalPoint(
        id="CWP-MH-ATM-004", name="Kotak ATM - Bandra Kurla Complex", type=CashPointType.ATM, bank="Kotak Mahindra Bank",
        address="G Block, BKC, Bandra East", district="Mumbai Suburban", state="Maharashtra",
        lat=19.0662, lng=72.8687, recent_fraud_activity=7, risk_score=0.61, jurisdiction_ps="BKC Cyber Police Station"
    ),

    # Delhi / NCR
    CashWithdrawalPoint(
        id="CWP-DL-ATM-001", name="PNB ATM - Connaught Place Radial 3", type=CashPointType.ATM, bank="Punjab National Bank",
        address="Block A, Inner Circle, Connaught Place", district="New Delhi", state="Delhi",
        lat=28.6315, lng=77.2167, recent_fraud_activity=18, risk_score=0.91, jurisdiction_ps="Connaught Place PS"
    ),
    CashWithdrawalPoint(
        id="CWP-DL-CSP-002", name="SBI Grahak Seva Kendra - Rohini Sec 22", type=CashPointType.CSP, bank="State Bank of India",
        address="Plot 52, Pocket 4, Sector 22, Rohini", district="North West Delhi", state="Delhi",
        lat=28.7180, lng=77.0655, recent_fraud_activity=12, risk_score=0.82, jurisdiction_ps="Rohini Cyber PS"
    ),
    CashWithdrawalPoint(
        id="CWP-DL-BR-003", name="Bank of Baroda Branch - Karol Bagh", type=CashPointType.BRANCH, bank="Bank of Baroda",
        address="45 Ajmal Khan Road, Karol Bagh", district="Central Delhi", state="Delhi",
        lat=28.6521, lng=77.1906, recent_fraud_activity=6, risk_score=0.55, jurisdiction_ps="Karol Bagh PS"
    ),

    # Karnataka / Bangalore
    CashWithdrawalPoint(
        id="CWP-KA-ATM-001", name="Canara Bank ATM - Koramangala 80ft Rd", type=CashPointType.ATM, bank="Canara Bank",
        address="112, 80 Feet Road, 4th Block, Koramangala", district="Bangalore Urban", state="Karnataka",
        lat=12.9352, lng=77.6245, recent_fraud_activity=11, risk_score=0.79, jurisdiction_ps="Koramangala Cyber Cell"
    ),
    CashWithdrawalPoint(
        id="CWP-KA-CSP-002", name="Axis CSP Center - Whitefield EPIP", type=CashPointType.CSP, bank="Axis Bank",
        address="45 EPIP Zone, Whitefield", district="Bangalore Urban", state="Karnataka",
        lat=12.9784, lng=77.7289, recent_fraud_activity=8, risk_score=0.69, jurisdiction_ps="Whitefield PS"
    ),
    CashWithdrawalPoint(
        id="CWP-KA-BR-003", name="SBI Branch - Electronic City Phase 1", type=CashPointType.BRANCH, bank="State Bank of India",
        address="Cyber Park Building, Phase 1, Electronic City", district="Bangalore Urban", state="Karnataka",
        lat=12.8452, lng=77.6602, recent_fraud_activity=4, risk_score=0.48, jurisdiction_ps="Electronic City PS"
    ),

    # Tamil Nadu / Chennai
    CashWithdrawalPoint(
        id="CWP-TN-ATM-001", name="Indian Overseas Bank ATM - T. Nagar", type=CashPointType.ATM, bank="Indian Overseas Bank",
        address="24, Pondy Bazaar, T. Nagar", district="Chennai", state="Tamil Nadu",
        lat=13.0418, lng=80.2341, recent_fraud_activity=10, risk_score=0.76, jurisdiction_ps="T. Nagar Police Station"
    ),
    CashWithdrawalPoint(
        id="CWP-TN-CSP-002", name="Union Bank CSP - Tambaram West", type=CashPointType.CSP, bank="Union Bank of India",
        address="GST Road, Near Railway Station, Tambaram", district="Kanchipuram", state="Tamil Nadu",
        lat=12.9249, lng=80.1275, recent_fraud_activity=7, risk_score=0.63, jurisdiction_ps="Tambaram Cyber PS"
    ),

    # Uttar Pradesh / Lucknow & Noida
    CashWithdrawalPoint(
        id="CWP-UP-ATM-001", name="SBI ATM - Gomti Nagar Patrakarpuram", type=CashPointType.ATM, bank="State Bank of India",
        address="Crossing, Patrakarpuram, Gomti Nagar", district="Lucknow", state="Uttar Pradesh",
        lat=26.8530, lng=80.9995, recent_fraud_activity=15, risk_score=0.87, jurisdiction_ps="Gomti Nagar PS"
    ),
    CashWithdrawalPoint(
        id="CWP-UP-CSP-002", name="HDFC CSP Point - Sector 62 Noida", type=CashPointType.CSP, bank="HDFC Bank",
        address="C-Block Market, Sector 62, Noida", district="Gautam Buddha Nagar", state="Uttar Pradesh",
        lat=28.6270, lng=77.3653, recent_fraud_activity=13, risk_score=0.85, jurisdiction_ps="Noida Cyber Cell"
    ),

    # Gujarat / Ahmedabad
    CashWithdrawalPoint(
        id="CWP-GJ-ATM-001", name="Bank of Baroda ATM - Vastrapur Lake", type=CashPointType.ATM, bank="Bank of Baroda",
        address="Opp Vastrapur Lake, Bodakdev", district="Ahmedabad", state="Gujarat",
        lat=23.0373, lng=72.5293, recent_fraud_activity=8, risk_score=0.71, jurisdiction_ps="Vastrapur PS"
    ),

    # Telangana / Hyderabad
    CashWithdrawalPoint(
        id="CWP-TS-ATM-001", name="SBI ATM - Hitech City Madhapur", type=CashPointType.ATM, bank="State Bank of India",
        address="Near Cyber Towers, Madhapur, Hitech City", district="Hyderabad", state="Telangana",
        lat=17.4504, lng=78.3808, recent_fraud_activity=11, risk_score=0.80, jurisdiction_ps="Madhapur Cyber PS"
    ),
]


class FraudSimulator:
    """
    Core generator engine for realistic cyber-fraud money layering,
    mule entity graph synthesis, and cash-out scenario creation.
    """

    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)

    @staticmethod
    def _token(prefix: str, salt: str) -> str:
        h = hashlib.sha256(f"{prefix}-{salt}".encode()).hexdigest()[:8].upper()
        return f"{prefix}-{h[:4]}-{h[4:]}"

    @staticmethod
    def _generate_device_id(idx: int) -> str:
        return f"DEV-{hashlib.md5(f'device-{idx}'.encode()).hexdigest()[:8].upper()}"

    def generate_scenario(
        self,
        case_id: str,
        case_number: str,
        fraud_type: FraudType = FraudType.UPI_FRAUD,
        initial_amount: float = 450000.0,
        hops_count: int = 4,
        mode: SimulationMode = SimulationMode.SUSPICIOUS,
        state: str = "Maharashtra",
        district: str = "Mumbai",
        base_time: Optional[datetime] = None
    ) -> FraudScenario:
        """
        Generates an end-to-end synthetic fraud chain with mule hops,
        realistic noise transactions, candidate terminals, and ground truth cashout.
        """
        if base_time is None:
            base_time = datetime.now(timezone.utc) - timedelta(minutes=45)

        hops_count = max(2, min(5, hops_count))
        victim_token = self._token("VICT", f"{case_id}-0")
        terminal_token = self._token("TERM", f"{case_id}-{hops_count}")

        # Choose bank sequence
        selected_banks = random.sample(INDIAN_BANKS, min(hops_count + 1, len(INDIAN_BANKS)))

        transactions: List[SyntheticTransaction] = []
        entities_dict: Dict[str, SyntheticEntity] = {}

        # Victim entity
        victim_bank, _ = selected_banks[0]
        entities_dict[victim_token] = SyntheticEntity(
            id=victim_token,
            entity_type="VICTIM",
            label="Victim Account (Reported)",
            tokenized_account=victim_token,
            bank=victim_bank,
            state=state,
            district=district,
            first_seen=base_time.isoformat(),
            last_seen=base_time.isoformat(),
            total_amount=initial_amount,
            tx_count=1,
            risk_score=0.15,
            metadata={"status": "reported_fraud", "verified": True}
        )

        current_amount = initial_amount
        current_account = victim_token
        current_time = base_time

        # Inter-hop delay parameters based on mode
        delay_ranges = {
            SimulationMode.NORMAL: (8, 16),
            SimulationMode.SUSPICIOUS: (3, 8),
            SimulationMode.ADVERSARIAL: (1, 4)
        }[mode]

        # Generate Hop Chain
        mule_tokens = []
        for h in range(1, hops_count + 1):
            is_terminal = (h == hops_count)
            next_account = terminal_token if is_terminal else self._token("MULE", f"{case_id}-{h}")
            if not is_terminal:
                mule_tokens.append(next_account)

            step_delay = random.randint(*delay_ranges)
            current_time = current_time + timedelta(minutes=step_delay)

            # Mule commission / smurf deduction (2% to 6%)
            commission_pct = random.uniform(0.02, 0.06) if h > 1 else 0.0
            hop_amount = round(current_amount * (1.0 - commission_pct), 2)
            current_amount = hop_amount

            # Channels
            if h == 1:
                channel = "UPI"
            elif is_terminal:
                channel = random.choice(["ATM", "CSP"])
            else:
                channel = random.choice(["IMPS", "UPI", "NEFT"])

            from_bank_tuple = selected_banks[(h - 1) % len(selected_banks)]
            to_bank_tuple = selected_banks[h % len(selected_banks)]

            tx_risk = min(0.95, 0.35 + (h * 0.12) + (0.1 if mode == SimulationMode.ADVERSARIAL else 0.0))
            device_id = self._generate_device_id(h + hash(case_id) % 1000)

            tx = SyntheticTransaction(
                id=f"TXN{current_time.strftime('%Y%m%d%H%M%S')}{h:03d}",
                case_id=case_id,
                timestamp=current_time.isoformat(),
                from_account=current_account,
                to_account=next_account,
                amount=hop_amount,
                channel=channel,
                risk_score=round(tx_risk, 3),
                hop=h,
                is_noise=False,
                state=state,
                district=district,
                from_bank=from_bank_tuple[0],
                to_bank=to_bank_tuple[0],
                device_id=device_id,
                ip_hash=hashlib.sha256(f"ip-{h}".encode()).hexdigest()[:12]
            )
            transactions.append(tx)

            # Register Entity
            entity_type = "TERMINAL" if is_terminal else "MULE"
            label = f"Terminal Withdrawal Entity" if is_terminal else f"Mule Stage {h} Entity"
            entities_dict[next_account] = SyntheticEntity(
                id=next_account,
                entity_type=entity_type,
                label=label,
                tokenized_account=next_account,
                bank=to_bank_tuple[0],
                state=state,
                district=district,
                first_seen=current_time.isoformat(),
                last_seen=current_time.isoformat(),
                total_amount=hop_amount,
                tx_count=1,
                risk_score=round(tx_risk, 3),
                metadata={"hop": h, "mode": mode.value}
            )

            current_account = next_account

        # Generate Noise / Decoy Transactions (Benign background traffic to test noise filtering)
        noise_count = 3 if mode == SimulationMode.NORMAL else (6 if mode == SimulationMode.SUSPICIOUS else 10)
        for n in range(noise_count):
            noise_time = base_time + timedelta(minutes=random.randint(5, 50))
            n_from = self._token("NORM", f"noise-from-{case_id}-{n}")
            n_to = self._token("NORM", f"noise-to-{case_id}-{n}")
            b1, _ = random.choice(INDIAN_BANKS)
            b2, _ = random.choice(INDIAN_BANKS)

            noise_tx = SyntheticTransaction(
                id=f"TXN-NOISE-{n:03d}-{random.randint(1000, 9999)}",
                case_id=case_id,
                timestamp=noise_time.isoformat(),
                from_account=n_from,
                to_account=n_to,
                amount=round(random.uniform(500.0, 35000.0), 2),
                channel="UPI",
                risk_score=round(random.uniform(0.04, 0.18), 3),
                hop=-1,
                is_noise=True,
                state=state,
                district=district,
                from_bank=b1,
                to_bank=b2
            )
            transactions.append(noise_tx)

        # Sort transactions chronologically
        transactions.sort(key=lambda t: t.timestamp)

        # Filter candidate cash points by state/region or pick closest cluster
        matched_points = [p for p in CASH_POINTS_CATALOG if p.state.lower() == state.lower()]
        if not matched_points:
            matched_points = CASH_POINTS_CATALOG[:5]

        # Top candidate points
        candidate_points = sorted(matched_points, key=lambda p: p.risk_score, reverse=True)[:4]
        actual_point = candidate_points[0] if candidate_points else CASH_POINTS_CATALOG[0]
        actual_cashout_time = (current_time + timedelta(minutes=random.randint(12, 28))).isoformat()

        # Determine trace confidence hint based on hops, velocity, and mode
        if mode == SimulationMode.ADVERSARIAL:
            trace_confidence = "LOW"
        elif hops_count >= 4 or mode == SimulationMode.SUSPICIOUS:
            trace_confidence = "HIGH"
        else:
            trace_confidence = "MEDIUM"

        return FraudScenario(
            case_id=case_id,
            case_number=case_number,
            fraud_type=fraud_type,
            initial_amount=initial_amount,
            mode=mode,
            hops_count=hops_count,
            created_at=base_time.isoformat(),
            victim_account=victim_token,
            terminal_account=terminal_token,
            transactions=transactions,
            entities=list(entities_dict.values()),
            candidate_cash_points=candidate_points,
            actual_cash_point=actual_point,
            actual_cash_out_time=actual_cashout_time,
            actual_amount=round(current_amount * random.uniform(0.92, 0.98), 2),
            trace_confidence_hint=trace_confidence
        )
