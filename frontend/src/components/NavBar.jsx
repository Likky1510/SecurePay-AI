import { NavLink } from 'react-router-dom';
import { FaShieldAlt, FaHome, FaChartLine, FaQrcode, FaBell } from 'react-icons/fa';

const items = [
  { to: '/', icon: FaHome, title: 'Landing' },
  { to: '/dashboard', icon: FaChartLine, title: 'Dashboard' },
  { to: '/simulator', icon: FaShieldAlt, title: 'Simulator' },
  { to: '/qr-scanner', icon: FaQrcode, title: 'QR Scanner' },
  { to: '/alerts', icon: FaBell, title: 'Alerts' }
];

export default function NavBar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-cyan-400 text-xl" />
          <span className="text-lg font-bold tracking-tight">SecurePay AI</span>
        </div>
        <div className="flex space-x-3">
          {items.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-1 inline" /> {tab.title}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
