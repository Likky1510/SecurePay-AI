from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import TransactionInput, OTPInput, QRCheckInput, RiskResult, LiveTransaction, BehaviorPattern, AlertItem, ReceiverCheckInput
from .fraud_model import fraud_model
from .db import in_memory_db
from typing import List
from datetime import datetime
import uuid

app = FastAPI(title='SecurePay AI', version='1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

def build_status(risk: int):
    if risk < 35:
        return 'Safe'
    if risk < 70:
        return 'Suspicious'
    return 'Blocked'

@app.get('/api/health')
def health():
    return {'status':'ok', 'service':'SecurePay AI'}

@app.get('/api/transactions/live', response_model=List[LiveTransaction])
def get_live_transactions():
    return in_memory_db.get_live(40)

@app.post('/api/transactions/simulate', response_model=RiskResult)
def simulate_transaction(txn: TransactionInput):
    analysis = fraud_model.score(txn.dict())
    risk_score = analysis['risk_score']
    status = build_status(risk_score)
    reasons = []
    risk_factors = {
        'amount': 0,
        'location': 0,
        'receiver': 0,
        'time': 0,
        'device': 0,
        'pattern': 0
    }

    # Amount analysis
    if txn.amount > 8000:
        reasons.append(f'High amount (₹{txn.amount})')
        risk_factors['amount'] = 25
    elif txn.amount > 5000:
        reasons.append(f'Medium-high amount (₹{txn.amount})')
        risk_factors['amount'] = 15

    # Location analysis
    if txn.location == 'abroad':
        reasons.append('Overseas transaction (high risk jurisdiction)')
        risk_factors['location'] = 20
    elif txn.location == 'unknown':
        reasons.append('Unknown location')
        risk_factors['location'] = 12

    # Time analysis
    if txn.time_of_day < 5 or txn.time_of_day > 22:
        reasons.append(f'Unusual time: {txn.time_of_day}:00')
        risk_factors['time'] = 18
    
    if txn.time_of_day < 5 and txn.amount > 3000:
        reasons.append('Early morning + high amount (rare pattern)')
        risk_factors['time'] = 25

    # Receiver analysis
    if txn.receiver.lower() in ['unknownpayee','scampayee','badactor']:
        reasons.append('Known scam receiver detected')
        risk_factors['receiver'] = 35
    elif in_memory_db.check_receiver(txn.receiver):
        reasons.append('Truecaller-like scam receiver warning')
        risk_factors['receiver'] = 30
    elif 'unknown' in txn.receiver.lower():
        reasons.append('Generic/unclear receiver name')
        risk_factors['receiver'] = 15

    # Device analysis
    if txn.device_type == 'desktop' and txn.time_of_day in (0,1,2,3,4):
        reasons.append('Desktop + odd hours pattern')
        risk_factors['device'] = 12
    elif txn.device_type == 'tablet':
        reasons.append('Tablet device (less common)')
        risk_factors['device'] = 5

    # Model-based pattern
    if analysis['fraud_probability'] > 0.6:
        reasons.append('Model flagged fraud pattern')
        risk_factors['pattern'] = 20
    elif analysis['anomaly_score'] > 0.7:
        reasons.append('Anomaly detected by isolation forest')
        risk_factors['pattern'] = 15

    if not reasons:
        reasons = ['Transaction appears normal']

    entry = LiveTransaction(
        transaction_id=str(uuid.uuid4()),
        amount=txn.amount,
        receiver=txn.receiver,
        risk_score=risk_score,
        status=status,
        anomalies=reasons,
        timestamp=datetime.utcnow().isoformat() + 'Z'
    )
    in_memory_db.add_live(entry)

    if status != 'Safe':
        alert_msg = f"⚠️ Transaction {status.upper()}: Risk Score {risk_score}/100 | {reasons[0] if reasons else 'Flagged'}"
        in_memory_db.add_alert(alert_msg, level='critical' if status=='Blocked' else 'warning', transaction_id=entry.transaction_id)

    return RiskResult(
        risk_score=risk_score,
        status=status,
        reasons=reasons
    )

@app.post('/api/otp-check')
def otp_check(otp: OTPInput):
    problems = []
    if otp.otp_entry_time_ms < 5000:
        problems.append('⚠️ OTP entered too fast')
    if otp.otp_entry_time_ms > otp.expected_otp_lifetime_ms:
        problems.append('⚠️ OTP entered too late, possible replay')
    if otp.source and 'email' in otp.source.lower() and otp.otp_entry_time_ms < 3000:
        problems.append('⚠️ Possible phishing attempt: OTP from email entered quickly')
    return {'valid': len(problems)==0, 'alerts': problems}

@app.post('/api/qrcode-check')
def qrcode_check(payload: QRCheckInput):
    qr = payload.qr_data.strip().lower()
    issues=[]
    if not qr.startswith('upi://pay') and not qr.startswith('https://'):
        issues.append('Fake or malformed QR code')
    if 'scampayee' in qr or 'badactor' in qr:
        issues.append('Untrusted QR destination detected')
    if not issues:
        issues.append('QR code appears valid')
    return {'valid': len(issues)==1 and 'valid' in issues[0].lower(), 'warnings': issues}

@app.get('/api/behavior', response_model=BehaviorPattern)
def behavior_analysis():
    return BehaviorPattern(unusual_timing=True, high_amount=True, new_device=False, pattern_strength=0.75)

@app.get('/api/alerts', response_model=List[AlertItem])
def alerts():
    return in_memory_db.get_alerts()

@app.post('/api/receiver-check')
def receiver_check(payload: ReceiverCheckInput):
    blocked = in_memory_db.check_receiver(payload.receiver)
    return {'receiver': payload.receiver, 'blocked': blocked}
