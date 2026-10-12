# SecurePay AI

SecurePay AI is a full-stack real-time fraud prevention platform for banking and UPI transactions.

## Features
- Live transaction fraud dashboard
- AI risk scoring (Isolation Forest + Random Forest)
- Transaction simulator with instant analysis
- Smart OTP protection alerts
- QR code scanner simulation
- Behavior analysis and alert log
- Truecaller-style scam receiver detection

## Tech stack
- Frontend: React, Tailwind CSS, Recharts
- Backend: FastAPI, sklearn
- DB: In-memory mock (extendable to MongoDB/PostgreSQL)

## Folder structure
- `backend/` : FastAPI server code
- `frontend/` : React app code

## Run locally
### Backend
1. `cd backend`
2. `python -m venv .venv`
3. Windows: `.venv\Scripts\activate` / Mac/Linux: `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Deployment
- Backend: Dockerize from `backend/app/main.py`; deploy to Cloud Run, AWS ECS, etc.
- Frontend: Build with `npm run build` and host on Vercel/Netlify.

## Notes
- `fraud_model.py` generates synthetic data and trains dummy models for demonstration.
- Replace in-memory DB with MongoDB/PostgreSQL for production.
