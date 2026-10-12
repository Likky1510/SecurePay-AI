import { useState } from 'react';
import { checkQRCode } from '../api/securepayApi';

export default function QRScanner() {
  const [qrData, setQrData] = useState('upi://pay?pa=merchant@test&pn=Merchant');
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    const res = await checkQRCode({ qr_data: qrData });
    setResult(res.data);
  };

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">QR Code Scanner (UI Simulation)</h1>
      <div className="grid gap-5 md:grid-cols-2">
        <form onSubmit={handleScan} className="card space-y-4">
          <label className="block text-slate-300">QR Code Payload</label>
          <textarea value={qrData} onChange={(e)=>setQrData(e.target.value)} rows={5} className="input w-full" />
          <button className="py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black w-full">Scan QR</button>
        </form>

        <div className="card">
          <h2 className="text-xl font-semibold mb-2">QR Verdict</h2>
          {result ? (
            <div className="space-y-2">
              <p>Valid: <strong>{String(result.valid)}</strong></p>
              <ul className="list-disc list-inside text-slate-200">
                {result.warnings.map((w, idx)=> <li key={idx}>{w}</li>)}
              </ul>
            </div>
          ) : (
            <p className="text-slate-400">Enter or upload a QR string to scan for fake/untrusted patterns.</p>
          )}
        </div>
      </div>
    </section>
  );
}
