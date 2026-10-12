import { Link } from 'react-router-dom';
import { FaLock, FaRocket, FaChartBar, FaShieldAlt } from 'react-icons/fa';

export default function Landing() {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div>
          <p className="text-cyan-400 font-semibold uppercase tracking-wide">SecurePay AI</p>
          <h1 className="text-4xl font-bold text-white leading-tight">Real-time fraud prevention for banking & UPI.</h1>
          <p className="mt-4 text-slate-300">Detect suspicious payment behavior before completion with AI scoring, alerts, and truecaller-like scam receiver protection.</p>
          <Link to="/simulator" className="inline-flex mt-6 items-center px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-semibold">
            Try Demo
          </Link>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6"> 
          <div className="bg-slate-900 rounded-xl p-5">
            <h3 className="text-cyan-300 font-semibold">Live Transaction Feed</h3>
            <ul className="mt-3 space-y-2 text-slate-200">
              <li>UPI ₹3,200 to Merchant — <span className="text-green-300">Safe</span></li>
              <li>NEFT ₹13,000 to UnknownPayee — <span className="text-amber-300">Suspicious</span></li>
              <li>IMPS ₹25,000 to AbroadReceiver — <span className="text-red-400">Blocked</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: FaRocket, title: 'Instant Risk Score', desc: '0-100 AI score with status and anomaly details.' },
          { icon: FaShieldAlt, title: 'OTP Protection', desc: 'Detect phishing OTP patterns and rapid entry.' },
          { icon: FaChartBar, title: 'Behavior Insights', desc: 'Timing, device, and location risk analytics.' },
          { icon: FaLock, title: 'Scam Receiver Check', desc: 'Truecaller-style blacklist and alerts.' }
        ].map((item, index) => (
          <article key={index} className="card">
            <item.icon className="text-cyan-400 text-2xl" />
            <h4 className="mt-3 font-semibold text-white">{item.title}</h4>
            <p className="mt-1 text-slate-300 text-sm">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
