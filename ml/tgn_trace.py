"""
SENTINEL-I4C: TGN Trace Engine
Architecture: Prototype Temporal Graph Scoring (TGN Architecture)
Evaluates dynamic temporal transaction features: amount, time deltas, node degree,
interaction velocity, hop depth, and terminal transition likelihood.

NOTE: This is a hackathon prototype model operating on synthetic data.
Do NOT claim production trained accuracy or live banking access.
"""

from typing import List, Dict, Any, Optional
import torch
import torch.nn as nn
import torch.nn.functional as F
from pydantic import BaseModel, Field
from simulator.fraud_simulator import SyntheticTransaction, SyntheticEntity, CashWithdrawalPoint


class TGNCandidateScore(BaseModel):
    node_id: str
    node_type: str
    probability: float
    raw_score: float
    hop_depth: int
    degree: int
    velocity_score: float


class TGNScores(BaseModel):
    model_config = {"protected_namespaces": ()}
    engine_name: str = "Prototype Temporal Graph Scoring (TGN Architecture)"
    model_version: str = "TGN-v0.4.2-PROTOTYPE"
    trace_confidence: float
    entropy: float
    candidates: List[TGNCandidateScore]
    feature_snapshot: Dict[str, float]


class TemporalGraphScorerNN(nn.Module):
    """
    Lightweight PyTorch neural scoring module for temporal edge & node representations.
    Projects edge time-deltas, normalized amounts, degree, and hop sequences into
    next-hop cash-out transition logits.
    """
    def __init__(self, in_features: int = 7, hidden_dim: int = 32):
        super().__init__()
        self.fc1 = nn.Linear(in_features, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.1)
        self.fc2 = nn.Linear(hidden_dim, 16)
        self.out_head = nn.Linear(16, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.relu(self.fc1(x))
        h = self.dropout(h)
        h = self.relu(self.fc2(h))
        logits = self.out_head(h)
        return logits


class TGNTraceEngine:
    """
    Temporal Graph Network trace scorer.
    Analyzes evolving money-flow chains and scores likelihood of candidate next entities/cashout points.
    """
    def __init__(self):
        # 7 input features:
        # [norm_amount, time_delta_min, node_degree, tx_count, hop_depth, channel_type_encoded, velocity]
        self.model = TemporalGraphScorerNN(in_features=7, hidden_dim=32)
        self.model.eval()

    def _extract_features(
        self,
        tx: SyntheticTransaction,
        target_point: CashWithdrawalPoint,
        hop_num: int,
        prev_tx_time: Optional[float] = None
    ) -> torch.Tensor:
        # Normalize features
        norm_amount = min(1.0, tx.amount / 1000000.0)
        time_delta = 10.0 if prev_tx_time is None else max(1.0, (float(tx.timestamp.replace("Z", "")[:19].split("T")[-1].replace(":", "")[-4:]) % 60))
        node_degree = min(10, hop_num + 2)
        tx_count = hop_num + 1
        hop_depth = hop_num
        channel_code = 1.0 if tx.channel in ("ATM", "CSP") else 0.5
        velocity = norm_amount / max(1.0, time_delta)

        feat_tensor = torch.tensor(
            [[norm_amount, time_delta / 60.0, node_degree / 10.0, tx_count / 10.0, hop_depth / 5.0, channel_code, min(2.0, velocity)]],
            dtype=torch.float32
        )
        return feat_tensor

    def score_chain(
        self,
        transactions: List[SyntheticTransaction],
        candidate_points: List[CashWithdrawalPoint]
    ) -> TGNScores:
        """
        Executes forward inference on synthetic chain transactions and candidate terminal points.
        """
        main_txs = [t for t in transactions if not t.is_noise]
        if not main_txs:
            # Fallback for empty chain
            return TGNScores(
                trace_confidence=0.2,
                entropy=1.5,
                candidates=[],
                feature_snapshot={}
            )

        last_tx = main_txs[-1]
        hop_count = len(main_txs)

        candidate_scores: List[TGNCandidateScore] = []
        raw_logits = []

        with torch.no_grad():
            for i, cwp in enumerate(candidate_points):
                feats = self._extract_features(last_tx, cwp, hop_count)
                logit = self.model(feats).item()

                # Add risk activity weighting from point catalog
                calibrated_logit = logit + (cwp.recent_fraud_activity * 0.05) + (cwp.risk_score * 0.4)
                raw_logits.append(calibrated_logit)

            # Softmax normalization over candidates
            tensor_logits = torch.tensor(raw_logits, dtype=torch.float32)
            probabilities = F.softmax(tensor_logits, dim=0).tolist()

            for i, cwp in enumerate(candidate_points):
                candidate_scores.append(TGNCandidateScore(
                    node_id=cwp.id,
                    node_type=cwp.type.value,
                    probability=round(probabilities[i], 4),
                    raw_score=round(raw_logits[i], 4),
                    hop_depth=hop_count,
                    degree=min(10, hop_count + 1),
                    velocity_score=round(min(1.0, last_tx.amount / (hop_count * 50000.0)), 3)
                ))

        # Sort descending by probability
        candidate_scores.sort(key=lambda c: c.probability, reverse=True)

        # Compute trace confidence and Shannon entropy
        prob_tensor = torch.tensor([c.probability for c in candidate_scores], dtype=torch.float32)
        # Shannon entropy: - sum(p * log(p))
        entropy = -torch.sum(prob_tensor * torch.log(prob_tensor + 1e-9)).item()

        # Confidence: higher when hop depth is observed and entropy is lower (sharp peak)
        depth_factor = min(1.0, hop_count / 4.0)
        sharpness_factor = max(0.2, 1.0 - (entropy / 2.0))
        confidence = round(min(0.95, (0.5 * depth_factor) + (0.5 * sharpness_factor)), 3)

        feature_snapshot = {
            "last_hop": float(hop_count),
            "last_amount": float(last_tx.amount),
            "last_channel_risk": 0.85 if last_tx.channel in ("ATM", "CSP") else 0.45,
            "chain_length": float(len(transactions)),
            "noise_ratio": float(len([t for t in transactions if t.is_noise]) / max(1, len(transactions))),
        }

        return TGNScores(
            trace_confidence=confidence,
            entropy=round(entropy, 3),
            candidates=candidate_scores,
            feature_snapshot=feature_snapshot
        )
