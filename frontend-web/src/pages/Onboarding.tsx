import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingAPI } from '../services/api';
import type { FamilyStatus, OnboardingStepRequest, VisaPathway } from '../types';

const TOTAL = 6;

const VISA_PATHWAYS: { value: VisaPathway; label: string }[] = [
  { value: 'STUDENT', label: 'Student visa' },
  { value: 'BLUE_CARD', label: 'Blue Card / skilled worker' },
  { value: 'CHANCENKARTE', label: 'Chancenkarte (job-seeker)' },
  { value: 'FAMILY_REUNION', label: 'Family reunion' },
  { value: 'REFUGEE', label: 'Refugee (§24/§25)' },
  { value: 'OTHER', label: 'Other / not sure yet' },
];

const FAMILY: { value: FamilyStatus; label: string }[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'PARTNERED', label: 'In a relationship' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'PARENT', label: 'Parent' },
];

const CITIES = [
  { slug: 'munich', label: 'Munich' },
  { slug: 'berlin', label: 'Berlin' },
  { slug: 'stuttgart', label: 'Stuttgart' },
];

const optionBase =
  'w-full text-left p-4 rounded-2xl border-2 transition font-medium';
const optionSelected = 'border-helfa-ink bg-helfa-lime text-helfa-ink';
const optionIdle = 'border-helfa-ink/15 bg-white text-helfa-ink hover:border-helfa-ink/40';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingStepRequest>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const update = (patch: Partial<OnboardingStepRequest>) => setData((d) => ({ ...d, ...patch }));

  const submitStep = async (n: number, body: OnboardingStepRequest) => {
    setBusy(true);
    setError('');
    try {
      await onboardingAPI.saveStep(n, body);
      if (n < TOTAL) setStep(n + 1);
      else await finalize();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Step save failed');
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    try {
      await onboardingAPI.finalize();
      navigate('/tasks');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Finalize failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-helfa-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-helfa-slate">Onboarding</p>
          <h1 className="display-headline text-3xl mt-1">BUILD YOUR PLAN</h1>
        </div>

        <div className="surface-card p-8">
          <div className="mb-7">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-helfa-slate mb-2">
              <span>Step {step} of {TOTAL}</span>
              <span>{Math.round((step / TOTAL) * 100)}%</span>
            </div>
            <div className="h-2 bg-helfa-stone rounded-full overflow-hidden">
              <div
                className="h-full bg-helfa-ink transition-all"
                style={{ width: `${(step / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

          {step === 1 && (
            <Section title="What's your nationality?" subtitle="ISO country code — e.g. NG for Nigeria, IN for India.">
              <input
                type="text"
                maxLength={2}
                value={data.nationality ?? ''}
                onChange={(e) => update({ nationality: e.target.value.toUpperCase(), firstName: data.firstName ?? '' })}
                className="w-32 text-3xl text-center font-display tracking-widest border-2 border-helfa-ink/15 rounded-2xl p-3 uppercase focus:border-helfa-ink outline-none"
                placeholder="—"
              />
              <input
                type="text"
                value={data.firstName ?? ''}
                onChange={(e) => update({ firstName: e.target.value })}
                className="w-full mt-4 px-4 py-3 rounded-xl border border-helfa-ink/15 bg-white outline-none focus:border-helfa-ink"
                placeholder="First name (optional)"
              />
              <NextButton
                onClick={() => submitStep(1, { nationality: data.nationality, firstName: data.firstName })}
                disabled={busy || !data.nationality || data.nationality.length !== 2}
              />
            </Section>
          )}

          {step === 2 && (
            <Section title="Which city are you in (or moving to)?">
              <div className="grid grid-cols-3 gap-3">
                {CITIES.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => update({ citySlug: c.slug })}
                    className={`${optionBase} text-center ${data.citySlug === c.slug ? optionSelected : optionIdle}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <NextButton onClick={() => submitStep(2, { citySlug: data.citySlug })} disabled={busy || !data.citySlug} />
            </Section>
          )}

          {step === 3 && (
            <Section title="What's your visa pathway?">
              <div className="space-y-2">
                {VISA_PATHWAYS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => update({ visaPathway: v.value })}
                    className={`${optionBase} ${data.visaPathway === v.value ? optionSelected : optionIdle}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <NextButton onClick={() => submitStep(3, { visaPathway: data.visaPathway })} disabled={busy || !data.visaPathway} />
            </Section>
          )}

          {step === 4 && (
            <Section title="Family status">
              <div className="grid grid-cols-2 gap-3">
                {FAMILY.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => update({ familyStatus: f.value })}
                    className={`${optionBase} text-center ${data.familyStatus === f.value ? optionSelected : optionIdle}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center mt-5 text-sm text-helfa-slate">
                <input
                  type="checkbox"
                  checked={data.familyInGermany ?? false}
                  onChange={(e) => update({ familyInGermany: e.target.checked })}
                  className="mr-2 h-4 w-4 accent-helfa-ink"
                />
                Family already in Germany
              </label>
              <NextButton
                onClick={() => submitStep(4, {
                  familyStatus: data.familyStatus,
                  familyInGermany: data.familyInGermany ?? false,
                })}
                disabled={busy || !data.familyStatus}
              />
            </Section>
          )}

          {step === 5 && (
            <Section title="When are you arriving?" subtitle="Pick a date — we'll use it to schedule deadlines.">
              <input
                type="date"
                value={data.arrivalDate ?? ''}
                onChange={(e) => update({ arrivalDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-helfa-ink/15 bg-white outline-none focus:border-helfa-ink"
              />
              <NextButton onClick={() => submitStep(5, { arrivalDate: data.arrivalDate })} disabled={busy || !data.arrivalDate} />
            </Section>
          )}

          {step === 6 && (
            <Section title="One last thing" subtitle="You can upload your passport later — let's set up your task list now.">
              <button
                type="button"
                disabled={busy}
                onClick={() => submitStep(6, {})}
                className="btn-pill-lime w-full"
              >
                {busy ? 'Setting up your plan…' : 'Build my Helfa plan →'}
              </button>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="display-headline text-2xl mb-2">{title}</h2>
      {subtitle && <p className="text-helfa-slate mb-6 text-sm">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-pill-dark w-full mt-7">
      Continue →
    </button>
  );
}
