import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { officeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Tasks';
import type { OfficeDto } from '../types';

const CITIES = ['ALL', 'munich', 'berlin', 'stuttgart'] as const;

export default function Offices() {
  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<typeof CITIES[number]>('ALL');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [city]);

  async function load() {
    setLoading(true);
    try {
      const r = city === 'ALL'
        ? await officeAPI.list()
        : await officeAPI.nearest({ city, limit: 50 });
      setOffices(r.data);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Offices</h1>
        <p className="text-gray-600 mb-6">Bürgerämter, Ausländerbehörden, Finanzämter and other authorities Helfa supports.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {CITIES.map((c) => (
            <button key={c} onClick={() => setCity(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      city === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}>
              {c === 'ALL' ? 'All cities' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Loading…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offices.map((o) => (
            <div key={o.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{o.type}</span>
                {o.cityName && <span className="text-xs text-gray-500">{o.cityName}</span>}
              </div>
              <h3 className="font-semibold text-gray-900">{o.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{o.address}</p>
              <div className="flex gap-3 mt-3 text-sm">
                {o.bookingUrl && (
                  <a href={o.bookingUrl} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">Book →</a>
                )}
                {o.phone && <span className="text-gray-500">{o.phone}</span>}
              </div>
              {o.languagesSupported.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">Languages: {o.languagesSupported.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
