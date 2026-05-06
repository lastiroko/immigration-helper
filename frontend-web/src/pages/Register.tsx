import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell, Field } from './Login';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      headline={<>BUILD YOUR<br /><span className="text-helfa-lime">HELFA PLAN</span></>}
      tagline="Six questions, one personalised checklist. Free to start."
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-helfa-ink/15 bg-white focus:ring-2 focus:ring-helfa-lime focus:border-transparent outline-none"
            placeholder="Aisha Adekunle"
          />
        </Field>

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
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-helfa-ink/15 bg-white focus:ring-2 focus:ring-helfa-lime focus:border-transparent outline-none"
            placeholder="••••••••"
          />
          <span className="block text-xs text-helfa-slate mt-1">At least 6 characters.</span>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="btn-pill-lime w-full"
        >
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p className="text-center text-sm text-helfa-slate mt-7">
        Already have one?{' '}
        <Link to="/login" className="font-semibold text-helfa-ink hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-helfa-slate/70 mt-6">
        By creating an account you agree to our{' '}
        <Link to="/terms" className="underline hover:text-helfa-ink">Terms</Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline hover:text-helfa-ink">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}
