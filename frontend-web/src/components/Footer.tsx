import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-2">
        <span>© {new Date().getFullYear()} Helfa</span>
        <div className="flex gap-4">
          <Link to="/imprint" className="hover:text-gray-900">Imprint</Link>
          <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-900">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
