# Helfa — Ausländerbehörde Köln (residence permit) v1

**Status:** Draft v0.2 — most facts verified against stadt-koeln.de + th-koeln.de (2026-05-11 pass). Worker-permit specifics + fees + Fiktionsbescheinigung policy still need verification before v1.0 lock.

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
│ 6. Book your         │ ◀──── Köln has 9 Bezirksausländerämter (one per
│    appointment at    │     district). User must apply to the office
│    YOUR district's   │     covering THEIR Köln postal code — wrong
│    Bezirksamt        │     office = appointment refused.
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

**Both purposes need (verified against stadt-koeln.de + th-koeln.de):**
| # | Item | German name |
|---|---|---|
| 1 | Passport with valid visa or entry stamp + copies of all printed pages | Reisepass |
| 2 | Biometric photo, **35×45 mm, max 3 months old** | Biometrisches Passfoto |
| 3 | Meldebescheinigung from Anmeldung | Meldebescheinigung |
| 4 | Proof of health insurance | Krankenversicherungsnachweis |
| 5 | Rental contract (copy) — proof of address | Mietvertrag |
| 6 | Filled application form (form ID **33-F07_ErstAntBefAuf**) | Erstantrag auf Erteilung eines befristeten Aufenthaltstitels |

**Student adds:**
| 7 | Enrollment confirmation | Immatrikulationsbescheinigung |
| 8 | Proof of financial means: **Sperrkonto ≥ €11,904 / year (€992/month, 08/2025 rate)** OR scholarship OR Verpflichtungserklärung | Finanzierungsnachweis |

**For renewals from 4th semester onward, additionally:**
| 9 | Progress certificate showing academic achievements + expected completion date | Studienverlaufsbescheinigung |

**Worker adds (still TODO — needs verification before v1.0):**
| 7 | Signed employment contract OR job offer letter | Arbeitsvertrag |
| 8 | Filled "Erklärung zum Beschäftigungsverhältnis" form (employer fills this) | Erklärung zum Beschäftigungsverhältnis |
| 9 | Highest education certificate — recognized in ANABIN if foreign | Bildungsabschluss |
| 10 | If Blue Card: salary above the annual threshold (TODO: 2026 rate) | Gehaltsnachweis |

Same gating pattern as Anmeldung Screen 4: greyed CTA, toast on disabled tap.

### Screen 6: Book your appointment

> **Köln has 9 Bezirksausländerämter. You go to the one that covers YOUR district.**

Unlike Anmeldung — where any of the 9 Kundenzentren accepts you — the Ausländeramt is **postal-code-routed**. Your application goes to the Bezirksausländeramt that covers your Köln address. The wrong office will turn you away.

We need to:
1. Take the user's Köln postal code (already in `helfa.anmeldung-koeln.state.personalDetails.koelnPostalCode`)
2. Map it to the correct Bezirksausländeramt
3. Surface the booking link for THAT office only

Köln's appointment overview: [https://www.stadt-koeln.de/artikel/06415/index.html#ziel_0_72](https://www.stadt-koeln.de/artikel/06415/index.html#ziel_0_72)

The 9 Bezirksausländerämter map to Köln's 9 city districts (Stadtbezirke):
1. Innenstadt
2. Rodenkirchen
3. Lindenthal
4. Ehrenfeld
5. Nippes
6. Chorweiler
7. Porz
8. Kalk
9. Mülheim

(Same district names as the Kundenzentren from Anmeldung — likely same buildings, separate departments.)

Same honest reality as Anmeldung's booking screen:
- Slots are scarce in Köln
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

## Verified facts (as of 2026-05-11 — sources cited)

### ✅ Verified

1. **Köln has 9 Bezirksausländerämter, not one central office.** Postal-code-routed: your application goes to the office covering your Köln district. (Source: stadt-koeln.de/leben-in-koeln/soziales/auslaenderamt/)
2. **First-issue residence permit form ID:** `33-F07_ErstAntBefAuf` — *Erstantrag auf Erteilung eines befristeten Aufenthaltstitels*. (Source: stadt-koeln.de/service/produkte/00973/)
3. **Form URL (HTML wrapper):** `https://formular-server.de/Koeln_FS/findform?shortname=33-F07_ErstAntBefAuf&formtecid=3&areashortname=send_html`
4. **Underlying PDF (CORS-open, AcroForm-fillable):** `https://formular-server.de/Koeln_FS/getform/33-F07_ErstAntBefAuf_send_html_HTML/011-001/33-F07_ErstantragErteilung_befristetenAufenthaltstitels-V10_Vorl-1.12.pdf` — confirmed by HEAD request 2026-05-11. Same form-fill pattern as the Anmeldeformular works.
5. **Sperrkonto minimum for students:** €11,904 / year (€992 / month) as of 08/2025. (Source: th-koeln.de + stadt-koeln.de)
6. **Biometric photo spec:** 35 × 45 mm, max 3 months old. (Source: th-koeln.de)
7. **Two student visa entry types:** *Visum zu Studienzwecken* (already enrolled) vs *Visum zur Studienvorbereitung* (applying to study). Both need a residence permit after Anmeldung. (Source: th-koeln.de)
8. **Renewal lead time:** Apply ~3 months before current permit expires. From 4th semester onward, bring a progress certificate. (Source: th-koeln.de)
9. **Köln-specific warning:** "Send your application to the correct district immigration office" — wrong office = appointment refused. (Source: th-koeln.de)
10. **Booking page (overview):** [stadt-koeln.de/artikel/06415/index.html#ziel_0_72](https://www.stadt-koeln.de/artikel/06415/index.html#ziel_0_72) — links into per-district calendars from there.

### ⚠ Still TODO before v1.0 lock

- **Worker / Blue Card document checklist** — TH Köln only covers students; worker requirements need a separate source (possibly BAMF *Make it in Germany* or stadt-koeln.de's Erwerbstätigkeit page).
- **Blue Card salary thresholds for 2026** — €45,300 / €56,400 (regulated professions) was the 2024 rate per BAMF. Current values need check.
- **Fees in euros** — first-issue and renewal. €100 / €110 is folklore.
- **Fiktionsbescheinigung policy** — issued same-day at the appointment? Or by post?
- **eAT card delivery time** — 4–6 weeks is folklore; check current Köln backlog.
- **Per-district Bezirksausländeramt addresses + postal-code mapping** — needed for Screen 6 routing logic.
- **Direct booking calendar URL** — overview page above links to per-district calendars; need to enumerate the 9 final URLs.
- **Phone numbers** per district.

The Anmeldung spec required two passes of verification before lock. This spec is partway through pass 1.

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

*End of spec. Last revision: 2026-05-11 — v0.2 (verified facts pass against stadt-koeln.de + th-koeln.de; structural correction: 9 Bezirksausländerämter, not one central office; confirmed form 33-F07_ErstAntBefAuf is AcroForm-fillable like the Anmeldeformular).*
