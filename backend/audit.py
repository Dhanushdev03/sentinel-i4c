"""
SENTINEL-I4C: Chained Tamper-Evident Audit Logging
Implements SHA-256 cryptographic hash-chaining across all sensitive actions:
LOGIN, CASE_CREATED, TRANSACTION_RECEIVED, MODEL_EXECUTED, PREDICTION_CREATED,
ALERT_SENT, ALERT_ACKNOWLEDGED, INTERVENTION, OUTCOME, EXPORT.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditEntry(BaseModel):
    event_id: str
    user_id: str
    case_id: Optional[str] = None
    action: str
    timestamp: str
    details: str
    details_hash: str
    previous_hash: str
    hash: str
    ip_address: str = "127.0.0.1"


class AuditChainVerifier(BaseModel):
    is_valid: bool
    total_entries: int
    broken_index: Optional[int] = None
    verification_message: str


class AuditLogManager:
    """
    Manages an append-only in-memory and database backed chained audit log.
    Every new log entry incorporates the cryptographic hash of the preceding entry.
    """

    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def __init__(self):
        self.logs: List[AuditEntry] = []
        self._init_genesis()

    def _compute_hash(
        self,
        event_id: str,
        user_id: str,
        case_id: Optional[str],
        action: str,
        timestamp: str,
        details_hash: str,
        previous_hash: str
    ) -> str:
        payload = f"{event_id}|{user_id}|{case_id or ''}|{action}|{timestamp}|{details_hash}|{previous_hash}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _init_genesis(self):
        now = datetime.now(timezone.utc).isoformat()
        details = "Genesis: Sentinel-I4C audit ledger initialized."
        det_hash = hashlib.sha256(details.encode("utf-8")).hexdigest()
        event_id = "EVT-000001"
        h = self._compute_hash(event_id, "SYSTEM", None, "SYSTEM_INIT", now, det_hash, self.GENESIS_HASH)

        genesis = AuditEntry(
            event_id=event_id,
            user_id="SYSTEM",
            case_id=None,
            action="SYSTEM_INIT",
            timestamp=now,
            details=details,
            details_hash=det_hash,
            previous_hash=self.GENESIS_HASH,
            hash=h,
            ip_address="127.0.0.1"
        )
        self.logs.append(genesis)

    def log_event(
        self,
        user_id: str,
        action: str,
        details: str,
        case_id: Optional[str] = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditEntry:
        prev = self.logs[-1].hash if self.logs else self.GENESIS_HASH
        event_id = f"EVT-{len(self.logs) + 1:06d}"
        now = datetime.now(timezone.utc).isoformat()
        det_hash = hashlib.sha256(details.encode("utf-8")).hexdigest()
        entry_hash = self._compute_hash(event_id, user_id, case_id, action, now, det_hash, prev)

        entry = AuditEntry(
            event_id=event_id,
            user_id=user_id,
            case_id=case_id,
            action=action,
            timestamp=now,
            details=details,
            details_hash=det_hash,
            previous_hash=prev,
            hash=entry_hash,
            ip_address=ip_address
        )
        self.logs.append(entry)
        return entry

    def verify_integrity(self) -> AuditChainVerifier:
        """
        Verifies mathematical integrity of the entire audit chain.
        """
        if not self.logs:
            return AuditChainVerifier(is_valid=True, total_entries=0, verification_message="Empty ledger.")

        for i, entry in enumerate(self.logs):
            expected_prev = self.GENESIS_HASH if i == 0 else self.logs[i - 1].hash
            if entry.previous_hash != expected_prev:
                return AuditChainVerifier(
                    is_valid=False,
                    total_entries=len(self.logs),
                    broken_index=i,
                    verification_message=f"Chain broken at index {i} ({entry.event_id}): previous_hash mismatch."
                )

            # Check for details tampering
            current_det_hash = hashlib.sha256(entry.details.encode("utf-8")).hexdigest()
            if current_det_hash != entry.details_hash:
                return AuditChainVerifier(
                    is_valid=False,
                    total_entries=len(self.logs),
                    broken_index=i,
                    verification_message=f"Tampering detected at index {i} ({entry.event_id}): details content modified."
                )

            recomputed_hash = self._compute_hash(
                entry.event_id,
                entry.user_id,
                entry.case_id,
                entry.action,
                entry.timestamp,
                current_det_hash,
                entry.previous_hash
            )
            if entry.hash != recomputed_hash:
                return AuditChainVerifier(
                    is_valid=False,
                    total_entries=len(self.logs),
                    broken_index=i,
                    verification_message=f"Tampering detected at index {i} ({entry.event_id}): entry hash invalid."
                )

        return AuditChainVerifier(
            is_valid=True,
            total_entries=len(self.logs),
            verification_message="Ledger verified: All chained SHA-256 hashes are tamper-free."
        )


# Global instance
audit_manager = AuditLogManager()
