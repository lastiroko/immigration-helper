import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Tasks';
import type { PartnerCard, PartnerCategory } from '../types';

const CATEGORIES: (PartnerCategory | 'ALL')[] = ['ALL', 'BANK', 'INSURANCE', 'HOUSING', 'TRANSLATION', 'LANGUAGE', 'LEGAL', 'TAX'];

export default function Marketplace() {
  const [partners, setPartners] = useState<PartnerCard[]>([]);
  const [filter, setFilter] = useState<PartnerCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const r = await marketplaceAPI.list(filter === 'ALL' ? undefined : filter);
      setPartners(r.data);
    } finally { setLoading(false); }
  }

  async function click(slug: string) {
    try {
      const r = await marketplaceAPI.click(slug);
      window.open(r.data.redirectUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Fall through silently — the user can hit the partner site directly via detail page.
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600 mb-6">Vetted partners across the categories Helfa supports. Commission disclosed on every card.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filter === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}>
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Loading…</p>}
        {!loading && partners.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No partners in this category yet.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <span className="text-xs text-gray-500">{p.category}</span>
                </div>
                {p.rating != null && (
                  <span className="text-sm text-yellow-600">★ {Number(p.rating).toFixed(1)}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 italic mb-4 leading-snug">{p.commissionDisclosure}</p>
              <button onClick={() => click(p.slug)}
                      className="mt-auto bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
                Visit {p.name} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
