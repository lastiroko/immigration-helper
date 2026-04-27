import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { visaAPI } from '../services/api';
import type { VisaApplication, StatusHistoryEntry } from '../types';
import {
  STATUS_BADGE,
  formatDate,
  formatDateTime,
  relativeTime,
  visaIcon,
  visaLabel,
} from '../lib/applicationDisplay';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ok'; application: VisaApplication; history: StatusHistoryEntry[] }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  const handleLogout = () => { logout(); navigate('/login'); };

  const load = () => {
    if (!id) return;
    setState({ kind: 'loading' });
    Promise.all([visaAPI.getById(id), visaAPI.getHistory(id)])
      .then(([appRes, histRes]) =>
        setState({ kind: 'ok', application: appRes.data, history: histRes.data })
      )
      .catch((err: any) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) setState({ kind: 'not-found' });
        else setState({ kind: 'error', message: err.response?.data?.message || 'Failed to load application.' });
      });
  };

  useEffect(load, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/applications')}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
              >
                ← Applications
              </button>
              <span className="text-gray-200">|</span>
              <h1 className="text-xl font-bold text-gray-800">Immigration Helper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.kind === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-gray-400 text-sm">Loading application…</p>
          </div>
        )}

        {state.kind === 'not-found' && (
          <div className="bg-white rounded-2xl shadow p-14 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Application not found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              This application doesn't exist or you don't have access to it.
            </p>
            <Link
              to="/applications"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Back to Applications
            </Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-6">{state.message}</p>
            <button
              onClick={load}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {state.kind === 'ok' && (
          <DetailContent application={state.application} history={state.history} />
        )}
      </div>
    </div>
  );
}

function DetailContent({ application, history }: { application: VisaApplication; history: StatusHistoryEntry[] }) {
  const status = STATUS_BADGE[application.status];

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-3xl shrink-0">{visaIcon(application.visaType)}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{visaLabel(application.visaType)}</h2>
              <p className="text-sm text-gray-400 mt-1">
                Created {formatDate(application.createdAt)} · Updated {relativeTime(application.updatedAt)}
              </p>
            </div>
          </div>
          <span className={`self-start px-3 py-1.5 rounded-full text-sm font-medium ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </header>

      {(application.notes || application.office) && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Details</h3>
          <dl className="space-y-4 text-sm">
            {application.office && (
              <div>
                <dt className="text-gray-400 text-xs uppercase tracking-wide mb-1">Immigration office</dt>
                <dd className="text-gray-700">{application.office.name} · {application.office.city}</dd>
              </div>
            )}
            {application.notes && (
              <div>
                <dt className="text-gray-400 text-xs uppercase tracking-wide mb-1">Notes</dt>
                <dd className="text-gray-700 whitespace-pre-wrap">{application.notes}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Status timeline</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No history available.</p>
        ) : (
          <Timeline history={history} />
        )}
      </section>
    </div>
  );
}

function Timeline({ history }: { history: StatusHistoryEntry[] }) {
  return (
    <ol className="relative">
      <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
      {history.map((entry, i) => {
        const toBadge = STATUS_BADGE[entry.toStatus];
        const fromBadge = entry.fromStatus ? STATUS_BADGE[entry.fromStatus] : null;
        const isFirst = !entry.fromStatus;
        return (
          <li key={entry.id} className={`relative pl-8 ${i < history.length - 1 ? 'pb-6' : ''}`}>
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ring-4 ring-white ${toBadge.dot}`}
            />
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {isFirst ? (
                <>
                  <span className="text-sm font-medium text-gray-700">Created as</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${toBadge.cls}`}>
                    {toBadge.label}
                  </span>
                </>
              ) : (
                <>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${fromBadge!.cls}`}>
                    {fromBadge!.label}
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${toBadge.cls}`}>
                    {toBadge.label}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">
              by <span className="text-gray-700">{entry.changedByEmail}</span>
              {' · '}
              <span title={formatDateTime(entry.changedAt)}>{relativeTime(entry.changedAt)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.changedAt)}</p>
            {entry.note && (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mt-2 whitespace-pre-wrap">
                {entry.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
