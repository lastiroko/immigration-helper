# Helfa — Anmeldung Köln v1

**One flow. One city. Built so well a stranger on Reddit recommends it without being asked.**

- **User:** International students & working professionals moving to Köln
- **Language:** English only
- **Booking model:** Assisted (we walk them through Köln's own system), not on-behalf-of
- **Surface:** Standalone page at `/anmeldung-koeln` — does not require account for the first half
- **Goal of v1:** Get the user from "I just signed a lease" to "I am holding my Meldebescheinigung" without ever feeling lost

---

## The promise on the landing screen

> **Anmeldung in Köln, without the German.**
> A 14-day legal deadline, six required documents, nine Kundenzentren, two languages of confusion. We walk you through it once, perfectly. Free.

Below that, three credibility hooks (small, factual, no marketing fluff):
- *Wednesday morning is a walk-in window at every Kundenzentrum in Köln (until 12:00). Most guides won't tell you that.*
- *You can use any Kundenzentrum in the city, not just the one in your district.*
- *The form your landlord must sign is called a Wohnungsgeberbescheinigung. Without it, you'll be turned away.*

CTA: **Start — takes 4 minutes**

---

## Architecture: the flow as a state machine

```
┌─────────────┐
│ 0. Landing  │
└──────┬──────┘
       ▼
┌──────────────────────┐
│ 1. Do you already    │ ──── "Yes" ────▶ Exit to wohnsitzanmeldung.gov.de
│    have a German eID?│                  (federal online flow — ~10 min)
└──────┬───────────────┘
       │ No
       ▼
┌──────────────────────┐
│ 2. Do you have a     │ ──── "No" ────▶ Housing partner branch (exit)
│    residence yet?    │
└──────┬───────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ 3. When did you      │ ──── >14 days ago ──▶ "Don't panic" branch
│    move in?          │     (still continues, but with overdue copy)
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 4. Document checklist│ ◀──── User can leave & resume (localStorage)
│    (greyed button    │
│    until all ticked) │
└──────┬───────────────┘
       │ all ticked
       ▼
┌──────────────────────┐
│ 5. Pick your path    │
│    A) Walk-in (Mon   │
│       full / Wed AM) │
│    B) Book appt for  │
│       Tue/Thu/Fri    │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│ 6A. Walk-in day plan │   OR   ┌──────────────────────────┐
│     — which          │        │ 6B. Booked-appointment   │
│     Kundenzentrum,   │        │     plan — official       │
│     when to arrive,  │        │     calendar link + a     │
│     what to say      │        │     third-party watcher   │
└──────┬───────────────┘        └──────────┬───────────────┘
       │                                   │
       └───────────────┬───────────────────┘
                       ▼
┌────────────────────────────────────────┐
│ 7. The appointment companion           │
│    — German phrases, document order,   │
│    what happens at the desk            │
└──────┬─────────────────────────────────┘
       ▼
┌────────────────────────────────────────┐
│ 8. After Anmeldung — what comes next   │
│    Steuer-ID arrives in 2-3 weeks      │
│    Health insurance setup              │
│    GEZ letter is coming — pay it       │
│    Residence permit if non-EU          │
│    (Calendar reminders, opt-in)        │
└────────────────────────────────────────┘
```

Each screen is one decision. No screen has more than one primary CTA.

---

## Screen-by-screen spec

### Screen 0: Landing

**Layout:**
- Headline (Anton, large): *"Anmeldung in Köln, without the German."*
- Subline (Inter): One sentence on the legal deadline + free.
- Three credibility hooks as small cards (the three above).
- CTA pill: **"Start — takes 4 minutes"**
- Below the fold: *"Why us"* — three lines on what makes this different from googling. Short.
- Footer: legal disclaimer (we're not lawyers, official source is stadt-koeln.de, link).

**No nav. No login. No marketplace. No mention of "the platform". Just this one job.**

---

### Screen 1: "Do you have a German eID?"

**Single question, two big buttons:**

- ✅ **Yes — German ID card or residence permit (eAT) with the online function activated**
- ❌ **No, or I'm not sure**

**If "Yes" → eID branch (clean exit):**

> **You can do this entirely online. No queue. No paperwork.**
>
> Germany's federal portal lets anyone with an active eID register their new address from a phone in about 10 minutes. You'll need:
> - Your German ID card or eAT card with the online function turned on
> - Your six-digit eID PIN
> - The official AusweisApp (free)
>
> [Continue at wohnsitzanmeldung.gov.de] [I changed my mind, walk me through the in-person flow]
>
> *Most newcomers don't have an active eID yet — if that's you, pick the second option.*

**If "No" → continue to Screen 2.**

This is the honest first filter. It costs us a small slice of users (who didn't need us anyway) and earns trust by not pretending the in-person flow is the only path.

---

### Screen 2: "Do you have a place to live yet?"

**Single question, two big buttons:**

- ✅ **Yes, I have an address in Köln**
- ❌ **Not yet — I'm still looking**

**If "No" → housing branch:**

> **You can't do Anmeldung without an address. Let's fix that first.**
>
> Three options ranked by how fast they get you registerable:
>
> 1. **Temporary furnished rental** (Wunderflats, Homelike) — you can register at most of these. *Always confirm the landlord will sign a Wohnungsgeberbescheinigung before booking — some refuse and the place becomes useless to you.*
> 2. **Sublease (Untermiete)** — legal *only if* the main tenant has written permission from their landlord to sublet *and* registers you. Risky, common, ask explicitly.
> 3. **Long-term rental** — competitive in Köln. ImmoScout24, WG-Gesucht, Kleinanzeigen.
>
> [Save my email and notify me when I'm ready] [No thanks, I'll find it myself]

That's the exit. Not a sales pitch. We don't push them into our marketplace; we tell them the truth and offer to remember them.

**If "Yes" → continue to Screen 3.**

---

### Screen 3: "When did you move in?"

Date picker. Today defaults selected.

**Logic:**
- **≤ 14 days ago:** "You're on time. Let's get this sorted." → Screen 4.
- **> 14 days ago:** "You're past the 14-day deadline." Calm, factual copy:
  > *In practice, fines are rare unless months have passed, and most Kundenzentrum staff don't ask. The longer you wait, the more services (bank, insurance, residence permit) get blocked. Let's do it now.*
  → Screen 4.

No shame, no scolding. The user is already anxious; the app is the calm one.

---

### Screen 4: The document checklist (the heart of the app)

**Header:** *"Bring all of these. Miss one and they'll send you home."*

A small additional question at the top: *"Are you a non-EU citizen?"* — Yes/No. If Yes, item 5 (visa/eAT) becomes required; if No, it's hidden.

The checklist — each item is a tappable card that expands to show details:

| # | Document (English) | German name | Source |
|---|---|---|---|
| 1 | Your passport or national ID | Reisepass / Personalausweis | You already have it |
| 2 | Landlord's confirmation | **Wohnungsgeberbescheinigung** | Your landlord must sign — see below |
| 3 | Lease contract (recommended, not strictly required) | Mietvertrag | Your landlord |
| 4 | Filled-in registration form | Anmeldeformular | We give you a cheat-sheet — see below |
| 5 | **Non-EU only:** visa sticker or eAT residence permit card | Visum / Aufenthaltstitel (eAT) | Bring it if you have it |
| 6 | Marriage / birth certificates if registering family | Heirats- / Geburtsurkunde | Bring originals + certified German translation |
| 7 | Tax ID, *if you already have one* (most don't on first move) | Steuer-ID | Skip if first time in Germany |

**The Wohnungsgeberbescheinigung card expands to:**

> **The single document that turns most people away.**
>
> Your landlord (or main tenant, if subletting) must fill and sign this within 14 days of you moving in. By law, they're *required* to provide it.
>
> **What to send your landlord:**
>
> [Copy German message] *Sehr geehrte/r [Name], laut §19 BMG benötige ich für meine Anmeldung beim Bürgeramt eine Wohnungsgeberbescheinigung. Könnten Sie mir das ausgefüllte Formular bitte zusenden? Vielen Dank.*
>
> [Open the official Köln form (formular-server.de)]
>
> *If your landlord refuses or stalls, this is illegal. They face a fine up to €1,000. Mention this politely.*

**The Anmeldeformular card expands to:**

> **We give you a cheat-sheet. You fill the official form.**
>
> Köln's official Anmeldeformular lives on the city's form server and changes from time to time. We don't host a copy — that creates drift risk, and you'd get rejected if our copy fell behind. Instead, we generate a **printable cheat-sheet** that tells you exactly what to write in each field of the official form. We need a few details:
> - Full legal name (as on passport)
> - Date and place of birth
> - Nationality
> - Marital status
> - Religion (this affects church tax — see footnote)
> - Previous address
> - Köln address
>
> [Get my cheat-sheet] [Open the official form (formular-server.de)]
>
> *Print the cheat-sheet, keep it next to the form, copy it field-by-field. Same outcome, zero risk of an outdated copy.*

**The greyed button at the bottom:**

> **Continue → Pick your appointment**
> *(Tick all required documents above)*

The button is visually disabled until items 1, 2, and 4 are checked. Item 5 is also required if the user marked themselves non-EU at the top of the screen. Items 3, 6, 7 are conditional and the logic adapts. Greying is not just visual — the click handler is no-op'd, and on attempted tap a small toast says *"You're missing: Wohnungsgeberbescheinigung."*

This is the forcing function. This is the feature.

---

### Screen 5: "How fast do you want this done?"

Two cards, side by side:

**🟢 Walk-in — same day or tomorrow morning**
- *Open Mon (full day, 7:30–15:00) and Wed (half-day, 7:30–12:00) without an appointment*
- *Arrive 15 min before opening; expect 1–3 hours waiting*
- *Best for: anyone whose schedule allows a morning off*
- → Screen 6A

**🟡 Booked appointment — Tue, Thu, or Fri**
- *Köln's online calendar is often empty for weeks*
- *We point you straight at the official link and a third-party watcher; you book it*
- *Best for: anyone who can't take an unpredictable morning off*
- → Screen 6B

Honest framing. We don't hide that walk-in means waiting; we don't oversell the booking calendar.

*(If the founder's call to 0221/221-0 reveals walk-in is currently suspended, this screen gets a yellow status banner and the walk-in card is dimmed. Build proceeds with walk-in as the default path until proven otherwise.)*

---

### Screen 6A: Walk-in plan

**"Go to Kundenzentrum Innenstadt on Wednesday morning."**

- Map (one pin: the Kundenzentrum we recommend — Innenstadt by default because it's central; user can switch).
- Address (Laurenzplatz 1-3, 50667 Köln), opening time, walking/transit time from their address.
- *"Arrive by 7:15 for a 7:30 opening. Bring a book or laptop — phone signal is patchy inside."*
- **If Wednesday:** *"Wednesday closes at 12:00 — they stop pulling new numbers around 11:30. Be there at opening to be safe."*
- A quick rundown:
  > 1. Take a number from the machine ("Anmeldung" / "Wohnsitz anmelden")
  > 2. Wait for your number on the screen
  > 3. Go to the assigned counter
  > 4. Hand over your documents in the order you have them
  > 5. They'll print your Meldebescheinigung on the spot — keep it safe, you'll need it many times
- **If you came from abroad:** *"You must appear in person. Köln does not accept a Vollmacht (proxy) for a first registration from abroad — don't waste a morning trying."*
- CTA: **"I'm going" → Screen 7 (companion mode)**

The list of all nine Kundenzentren (Chorweiler, Ehrenfeld, Innenstadt, Kalk, Lindenthal, Mülheim, Nippes, Porz, Rodenkirchen) is one tap away. Each shows opening hours and a static "typical wait time" estimate (live data is a v2 candidate).

**Note:** Innenstadt I (ground floor) is the walk-in entrance. Innenstadt II (4th floor of the same building) is appointment-only — don't go up to 4 if you're walking in.

---

### Screen 6B: Booked-appointment plan

> **Köln runs the calendar. We point you at it.**
>
> Tue/Thu/Fri appointments are booked through Köln's official system at [termine.stadt-koeln.de](https://termine.stadt-koeln.de/m/kundenzentren/extern/calendar/?uid=b5a5a394-ec33-4130-9af3-490f99517071). The honest reality:
>
> - **Slots are scarce.** It is normal to refresh the calendar every day for a week or two and see nothing. New slots tend to open in small batches (often early morning) and get claimed within minutes.
> - **You must appear in person if you came from abroad** — Köln does not accept a Vollmacht for a first registration from abroad. Whoever you book for, that's who shows up.
> - **One person already built a slot watcher** for Köln: [terminator.koeln](https://terminator.koeln/). It's third-party, not ours, not endorsed beyond "this exists and many people use it." Read its terms before signing up.
>
> [Open Köln's official booking page] [Open Terminator (third-party)] [I prefer the walk-in route]

**Why we don't run our own slot watcher in v1:** the city's booking host disallows automated polling in `robots.txt`. Building a polite watcher anyway is a v2 decision once we know whether v1 has the audience to justify it. See *v2 candidates* at the bottom of this spec.

→ Screen 7 once they've booked.

---

### Screen 7: The appointment companion

This screen is what the user pulls up *at the Kundenzentrum*, on their phone, while waiting in line.

**Top section: Today's checklist (interactive — one final tick-through)**
- All documents I should have (re-listed)
- *"Tap each one to confirm it's in your bag right now."*

**Middle section: German phrases, big and tappable**

| Situation | German | Pronunciation hint |
|---|---|---|
| "I'm here for Anmeldung." | *Ich möchte mich anmelden.* | ish MURK-tuh mish AN-mel-den |
| "I don't speak German, do you speak English?" | *Ich spreche kein Deutsch. Sprechen Sie Englisch?* | ish SHPREH-khuh kine doytch |
| "Could you write that down for me?" | *Könnten Sie das bitte aufschreiben?* | KURN-ten zee dass BIT-uh OWF-shry-ben |
| "When will I get my Meldebescheinigung?" | *Wann bekomme ich die Meldebescheinigung?* | vahn beh-KOM-uh ish dee... |
| "Thank you, goodbye." | *Vielen Dank, auf Wiedersehen.* | FEE-len dahnk, owf VEE-der-zay-en |

Tap to enlarge — full-screen big text mode. The user can hold their phone up to the staff member if needed.

**Bottom section: What's about to happen**
- They'll ask for your documents in roughly this order
- They might ask about religion (church tax) — you can decline by saying *konfessionslos*
- They'll print your Meldebescheinigung and you'll walk out with it
- You'll receive your Steuer-ID by post in 2–3 weeks

---

### Screen 8: "What's next" — the after-Anmeldung engine

**This is where the app changes from a one-trick wizard into a relationship.**

> **You're registered. Here's what happens in the next 90 days.**

A timeline, not a list:

```
Day 0 (today)         You walked out with your Meldebescheinigung. Keep it safe.
Day 14–21             Your Steuer-ID arrives by post. Brown envelope, looks
                      official. Do not throw it away. You'll need it for work,
                      banking, and tax forever.
Day 14–30             A letter from "Beitragsservice" (GEZ) arrives demanding
                      €18.36/month. This is the broadcasting fee. PAY IT —
                      ignoring it tanks your credit score (SCHUFA).
                      You can apply for exemption only if you're on benefits.
Within 90 days        If you're non-EU: apply for your residence permit at the
                      Ausländerbehörde. The wait list in Köln is long — start
                      now, not in month 2.
Within 30 days        Pick a health insurance (Krankenkasse). If you're employed,
                      tell HR your choice. TK is the easiest for English speakers.
Whenever              Open a German bank account (you needed Anmeldung for this).
                      N26 or bunq if you want it in English in 10 minutes.
```

**Each row is a card with:**
- A clear "[Set reminder]" button (Google Calendar / Apple Calendar deep link, opt-in, no account needed for v1)
- A "[Help me with this]" button → goes to a parking-lot page that says "We're building this flow next. Drop your email to be notified." (Honest. We're not pretending these flows exist yet.)

**Bottom CTA:** *"Save these reminders to your calendar"* — generates one .ics file with all the right dates.

---

## Account model for v1

**No required account.** The first four screens work in a fresh browser, no signup. State persists in `localStorage`.

**Email is asked for at most once**, at the optional "save reminders" step on Screen 8. That's it. No marketing emails. No "create your Helfa profile." The friction kills conversion and we don't need it for v1.

---

## What we deliberately do *not* build in v1

- ❌ The full "all 5 cities" platform
- ❌ Other topics (police, tax filing, hospital) — they're parking-lot pages with email capture
- ❌ Marketplace integration (the housing exit links to external partners only — no embedded marketplace UI)
- ❌ Document storage / vault — we generate the cheat-sheet for the Anmeldeformular and the user fills the official form themselves
- ❌ **Our own slot watcher** — deferred to v2; we link to Terminator if users want automation
- ❌ Stripe / paid tier — v1 is free
- ❌ Mobile app theme parity — web only
- ❌ User accounts with passwords
- ❌ The Vollmacht / on-behalf-of booking — too much legal/liability for v1, and Köln rejects it for from-abroad registrations anyway

The current backend (15 migrations, billing, vault, partner webhooks) **stays as-is**. We don't refactor it. We build `/anmeldung-koeln` as essentially a separate, much simpler product that shares the deployment but not the data model. If it works, we evolve. If it doesn't, we throw away one page, not a year of work.

---

## Verified facts (from the 2026-05-07 verification pass)

These are the facts the spec depends on. Verified against stadt-koeln.de and the booking host on 2026-05-07.

1. **Walk-in days at Köln Kundenzentren** — Mon (7:30–15:00) full-day, Wed (7:30–12:00) half-day; uniform across all nine Kundenzentren. Tue/Thu/Fri are appointment-only.
2. **Wohnungsgeberbescheinigung** is the official Köln term (the spec previously used "Wohnungsgeberbestätigung" — corrected throughout). Form ID `02-F17_WohnGeberBest` on Köln's form server. Landlord deadline: 14 days from move-in. Refusal is a violation, with penalties up to €1,000 for the landlord.
3. **Köln booking system URL** — `https://termine.stadt-koeln.de/m/kundenzentren/extern/calendar/?uid=b5a5a394-ec33-4130-9af3-490f99517071` (per Köln's article 06415).
4. **Anti-bot on the booking host** — `robots.txt` says `Disallow: /` for all user-agents; ASP.NET session + `__RequestVerificationToken` on every page. Hence: no homemade slot watcher in v1.
5. **Anmeldeformular** is form ID `34-F27_Anmeldung` on Köln's form server; interactive form, not a flat PDF. v1 generates a cheat-sheet, user fills the official form.
6. **Non-EU specifics** — no special Anmeldung form, but bring visa sticker or eAT card. *"Bei Zuzug aus dem Ausland müssen Sie immer selbst vorsprechen"* — first-time registration from abroad must be in person, no Vollmacht.

**One outstanding check (founder is doing it manually):** confirm walk-in is currently active by calling 0221/221-0. If the city has temporarily suspended walk-in, Screen 5 needs a current-status banner; build proceeds with walk-in as the default path until proven otherwise.

---

## Engineering note (small)

This is a single React route with maybe 10 components and **zero new backend endpoints**. No JPA entities. No new migrations. Use `localStorage` for in-flight state. The cheat-sheet generator is a client-side PDF/HTML render. The .ics file (Screen 8) is also client-side. **Days, not weeks, to build.**

---

## Success criteria for v1

We don't ship until:

1. A friend who has never been to Germany can do Anmeldung using only the page. End to end. No googling.
2. Every fact on the page traces to an official source we can cite (most already do — see *Verified facts* above).
3. Someone on r/cologne or r/germany posts about it without us asking.

If 1–2 are met but 3 doesn't happen within a month of launch, the product isn't good enough yet — go back to user interviews.

---

## v2 candidates (deferred from v1)

These earned a v1 spec slot at one point and got cut for scope or risk. If v1 has the audience and the slot scarcity stays painful, revisit:

- **Our own slot watcher.** Cut from v1 because the booking host's `robots.txt` disallows all automated polling. Re-evaluate by either: (a) reaching out to the city for an explicit data-sharing arrangement, (b) integrating Terminator's data if they expose a feed, or (c) building a polite watcher with an identifiable User-Agent and accepting the city may block us. Original engineering note: a templated email + scheduled cron polling at a respectful interval (≥10 min) plus a `slot_watchers` table and one backend endpoint.
- **Live wait-time data per Kundenzentrum.** Köln's wait-time page is a static daily snapshot; v2 could scrape or estimate per-center load.
- **Document vault** for the user's filled Anmeldeformular cheat-sheet + Wohnungsgeberbescheinigung scan.
- **The next bureaucracy step** for non-EU users: residence permit at the Ausländerbehörde (Aufenthaltserlaubnis zu Studienzwecken / zur Erwerbstätigkeit). Currently a parking-lot link in Screen 8.
- **Other cities** — Berlin, Munich, Hamburg, Frankfurt. Each has its own quirks; treat as separate flows, not a templated multi-city platform.

---

## What I'd cut if you want it shipped in two weekends instead of three

The slot watcher cut is already in. Beyond that:

- Drop the appointment companion (Screen 7) — combine with Screen 6A.
- Drop the after-Anmeldung timeline (Screen 8) — replace with a single email capture: "We'll email you when your Steuer-ID is due."

That's still a better product than what exists today, and it's two weekends of work tops.

---

*End of spec. Last revision: 2026-05-07 — v1.1 (verification corrections + slot watcher cut).*
