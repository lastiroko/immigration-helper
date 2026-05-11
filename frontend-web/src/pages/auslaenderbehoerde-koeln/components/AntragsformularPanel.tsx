import { useState, type ReactNode } from 'react';
import type { FlowApi, ResidencePermitDetails } from '../types';
import { emptyResidencePermitDetails } from '../types';
import { fillResidencePermitForm, readAnmeldungSnapshot } from '../formFill';
import { bezirksamtForPostalCode } from '../bezirksaemter';

const FORM_HTML_URL =
  'https://formular-server.de/Koeln_FS/findform?shortname=33-F07_ErstAntBefAuf&formtecid=3&areashortname=send_html';

export function AntragsformularPanel({ flow }: { flow: FlowApi }) {
  const [draft, setDraft] = useState<ResidencePermitDetails>(
    () => flow.state.residencePermitDetails ?? emptyResidencePermitDetails,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const purpose = flow.state.purpose;
  const isWorker = purpose === 'worker';
  const isStudent = purpose === 'student';
  const anmeldung = readAnmeldungSnapshot();

  const update = <K extends keyof ResidencePermitDetails>(
    key: K,
    value: ResidencePermitDetails[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const updateEmployer = <
    K extends keyof ResidencePermitDetails['employer'],
  >(
    key: K,
    value: ResidencePermitDetails['employer'][K],
  ) => {
    setDraft((d) => ({
      ...d,
      employer: { ...d.employer, [key]: value },
    }));
  };

  const handleGenerate = async () => {
    setError(null);
    setWarning(null);
    if (purpose !== 'student' && purpose !== 'worker') {
      setError(
        "Pick a purpose first (Screen 2). v1 only fills student or worker forms.",
      );
      return;
    }
    const koelnPLZ = anmeldung?.koelnPostalCode ?? '';
    const bezirksamt = bezirksamtForPostalCode(koelnPLZ);
    if (!bezirksamt) {
      setWarning(
        koelnPLZ
          ? `Postal code ${koelnPLZ} doesn't match any of Köln's 9 districts — the form's office dropdown will be left blank for you to fill.`
          : "We don't have your Köln postal code from Anmeldung yet — the form's office dropdown will be left blank.",
      );
    }

    setBusy(true);
    flow.update({ residencePermitDetails: draft });
    try {
      const url = await fillResidencePermitForm({
        details: draft,
        anmeldung,
        purpose,
        visaExpires: flow.state.visaExpires,
        bezirksamtFormValue: bezirksamt?.formValue ?? '',
      });
      const win = window.open(url, '_blank');
      if (!win) {
        setError(
          'Your browser blocked the new tab. Allow popups for this site and try again.',
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('fetch-failed')) {
        setError("Couldn't reach Köln's form server. Check your connection.");
      } else {
        setError(`Couldn't generate the form (${msg}).`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <div>
        <p className="text-sm font-semibold text-helfa-ink">
          We fill the official form for you. You print and sign it.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-helfa-ink/80">
          We fetch the live PDF (form ID <code>33-F07_ErstAntBefAuf</code>)
          on every Generate, fill the fields we have, and pre-select your
          Bezirksamt based on your Köln postal code.
        </p>
      </div>

      {anmeldung && (
        <div className="rounded-xl bg-helfa-lime/15 px-4 py-3 text-xs leading-relaxed text-helfa-ink/85">
          <strong>Cross-flow:</strong> we found your Anmeldung details in
          this browser — name, birth date, nationality, document number, and
          Köln address will be pre-filled. You only need to add the fields
          below.
        </div>
      )}

      <div className="rounded-xl bg-helfa-stone/40 px-4 py-3 text-xs leading-relaxed text-helfa-slate">
        Your details stay in your browser only — we don't have a server.
      </div>

      {/* Physical descriptors — required on the form */}
      <Section title="Physical descriptors (German forms ask for these)">
        <Field label="Height in cm">
          <input
            type="number"
            value={draft.height}
            onChange={(e) => update('height', e.target.value)}
            className={fieldClass}
            placeholder="e.g. 178"
          />
        </Field>
        <Field label="Eye colour">
          <select
            value={draft.eyeColor}
            onChange={(e) => update('eyeColor', e.target.value)}
            className={fieldClass}
          >
            <option value="">— pick one —</option>
            <option value="braun">braun (brown)</option>
            <option value="blau">blau (blue)</option>
            <option value="grün">grün (green)</option>
            <option value="grau">grau (grey)</option>
            <option value="haselnussbraun">haselnussbraun (hazel)</option>
            <option value="schwarz">schwarz (black)</option>
          </select>
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <Field label="Phone">
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={draft.email}
            onChange={(e) => update('email', e.target.value)}
            className={fieldClass}
          />
        </Field>
      </Section>

      {/* Worker section */}
      {isWorker && (
        <Section title="Employer and income">
          <Field label="Job title" full>
            <input
              type="text"
              value={draft.employer.jobTitle}
              onChange={(e) => updateEmployer('jobTitle', e.target.value)}
              className={fieldClass}
              placeholder="e.g. Software Engineer"
            />
          </Field>
          <Field label="Employer / company name" full>
            <input
              type="text"
              value={draft.employer.name}
              onChange={(e) => updateEmployer('name', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Boss's full name (Vorname Familienname)" full>
            <input
              type="text"
              value={draft.employer.bossName}
              onChange={(e) => updateEmployer('bossName', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Employer street + number" full>
            <input
              type="text"
              value={draft.employer.street}
              onChange={(e) => updateEmployer('street', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Postal code">
            <input
              type="text"
              inputMode="numeric"
              value={draft.employer.postalCode}
              onChange={(e) => updateEmployer('postalCode', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              value={draft.employer.city}
              onChange={(e) => updateEmployer('city', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Employer phone">
            <input
              type="tel"
              value={draft.employer.phone}
              onChange={(e) => updateEmployer('phone', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Employer email">
            <input
              type="email"
              value={draft.employer.email}
              onChange={(e) => updateEmployer('email', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Monthly gross income (€)"
            hint="Use the figure on your employment contract."
            full
          >
            <input
              type="number"
              value={draft.monthlyIncomeGross}
              onChange={(e) => update('monthlyIncomeGross', e.target.value)}
              className={fieldClass}
              placeholder="e.g. 4500"
            />
          </Field>
        </Section>
      )}

      {/* Student section */}
      {isStudent && (
        <Section title="Studies">
          <Field label="University name" full>
            <input
              type="text"
              value={draft.university}
              onChange={(e) => update('university', e.target.value)}
              className={fieldClass}
              placeholder="e.g. Technische Hochschule Köln"
            />
          </Field>
          <Field label="Study field / programme">
            <input
              type="text"
              value={draft.studyField}
              onChange={(e) => update('studyField', e.target.value)}
              className={fieldClass}
              placeholder="e.g. Computer Science MSc"
            />
          </Field>
          <Field label="University website">
            <input
              type="url"
              value={draft.studyWebsite}
              onChange={(e) => update('studyWebsite', e.target.value)}
              className={fieldClass}
              placeholder="e.g. th-koeln.de"
            />
          </Field>
        </Section>
      )}

      <Section title="Health insurance">
        <Field label="Insurance provider (Krankenkasse)" full>
          <input
            type="text"
            value={draft.insuranceProvider}
            onChange={(e) => update('insuranceProvider', e.target.value)}
            className={fieldClass}
            placeholder="e.g. Techniker Krankenkasse, AOK, Mawista"
          />
        </Field>
      </Section>

      <Section title="Required disclosures (Honest answers — they will check)">
        <YesNo
          label="Do you speak German at conversational level?"
          value={draft.speaksGerman}
          onChange={(v) => update('speaksGerman', v)}
        />
        <YesNo
          label="Do you have a criminal record (anywhere)?"
          value={draft.hasCriminalRecord}
          onChange={(v) => update('hasCriminalRecord', v)}
        />
        <YesNo
          label="Are you the subject of an open investigation?"
          value={draft.hasOpenInvestigation}
          onChange={(v) => update('hasOpenInvestigation', v)}
        />
        <YesNo
          label="Have you ever been deported from any country?"
          value={draft.hasBeenDeported}
          onChange={(v) => update('hasBeenDeported', v)}
        />
      </Section>

      {warning && (
        <p className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-helfa-ink">
          {warning}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-helfa-stone/60 px-4 py-3 text-sm text-helfa-ink">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy}
          aria-disabled={busy}
          className="btn-pill-cta"
        >
          {busy ? 'Generating…' : 'Generate my filled form (PDF)'}
        </button>
        <a
          href={FORM_HTML_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-ghost"
        >
          Open the blank form ↗
        </a>
      </div>

      <p className="text-xs text-helfa-slate leading-relaxed">
        The PDF opens in a new tab. Print it, sign it, and bring it to your
        appointment along with the documents above.
      </p>
    </div>
  );
}

// ─── Inline helpers (kept local to this file for now; can be extracted
//     if a third panel ever uses them) ─────────────────────────────────

const fieldClass =
  'w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm text-helfa-ink shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime';

function Section({
  title,
  children,
  hint,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-helfa-slate">
        {title}
      </h4>
      {hint && (
        <p className="mt-0.5 text-[11px] leading-snug text-helfa-slate">
          {hint}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block text-xs font-semibold text-helfa-ink">
        {label}
      </span>
      {hint && (
        <span className="mt-0.5 block text-[11px] leading-snug text-helfa-slate">
          {hint}
        </span>
      )}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-semibold text-helfa-ink">{label}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
            value === false
              ? 'border-helfa-ink bg-helfa-ink text-white'
              : 'border-helfa-ink/20 bg-white text-helfa-ink hover:border-helfa-ink/50'
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
            value === true
              ? 'border-helfa-ink bg-helfa-ink text-white'
              : 'border-helfa-ink/20 bg-white text-helfa-ink hover:border-helfa-ink/50'
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );
}

