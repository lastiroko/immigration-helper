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
    <div className="min-h-screen bg-helfa-cream">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-5xl mx-auto px-5 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-helfa-slate">Vetted partners</p>
        <h1 className="display-headline text-4xl mt-1">MARKETPLACE</h1>
        <p className="text-helfa-slate mt-3 max-w-2xl">
          Vetted partners across the categories Helfa supports. Commission disclosed on every card — no hidden incentives.
        </p>

        <div className="flex flex-wrap gap-2 my-7">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                filter === c
                  ? 'bg-helfa-ink text-helfa-lime'
                  : 'bg-white text-helfa-slate border border-helfa-ink/10 hover:border-helfa-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-helfa-slate">Loading…</p>}
        {!loading && partners.length === 0 && (
          <div className="surface-card p-10 text-center text-helfa-slate">
            No partners in this category yet.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((p) => (
            <div key={p.id} className="surface-card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-helfa-ink">{p.name}</h3>
                  <span className="text-xs uppercase tracking-wider text-helfa-slate">{p.category}</span>
                </div>
                {p.rating != null && (
                  <span className="text-sm text-helfa-ink">★ {Number(p.rating).toFixed(1)}</span>
                )}
              </div>
              <p className="text-xs text-helfa-slate italic mt-3 mb-5 leading-snug">{p.commissionDisclosure}</p>
              <button onClick={() => click(p.slug)} className="btn-pill-dark mt-auto self-start text-sm !py-2.5 !px-5">
                Visit {p.name} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
