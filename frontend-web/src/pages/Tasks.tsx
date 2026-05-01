import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { TaskDto, TaskStatus } from '../types';

const STATUS_FILTERS: (TaskStatus | 'ALL')[] = ['ALL', 'UPCOMING', 'DUE', 'OVERDUE', 'COMPLETE', 'SKIPPED'];

const STATUS_BADGE: Record<TaskStatus, string> = {
  UPCOMING: 'bg-gray-100 text-gray-700',
  DUE: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-700',
  COMPLETE: 'bg-green-100 text-green-700',
  SKIPPED: 'bg-gray-100 text-gray-500 line-through',
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
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => { logout(); navigate('/login'); }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}>
              {f}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-500">Loading…</p>}
        {!loading && tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No tasks in this filter. Try "ALL".
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-md transition p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[t.status]}`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-400">priority {t.priority}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{t.title}</h3>
                  {t.description && <p className="text-sm text-gray-600 truncate mt-1">{t.description}</p>}
                </div>
                <div className="text-right text-sm text-gray-500 whitespace-nowrap">
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-6">
          <Link to="/tasks" className="text-xl font-bold text-gray-900">Helfa</Link>
          <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">My Journey</Link>
          <Link to="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">Marketplace</Link>
          <Link to="/offices" className="text-sm text-gray-600 hover:text-gray-900">Offices</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
