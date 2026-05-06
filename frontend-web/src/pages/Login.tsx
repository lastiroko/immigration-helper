import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      headline={<>SIGN IN TO<br /><span className="text-helfa-lime">HELFA</span></>}
      tagline="Pick up your plan exactly where you left it."
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-helfa-ink/15 bg-white focus:ring-2 focus:ring-helfa-lime focus:border-transparent outline-none"
            placeholder="your@email.com"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-helfa-ink/15 bg-white focus:ring-2 focus:ring-helfa-lime focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="btn-pill-dark w-full"
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <p className="text-center text-sm text-helfa-slate mt-7">
        New to Helfa?{' '}
        <Link to="/register" className="font-semibold text-helfa-ink hover:underline">
          Create an account
        </Link>
      </p>

      <div className="text-center text-xs text-helfa-slate/70 mt-8 space-x-3">
        <Link to="/" className="hover:text-helfa-ink">Home</Link>
        <span>·</span>
        <Link to="/imprint" className="hover:text-helfa-ink">Imprint</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-helfa-ink">Privacy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-helfa-ink">Terms</Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({
  eyebrow, headline, tagline, children,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-helfa-cream">
      {/* Left column — brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-helfa-dark text-white p-12 overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <span className="font-display uppercase text-helfa-deep/70 text-[18rem] -mr-10 leading-none select-none">
            HELFA
          </span>
        </div>
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink font-display text-base">H</span>
          <span className="font-display text-lg uppercase tracking-tightest">Helfa</span>
        </Link>

        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-helfa-lime">{eyebrow}</p>
          <h1 className="display-headline text-5xl xl:text-6xl mt-3">{headline}</h1>
          <p className="mt-4 text-white/70 max-w-sm">{tagline}</p>
        </div>

        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} Helfa · Built in Munich</p>
      </aside>

      {/* Right column — form */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="h-7 w-7 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink font-display text-base">H</span>
            <span className="font-display text-lg uppercase tracking-tightest text-helfa-ink">Helfa</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-helfa-slate mb-1.5">{label}</span>
      {children}
    </label>
  );
}
