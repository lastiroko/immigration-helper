import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { visaAPI } from '../services/api';

const VISA_TYPES = [
  { value: 'STUDENT',   label: 'Student Visa',        icon: '🎓', desc: 'For university or college enrollment in Germany' },
  { value: 'WORK',      label: 'Work Visa',            icon: '💼', desc: 'Standard employment work permit' },
  { value: 'BLUE_CARD', label: 'EU Blue Card',         icon: '🔵', desc: 'For highly qualified non-EU professionals' },
  { value: 'FAMILY',    label: 'Family Reunion Visa',  icon: '👨‍👩‍👧', desc: 'Join your family members residing in Germany' },
];

export default function NewApplication() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visaType, setVisaType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !visaType) return;
    setError('');
    setLoading(true);
    try {
      await visaAPI.create({ visaType, notes: notes.trim() || undefined });
      navigate('/applications');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">New Visa Application</h2>
          <p className="text-gray-500 mt-1">Choose your visa type and provide any relevant details.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Visa Type</h3>
            <p className="text-sm text-gray-400 mb-4">Select the visa that matches your situation</p>
            <div className="space-y-3">
              {VISA_TYPES.map(vt => (
                <label
                  key={vt.value}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition select-none ${
                    visaType === vt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="visaType"
                    value={vt.value}
                    checked={visaType === vt.value}
                    onChange={() => setVisaType(vt.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl shrink-0">{vt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${visaType === vt.value ? 'text-blue-700' : 'text-gray-900'}`}>
                      {vt.label}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{vt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    visaType === vt.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {visaType === vt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Notes</h3>
            <p className="text-sm text-gray-400 mb-4">Optional — current visa status, specific circumstances, questions</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Currently on a tourist visa, enrolled at TU Berlin starting October 2025…"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!visaType || loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              {loading ? 'Creating…' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
