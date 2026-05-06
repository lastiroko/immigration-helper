import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-helfa-ink text-white border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row justify-between items-center text-sm gap-3">
        <div className="flex items-center gap-2 text-white/70">
          <span className="h-6 w-6 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink font-display text-sm">H</span>
          <span>© {new Date().getFullYear()} Helfa</span>
        </div>
        <div className="flex gap-5 text-white/60">
          <Link to="/imprint" className="hover:text-white">Imprint</Link>
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
