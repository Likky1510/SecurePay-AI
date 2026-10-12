import { useState } from 'react';
import { simulateTransaction, checkOTP, receiverCheck } from '../api/securepayApi';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

const initialForm = {
  amount: 2500,
  receiver: 'Friend',
  qr_code: 'upi://pay?pa=merchant@test',
  device_type: 'mobile',
  location: 'home',
  time_of_day: 14
};

const RiskGauge = ({ score }) => {
  let color = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/20';
  if (score >= 35 && score < 70) {
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/20';
  } else if (score >= 70) {
    color = 'text-rose-400';
    bgColor = 'bg-rose-500/20';
  }
  
  return (
    <div className={`text-center p-6 rounded-lg ${bgColor}`}>
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-slate-300 text-sm mt-2">Risk Score / 100</div>
      <div className={`mt-3 px-4 py-1 rounded-full text-sm font-semibold inline-block ${
        score < 35 ? 'bg-emerald-500/30 text-emerald-300' : 
        score < 70 ? 'bg-amber-500/30 text-amber-300' : 
        'bg-rose-500/30 text-rose-300'
      }`}>
        {score < 35 ? '✓ Safe' : score < 70 ? '⚠ Suspicious' : '✗ Blocked'}
      </div>
    </div>
  );
};

export default function Simulator() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [otpAlerts, setOtpAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eq = await receiverCheck({ receiver: form.receiver });
      if (eq.data.blocked) {
        setResult({
          risk_score: 99,
          status: 'Blocked',
          reasons: ['❌ Receiver is flagged by scam list']
        });
        setOtpAlerts([]);
        return;
      }
      const res = await simulateTransaction(form);
      setResult(res.data);
      
      const otp = await checkOTP({
        otp_entry_time_ms: Math.random() * 25000,
        expected_otp_lifetime_ms: 20000,
        source: 'sms'
      });
      setOtpAlerts(otp.data.alerts);
    } catch (error) {
      console.error(error);
      setResult({ risk_score: 0, status: 'Error', reasons: ['Failed to analyze'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">Transaction Simulator</h1>
      <div className="grid gap-5 md:grid-cols-2">
        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Amount (₹)</label>
            <input type="number" name="amount" min="1" value={form.amount} onChange={(e)=>setForm({ ...form, amount: Number(e.target.value) })} className="input w-full" />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Receiver Name</label>
            <input name="receiver" value={form.receiver} onChange={(e)=>setForm({ ...form, receiver: e.target.value })} placeholder="e.g., Friend, ScamPayee" className="input w-full" />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">QR Code Data</label>
            <input name="qr_code" value={form.qr_code} onChange={(e)=>setForm({ ...form, qr_code: e.target.value })} className="input w-full text-xs" />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Device Type</label>
            <select value={form.device_type} onChange={(e)=>setForm({ ...form, device_type: e.target.value })} className="input w-full">
              <option value="mobile">📱 Mobile</option>
              <option value="desktop">💻 Desktop</option>
              <option value="tablet">📱 Tablet</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Location</label>
            <select value={form.location} onChange={(e)=>setForm({ ...form, location: e.target.value })} className="input w-full">
              <option value="home">🏠 Home</option>
              <option value="work">🏢 Work</option>
              <option value="station">🚉 Station</option>
              <option value="abroad">✈️ Abroad</option>
              <option value="unknown">❓ Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Time of Day (0-23)</label>
            <input type="number" name="time_of_day" min="0" max="23" value={form.time_of_day} onChange={(e)=>setForm({ ...form, time_of_day: Number(e.target.value)})} className="input w-full" />
            <p className="text-xs text-slate-400 mt-1">Early morning (0-4) or late night (22-23) raises risk</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 text-black font-semibold transition">
            {loading ? 'Analyzing...' : 'Run Fraud Analysis'}
          </button>
        </form>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-white">Fraud Risk Analysis</h2>
          {result ? (
            <div className="space-y-4">
              <RiskGauge score={result.risk_score} />
              
              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-white mb-3">📋 Risk Factors</h3>
                <ul className="space-y-2">
                  {result.reasons && result.reasons.length > 0 ? (
                    result.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-emerald-300">✓ No risk factors detected</li>
                  )}
                </ul>
              </div>

              {otpAlerts.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h3 className="font-semibold text-white mb-2">🔐 OTP Behavior</h3>
                  <ul className="space-y-1">
                    {otpAlerts.map((alert, i) => (
                      <li key={i} className="text-amber-300 text-sm flex items-center gap-2">
                        <FaExclamationCircle /> {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 py-8 text-center">Fill the form and submit to see fraud analysis results.</p>
          )}
        </div>
      </div>
    </section>
  );
}
