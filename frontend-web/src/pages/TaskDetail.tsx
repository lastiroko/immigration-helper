import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Tasks';
import type { TaskDto, UserJourney } from '../types';

interface DocSlot { type: string; satisfied: boolean; }

const STATUS_BADGE: Record<string, string> = {
  UPCOMING: 'bg-helfa-stone text-helfa-ink',
  DUE: 'bg-amber-200 text-amber-900',
  OVERDUE: 'bg-red-100 text-red-700',
  COMPLETE: 'bg-helfa-lime text-helfa-ink',
  SKIPPED: 'bg-helfa-stone text-helfa-slate line-through',
};

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
      <div className="min-h-screen bg-helfa-cream">
        <Header onLogout={() => { logout(); navigate('/login'); }} />
        <div className="max-w-3xl mx-auto px-5 py-10">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>
          <Link to="/tasks" className="text-helfa-ink hover:underline mt-4 inline-block text-sm">← back to tasks</Link>
        </div>
      </div>
    );
  }
  if (!task) return <p className="p-8 text-helfa-slate">Loading…</p>;

  const terminal = task.status === 'COMPLETE' || task.status === 'SKIPPED';

  return (
    <div className="min-h-screen bg-helfa-cream">
      <Header onLogout={() => { logout(); navigate('/login'); }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/tasks" className="text-sm text-helfa-slate hover:text-helfa-ink mb-4 inline-block">← back</Link>

        <div className="surface-card p-7 mb-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`badge-pill ${STATUS_BADGE[task.status] ?? 'bg-helfa-stone text-helfa-ink'}`}>
              {task.status}
            </span>
            <span className="text-xs text-helfa-slate">priority {task.priority}</span>
            {journey && <span className="text-xs text-helfa-slate">• {journey.type.replace(/_/g, ' ')}</span>}
          </div>
          <h1 className="display-headline text-3xl mb-3">{task.title}</h1>
          {task.description && <p className="text-helfa-ink/80 leading-relaxed">{task.description}</p>}
          <div className="text-sm text-helfa-slate mt-5">
            {task.dueAt
              ? <>Due <strong className="text-helfa-ink">{new Date(task.dueAt).toLocaleDateString()}</strong></>
              : 'Blocked — waiting for upstream task to complete'}
            {task.postponedUntil && <> • postponed to {new Date(task.postponedUntil).toLocaleDateString()}</>}
          </div>
        </div>

        {slots.length > 0 && (
          <div className="surface-card p-7 mb-5">
            <h3 className="font-bold text-helfa-ink mb-4 uppercase tracking-tight">Required documents</h3>
            <ul className="space-y-2 text-sm">
              {slots.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ${
                    s.satisfied ? 'bg-helfa-lime text-helfa-ink' : 'bg-helfa-stone text-helfa-slate'
                  }`}>
                    {s.satisfied ? '✓' : '○'}
                  </span>
                  <span className={s.satisfied ? 'text-helfa-ink' : 'text-helfa-slate'}>{s.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!terminal && (
          <div className="flex flex-wrap gap-3">
            <button onClick={complete} disabled={busy} className="btn-pill-lime">
              ✓ Mark complete
            </button>
            <button onClick={() => postpone(7)} disabled={busy} className="btn-pill-outline">
              Postpone 1 week
            </button>
            <button onClick={skip} disabled={busy} className="btn-pill-outline !text-helfa-slate">
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
