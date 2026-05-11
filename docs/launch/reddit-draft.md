# Reddit launch post — draft

**Status:** Draft for founder review. **Do not post until usability-test-checklist.md passes with at least one real-user test.** Spec criterion #3 says the org-grown signal of success is "someone on r/cologne or r/germany posts about it without us asking" — so the founder posts ONCE to seed, the rest must be organic.

---

## Where to post

Order, with reasoning:

1. **r/cologne** (15k members, German + English, locals + newcomers). Highest fit. Post in English with a short German one-liner at the top so locals don't auto-skip.
2. **r/germany** (450k members, mostly newcomers). Secondary. Post here only if r/cologne goes well.
3. **r/IWantOut** (250k members, future expats). Tertiary — they're not in Köln yet, so engagement is lower-quality but reach is high.
4. **r/AskAGerman** (90k). Skip — better for Q&A than launch posts.
5. **r/expats** (180k). Skip — too generic, will get downvoted as off-topic.

**Do NOT cross-post simultaneously.** Reddit treats simultaneous cross-posts as spam. Post to r/cologne, wait 24–48h, learn from feedback, then post to r/germany with adjusted copy.

---

## Subreddit rules check (do this BEFORE posting — rules change)

- [ ] r/cologne: read sidebar + sticky for self-promotion rules. As of writing, links to free non-commercial tools by community members are generally OK if framed as "I made a thing, hope it helps."
- [ ] r/germany: stricter on self-promotion. Frame as "I made this for myself and figured it might help others." Don't post if you've never engaged in the sub before.

---

## Account warmup (3–7 days BEFORE posting)

- [ ] Use an account that has at least some history (>30 day age, >50 comment karma). A new account posting a tool link smells like spam.
- [ ] Comment helpfully on 2–3 unrelated r/cologne / r/germany threads first. Build context.

---

## Post format — r/cologne (primary)

### Title (try one, A/B if you want):

**A.** I built a free thing that walks you through Anmeldung in Köln in English. Looking for honest feedback.

**B.** Anmeldung in Köln, in English. Free. No signup. Built it because I couldn't find anything that actually worked.

**C.** Made an English-language guide for Anmeldung in Köln — fills the official form for you. Would love brutal feedback.

Recommended: **A** or **C**. They lead with the help-ask, not the brag. Reddit responds better to "looking for feedback" than "look what I made."

### Body:

```
TL;DR — https://immigration-helper-taupe.vercel.app/anmeldung-koeln

I'm an international resident in Köln. When I did my Anmeldung, I bounced between five blog posts and the city's German-only website for a week before figuring it out. So I built the page I wished existed.

What it does:
- Walks you through every decision (do you have a German eID? are you moving from abroad or within Germany? do you have an address yet?) in 12 short screens.
- Tells you the 6 documents you need, with the German names so you don't get sent home for asking for the wrong thing.
- Surfaces the Wednesday morning walk-in window at every Kundenzentrum (a fact most guides bury).
- Fills the official Köln Anmeldeformular (form 34-F27) for you, in your browser, from the live PDF on the city's form server. You print it and sign it. Same form Köln serves — no replica, no drift risk.
- Companion mode for the appointment itself: tap a German phrase to enlarge it full-screen so you can hold the phone up to the clerk.

What it isn't:
- Not affiliated with the Stadt Köln. We just point you at their stuff in plain English.
- Not a paid service. No signup, no email, no account. Everything saves in your browser.
- Not legal advice. We're not lawyers. The official source for everything is stadt-koeln.de — linked from every page.

Built mobile-first, in English only for now. Köln-only. If this works, the residence-permit flow at the Ausländerbehörde is next.

I'd love to know:
1. Did you understand what to do at every screen? (If you got stuck, where?)
2. Did the form-fill output look right? (Or did the city reject it because a field was wrong?)
3. What's missing that you needed?

Roast me — I'd rather find out from you than from the friend I'm about to hand it to.

— [your reddit handle]
```

### Body for r/germany (secondary, if r/cologne goes well):

Same structure but adjust the opening:

> "I made a thing for Köln Anmeldung. Sharing here in case anyone moving to Köln (or someone you know) is about to do this. Köln-only for now — other cities are not on the page yet."

Be explicit about the Köln-only scope upfront so you don't get "what about Berlin?" comments.

---

## Things to do BEFORE posting

- [ ] Run through the page yourself one more time. Make sure nothing looks broken.
- [ ] Test on a fresh browser / incognito window — make sure no leftover localStorage gives a weird first impression.
- [ ] Test on a phone. Reddit traffic is mostly mobile.
- [ ] Check the OG preview: paste the URL into a Slack DM to yourself to confirm the title + description render correctly.
- [ ] Have at least one friend-test passed (`docs/usability-test-checklist.md`).

## Things to do AFTER posting

- [ ] Stay around for the first 2–4 hours. Reply to every comment within 30 minutes during that window. Reddit rewards fast OP responses.
- [ ] Don't get defensive when criticised. "Good catch, fixing this week" beats "actually it does that, you missed it."
- [ ] Track inbound traffic via Vercel analytics (free tier) and screenshot the spike for posterity.
- [ ] Save every concrete bug report or feature request as a TODO, not as a comment reply.

## What success looks like

- 50+ upvotes on r/cologne in 24h = product-market fit signal worth following
- 1+ unsolicited comment "saving this for when I move" = real value being created
- 1+ DM asking "could you do this for [other city]" = expansion signal — note but do not act on
- Crickets (<10 upvotes, no comments) = page isn't recommendable yet — back to user interviews

## What to do if it gets popular

- Don't add features in a panic. Stay focused on Köln Anmeldung quality.
- Add the residence-permit flow next (already spec'd), since that's what most Anmeldung users will need within 90 days.
- Resist the urge to expand to other cities until the residence-permit flow is also shipped.

---

*Draft v1 — 2026-05-11. Update with the actual reddit handle + any feedback from a pre-post review.*
