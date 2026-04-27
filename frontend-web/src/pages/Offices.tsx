import { useState, useEffect } from 'react';
import { officeAPI } from '../services/api';
import type { ImmigrationOffice } from '../types';

export default function Offices() {
  const [offices, setOffices] = useState<ImmigrationOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');

  const searchOffices = async () => {
    setLoading(true);
    try {
      const response = await officeAPI.search({ city: city || undefined });
      setOffices(response.data);
    } catch (error) {
      console.error('Failed to fetch offices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchOffices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Immigration Offices</h1>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search by city (e.g., Berlin, Munich)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchOffices}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offices.map((office) => (
            <div key={office.id} className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">{office.name}</h3>
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

        {offices.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-8">
            No offices found. Try a different search.
          </p>
        )}
      </div>
    </div>
  );
}