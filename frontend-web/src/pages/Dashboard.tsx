import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">
              Immigration Helper
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} ({user?.subscriptionTier})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Find Offices</h3>
            <p className="text-gray-600 mb-4">
              Search immigration offices in Germany
            </p>
            <button
              onClick={() => navigate('/offices')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Search Offices
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Visa Applications</h3>
            <p className="text-gray-600 mb-4">
              Manage your visa applications
            </p>
            <button
              onClick={() => navigate('/applications')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Applications
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-gray-600 mb-4">
              Upload and manage documents
            </p>
            <button
              onClick={() => navigate('/documents')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}