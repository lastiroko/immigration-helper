import { useState, type ReactNode } from 'react';
import type {
  FlowApi,
  PersonalDetails,
  SecondPerson,
  Sex,
  MaritalStatus,
  Religion,
  Relationship,
  ResidenceType,
  DocumentType,
} from '../types';
import { emptyPersonalDetails, emptySecondPerson } from '../types';
import { fillAnmeldeformular, DOCUMENT_TYPES } from '../formFill';

const ANMELDEFORMULAR_URL =
  'https://formular-server.de/Koeln_FS/findform?areashortname=koeln_html&formtecid=3&shortname=34-F27_Anmeldung';

export function AnmeldeformularPanel({ flow }: { flow: FlowApi }) {
  const [draft, setDraft] = useState<PersonalDetails>(
    () => flow.state.personalDetails ?? emptyPersonalDetails,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive person 2 at render so the form always has data to bind to. We
  // only persist + fill it when the family toggle on Screen 4 is on.
  const p2: SecondPerson = draft.person2 ?? emptySecondPerson;
  const familyOn = flow.state.isRegisteringFamily;
  const isMarried = draft.maritalStatus === 'married';

  const update = <K extends keyof PersonalDetails>(
    key: K,
    value: PersonalDetails[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const updateP2 = <K extends keyof SecondPerson>(
    key: K,
    value: SecondPerson[K],
  ) => {
    setDraft((d) => ({
      ...d,
      person2: { ...(d.person2 ?? emptySecondPerson), [key]: value },
    }));
  };

  const handleGenerate = async () => {
    setError(null);
    setBusy(true);
    // Strip person 2 from the saved/sent data if the family toggle is off,
    // so a stale Person-2 draft doesn't leak onto the PDF.
    const dataToFill: PersonalDetails = {
      ...draft,
      person2: familyOn ? draft.person2 : null,
    };
    flow.update({ personalDetails: dataToFill });
    try {
      const url = await fillAnmeldeformular(dataToFill, flow.state.moveInDate);
      const win = window.open(url, '_blank');
      if (!win) {
        setError(
          'Your browser blocked the new tab. Allow popups for this site and try again — or right-click "Generate" and open in a new tab.',
        );
      }
      // Don't revokeObjectURL — the new tab needs to keep the blob alive.
      // Browsers GC blob URLs on tab close.
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('fetch-failed')) {
        setError(
          "Couldn't reach Köln's form server. Check your connection and try again.",
        );
      } else {
        setError(
          `Couldn't generate the form (${msg}). The official form is still one tap away below.`,
        );
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
          Your details land directly on Köln's current Anmeldeformular —
          we fetch the live PDF on every generate, so you're never working
          off a stale copy.
        </p>
      </div>

      <div className="rounded-xl bg-helfa-stone/40 px-4 py-3 text-xs leading-relaxed text-helfa-slate">
        Your details stay in your browser only — we don't have a server. Use
        Restart in the footer to clear them.
      </div>

      {/* ─── About you ─────────────────────────────────────────────────── */}
      <Section title="About you">
        <Field label="First name(s)">
          <input
            type="text"
            value={draft.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            className={fieldClass}
            placeholder="As on your passport"
          />
        </Field>
        <Field label="Family name (surname)">
          <input
            type="text"
            value={draft.familyName}
            onChange={(e) => update('familyName', e.target.value)}
            className={fieldClass}
            placeholder="As on your passport"
          />
        </Field>
        <Field
          label="Birth name (if different)"
          hint="Maiden name, etc. Leave blank if same as surname."
          full
        >
          <input
            type="text"
            value={draft.birthName}
            onChange={(e) => update('birthName', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={draft.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Sex">
          <select
            value={draft.sex}
            onChange={(e) => update('sex', e.target.value as Sex)}
            className={fieldClass}
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="diverse">Diverse</option>
          </select>
        </Field>
        <Field label="City of birth">
          <input
            type="text"
            value={draft.birthCity}
            onChange={(e) => update('birthCity', e.target.value)}
            className={fieldClass}
            placeholder="e.g. Lagos"
          />
        </Field>
        <Field label="Country of birth">
          <input
            type="text"
            value={draft.birthCountry}
            onChange={(e) => update('birthCountry', e.target.value)}
            className={fieldClass}
            placeholder="e.g. Nigeria"
          />
        </Field>
        <Field label="Nationality">
          <input
            type="text"
            value={draft.nationality}
            onChange={(e) => update('nationality', e.target.value)}
            className={fieldClass}
            placeholder="e.g. Nigerian"
          />
        </Field>
        <Field label="Marital status">
          <select
            value={draft.maritalStatus}
            onChange={(e) =>
              update('maritalStatus', e.target.value as MaritalStatus)
            }
            className={fieldClass}
          >
            <option value="">— pick one —</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </Field>
        <Field
          label="Religion"
          hint="None = no church tax. Catholic/Protestant/Jewish = ~8–9% of your income tax goes to the church."
        >
          <select
            value={draft.religion}
            onChange={(e) => update('religion', e.target.value as Religion)}
            className={fieldClass}
          >
            <option value="">— pick one —</option>
            <option value="none">None (konfessionslos)</option>
            <option value="catholic">Catholic (Römisch-katholisch)</option>
            <option value="protestant">Protestant (Evangelisch)</option>
            <option value="jewish">Jewish (Jüdisch)</option>
            <option value="other">Other</option>
          </select>
        </Field>
        {draft.religion === 'other' && (
          <Field label="Which denomination?" full>
            <input
              type="text"
              value={draft.otherReligion}
              onChange={(e) => update('otherReligion', e.target.value)}
              className={fieldClass}
            />
          </Field>
        )}
      </Section>

      {/* ─── Your ID document ──────────────────────────────────────────── */}
      <Section
        title="Your ID document"
        hint="Skip if you don't have these handy — the clerk can fill them at the desk."
      >
        <Field label="Document type">
          <select
            value={draft.documentType}
            onChange={(e) =>
              update('documentType', e.target.value as DocumentType)
            }
            className={fieldClass}
          >
            <option value="">— pick one —</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Serial number" hint="As printed on the document.">
          <input
            type="text"
            value={draft.documentSerial}
            onChange={(e) => update('documentSerial', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Issuing authority" full>
          <input
            type="text"
            value={draft.documentIssuingAuthority}
            onChange={(e) =>
              update('documentIssuingAuthority', e.target.value)
            }
            className={fieldClass}
            placeholder="e.g. Bundesdruckerei, Lagos passport office"
          />
        </Field>
        <Field label="Issue date">
          <input
            type="date"
            value={draft.documentIssueDate}
            onChange={(e) => update('documentIssueDate', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Valid until">
          <input
            type="date"
            value={draft.documentExpiryDate}
            onChange={(e) => update('documentExpiryDate', e.target.value)}
            className={fieldClass}
          />
        </Field>
      </Section>

      {/* ─── Where you came from ───────────────────────────────────────── */}
      {(() => {
        // Adapt the section to whether this is a within-Germany move
        // (Ummeldung) or an arrival from abroad. originIsAbroad is set on
        // Screen 1.5; null means "haven't asked yet" → show all fields.
        const fromAbroad = flow.state.originIsAbroad === true;
        const inGermany = flow.state.originIsAbroad === false;
        return (
          <Section
            title={
              inGermany
                ? 'Your previous German address'
                : fromAbroad
                  ? 'Your previous address abroad'
                  : 'Where you came from'
            }
            hint={
              inGermany
                ? 'Same form whether it’s an Anmeldung or an Ummeldung — you just need a few extra slots filled.'
                : fromAbroad
                  ? 'Country matters; postal code and Bundesland do not.'
                  : undefined
            }
          >
            {inGermany && (
              <Field
                label="Move-out date (Tag des Auszugs)"
                hint="When you formally left the previous address — usually your lease end-date."
              >
                <input
                  type="date"
                  value={draft.moveOutDate}
                  onChange={(e) => update('moveOutDate', e.target.value)}
                  className={fieldClass}
                />
              </Field>
            )}
            <Field label="Street + number" full>
              <input
                type="text"
                value={draft.prevStreet}
                onChange={(e) => update('prevStreet', e.target.value)}
                className={fieldClass}
                placeholder={
                  inGermany ? 'e.g. Mönckebergstraße 7' : 'e.g. 12 Allen Avenue'
                }
              />
            </Field>
            <Field label="City">
              <input
                type="text"
                value={draft.prevCity}
                onChange={(e) => update('prevCity', e.target.value)}
                className={fieldClass}
                placeholder={inGermany ? 'e.g. Hamburg' : 'e.g. Lagos'}
              />
            </Field>
            {!fromAbroad && (
              <Field label="Postal code">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  value={draft.prevPostalCode}
                  onChange={(e) => update('prevPostalCode', e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. 20095"
                />
              </Field>
            )}
            {!fromAbroad && (
              <Field label="Bundesland">
                <input
                  type="text"
                  value={draft.prevBundesland}
                  onChange={(e) => update('prevBundesland', e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Hamburg, Bayern"
                />
              </Field>
            )}
            {!fromAbroad && (
              <Field label="Kreis (district)" hint="Stadtkreis or Landkreis.">
                <input
                  type="text"
                  value={draft.prevKreis}
                  onChange={(e) => update('prevKreis', e.target.value)}
                  className={fieldClass}
                />
              </Field>
            )}
            {!inGermany && (
              <Field
                label="Country"
                hint={
                  fromAbroad
                    ? 'The country you arrived from.'
                    : 'If from abroad — leave blank for in-Germany moves.'
                }
              >
                <input
                  type="text"
                  value={draft.prevCountry}
                  onChange={(e) => update('prevCountry', e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Nigeria"
                />
              </Field>
            )}
            <Field label="That place was a:" full>
              <RadioRow
                value={draft.residenceTypeOld}
                onChange={(v) => update('residenceTypeOld', v)}
                options={RESIDENCE_OPTIONS}
                allowEmpty
              />
            </Field>
            <Field label="Are you keeping that place?" full>
              <RadioRow
                value={draft.keepingOldResidence}
                onChange={(v) =>
                  update('keepingOldResidence', v as 'yes' | 'no' | '')
                }
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'yes', label: 'Yes' },
                ]}
              />
            </Field>
            {draft.keepingOldResidence === 'yes' && (
              <Field label="Keeping it as:" full>
                <RadioRow
                  value={draft.keepingOldAs}
                  onChange={(v) =>
                    update('keepingOldAs', v as 'haupt' | 'neben' | '')
                  }
                  options={[
                    { value: 'haupt', label: 'Hauptwohnung (main)' },
                    { value: 'neben', label: 'Nebenwohnung (secondary)' },
                  ]}
                />
              </Field>
            )}
          </Section>
        );
      })()}

      {/* ─── Köln address ──────────────────────────────────────────────── */}
      <Section title="Where you're moving to in Köln">
        <Field label="Street + number" hint="Match your lease exactly." full>
          <input
            type="text"
            value={draft.koelnStreet}
            onChange={(e) => update('koelnStreet', e.target.value)}
            className={fieldClass}
            placeholder="e.g. Severinstraße 12"
          />
        </Field>
        <Field label="Postal code">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            value={draft.koelnPostalCode}
            onChange={(e) => update('koelnPostalCode', e.target.value)}
            className={fieldClass}
            placeholder="e.g. 50678"
          />
        </Field>
        <Field
          label="Stadtteil (district)"
          hint="Optional — e.g. Altstadt-Süd, Ehrenfeld."
        >
          <input
            type="text"
            value={draft.koelnOrtsteil}
            onChange={(e) => update('koelnOrtsteil', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="This new place is your:" full>
          <RadioRow
            value={draft.residenceTypeNew}
            onChange={(v) => update('residenceTypeNew', v)}
            options={RESIDENCE_OPTIONS}
          />
        </Field>
        <Field label="Do you have other homes elsewhere in Germany?" full>
          <RadioRow
            value={draft.hasOtherDEHomes}
            onChange={(v) =>
              update('hasOtherDEHomes', v as 'yes' | 'no' | '')
            }
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
          />
        </Field>
      </Section>

      {/* ─── Your landlord (Wohnungsgeber) ─────────────────────────────── */}
      <Section
        title="Your landlord (Wohnungsgeber)"
        hint="From the signed Wohnungsgeberbescheinigung you collected above."
      >
        <Field label="Landlord name" full>
          <input
            type="text"
            value={draft.landlordName}
            onChange={(e) => update('landlordName', e.target.value)}
            className={fieldClass}
            placeholder="Name of the person or company"
          />
        </Field>
        <Field label="Street + number" full>
          <input
            type="text"
            value={draft.landlordStreet}
            onChange={(e) => update('landlordStreet', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Postal code">
          <input
            type="text"
            inputMode="numeric"
            value={draft.landlordPostalCode}
            onChange={(e) => update('landlordPostalCode', e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="City">
          <input
            type="text"
            value={draft.landlordCity}
            onChange={(e) => update('landlordCity', e.target.value)}
            className={fieldClass}
          />
        </Field>
      </Section>

      {/* ─── Marriage info (only if married) ───────────────────────────── */}
      {isMarried && (
        <Section
          title="Marriage info"
          hint="The form asks for these when you mark Married above."
        >
          <Field label="Marriage date">
            <input
              type="date"
              value={draft.marriageDate}
              onChange={(e) => update('marriageDate', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Registry number" hint="Aktenzeichen (if you have one).">
            <input
              type="text"
              value={draft.marriageRegistryNumber}
              onChange={(e) =>
                update('marriageRegistryNumber', e.target.value)
              }
              className={fieldClass}
            />
          </Field>
          <Field label="Marriage city">
            <input
              type="text"
              value={draft.marriagePlace}
              onChange={(e) => update('marriagePlace', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Marriage country">
            <input
              type="text"
              value={draft.marriageCountry}
              onChange={(e) => update('marriageCountry', e.target.value)}
              className={fieldClass}
            />
          </Field>
        </Section>
      )}

      {/* ─── Second person (only if family toggle on) ──────────────────── */}
      {familyOn && (
        <Section
          title="Second person registering with you"
          hint="Spouse or child. The form only has space for two people on one sheet — register more on a second copy."
        >
          <Field label="Their relationship to you" full>
            <select
              value={p2.relationship}
              onChange={(e) =>
                updateP2('relationship', e.target.value as Relationship)
              }
              className={fieldClass}
            >
              <option value="">— pick one —</option>
              <option value="spouse">Spouse (Ehegatte/in)</option>
              <option value="childBoth">Child of both parents</option>
              <option value="childMother">Child of mother</option>
              <option value="childFather">Child of father</option>
            </select>
          </Field>
          <Field label="First name(s)">
            <input
              type="text"
              value={p2.firstName}
              onChange={(e) => updateP2('firstName', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Family name (surname)">
            <input
              type="text"
              value={p2.familyName}
              onChange={(e) => updateP2('familyName', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Birth name (if different)"
            hint="Leave blank if same as surname."
            full
          >
            <input
              type="text"
              value={p2.birthName}
              onChange={(e) => updateP2('birthName', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              value={p2.dateOfBirth}
              onChange={(e) => updateP2('dateOfBirth', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Sex">
            <select
              value={p2.sex}
              onChange={(e) => updateP2('sex', e.target.value as Sex)}
              className={fieldClass}
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="diverse">Diverse</option>
            </select>
          </Field>
          <Field label="City of birth">
            <input
              type="text"
              value={p2.birthCity}
              onChange={(e) => updateP2('birthCity', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Country of birth">
            <input
              type="text"
              value={p2.birthCountry}
              onChange={(e) => updateP2('birthCountry', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Nationality">
            <input
              type="text"
              value={p2.nationality}
              onChange={(e) => updateP2('nationality', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Marital status">
            <select
              value={p2.maritalStatus}
              onChange={(e) =>
                updateP2('maritalStatus', e.target.value as MaritalStatus)
              }
              className={fieldClass}
            >
              <option value="">— pick one —</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </Field>
          <Field label="Religion">
            <select
              value={p2.religion}
              onChange={(e) =>
                updateP2('religion', e.target.value as Religion)
              }
              className={fieldClass}
            >
              <option value="">— pick one —</option>
              <option value="none">None (konfessionslos)</option>
              <option value="catholic">Catholic</option>
              <option value="protestant">Protestant</option>
              <option value="jewish">Jewish</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {p2.religion === 'other' && (
            <Field label="Which denomination?">
              <input
                type="text"
                value={p2.otherReligion}
                onChange={(e) => updateP2('otherReligion', e.target.value)}
                className={fieldClass}
              />
            </Field>
          )}
          <Field label="Document type">
            <select
              value={p2.documentType}
              onChange={(e) =>
                updateP2('documentType', e.target.value as DocumentType)
              }
              className={fieldClass}
            >
              <option value="">— pick one —</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Serial number">
            <input
              type="text"
              value={p2.documentSerial}
              onChange={(e) => updateP2('documentSerial', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Issuing authority" full>
            <input
              type="text"
              value={p2.documentIssuingAuthority}
              onChange={(e) =>
                updateP2('documentIssuingAuthority', e.target.value)
              }
              className={fieldClass}
            />
          </Field>
          <Field label="Issue date">
            <input
              type="date"
              value={p2.documentIssueDate}
              onChange={(e) => updateP2('documentIssueDate', e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Valid until">
            <input
              type="date"
              value={p2.documentExpiryDate}
              onChange={(e) =>
                updateP2('documentExpiryDate', e.target.value)
              }
              className={fieldClass}
            />
          </Field>
        </Section>
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
          className="btn-pill-cta"
          aria-disabled={busy}
        >
          {busy ? 'Generating…' : 'Generate my filled form (PDF)'}
        </button>
        <a
          href={ANMELDEFORMULAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-ghost"
        >
          Open the blank form ↗
        </a>
      </div>

      <p className="text-xs text-helfa-slate leading-relaxed">
        The PDF opens in a new tab. Print it from there, sign it, and bring
        it to your appointment. We always pull the current version from
        Köln — if they tweak the form, you get the new layout automatically.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

const RESIDENCE_OPTIONS: { value: ResidenceType; label: string }[] = [
  { value: 'haupt', label: 'Hauptwohnung (main)' },
  { value: 'neben', label: 'Nebenwohnung (secondary)' },
  { value: 'alleinige', label: 'Alleinige (only)' },
];

const fieldClass =
  'w-full rounded-xl border border-helfa-ink/15 bg-white px-3 py-2 text-sm text-helfa-ink shadow-sm focus:border-helfa-ink focus:outline-none focus:ring-2 focus:ring-helfa-lime';

function Section({
  title,
  hint,
  children,
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

function RadioRow<T extends string>({
  value,
  onChange,
  options,
  allowEmpty,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              selected
                ? 'border-helfa-ink bg-helfa-ink text-white'
                : 'border-helfa-ink/20 bg-white text-helfa-ink hover:border-helfa-ink/50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange('' as T)}
          className="rounded-full border border-helfa-ink/15 bg-white px-3 py-1.5 text-xs text-helfa-slate hover:text-helfa-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}
