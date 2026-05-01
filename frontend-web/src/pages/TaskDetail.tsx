import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Tasks';
import type { TaskDto, UserJourney } from '../types';

interface DocSlot { type: string; satisfied: boolean; }

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDto | null>(null);
  const [journey, setJourney] = useState<UserJourney | null>(null);
  const [slots, setSlots] = useState<DocSlot[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function load() {
    if (!id) return;
    try {
      const r = await taskAPI.get(id);
      setTask(r.data.task);
      setJourney(r.data.journey);
      setSlots(r.data.requiredDocuments ?? []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Task not found');
    }
  }

  async function complete() {
    if (!task) return;
    setBusy(true);
    try {
      const r = await taskAPI.complete(task.id);
      setTask(r.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to mark complete');
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    if (!task) return;
    setBusy(true);
    try {
      const r = await taskAPI.skip(task.id);
      setTask(r.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to skip');
    } finally {
      setBusy(false);
    }
  }

  async function postpone(days: number) {
    if (!task) return;
    setBusy(true);
    try {
      const target = new Date();
      target.setDate(target.getDate() + days);
      const iso = target.toISOString().slice(0, 10);
      const r = await taskAPI.postpone(task.id, iso);
      setTask(r.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to postpone');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLogout={() => { logout(); navigate('/login'); }} />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>
          <Link to="/tasks" className="text-blue-600 hover:underline mt-4 inline-block">← back to tasks</Link>
        </div>
      </div>
    );
  }
  if (!task) return <p className="p-8 text-gray-500">Loading…</p>;

  const terminal = task.status === 'COMPLETE' || task.status === 'SKIPPED';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/tasks" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">← back</Link>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">{task.status}</span>
            <span className="text-xs text-gray-400">priority {task.priority}</span>
            {journey && <span className="text-xs text-gray-400">• {journey.type.replace(/_/g, ' ')}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
          {task.description && <p className="text-gray-700 leading-relaxed">{task.description}</p>}
          <div className="text-sm text-gray-500 mt-4">
            {task.dueAt
              ? <>Due <strong>{new Date(task.dueAt).toLocaleDateString()}</strong></>
              : 'Blocked — waiting for upstream task to complete'}
            {task.postponedUntil && <> • postponed to {new Date(task.postponedUntil).toLocaleDateString()}</>}
          </div>
        </div>

        {slots.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Required documents</h3>
            <ul className="space-y-1 text-sm">
              {slots.map((s, i) => (
                <li key={i} className={s.satisfied ? 'text-green-700' : 'text-gray-600'}>
                  {s.satisfied ? '✓' : '○'} {s.type}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!terminal && (
          <div className="flex flex-wrap gap-3">
            <button onClick={complete} disabled={busy}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400">
              ✓ Mark complete
            </button>
            <button onClick={() => postpone(7)} disabled={busy}
                    className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100">
              Postpone 1 week
            </button>
            <button onClick={skip} disabled={busy}
                    className="bg-white border border-gray-300 text-gray-500 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100">
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
