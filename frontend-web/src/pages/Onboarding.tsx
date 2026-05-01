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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Step {step} of {TOTAL}</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all"
                 style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {step === 1 && (
          <Section title="What's your nationality?"
                   subtitle="ISO country code — e.g., NG for Nigeria, IN for India.">
            <input
              type="text" maxLength={2} value={data.nationality ?? ''}
              onChange={(e) => update({ nationality: e.target.value.toUpperCase(), firstName: data.firstName ?? '' })}
              className="w-32 text-3xl text-center font-mono border-2 border-gray-300 rounded-lg p-3 uppercase tracking-widest"
              placeholder="—" />
            <input
              type="text" value={data.firstName ?? ''} onChange={(e) => update({ firstName: e.target.value })}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg" placeholder="First name (optional)" />
            <NextButton onClick={() => submitStep(1, { nationality: data.nationality, firstName: data.firstName })}
                        disabled={busy || !data.nationality || data.nationality.length !== 2} />
          </Section>
        )}

        {step === 2 && (
          <Section title="Which city are you in (or moving to)?">
            <div className="grid grid-cols-3 gap-3">
              {CITIES.map((c) => (
                <button key={c.slug} type="button"
                        onClick={() => update({ citySlug: c.slug })}
                        className={`p-4 rounded-lg border-2 transition ${
                          data.citySlug === c.slug ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                        }`}>
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
                <button key={v.value} type="button"
                        onClick={() => update({ visaPathway: v.value })}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          data.visaPathway === v.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                        }`}>
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
                <button key={f.value} type="button"
                        onClick={() => update({ familyStatus: f.value })}
                        className={`p-3 rounded-lg border-2 transition ${
                          data.familyStatus === f.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex items-center mt-4 text-sm">
              <input type="checkbox" checked={data.familyInGermany ?? false}
                     onChange={(e) => update({ familyInGermany: e.target.checked })}
                     className="mr-2" />
              Family already in Germany
            </label>
            <NextButton onClick={() => submitStep(4, {
              familyStatus: data.familyStatus,
              familyInGermany: data.familyInGermany ?? false,
            })} disabled={busy || !data.familyStatus} />
          </Section>
        )}

        {step === 5 && (
          <Section title="When are you arriving?" subtitle="Pick a date — we'll use it to schedule deadlines.">
            <input type="date" value={data.arrivalDate ?? ''}
                   onChange={(e) => update({ arrivalDate: e.target.value })}
                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
            <NextButton onClick={() => submitStep(5, { arrivalDate: data.arrivalDate })}
                        disabled={busy || !data.arrivalDate} />
          </Section>
        )}

        {step === 6 && (
          <Section title="One last thing"
                   subtitle="You can upload your passport later — let's set up your task list now.">
            <button type="button" disabled={busy}
                    onClick={() => submitStep(6, {})}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
              {busy ? 'Setting up your plan…' : 'Build my Helfa plan →'}
            </button>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition">
      Continue →
    </button>
  );
}
