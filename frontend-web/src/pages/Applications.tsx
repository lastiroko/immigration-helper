import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { visaAPI } from '../services/api';
import type { VisaApplication, ApplicationStatus } from '../types';
import { STATUS_BADGE, formatDate, visaIcon, visaLabel } from '../lib/applicationDisplay';

export default function Applications() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    visaAPI.getMe()
      .then(res => setApplications(res.data))
      .catch(() => setError('Failed to load applications. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const counts = applications.reduce<Partial<Record<ApplicationStatus, number>>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
              >
                ← Dashboard
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visa Applications</h2>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
          >
            + New Application
          </Link>
        </div>

        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as ApplicationStatus[]).map(s => (
              <div key={s} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{counts[s] ?? 0}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[s].cls}`}>
                  {STATUS_BADGE[s].label}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-gray-400 text-sm">Loading your applications…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-14 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Start your visa journey by creating your first application. We'll help you track every step.
            </p>
            <Link
              to="/applications/new"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create First Application
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const status = STATUS_BADGE[app.status];
              return (
                <Link
                  key={app.id}
                  to={`/applications/${app.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-xl p-3 text-2xl shrink-0">{visaIcon(app.visaType)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{visaLabel(app.visaType)}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Created {formatDate(app.createdAt)}</p>
                      {app.notes && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1 max-w-xs">{app.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium shrink-0 ${status.cls}`}>
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
