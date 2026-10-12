from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List

class TransactionInput(BaseModel):
    amount: float = Field(..., gt=0)
    receiver: str
    qr_code: Optional[str] = None
    device_type: str = Field(..., pattern="^(mobile|desktop|tablet)$")
    location: str
    time_of_day: int = Field(..., ge=0, le=23)

class OTPInput(BaseModel):
    otp_entry_time_ms: int = Field(..., ge=0)
    expected_otp_lifetime_ms: int = Field(..., gt=0)
    source: Optional[str] = None

class QRCheckInput(BaseModel):
    qr_data: str

class RiskResult(BaseModel):
    risk_score: int
    status: str
    reasons: List[str]

class LiveTransaction(BaseModel):
    transaction_id: str
    amount: float
    receiver: str
    risk_score: int
    status: str
    anomalies: List[str]
    timestamp: str

class BehaviorPattern(BaseModel):
    unusual_timing: bool
    high_amount: bool
    new_device: bool
    pattern_strength: float

class AlertItem(BaseModel):
    alert_id: str
    message: str
    level: str
    transaction_id: Optional[str]
    created_at: str

class ReceiverCheckInput(BaseModel):
    receiver: str
