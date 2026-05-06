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
    <div className="min-h-screen bg-helfa-cream">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-5xl mx-auto px-5 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-helfa-slate">Authorities</p>
        <h1 className="display-headline text-4xl mt-1">OFFICES</h1>
        <p className="text-helfa-slate mt-3 max-w-2xl">
          Bürgerämter, Ausländerbehörden, Finanzämter and other authorities Helfa supports — with booking links and phone numbers.
        </p>

        <div className="flex flex-wrap gap-2 my-7">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                city === c
                  ? 'bg-helfa-ink text-helfa-lime'
                  : 'bg-white text-helfa-slate border border-helfa-ink/10 hover:border-helfa-ink'
              }`}
            >
              {c === 'ALL' ? 'All cities' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p className="text-helfa-slate">Loading…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offices.map((o) => (
            <div key={o.id} className="surface-card p-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge-pill bg-helfa-stone text-helfa-ink">{o.type}</span>
                {o.cityName && <span className="text-xs text-helfa-slate">{o.cityName}</span>}
              </div>
              <h3 className="font-bold text-helfa-ink">{o.name}</h3>
              <p className="text-sm text-helfa-slate mt-1">{o.address}</p>
              <div className="flex gap-3 mt-4 text-sm flex-wrap">
                {o.bookingUrl && (
                  <a
                    href={o.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-helfa-ink hover:underline"
                  >
                    Book →
                  </a>
                )}
                {o.phone && <span className="text-helfa-slate">{o.phone}</span>}
              </div>
              {o.languagesSupported.length > 0 && (
                <p className="text-xs text-helfa-slate mt-3">
                  Languages: {o.languagesSupported.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
