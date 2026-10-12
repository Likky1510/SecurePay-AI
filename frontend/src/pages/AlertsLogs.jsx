import { useEffect, useState } from 'react';
import { getAlerts } from '../api/securepayApi';

export default function AlertsLogs() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await getAlerts();
    setAlerts(res.data);
  };

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alerts & Logs</h1>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900">Refresh</button>
      </header>
      <div className="card">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length ? alerts.map((alert)=> (
              <tr key={alert.alert_id} className="border-t border-slate-700">
                <td className="px-3 py-2">{new Date(alert.created_at).toLocaleString()}</td>
                <td className={`px-3 py-2 font-semibold ${alert.level === 'critical' ? 'text-rose-400' : 'text-amber-300'}`}>{alert.level}</td>
                <td className="px-3 py-2">{alert.message}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="px-3 py-4 text-slate-300">No alerts yet. Simulate transactions to generate logs.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
