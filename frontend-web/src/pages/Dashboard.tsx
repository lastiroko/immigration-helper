import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from './Tasks';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const tier = user?.subscriptionTier ?? 'FREE';

  return (
    <div className="min-h-screen bg-helfa-cream">
      <Header onLogout={onLogout} />

      {/* hero strip */}
      <section className="bg-helfa-dark text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <p className="text-xs uppercase tracking-[0.2em] text-helfa-lime">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </p>
            <h1 className="display-headline text-5xl lg:text-6xl mt-3">
              YOUR HELFA<br /><span className="text-helfa-lime">DASHBOARD</span>
            </h1>
            <p className="mt-4 text-white/70 max-w-xl">
              Pick up where you left off — your tasks, your offices, and the marketplace partners we've vetted for you.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
            <span className="badge-pill bg-helfa-lime text-helfa-ink">PLAN · {tier}</span>
            <span className="badge-pill bg-white/10 text-white/80">DE · Munich</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        <ActionCard
          n="01"
          title="My journey"
          body="Open your task list — what's due, what's next, and what's blocked."
          cta="Open tasks"
          onClick={() => navigate('/tasks')}
        />
        <ActionCard
          n="02"
          title="Marketplace"
          body="Vetted banks, insurance, housing, translation and language partners."
          cta="Browse partners"
          onClick={() => navigate('/marketplace')}
        />
        <ActionCard
          n="03"
          title="Offices"
          body="Bürgeramt, Ausländerbehörde, Finanzamt — booking links and phone numbers."
          cta="Find an office"
          onClick={() => navigate('/offices')}
        />
      </div>
    </div>
  );
}

function ActionCard({
  n, title, body, cta, onClick,
}: {
  n: string; title: string; body: string; cta: string; onClick: () => void;
}) {
  return (
    <div className="surface-card p-6 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-display text-helfa-slate text-sm">{n}</span>
        <span className="h-9 w-9 rounded-full bg-helfa-lime grid place-items-center text-helfa-ink">↗</span>
      </div>
      <h3 className="mt-6 font-bold text-lg uppercase tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-helfa-slate leading-relaxed flex-1">{body}</p>
      <button onClick={onClick} className="btn-pill-dark mt-6 self-start text-sm !py-2.5 !px-5">
        {cta} →
      </button>
    </div>
  );
}
