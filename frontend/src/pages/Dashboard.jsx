import { useEffect, useState } from 'react';
import { getLiveTransactions, getBehavior, getAlerts } from '../api/securepayApi';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [behavior, setBehavior] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchInfo();
    const interval = setInterval(fetchInfo, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInfo = async () => {
    try {
      const [t, b, a] = await Promise.all([getLiveTransactions(), getBehavior(), getAlerts()]);
      setTransactions(t.data);
      setBehavior(b.data);
      setAlerts(a.data.slice(0, 8));
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate statistics
  const stats = {
    total: transactions.length,
    safe: transactions.filter(t => t.status === 'Safe').length,
    suspicious: transactions.filter(t => t.status === 'Suspicious').length,
    blocked: transactions.filter(t => t.status === 'Blocked').length,
    avgRisk: transactions.length > 0 ? Math.round(transactions.reduce((acc, t) => acc + t.risk_score, 0) / transactions.length) : 0,
    totalAmount: transactions.reduce((acc, t) => acc + t.amount, 0)
  };

  const chartData = transactions.slice(0, 15).map((tx, idx) => ({
    id: idx,
    risk: tx.risk_score,
    status: tx.status
  })).reverse();

  const statusDistribution = [
    { name: 'Safe', value: stats.safe, color: '#10b981' },
    { name: 'Suspicious', value: stats.suspicious, color: '#f59e0b' },
    { name: 'Blocked', value: stats.blocked, color: '#ef4444' }
  ];

  const riskBuckets = {
    'Low Risk (0-34)': transactions.filter(t => t.risk_score < 35).length,
    'Medium Risk (35-69)': transactions.filter(t => t.risk_score >= 35 && t.risk_score < 70).length,
    'High Risk (70+)': transactions.filter(t => t.risk_score >= 70).length
  };

  const riskBucketData = Object.entries(riskBuckets).map(([name, count]) => ({ name, count }));

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Real-Time Fraud Detection Dashboard</h1>
        <button onClick={fetchInfo} className="px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm">Refresh</button>
      </header>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <article className="card">
          <p className="text-xs uppercase text-slate-400 font-semibold">Live Transactions</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1">monitored</p>
        </article>
        <article className="card">
          <p className="text-xs uppercase text-slate-400 font-semibold">✓ Safe</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.safe}</p>
          <p className="text-xs text-emerald-300">{stats.total ? Math.round(stats.safe / stats.total * 100) : 0}%</p>
        </article>
        <article className="card">
          <p className="text-xs uppercase text-slate-400 font-semibold">⚠ Suspicious</p>
          <p className="text-3xl font-bold text-amber-400">{stats.suspicious}</p>
          <p className="text-xs text-amber-300">{stats.total ? Math.round(stats.suspicious / stats.total * 100) : 0}%</p>
        </article>
        <article className="card">
          <p className="text-xs uppercase text-slate-400 font-semibold">✗ Blocked</p>
          <p className="text-3xl font-bold text-rose-400">{stats.blocked}</p>
          <p className="text-xs text-rose-300">{stats.total ? Math.round(stats.blocked / stats.total * 100) : 0}%</p>
        </article>
        <article className="card">
          <p className="text-xs uppercase text-slate-400 font-semibold">Avg Risk</p>
          <p className="text-3xl font-bold text-cyan-400">{stats.avgRisk}</p>
          <p className="text-xs text-cyan-300">out of 100</p>
        </article>
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card h-80">
          <h3 className="text-lg font-semibold mb-3 text-white">📊 Risk Score Timeline</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="id" stroke="#cbd5e1" />
              <YAxis domain={[0, 100]} stroke="#cbd5e1" />
              <Tooltip />
              <Line type="monotone" dataKey="risk" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80">
          <h3 className="text-lg font-semibold mb-3 text-white">🎯 Transaction Status Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Breakdown & Behavior */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">📈 Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskBucketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-3 text-white">👥 User Behavior Analytics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-300 text-sm font-medium">Unusual Timing Detected</p>
              <p className={`text-lg font-bold ${behavior?.unusual_timing ? 'text-amber-400' : 'text-emerald-400'}`}>
                {behavior?.unusual_timing ? '⚠️ Yes' : '✓ Normal'}
              </p>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">High Amount Pattern</p>
              <p className={`text-lg font-bold ${behavior?.high_amount ? 'text-amber-400' : 'text-emerald-400'}`}>
                {behavior?.high_amount ? '⚠️ Detected' : '✓ Normal'}
              </p>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">New Device Alert</p>
              <p className={`text-lg font-bold ${behavior?.new_device ? 'text-amber-400' : 'text-emerald-400'}`}>
                {behavior?.new_device ? '⚠️ Yes' : '✓ No'}
              </p>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">Pattern Strength</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full" style={{ width: `${(behavior?.pattern_strength || 0) * 100}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{Math.round((behavior?.pattern_strength || 0) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transactions Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-white">📋 Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 text-xs uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-3 py-3">Txn ID</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Receiver</th>
                <th className="px-3 py-3">Risk Score</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 15).map((tx) => (
                <tr key={tx.transaction_id} className="border-t border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="px-3 py-3 text-slate-200 font-mono text-xs">{tx.transaction_id.slice(0, 8)}</td>
                  <td className="px-3 py-3 font-semibold">₹{tx.amount.toLocaleString()}</td>
                  <td className="px-3 py-3 text-slate-300">{tx.receiver}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${
                          tx.risk_score < 35 ? 'bg-emerald-500 w-1/4' :
                          tx.risk_score < 70 ? 'bg-amber-500 w-2/3' :
                          'bg-rose-500 w-full'
                        }`}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-200">{tx.risk_score}</span>
                    </div>
                  </td>
                  <td className={`px-3 py-3 font-bold ${
                    tx.status === 'Safe' ? 'text-emerald-300' :
                    tx.status === 'Suspicious' ? 'text-amber-300' :
                    'text-rose-400'
                  }`}>
                    {tx.status === 'Safe' ? '✓' : tx.status === 'Suspicious' ? '⚠' : '✗'} {tx.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-3 text-white">🚨 Recent Alerts</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.alert_id} className={`p-3 rounded-lg text-sm ${
                alert.level === 'critical' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50' :
                'bg-amber-500/20 text-amber-200 border border-amber-500/50'
              }`}>
                <div className="font-semibold">{alert.message}</div>
                <div className="text-xs opacity-75 mt-1">{new Date(alert.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
