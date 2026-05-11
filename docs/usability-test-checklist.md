# Anmeldung Köln — usability test checklist

Spec success criterion #1: *A friend who has never been to Germany can do Anmeldung using only the page. End to end. No googling.*

This checklist is for that test. Find a friend, sit them down with their phone, and watch.

---

## Who to recruit

The ideal tester is one of these:

- **Just moved or about to move to Germany** — best signal, highest motivation.
- **Plans to move within 3 months** — engagement is real, fictional answers are minimal.
- **Has helped a partner/family member through Anmeldung** — knows the bureaucracy, can spot wrong info.

Avoid: anyone who has done Anmeldung in Köln in the last 12 months (they'll auto-correct your gaps without flagging them).

---

## Before they sit down (5 min prep)

- [ ] Tester has their own phone. We test on **mobile**, not desktop.
- [ ] Tester is on a fresh browser tab — no leftover localStorage from earlier sessions.
- [ ] You have a notepad (paper or another device). Don't take notes on the test phone.
- [ ] You have a stopwatch or just track wall-clock start time.
- [ ] Decide whether to test the **full flow** (45–60 min) or just **pre-appointment** (Screens 0 → 4 → form-fill, ~15 min).

---

## The framing — say this verbatim

> "I'm building a free tool to help people register their address when they move to Köln. I want to see if it actually works without me hovering. Pretend you just signed a lease in Köln and you have to do this thing called Anmeldung within 14 days. Use the page like you would on your own. Talk out loud as much as you can — what you're thinking, what's confusing, what you'd Google if I weren't sitting here. I won't help unless you completely stall. Ready?"

Then hand them the URL: `https://immigration-helper-taupe.vercel.app/anmeldung-koeln`

---

## What to watch for (write these down as they happen)

### Comprehension
- [ ] Do they know what Anmeldung is by the end of Screen 0?
- [ ] Do they understand "Wohnungsgeberbescheinigung" by the end of Screen 4?
- [ ] Can they explain back what they're supposed to bring to the appointment?

### Friction
- [ ] Where do they pause for >5 seconds? Note the screen and the field.
- [ ] Where do they go back? (Back button, browser back, restart from beginning.)
- [ ] Where do they reach for their phone to Google something?
- [ ] Do they understand the document checklist gating CTA on Screen 4?
- [ ] Do they realize they can paste their booking confirmation on Screen 6B?

### Form-fill on Screen 4 (the highest-stakes interaction)
- [ ] Do they expand the Anmeldeformular card?
- [ ] Do they understand they're filling Köln's official form, not a copy?
- [ ] Do they know which sections are required vs optional?
- [ ] Does the generated PDF open in a new tab without browser warnings?
- [ ] If they're moving from another German city, do they fill PLZ + Bundesland + Kreis?
- [ ] If from abroad, do they leave Country empty? (They shouldn't — but watch.)

### Appointment booking (Screen 6B)
- [ ] Do they actually click through to the Köln booking calendar?
- [ ] If they get a confirmation email, do they remember to come back and paste it?
- [ ] If the parser fails on their email, do they figure out the manual form fallback?

### Companion screen (Screen 7)
- [ ] Do they tap a phrase to enlarge it?
- [ ] Does the full-screen overlay feel useful or gimmicky?
- [ ] Would they actually use this in front of a clerk? (Ask after.)

---

## Things you should NOT explain

If they ask, say "what would you do if I weren't here?":

- Which button to click
- What a German word means (let them tap-translate or guess)
- Whether their answer is right
- Where to find the next step

The point is to find what the page leaves unanswered.

You CAN explain:

- Anything they wouldn't realistically have to deal with (e.g., "ignore the cookie banner if there is one")
- The framing of the test itself

---

## Post-test debrief (15 min, optional but high-value)

Open-ended first, then specifics.

1. **"Walk me through what you just did, in your own words."** Listen for what they remember vs forget.
2. **"What was the most confusing part?"**
3. **"What would you have Googled if I weren't here?"**
4. **"Would you actually use this when you move? Why or why not?"**
5. **"Would you tell a friend about it? In what context?"**
6. **"On a scale of 1–10, how confident are you that you could do Anmeldung now?"** (Pre-test baseline: 0.)
7. **"What's missing? What did you expect to see that wasn't there?"**

---

## Red flags that mean we don't ship yet

If any of these come up, fix before launch:

- They stall on Screen 4 because they don't know what document is what
- The generated PDF has a field that isn't filled but they expected it would be
- They Google a German word that the page should have translated
- They don't realize they need a Wohnungsgeberbescheinigung
- They miss the 14-day deadline framing entirely
- They give up before reaching Screen 8

---

## After the test

- [ ] Write up findings in a Google Doc / Notion page within 24 hours (memory fades fast).
- [ ] Group findings by severity: **must-fix-before-launch** / **nice-to-fix-soon** / **wishlist**.
- [ ] Create issues / TODOs for must-fix items.
- [ ] Re-test after fixes with a different tester (not the same one — they'll confirm rather than challenge).

---

## Scaling beyond one test

After three friend-tests with green outcomes, the next move is criterion #3 from the spec — *Someone on r/cologne or r/germany posts about it without us asking*. Don't post yourself; let it leak organically through the tester's networks. If 30 days pass with no organic mention, the product isn't recommendable yet — go back to interviews.
