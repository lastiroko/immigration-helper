import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { TaskDto, TaskStatus } from '../types';

const STATUS_FILTERS: (TaskStatus | 'ALL')[] = ['ALL', 'UPCOMING', 'DUE', 'OVERDUE', 'COMPLETE', 'SKIPPED'];

const STATUS_BADGE: Record<TaskStatus, string> = {
  UPCOMING: 'bg-helfa-stone text-helfa-ink',
  DUE: 'bg-amber-200 text-amber-900',
  OVERDUE: 'bg-red-100 text-red-700',
  COMPLETE: 'bg-helfa-lime text-helfa-ink',
  SKIPPED: 'bg-helfa-stone text-helfa-slate line-through',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = filter === 'ALL' ? { size: 100 } : { status: filter, size: 100 };
      const r = await taskAPI.list(params);
      setTasks(r.data.items);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 404) navigate('/onboarding');
      else setError(err.response?.data?.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-helfa-cream">
      <Header onLogout={() => { logout(); navigate('/login'); }} />

      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-helfa-slate">My journey</p>
            <h1 className="display-headline text-4xl mt-1">YOUR TASKS</h1>
          </div>
          <span className="badge-pill bg-white text-helfa-ink border border-helfa-ink/10">
            {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                filter === f
                  ? 'bg-helfa-ink text-helfa-lime'
                  : 'bg-white text-helfa-slate border border-helfa-ink/10 hover:border-helfa-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {loading && <p className="text-helfa-slate">Loading…</p>}
        {!loading && tasks.length === 0 && (
          <div className="surface-card p-10 text-center text-helfa-slate">
            No tasks in this filter. Try "ALL".
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((t) => (
            <Link
              key={t.id}
              to={`/tasks/${t.id}`}
              className="block surface-card hover:shadow-lg transition p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge-pill ${STATUS_BADGE[t.status]}`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-helfa-slate">priority {t.priority}</span>
                  </div>
                  <h3 className="font-bold text-helfa-ink truncate">{t.title}</h3>
                  {t.description && <p className="text-sm text-helfa-slate truncate mt-1">{t.description}</p>}
                </div>
                <div className="text-right text-sm text-helfa-slate whitespace-nowrap">
                  {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : 'blocked'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  return (
    <nav className="bg-helfa-ink text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-7">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink font-display text-base">H</span>
            <span className="font-display text-lg uppercase tracking-tightest">Helfa</span>
          </Link>
          <Link to="/tasks" className="text-sm text-white/70 hover:text-white">My journey</Link>
          <Link to="/marketplace" className="text-sm text-white/70 hover:text-white">Marketplace</Link>
          <Link to="/offices" className="text-sm text-white/70 hover:text-white">Offices</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-white/60">{user?.name}</span>
          <button
            onClick={onLogout}
            className="text-xs uppercase tracking-wider text-white/60 hover:text-helfa-lime"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
