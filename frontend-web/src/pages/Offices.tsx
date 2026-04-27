import { useState, useEffect, useMemo } from 'react';
import { officeAPI } from '../services/api';
import type { ImmigrationOffice } from '../types';

const TYPE_LABEL: Record<ImmigrationOffice['type'], string> = {
  AUSLAENDERBEHORDE: 'Foreigners Office',
  BAMF: 'BAMF',
  EMBASSY: 'Embassy',
};

export default function Offices() {
  const [offices, setOffices] = useState<ImmigrationOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    officeAPI.search()
      .then(res => setOffices(res.data))
      .catch(() => setError('Failed to load offices. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const cityOptions = useMemo(
    () => Array.from(new Set(offices.map(o => o.city))).sort((a, b) => a.localeCompare(b)),
    [offices],
  );

  const typeOptions = useMemo(
    () => Array.from(new Set(offices.map(o => o.type))).sort((a, b) => a.localeCompare(b)),
    [offices],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return offices.filter(o => {
      if (q && !o.name.toLowerCase().includes(q)) return false;
      if (cityFilter && o.city !== cityFilter) return false;
      if (typeFilter && o.type !== typeFilter) return false;
      return true;
    });
  }, [offices, debouncedSearch, cityFilter, typeFilter]);

  const hasActiveFilter = Boolean(searchInput || cityFilter || typeFilter);

  const clearFilters = () => {
    setSearchInput('');
    setCityFilter('');
    setTypeFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Immigration Offices</h1>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="office-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search by name
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  🔍
                </span>
                <input
                  id="office-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g., Berlin Mitte"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:w-56">
              <label htmlFor="office-city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                id="office-city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All cities</option>
                {cityOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="md:w-56">
              <label htmlFor="office-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="office-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All types</option>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline self-start md:self-end md:pb-2"
              >
                Clear filters
              </button>
            )}
          </div>

          <p aria-live="polite" className="text-sm text-gray-500 mt-4">
            {loading
              ? 'Loading offices…'
              : `Showing ${filtered.length} of ${offices.length} office${offices.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-gray-400 text-sm">Loading offices…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-14 text-center">
            <div className="text-6xl mb-4">🔎</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {offices.length === 0 ? 'No offices found' : 'No offices match your filters'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {offices.length === 0
                ? 'There are no offices to display right now.'
                : 'Try adjusting your search, city, or type filter.'}
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((office) => (
              <div key={office.id} className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{office.name}</h3>
                  <span className="shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {TYPE_LABEL[office.type]}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{office.city}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Address:</strong> {office.address}</p>
                  {office.phone && <p><strong>Phone:</strong> {office.phone}</p>}
                  {office.email && <p><strong>Email:</strong> {office.email}</p>}
                  {office.website && (
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
