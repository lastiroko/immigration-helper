# Helfa — Ausländerbehörde Köln (residence permit) v1

**Status:** Draft v0.1 — design only, no code yet. Founder-verification needed on every fact below.

**One flow. One city. The natural follow-on for non-EU users who finished Anmeldung Köln.**

- **User:** Non-EU international students & skilled workers in Köln who already completed Anmeldung
- **Language:** English only
- **Surface:** Standalone page at `/auslaenderbehoerde-koeln` — does not require account
- **Goal of v1:** Get the user from "I'm registered, now I need a residence permit" to "I'm holding my Aufenthaltstitel" without ever feeling lost

---

## Why this is next

Spec criterion in `anmeldung-koeln-v1-spec.md` Screen 8 already calls this out:

> *Within 90 days — If you're non-EU: apply for your residence permit at the Ausländerbehörde. The wait list in Köln is long — start now, not in month 2.*

Currently that's a parking-lot link. The natural follow-on after Anmeldung is the same kind of guided flow for the next bureaucracy step — same design language, same `localStorage` pattern, same no-backend constraint.

---

## The promise on the landing screen

> **Your residence permit in Köln, without the panic.**
> Köln's Ausländerbehörde has a months-long waitlist. We tell you exactly which permit you need, exactly which documents to bring, and exactly which booking link to refresh.

Three credibility hooks (small, factual):
- *Köln issues the appointment slot before the deadline matters — book the moment you have your Anmeldung, not when your visa is about to expire.*
- *Different permit types need different documents. We ask three questions and give you the right list.*
- *Nothing on this page is auto-translated from German. Every field is hand-checked against §§16, 18, 21 AufenthG.*

CTA: **Start — takes 4 minutes**

---

## v1 scope (what we cover, what we defer)

### v1 covers two permit purposes — the 80% case in Köln:

1. **Student permit (Aufenthaltstitel zu Studienzwecken — §16b AufenthG)** — enrolled at a German uni
2. **Skilled worker permit (Aufenthaltstitel zur Erwerbstätigkeit — §18a/b AufenthG / EU Blue Card §18b Abs. 2)** — has a job offer or contract

### v2 candidates (deferred, mentioned at the end):

- Studienbewerber (applying to study, not yet enrolled)
- Familiennachzug (family reunification)
- Selbständige Tätigkeit (self-employed)
- Asyl / subsidiäre Schutz (refugee status — different building, different process)
- Verlängerung (extension, not first-issue) — different appointment type
- Permanent settlement (Niederlassungserlaubnis) — different process entirely

The 80/20 cut keeps v1 honest. Anyone outside the two paths gets a clear "this v1 doesn't cover your case yet — here's the official link" message and exits cleanly.

---

## Architecture: the flow as a state machine

```
┌─────────────┐
│ 0. Landing  │
└──────┬──────┘
       ▼
┌──────────────────────┐
│ 1. Are you a non-EU  │ ──── EU/EEA/CH ──▶ Exit: "You don't need this. Done."
│    citizen?          │
└──────┬───────────────┘
       │ Non-EU
       ▼
┌──────────────────────┐
│ 2. Why are you in    │ ──── Other ─────▶ Exit: "v1 doesn't cover your case
│    Köln?             │                    yet — here's the official link"
│    (Student / Work / │
│     Other)           │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 3. Anmeldung done?   │ ──── No ────────▶ Soft off-ramp:
│                      │                    "Do Anmeldung first → /anmeldung-koeln"
└──────┬───────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ 4. Visa countdown    │ ──── pre-fill from move-in date if shared
│    (when does your   │     localStorage with /anmeldung-koeln)
│    current visa /    │
│    entry stamp end?) │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 5. Document checklist│ ◀──── adapts to Student vs Worker
│    (greyed CTA gates │
│    on required ticks)│
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 6. Book your         │
│    appointment       │
│    (link out to Köln │
│    booking calendar) │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 7. Companion mode    │
│    (German phrases,  │
│    document order,   │
│    fee + payment)    │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 8. After issuance    │
│    — eAT card pickup,│
│    PIN letter, when  │
│    to renew, what    │
│    next jobs / cities│
│    require           │
└──────────────────────┘
```

7 screens (vs. Anmeldung's 12). The eID branch / Ummeldung branch / family-toggle complexity from Anmeldung doesn't apply here.

---

## Screen-by-screen (skeleton — full prose to come in v0.2)

### Screen 0: Landing

Same structure as Anmeldung's landing — Anton hero, three credibility chips, dark-green CTA. Single CTA: "Start — takes 4 minutes."

### Screen 1: Are you a non-EU citizen?

Two big choice cards: **Yes (non-EU)** / **No (EU, EEA, Switzerland)**.

If "No" → clean exit: *"You don't need a residence permit. Anmeldung is enough. You can move on with your life."*

### Screen 2: Why are you in Köln?

Three choice cards:

1. **Studying** — *Enrolled at a German university or about to be (Hochschule, Fachhochschule, Universität)*
2. **Working** — *Job offer, employment contract, or freelance gig with steady income*
3. **Other** — *Family reunification, self-employment, asylum, etc.*

If **Other** → soft off-ramp explaining v1 doesn't cover this yet, with a link to Köln's official Ausländerbehörde page.

### Screen 3: Anmeldung done?

Quick gate. **Yes** → continue. **No** → *"You need Anmeldung first — that's the cornerstone of every other paperwork step in Germany."* with a link to `/anmeldung-koeln`.

If `localStorage['helfa.anmeldung-koeln.state']` shows `meldebescheinigungObtainedAt !== null`, pre-tick this and skip the screen. (Cross-flow continuity — the two sub-products live on the same domain so they can read each other's state.)

### Screen 4: Visa countdown

> **When does your current visa, entry stamp, or Fiktionsbescheinigung expire?**

Date picker. Compute days remaining. If <30: red urgency banner. If 30–90: yellow. If >90: calm green.

Pre-fill from `helfa.anmeldung-koeln.state.moveInDate` if present (typical visa = 90 days from entry).

### Screen 5: Document checklist

Adapts to purpose from Screen 2.

**Both purposes need:**
| # | Item | German name |
|---|---|---|
| 1 | Passport (with valid visa or entry stamp) | Reisepass |
| 2 | Biometric photo, max 6 months old | Biometrisches Passfoto |
| 3 | Meldebescheinigung from Anmeldung | Meldebescheinigung |
| 4 | Proof of health insurance (Krankenkasse confirmation) | Krankenversicherungsnachweis |
| 5 | Proof of address — same Wohnungsgeberbescheinigung as Anmeldung | Wohnungsgeberbescheinigung |
| 6 | Application form (Antrag auf Erteilung eines Aufenthaltstitels) | Antragsformular |

**Student adds:**
| 7 | Enrollment confirmation (Immatrikulationsbescheinigung) | Immatrikulationsbescheinigung |
| 8 | Proof of financial means: blocked account ≥ €11,904 (2026 rate) OR scholarship OR parental Verpflichtungserklärung | Finanzierungsnachweis |

**Worker adds:**
| 7 | Signed employment contract OR job offer letter | Arbeitsvertrag |
| 8 | Filled "Erklärung zum Beschäftigungsverhältnis" form (employer fills this) | Erklärung zum Beschäftigungsverhältnis |
| 9 | Highest education certificate (Bachelor's, Master's, etc.) — recognized in ANABIN if foreign | Bildungsabschluss |
| 10 | If Blue Card: salary ≥ €45,300 (2026 rate, regulated professions €56,400) | Gehaltsnachweis |

Same gating pattern as Anmeldung Screen 4: greyed CTA, toast on disabled tap.

### Screen 6: Book your appointment

> **Köln runs the calendar. We point you at it.**

Köln's appointment system: `https://termine.stadt-koeln.de/m/auslaenderamt/extern/calendar/` *(verify exact URL — may differ from Anmeldung calendar)*.

Filter by appointment type — pick **"Aufenthaltstitel — Erstantrag"**.

Same honest reality:
- Slots are scarce
- Book the moment you have a slot, not when you have a deadline
- Same paste-to-parse confirmation card as Anmeldung Screen 6B

### Screen 7: Companion mode

Same pattern as Anmeldung Screen 7 — final document tick-through, big tappable German phrases, what-happens-at-the-desk rundown.

Phrases specific to Ausländerbehörde:
- "Ich beantrage einen Aufenthaltstitel" — "I'm applying for a residence permit"
- "Wann bekomme ich meinen Titel?" — "When will I get my permit?"
- "Kann ich mit dem Antrag schon arbeiten?" — "Can I work while the application is pending?"

Add a fee notice: **€100 first-issue (students), €110 first-issue (workers)** *(verify 2026 rates)*. Pay by card or cash on the day.

### Screen 8: After issuance

The user walks out with a **Fiktionsbescheinigung** (interim certificate) — the actual eAT card arrives 4–6 weeks later by post.

Timeline:
- **Day 0**: Fiktionsbescheinigung in hand. Don't lose it.
- **Day 14–28**: PIN letter from Bundesdruckerei arrives separately. Keep it — needed to activate eID.
- **Day 28–42**: eAT card arrives. Pick up at Ausländerbehörde or have it posted.
- **6 weeks before expiry of permit**: Renewal (Verlängerung) — book the appointment at the 6-week mark, not later.
- **Within 5 years (typically)**: Eligible for Niederlassungserlaubnis (permanent settlement) — different process.

.ics download for renewal date + eAT-pickup window.

---

## State model

For the frontend, each user has an `AuslaenderbehoerdeJourney`:

```ts
type AuslaenderbehoerdeState = {
  schemaVersion: 1;
  started: boolean;
  isNonEU: boolean | null;
  purpose: 'student' | 'worker' | 'other' | null;
  anmeldungDone: boolean | null;
  visaExpires: string | null; // ISO date
  documentsChecked: {
    passport: boolean;
    photo: boolean;
    meldebescheinigung: boolean;
    insurance: boolean;
    wohnungsgeber: boolean;
    antragsformular: boolean;
    // student-only
    immatrikulation?: boolean;
    finanzierung?: boolean;
    // worker-only
    arbeitsvertrag?: boolean;
    beschaeftigungserklaerung?: boolean;
    bildungsabschluss?: boolean;
    gehaltsnachweis?: boolean;
  };
  documentsConfirmed: boolean;
  appointment: { date: string; time: string } | null;
  fiktionsbescheinigungObtainedAt: string | null;
  eatCardObtainedAt: string | null;
  permitExpires: string | null; // for renewal reminders
};
```

Same data-derived screen pattern as Anmeldung — no `state.screen`, derive on each render.

`localStorage` key: `helfa.auslaenderbehoerde-koeln.state`.

---

## Cross-flow continuity (the new bit)

This is the first sub-product that READS another sub-product's state. Pattern:

- On Screen 3 (Anmeldung done?), check `localStorage['helfa.anmeldung-koeln.state']`. If `meldebescheinigungObtainedAt !== null`, auto-skip with a toast: *"We see you finished Anmeldung on [date]."*
- On Screen 5 (documents), if Anmeldung state has `personalDetails`, use them to pre-populate the application form (when Screen 5 implementation lands). User confirms, doesn't re-type.
- On Screen 8 (timeline), link back to `/anmeldung-koeln` if user wants to revisit the Meldebescheinigung guidance.

This works because both flows live on the same origin (`immigration-helper-taupe.vercel.app`). No backend, no shared schema, no migrations — just well-known `localStorage` keys.

---

## What we deliberately do *not* build in v1

- ❌ Permit-purpose flows beyond student + worker (deferred to v2)
- ❌ Account / login (same as Anmeldung — none required)
- ❌ Slot-watcher for the Ausländerbehörde calendar (same `robots.txt` blocker as Anmeldung)
- ❌ Document upload to Köln's portal (Köln doesn't have an upload API for this)
- ❌ Filling the Antrag PDF in-browser via pdf-lib — *deferred for v0.2 spec decision* (the form may or may not be a fillable AcroForm; needs verification)
- ❌ Employer-side flow for the "Erklärung zum Beschäftigungsverhältnis" form — that's a HR task, not the applicant's
- ❌ ANABIN degree-recognition lookup — out of scope for v1
- ❌ German-language UI

---

## Verified facts (TODO — every line below needs founder verification before v0.2)

These are best-effort guesses based on general knowledge, not confirmed.

1. **Booking URL** — TODO. Suspected: `https://termine.stadt-koeln.de/m/auslaenderamt/extern/calendar/` but the appointment-type slug may differ.
2. **Address of Köln Ausländerbehörde** — TODO. Suspected: Kalker Hauptstr. 247–273, 51103 Köln (shared building with Kundenzentrum Kalk, but separate department).
3. **Fees** — TODO. Suspected: €100 student first-issue, €110 worker first-issue, but 2026 rates may have changed.
4. **Blocked-account minimum (Sperrkonto)** — TODO. €11,904 in 2024, increases ~5% annually. Confirm 2026 rate via DAAD or auswaertiges-amt.de.
5. **Blue Card salary threshold** — TODO. €45,300 standard / €56,400 regulated (Mangelberufe) for 2024 per BAMF. Confirm 2026 rate.
6. **Antragsformular URL** — TODO. May be on stadt-koeln.de or formular-server.de.
7. **eAT card delivery time** — TODO. 4–6 weeks is folklore; check current Köln backlog.
8. **Whether Fiktionsbescheinigung is automatic on appointment day** — TODO.

The Anmeldung spec required two passes of verification (v1.0 → v1.1 corrections). Expect the same here.

---

## Engineering note

Same constraints as Anmeldung:

- Single React route, ~10 components
- Zero new backend endpoints, zero JPA, zero migrations
- `localStorage` for in-flight state
- Reuse `pdf-lib`, `FlowShell`, `Section`, `Field`, `RadioRow`, `Toast`, `PhraseOverlay`, `CheckIcon`, `googleCalendarUrl`, `buildIcs` from `/anmeldung-koeln`

Net new code: ~6 screens × ~150 lines each + 1 state file + 1 router + 1 docs lookup file = ~1,200 lines. **A few days, not weeks.**

Cross-flow continuity adds ~30 lines (a `readAnmeldungState()` helper).

---

## Success criteria for v1

Identical structure to Anmeldung:

1. A non-EU friend who finished Anmeldung can do their residence permit using only the page. End to end. No googling.
2. Every fact traces to an official source (BAMF, auswärtiges Amt, stadt-koeln.de, AufenthG).
3. Someone on r/cologne, r/germany, or r/IWantOut posts about it without us asking.

---

## v2 candidates

These earned a v1 spec slot but got cut for scope:

- **Familiennachzug** (family reunification) — different documents, often involves embassies, legally complex
- **Studienbewerber** (applying to study but not yet enrolled) — uses a 9-month visa first
- **Selbständige Tätigkeit** (self-employment / freelance) — needs business plan, financial projections
- **Asyl / subsidiärer Schutz** — different building (Bundesamt für Migration und Flüchtlinge — BAMF in Bonn-Lengsdorf, not Köln Ausländerbehörde)
- **Niederlassungserlaubnis** (permanent settlement after 5 years) — different application, often Sprachzertifikat B1+
- **Renewal (Verlängerung)** — different appointment type, simpler documents
- **Other cities** — Berlin LEA is famous for being unbearable; Munich KVR; Hamburg ZEA. Each has its own quirks
- **In-app filling of the Antrag PDF** — once we verify the form is AcroForm-fillable

---

## Next steps

1. Founder verifies every line in *Verified facts* (above) and produces v0.2 with corrections.
2. Run a v0.2 design review (same adversarial pattern as Anmeldung's review that produced v1.2 / v1.3).
3. Lock the v1.0 spec.
4. Build.

No code until v1.0 lock.

---

*End of spec. Last revision: 2026-05-11 — v0.1 (initial draft).*
