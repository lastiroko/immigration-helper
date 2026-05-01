import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { onboardingApi } from '../src/api/client';
import type { FamilyStatus, OnboardingStepRequest, VisaPathway } from '../src/api/types';

const TOTAL = 6;
const PATHWAYS: { v: VisaPathway; label: string }[] = [
  { v: 'STUDENT', label: 'Student visa' },
  { v: 'BLUE_CARD', label: 'Blue Card / skilled worker' },
  { v: 'CHANCENKARTE', label: 'Chancenkarte' },
  { v: 'FAMILY_REUNION', label: 'Family reunion' },
  { v: 'REFUGEE', label: 'Refugee (§24/§25)' },
  { v: 'OTHER', label: 'Other / not sure' },
];
const FAMILY: { v: FamilyStatus; label: string }[] = [
  { v: 'SINGLE', label: 'Single' },
  { v: 'PARTNERED', label: 'In a relationship' },
  { v: 'MARRIED', label: 'Married' },
  { v: 'PARENT', label: 'Parent' },
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
  const router = useRouter();

  const update = (patch: Partial<OnboardingStepRequest>) => setData((d) => ({ ...d, ...patch }));

  const next = async (n: number, body: OnboardingStepRequest) => {
    setBusy(true); setError('');
    try {
      await onboardingApi.saveStep(n, body);
      if (n < TOTAL) setStep(n + 1);
      else { await onboardingApi.finalize(); router.replace('/(tabs)/tasks'); }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed');
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, backgroundColor: '#f8fafc' }}>
      <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Step {step} of {TOTAL}</Text>
      <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <View style={{ width: `${(step / TOTAL) * 100}%`, height: '100%', backgroundColor: '#2563eb' }} />
      </View>

      {error ? <Text style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, marginBottom: 12 }}>{error}</Text> : null}

      {step === 1 && (
        <Section title="What's your nationality?" subtitle="ISO country code — e.g., NG for Nigeria.">
          <TextInput value={data.nationality ?? ''} maxLength={2} autoCapitalize="characters"
            onChangeText={(t) => update({ nationality: t.toUpperCase() })}
            style={{ alignSelf: 'center', fontSize: 32, fontFamily: 'monospace', borderWidth: 2, borderColor: '#cbd5e1',
                     borderRadius: 12, padding: 16, width: 120, textAlign: 'center', marginBottom: 12, backgroundColor: '#fff' }} />
          <TextInput value={data.firstName ?? ''} onChangeText={(t) => update({ firstName: t })}
            placeholder="First name (optional)"
            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 }} />
          <NextBtn busy={busy} disabled={!data.nationality || data.nationality.length !== 2}
                   onPress={() => next(1, { nationality: data.nationality, firstName: data.firstName })} />
        </Section>
      )}

      {step === 2 && (
        <Section title="Which city?">
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {CITIES.map((c) => (
              <TouchableOpacity key={c.slug} onPress={() => update({ citySlug: c.slug })}
                style={{ flex: 1, padding: 14, borderRadius: 8, borderWidth: 2,
                         borderColor: data.citySlug === c.slug ? '#2563eb' : '#cbd5e1',
                         backgroundColor: data.citySlug === c.slug ? '#dbeafe' : '#fff' }}>
                <Text style={{ textAlign: 'center' }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <NextBtn busy={busy} disabled={!data.citySlug} onPress={() => next(2, { citySlug: data.citySlug })} />
        </Section>
      )}

      {step === 3 && (
        <Section title="Visa pathway">
          {PATHWAYS.map((p) => (
            <TouchableOpacity key={p.v} onPress={() => update({ visaPathway: p.v })}
              style={{ padding: 12, borderRadius: 8, borderWidth: 2, marginBottom: 8,
                       borderColor: data.visaPathway === p.v ? '#2563eb' : '#cbd5e1',
                       backgroundColor: data.visaPathway === p.v ? '#dbeafe' : '#fff' }}>
              <Text>{p.label}</Text>
            </TouchableOpacity>
          ))}
          <NextBtn busy={busy} disabled={!data.visaPathway} onPress={() => next(3, { visaPathway: data.visaPathway })} />
        </Section>
      )}

      {step === 4 && (
        <Section title="Family status">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {FAMILY.map((f) => (
              <TouchableOpacity key={f.v} onPress={() => update({ familyStatus: f.v })}
                style={{ width: '48%', padding: 12, borderRadius: 8, borderWidth: 2,
                         borderColor: data.familyStatus === f.v ? '#2563eb' : '#cbd5e1',
                         backgroundColor: data.familyStatus === f.v ? '#dbeafe' : '#fff' }}>
                <Text style={{ textAlign: 'center' }}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <NextBtn busy={busy} disabled={!data.familyStatus}
                   onPress={() => next(4, { familyStatus: data.familyStatus, familyInGermany: data.familyInGermany ?? false })} />
        </Section>
      )}

      {step === 5 && (
        <Section title="When are you arriving?" subtitle="Format YYYY-MM-DD (we'll add a real date picker later).">
          <TextInput value={data.arrivalDate ?? ''} onChangeText={(t) => update({ arrivalDate: t })}
            placeholder="2026-09-01"
            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 }} />
          <NextBtn busy={busy} disabled={!data.arrivalDate} onPress={() => next(5, { arrivalDate: data.arrivalDate })} />
        </Section>
      )}

      {step === 6 && (
        <Section title="Almost there" subtitle="We'll build your personalised plan now.">
          <NextBtn label={busy ? 'Building plan…' : 'Build my Helfa plan →'} busy={busy} disabled={false}
                   onPress={() => next(6, {})} />
        </Section>
      )}
    </ScrollView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 4 }}>{title}</Text>
      {subtitle ? <Text style={{ color: '#64748b', marginBottom: 16 }}>{subtitle}</Text> : null}
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function NextBtn({ onPress, disabled, busy, label }: { onPress: () => void; disabled: boolean; busy: boolean; label?: string }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || busy}
      style={{ marginTop: 8, backgroundColor: disabled || busy ? '#94a3b8' : '#2563eb',
               padding: 14, borderRadius: 8, alignItems: 'center' }}>
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>{label ?? 'Continue →'}</Text>}
    </TouchableOpacity>
  );
}
