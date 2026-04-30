-- Helfa Phase 2 seed: 30 MVP task templates (PRD F-001..F-011 surface).
-- Repeatable migration. Idempotent via ON CONFLICT(code).
-- `applicable_to` rule schema is documented in PersonalisationEngine.

INSERT INTO task_templates (code, title, description, applicable_to, default_lead_days, depends_on, phase, priority, associated_office_type, associated_document_types)
VALUES
    -- ── Pre-arrival ────────────────────────────────────────────────
    ('PASSPORT_VALID',
     '{"en":"Verify passport validity","de":"Reisepassgültigkeit prüfen"}',
     '{"en":"Confirm your passport is valid for at least 12 months beyond your planned arrival.","de":"Stelle sicher, dass dein Reisepass mindestens 12 Monate nach geplanter Einreise gültig ist."}',
     '{"all":true}',
     90, ARRAY[]::TEXT[], 'MVP', 10, NULL, ARRAY['PASSPORT']),

    ('SPERRKONTO_OPEN',
     '{"en":"Open a blocked account (Sperrkonto)","de":"Sperrkonto eröffnen"}',
     '{"en":"Required proof of funds for student and job-seeker visas. Compare Fintiba, Expatrio, Coracle.","de":"Pflichtnachweis für Studenten- und Jobsuchervisa."}',
     '{"visaPathway":["STUDENT","CHANCENKARTE"]}',
     60, ARRAY[]::TEXT[], 'MVP', 15, NULL, ARRAY['BANK_PROOF']),

    ('APOSTILLE_DEGREE',
     '{"en":"Apostille your university degree","de":"Hochschulabschluss apostillieren"}',
     '{"en":"Required for ZAB / Anabin recognition and for many employer onboardings.","de":"Notwendig für die ZAB/Anabin-Anerkennung."}',
     '{"visaPathway":["BLUE_CARD","CHANCENKARTE","STUDENT"]}',
     60, ARRAY[]::TEXT[], 'MVP', 20, NULL, ARRAY['DEGREE']),

    ('TRANSLATE_DOCUMENTS',
     '{"en":"Order sworn translations","de":"Beglaubigte Übersetzungen beauftragen"}',
     '{"en":"Birth, marriage, and qualification certificates need beeidigte Übersetzungen.","de":"Geburts-, Heirats- und Qualifikationsurkunden benötigen beeidigte Übersetzungen."}',
     '{"all":true}',
     45, ARRAY[]::TEXT[], 'MVP', 25, NULL, ARRAY['CERT_TRANSLATION']),

    ('HEALTH_INSURANCE_PRE',
     '{"en":"Choose a health insurance provider","de":"Krankenversicherung auswählen"}',
     '{"en":"Required before visa interview and Anmeldung. Public vs private depends on income and pathway.","de":"Erforderlich vor Visa-Termin und Anmeldung."}',
     '{"all":true}',
     30, ARRAY[]::TEXT[], 'MVP', 20, NULL, ARRAY['INSURANCE_PROOF']),

    ('FIND_INITIAL_ACCOMMODATION',
     '{"en":"Secure initial accommodation","de":"Erste Unterkunft sichern"}',
     '{"en":"You need a registered address to do Anmeldung. Look at Wunderflats, HousingAnywhere, or sublets.","de":"Eine gemeldete Adresse ist Voraussetzung für die Anmeldung."}',
     '{"all":true}',
     30, ARRAY[]::TEXT[], 'MVP', 20, NULL, ARRAY['RENTAL_AGREEMENT']),

    -- ── Arrival window (Anmeldung within 14 days) ─────────────────
    ('ANMELDUNG_BOOK_APPOINTMENT',
     '{"en":"Book your Anmeldung appointment","de":"Anmeldungstermin buchen"}',
     '{"en":"Book the earliest available Bürgeramt slot. Many cities run out 4-8 weeks ahead.","de":"Buche den frühesten Bürgeramt-Termin."}',
     '{"all":true}',
     14, ARRAY['FIND_INITIAL_ACCOMMODATION']::TEXT[], 'MVP', 10, 'BURGERAMT', ARRAY[]::TEXT[]),

    ('ANMELDUNG_PREPARE_DOCS',
     '{"en":"Prepare Anmeldung documents","de":"Anmeldeunterlagen vorbereiten"}',
     '{"en":"Wohnungsgeberbestätigung from your landlord, passport, and Anmeldeformular.","de":"Wohnungsgeberbestätigung, Reisepass, Anmeldeformular."}',
     '{"all":true}',
     7, ARRAY['ANMELDUNG_BOOK_APPOINTMENT']::TEXT[], 'MVP', 12, 'BURGERAMT', ARRAY['WOHNUNGSGEBERBESTAETIGUNG','PASSPORT']),

    ('ANMELDUNG_REGISTER',
     '{"en":"Complete Anmeldung within 14 days","de":"Anmeldung innerhalb von 14 Tagen"}',
     '{"en":"By Bundesmeldegesetz §17 you must register within 14 days of moving in. Late registration carries fines up to €1,000.","de":"Laut Bundesmeldegesetz §17 musst du dich innerhalb von 14 Tagen anmelden."}',
     '{"all":true}',
     14, ARRAY['ANMELDUNG_PREPARE_DOCS']::TEXT[], 'MVP', 5, 'BURGERAMT', ARRAY['WOHNUNGSGEBERBESTAETIGUNG']),

    -- ── Post-Anmeldung essentials ─────────────────────────────────
    ('TAX_ID_RECEIVE',
     '{"en":"Store your tax ID (Steueridentifikationsnummer)","de":"Steuer-ID aufbewahren"}',
     '{"en":"Issued automatically by the Bundeszentralamt within 2-4 weeks of Anmeldung. Required for employment and bank account.","de":"Wird nach Anmeldung automatisch zugeschickt."}',
     '{"all":true}',
     21, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 30, 'FINANZAMT', ARRAY['TAX_ID_LETTER']),

    ('BANK_ACCOUNT_OPEN',
     '{"en":"Open a German Girokonto","de":"Girokonto eröffnen"}',
     '{"en":"Most employers and landlords require a German current account. N26, DKB, Commerzbank, and others.","de":"Viele Arbeitgeber und Vermieter verlangen ein deutsches Girokonto."}',
     '{"all":true}',
     30, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 35, NULL, ARRAY['BANK_ACCOUNT_PROOF']),

    ('HEALTH_INSURANCE_ENROL',
     '{"en":"Finalize health insurance enrolment","de":"Krankenversicherung abschließen"}',
     '{"en":"Submit Mitgliedsbescheinigung to employer or university; receive your insurance card.","de":"Abschluss der Krankenversicherung mit Mitgliedsbescheinigung."}',
     '{"all":true}',
     30, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 30, NULL, ARRAY['INSURANCE_PROOF']),

    ('PHONE_SIM_REGISTER',
     '{"en":"Get a registered SIM card","de":"SIM-Karte registrieren"}',
     '{"en":"Required by law to identify yourself with passport. Most carriers cannot register without Anmeldung.","de":"Gesetzliche Identitätsprüfung erforderlich."}',
     '{"all":true}',
     14, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 50, NULL, ARRAY['PASSPORT']),

    ('RUNDFUNKBEITRAG_REGISTER',
     '{"en":"Register for Rundfunkbeitrag (GEZ)","de":"Rundfunkbeitrag anmelden"}',
     '{"en":"Mandatory €18.36/month per household. BAföG recipients can apply for exemption.","de":"Pflichtbeitrag €18,36/Monat pro Haushalt."}',
     '{"all":true}',
     30, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 60, NULL, ARRAY[]::TEXT[]),

    -- ── Studies / work ────────────────────────────────────────────
    ('UNI_MATRICULATE',
     '{"en":"Complete university matriculation","de":"Universitätsimmatrikulation abschließen"}',
     '{"en":"Submit Mitgliedsbescheinigung, pay Semesterbeitrag, get student ID.","de":"Abgabe der Unterlagen, Zahlung des Semesterbeitrags, Studierendenausweis."}',
     '{"visaPathway":["STUDENT"]}',
     30, ARRAY['HEALTH_INSURANCE_ENROL']::TEXT[], 'MVP', 25, NULL, ARRAY['ENROLLMENT_LETTER']),

    ('WORK_CONTRACT_VERIFY',
     '{"en":"Verify your German work contract","de":"Deutschen Arbeitsvertrag prüfen"}',
     '{"en":"Salary thresholds, Probezeit, working time, and notice period must match Blue Card requirements.","de":"Gehaltsgrenze und Vertragsklauseln auf Blue-Card-Konformität prüfen."}',
     '{"visaPathway":["BLUE_CARD","CHANCENKARTE"]}',
     14, ARRAY[]::TEXT[], 'MVP', 25, NULL, ARRAY['WORK_CONTRACT']),

    ('ZAB_RECOGNITION',
     '{"en":"Submit qualifications to ZAB / Anabin","de":"Qualifikationen bei ZAB/Anabin einreichen"}',
     '{"en":"Required for regulated professions and many Blue Card pathways.","de":"Erforderlich für reglementierte Berufe und viele Blue-Card-Pfade."}',
     '{"visaPathway":["BLUE_CARD","CHANCENKARTE"]}',
     45, ARRAY['APOSTILLE_DEGREE','TRANSLATE_DOCUMENTS']::TEXT[], 'MVP', 35, NULL, ARRAY['DEGREE','CERT_TRANSLATION']),

    ('JOB_SEEKER_REGISTER',
     '{"en":"Register as job-seeker (Chancenkarte)","de":"Als arbeitssuchend registrieren (Chancenkarte)"}',
     '{"en":"Register at the Agentur für Arbeit and start tracking your points-based job hunt.","de":"Registrierung bei der Agentur für Arbeit."}',
     '{"visaPathway":["CHANCENKARTE"]}',
     14, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 40, 'JOBCENTER', ARRAY[]::TEXT[]),

    -- ── Residence permit ─────────────────────────────────────────
    ('RESIDENCE_PERMIT_BOOK',
     '{"en":"Book Ausländerbehörde appointment","de":"Termin bei der Ausländerbehörde buchen"}',
     '{"en":"Book early — many Ausländerbehörden have 8-16 week waitlists.","de":"Frühzeitig buchen, da Wartezeiten bis 16 Wochen möglich sind."}',
     '{"all":true}',
     30, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 15, 'AUSLANDERBEHORDE', ARRAY[]::TEXT[]),

    ('RESIDENCE_PERMIT_DOCS',
     '{"en":"Prepare residence permit documents","de":"Aufenthaltstitel-Unterlagen vorbereiten"}',
     '{"en":"Passport, biometric photos, Anmeldebescheinigung, insurance proof, financial proof, and pathway-specific docs.","de":"Reisepass, biometrische Fotos, Anmeldebescheinigung, Krankenversicherungsnachweis, Finanznachweis."}',
     '{"all":true}',
     21, ARRAY['RESIDENCE_PERMIT_BOOK']::TEXT[], 'MVP', 18, 'AUSLANDERBEHORDE', ARRAY['PASSPORT','BIOMETRIC_PHOTO','INSURANCE_PROOF']),

    ('RESIDENCE_PERMIT_APPOINTMENT',
     '{"en":"Attend Ausländerbehörde appointment","de":"Termin bei der Ausländerbehörde wahrnehmen"}',
     '{"en":"Submit application, pay fee (€100-110), receive Fiktionsbescheinigung if eAT not ready.","de":"Antrag stellen, Gebühr zahlen, ggf. Fiktionsbescheinigung erhalten."}',
     '{"all":true}',
     30, ARRAY['RESIDENCE_PERMIT_DOCS']::TEXT[], 'MVP', 20, 'AUSLANDERBEHORDE', ARRAY[]::TEXT[]),

    ('PERMIT_RENEWAL_REMINDER',
     '{"en":"Renew your residence permit","de":"Aufenthaltstitel verlängern"}',
     '{"en":"Start renewal at least 8 weeks before expiry to avoid Fiktionsbescheinigung.","de":"Mindestens 8 Wochen vor Ablauf verlängern."}',
     '{"all":true}',
     56, ARRAY[]::TEXT[], 'MVP', 70, 'AUSLANDERBEHORDE', ARRAY['EAT_CARD']),

    -- ── Family ────────────────────────────────────────────────────
    ('SPOUSE_A1_GERMAN',
     '{"en":"Spouse to obtain A1 German certificate","de":"A1-Deutsch-Zertifikat für Ehepartner"}',
     '{"en":"Family reunion visa typically requires A1 Goethe / telc / TestDaF certificate.","de":"Für den Familienzuzug wird in der Regel ein A1-Zertifikat verlangt."}',
     '{"visaPathway":["FAMILY_REUNION"]}',
     90, ARRAY[]::TEXT[], 'MVP', 30, NULL, ARRAY['LANG_CERT']),

    ('MARRIAGE_CERT_APOSTILLE',
     '{"en":"Apostille and translate marriage certificate","de":"Heiratsurkunde apostillieren und übersetzen"}',
     '{"en":"Some countries require OLG-Befreiung (e.g., non-Apostille countries).","de":"Manche Länder benötigen eine OLG-Befreiung."}',
     '{"visaPathway":["FAMILY_REUNION"]}',
     60, ARRAY[]::TEXT[], 'MVP', 35, NULL, ARRAY['MARRIAGE_CERT','CERT_TRANSLATION']),

    ('EMBASSY_APPT_FAMILY',
     '{"en":"Book embassy appointment for family reunion","de":"Botschaftstermin für Familienzuzug"}',
     '{"en":"High-volume bottleneck. Book the moment your case file is complete.","de":"Termine sind schwer zu bekommen — sofort buchen."}',
     '{"visaPathway":["FAMILY_REUNION"]}',
     90, ARRAY['MARRIAGE_CERT_APOSTILLE','SPOUSE_A1_GERMAN']::TEXT[], 'MVP', 25, NULL, ARRAY[]::TEXT[]),

    ('CHILDCARE_KITA',
     '{"en":"Apply for Kita / childcare and Kindergeld","de":"Kita-Platz und Kindergeld beantragen"}',
     '{"en":"Submit Kita-Anmeldung; apply for Kindergeld at Familienkasse.","de":"Kita-Anmeldung; Kindergeldantrag bei der Familienkasse."}',
     '{"familyStatus":["PARENT"]}',
     60, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 45, 'FAMILIENKASSE', ARRAY['BIRTH_CERTIFICATE']),

    -- ── Settling-in (everyone) ───────────────────────────────────
    ('DRIVERS_LICENSE_CONVERT',
     '{"en":"Convert driver''s licence","de":"Führerschein umschreiben"}',
     '{"en":"Non-EU licences must be converted within 6 months of Anmeldung. Conversion conditions depend on country of origin.","de":"Nicht-EU-Führerscheine innerhalb von 6 Monaten umschreiben."}',
     '{"all":true}',
     180, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 75, 'FUHRERSCHEINSTELLE', ARRAY['DRIVERS_LICENSE']),

    ('PRIVATE_LIABILITY_INSURANCE',
     '{"en":"Get private liability insurance","de":"Haftpflichtversicherung abschließen"}',
     '{"en":"Highly recommended (~€50/year). Standard requirement for most rentals.","de":"Sehr empfohlen, oft Voraussetzung bei Mietverträgen."}',
     '{"all":true}',
     30, ARRAY['BANK_ACCOUNT_OPEN']::TEXT[], 'MVP', 65, NULL, ARRAY[]::TEXT[]),

    ('SPRACHKURS_INTEGRATION',
     '{"en":"Enrol in integration / language course","de":"Integrations-/Sprachkurs anmelden"}',
     '{"en":"BAMF integration course is free or subsidised for refugees and family-reunion arrivals.","de":"BAMF-Integrationskurs für Geflüchtete und Familiennachzug."}',
     '{"visaPathway":["REFUGEE","FAMILY_REUNION"]}',
     45, ARRAY['ANMELDUNG_REGISTER']::TEXT[], 'MVP', 55, NULL, ARRAY[]::TEXT[]),

    ('ARRIVAL_FLIGHT',
     '{"en":"Plan arrival logistics","de":"Anreise planen"}',
     '{"en":"Book flight, plan first 14 days, ensure SIM access for Anmeldung confirmation.","de":"Flug buchen, erste 14 Tage planen, SIM für Anmeldungsbestätigung."}',
     '{"all":true}',
     14, ARRAY[]::TEXT[], 'MVP', 22, NULL, ARRAY[]::TEXT[])
ON CONFLICT (code) DO UPDATE SET
    title                     = EXCLUDED.title,
    description               = EXCLUDED.description,
    applicable_to             = EXCLUDED.applicable_to,
    default_lead_days         = EXCLUDED.default_lead_days,
    depends_on                = EXCLUDED.depends_on,
    phase                     = EXCLUDED.phase,
    priority                  = EXCLUDED.priority,
    associated_office_type    = EXCLUDED.associated_office_type,
    associated_document_types = EXCLUDED.associated_document_types,
    updated_at                = NOW();
