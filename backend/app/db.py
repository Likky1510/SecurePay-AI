from typing import List
from .models import LiveTransaction, AlertItem
from datetime import datetime
import uuid

class InMemoryDB:
    def __init__(self):
        self.live_transactions = []
        self.alerts = []
        self.scam_receivers = set(['ScamPayee', 'BadActor', 'UnknownPayee'])

    def add_live(self, item: LiveTransaction):
        self.live_transactions.append(item)

    def get_live(self, limit=30):
        return list(self.live_transactions[-limit:])[::-1]

    def add_alert(self, message: str, level='warning', transaction_id=None):
        alert = AlertItem(
            alert_id=str(uuid.uuid4()),
            message=message,
            level=level,
            transaction_id=transaction_id,
            created_at=datetime.utcnow().isoformat() + 'Z'
        )
        self.alerts.append(alert)
        return alert

    def get_alerts(self):
        return list(self.alerts)[::-1]

    def check_receiver(self, receiver: str):
        return receiver in self.scam_receivers

in_memory_db = InMemoryDB()
