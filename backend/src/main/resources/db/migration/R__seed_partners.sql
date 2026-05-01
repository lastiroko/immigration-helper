-- Helfa Phase 5 seed: marketplace partners (MVP roster).
-- Repeatable migration; idempotent via ON CONFLICT(slug).
--
-- Commission disclosures are placeholder copy; replace with the partner-supplied
-- disclosure language before any production launch. Trustpilot ratings will be
-- pulled live in Phase 2 of the post-MVP roadmap; static placeholders for now.

INSERT INTO partners (slug, name, category, logo_url, website_url, affiliate_url_template,
                      commission_disclosure, rating, active, supported_nationalities)
VALUES
    -- ── Blocked accounts (Sperrkonto) ──────────────────────────────
    ('fintiba', 'Fintiba', 'BANK',
     NULL, 'https://fintiba.com',
     'https://fintiba.com/?aff_sub={tag}',
     'Helfa earns a referral fee when you open a Sperrkonto via this link. The fee does not affect your price.',
     4.50, TRUE, ARRAY[]::TEXT[]),

    ('expatrio', 'Expatrio', 'BANK',
     NULL, 'https://www.expatrio.com',
     'https://www.expatrio.com/?aff={tag}',
     'Helfa earns a referral fee when you open an Expatrio Value Package. Disclosed per §5a UWG.',
     4.30, TRUE, ARRAY[]::TEXT[]),

    -- ── Health insurance ──────────────────────────────────────────
    ('feather', 'Feather Insurance', 'INSURANCE',
     NULL, 'https://feather-insurance.com',
     'https://feather-insurance.com/?ref={tag}',
     'Helfa earns a brokerage fee paid by Feather. You pay the standard premium; the fee comes from Feather''s margin.',
     4.70, TRUE, ARRAY[]::TEXT[]),

    ('ottonova', 'ottonova', 'INSURANCE',
     NULL, 'https://www.ottonova.de/en',
     'https://www.ottonova.de/en?utm_source=helfa&aff={tag}',
     'Helfa earns a brokerage fee from ottonova for new private health insurance policies.',
     4.40, TRUE, ARRAY['DE','US','GB','IN','CN','BR']),

    -- ── Housing ────────────────────────────────────────────────────
    ('wunderflats', 'Wunderflats', 'HOUSING',
     NULL, 'https://wunderflats.com',
     'https://wunderflats.com/?aff={tag}',
     'Helfa earns a service fee from Wunderflats for confirmed bookings. The fee does not affect your rent.',
     4.20, TRUE, ARRAY[]::TEXT[]),

    ('housing-anywhere', 'HousingAnywhere', 'HOUSING',
     NULL, 'https://housinganywhere.com',
     'https://housinganywhere.com/?af={tag}',
     'Helfa earns a referral fee paid by HousingAnywhere on confirmed bookings.',
     4.10, TRUE, ARRAY[]::TEXT[]),

    -- ── Sworn translation ─────────────────────────────────────────
    ('beglaubigung24', 'Beglaubigung24', 'TRANSLATION',
     NULL, 'https://www.beglaubigung24.de',
     'https://www.beglaubigung24.de/?ref={tag}',
     'Helfa earns 15-25% margin on sworn translations ordered through this link. Disclosed per §5a UWG.',
     4.60, TRUE, ARRAY[]::TEXT[]),

    -- ── Language schools / certificates ───────────────────────────
    ('goethe', 'Goethe-Institut Online', 'LANGUAGE',
     NULL, 'https://www.goethe.de/en/spr/kup/kur.html',
     NULL,
     'Editorial listing — Helfa does not earn a fee. Linked because Goethe certificates satisfy A1 requirements for family-reunion visas.',
     4.80, TRUE, ARRAY[]::TEXT[]),

    -- ── Legal ─────────────────────────────────────────────────────
    ('schluender', 'Schlün & Elsner Rechtsanwälte', 'LEGAL',
     NULL, 'https://www.schluender.info',
     NULL,
     'Editorial listing — Helfa does not earn a fee. English-speaking immigration lawyers covering Berlin, Munich, Frankfurt.',
     4.50, TRUE, ARRAY[]::TEXT[]),

    -- ── Tax ───────────────────────────────────────────────────────
    ('taxfix', 'Taxfix', 'TAX',
     NULL, 'https://taxfix.de',
     'https://taxfix.de/?utm_source=helfa&aff={tag}',
     'Helfa earns a referral fee for completed tax returns filed via this link.',
     4.40, TRUE, ARRAY[]::TEXT[])
ON CONFLICT (slug) DO UPDATE SET
    name                     = EXCLUDED.name,
    category                 = EXCLUDED.category,
    logo_url                 = EXCLUDED.logo_url,
    website_url              = EXCLUDED.website_url,
    affiliate_url_template   = EXCLUDED.affiliate_url_template,
    commission_disclosure    = EXCLUDED.commission_disclosure,
    rating                   = EXCLUDED.rating,
    active                   = EXCLUDED.active,
    supported_nationalities  = EXCLUDED.supported_nationalities;
