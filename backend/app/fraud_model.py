import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

class FraudModel:
    def __init__(self):
        self.iforest = IsolationForest(n_estimators=200, contamination=0.09, random_state=42)
        self.rf = RandomForestClassifier(n_estimators=150, random_state=42, max_depth=8)
        self.scaler = StandardScaler()
        self.le_receiver = LabelEncoder()
        self.le_device = LabelEncoder()
        self.le_location = LabelEncoder()
        self._train()

    def _synthetic_dataset(self):
        rng = np.random.default_rng(42)
        n = 3000
        # More nuanced distribution
        amount = np.concatenate([
            rng.normal(1200, 300, int(n*0.70)),  # Normal transactions
            rng.normal(5000, 1500, int(n*0.15)), # Medium transactions
            rng.normal(12000, 2500, int(n*0.10)), # High transactions
            rng.uniform(15000, 20000, int(n*0.05)) # Very high (suspicious)
        ])
        amount = np.clip(amount, 10, 20000)
        
        device = rng.choice(['mobile', 'desktop', 'tablet'], size=amount.shape[0], p=[0.65,0.25,0.1])
        location = rng.choice(['home', 'work', 'station', 'abroad', 'unknown'], size=amount.shape[0], p=[0.45,0.30,0.10,0.08,0.07])
        receiver = rng.choice(['Friend', 'Family', 'Bill', 'Merchant', 'UnknownPayee', 'Corporate'], size=amount.shape[0], p=[0.25,0.20,0.25,0.20,0.05,0.05])
        time_of_day = rng.integers(0,24,size=amount.shape[0])
        
        is_fraud = np.zeros(amount.shape[0])
        
        # Rule-based fraud flags for realistic distribution
        high_amount_abroad = (amount > 8000) & (location == 'abroad')
        is_fraud[high_amount_abroad] = 1
        
        odd_time_high_amt = (time_of_day < 5) & (amount > 3000)
        is_fraud[odd_time_high_amt] = 1
        
        unknown_receiver = (receiver == 'UnknownPayee') & (amount > 2000)
        is_fraud[unknown_receiver] = 1
        
        # Add random noise fraud
        random_fraud = rng.random(amount.shape[0]) < 0.05
        is_fraud[random_fraud] = 1
        
        df = pd.DataFrame({
            'amount': amount,
            'device_type': device,
            'location': location,
            'receiver': receiver,
            'time_of_day': time_of_day,
            'is_fraud': is_fraud
        })
        return df

    def _train(self):
        df = self._synthetic_dataset()
        self.le_receiver.fit(df.receiver)
        self.le_device.fit(df.device_type)
        self.le_location.fit(df.location)
        
        X = self._prepare_features(df)
        X_scaled = self.scaler.fit_transform(X)

        self.iforest.fit(X_scaled)
        self.rf.fit(X_scaled, df.is_fraud)

    def _prepare_features(self, df):
        receiver_enc = self.le_receiver.transform(df.receiver)
        device_enc = self.le_device.transform(df.device_type)
        location_enc = self.le_location.transform(df.location)
        
        # Normalize amount to 0-1 range
        amount_norm = df.amount / 20000
        
        # Hour risk (0-5 is risky, 22-23 is risky)
        hour_risk = np.where((df.time_of_day < 5) | (df.time_of_day > 22), 1, 0)
        
        X = np.column_stack([
            amount_norm,
            receiver_enc,
            device_enc,
            location_enc,
            df.time_of_day / 24,
            hour_risk
        ])
        return X

    def score(self, input_data: dict):
        df = pd.DataFrame([input_data])
        
        # Handle new receiver
        if input_data['receiver'] not in self.le_receiver.classes_:
            self.le_receiver.classes_ = np.append(self.le_receiver.classes_, input_data['receiver'])
        # Handle new device
        if input_data['device_type'] not in self.le_device.classes_:
            self.le_device.classes_ = np.append(self.le_device.classes_, input_data['device_type'])
        
        df.receiver = df.receiver.astype(str)
        df.device_type = df.device_type.astype(str)
        
        receiver_enc = self.le_receiver.transform(df.receiver)
        device_enc = self.le_device.transform(df.device_type)
        location_enc = self.le_location.transform([input_data.get('location', 'unknown')])[0]
        
        amount_norm = input_data['amount'] / 20000
        hour_risk = 1 if (input_data['time_of_day'] < 5 or input_data['time_of_day'] > 22) else 0
        
        X = np.column_stack([
            [amount_norm],
            [receiver_enc],
            [device_enc],
            [location_enc],
            [input_data['time_of_day'] / 24],
            [hour_risk]
        ])
        
        X_scaled = self.scaler.transform(X)
        
        # Get anomaly score (normalized)
        iso_decision = self.iforest.decision_function(X_scaled)[0]
        iso_score = -iso_decision / 0.75  # Normalize based on typical range
        iso_score = np.clip(iso_score, 0, 1)
        
        # Get fraud probability
        fraud_prob = self.rf.predict_proba(X_scaled)[0][1]
        
        # Calculate composite risk with probabilistic weighting
        risk_probability = (iso_score * 0.35) + (fraud_prob * 0.65)
        risk_probability = np.clip(risk_probability, 0, 1)
        
        # Convert to 0-100 scale with better distribution
        risk_score = int(risk_probability * 100)
        
        return {
            'risk_score': risk_score,
            'risk_probability': float(risk_probability),
            'anomaly_score': float(iso_score),
            'fraud_probability': float(fraud_prob),
            'confidence': float(max(iso_score, fraud_prob))
        }

fraud_model = FraudModel()
