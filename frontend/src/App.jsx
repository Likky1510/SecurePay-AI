import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import QRScanner from './pages/QRScanner';
import AlertsLogs from './pages/AlertsLogs';

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/alerts" element={<AlertsLogs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
