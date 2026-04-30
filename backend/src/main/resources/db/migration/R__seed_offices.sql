-- Helfa Phase 2 seed: canonical offices for the three MVP cities.
-- Repeatable migration. Idempotent via composite (city, type) lookup; we delete-then-insert
-- per city to keep the seed authoritative without unique constraints on (city_id,type,name).

DELETE FROM offices
WHERE city_id IN (SELECT id FROM cities WHERE slug IN ('munich', 'berlin', 'stuttgart'))
  AND name IN (
    'KVR München (Kreisverwaltungsreferat)',
    'Bürgerbüro München',
    'Finanzamt München',
    'LEA Berlin (Landesamt für Einwanderung)',
    'Bürgeramt Berlin Mitte',
    'Finanzamt Berlin Mitte',
    'Bürgerbüro Stuttgart Mitte',
    'Ausländerbehörde Stuttgart',
    'Finanzamt Stuttgart Mitte'
  );

WITH munich AS (SELECT id FROM cities WHERE slug = 'munich'),
     berlin AS (SELECT id FROM cities WHERE slug = 'berlin'),
     stuttgart AS (SELECT id FROM cities WHERE slug = 'stuttgart')
INSERT INTO offices (city_id, type, name, address, latitude, longitude, booking_url, languages_supported)
VALUES
    ((SELECT id FROM munich),    'AUSLANDERBEHORDE', 'KVR München (Kreisverwaltungsreferat)', 'Ruppertstraße 19, 80337 München',  48.12743, 11.55203, 'https://stadt.muenchen.de/service/info/auslaenderbehoerde-fuer-erwachsene/1063906/',           ARRAY['de','en']),
    ((SELECT id FROM munich),    'BURGERAMT',        'Bürgerbüro München',                    'Ruppertstraße 19, 80337 München',  48.12743, 11.55203, 'https://stadt.muenchen.de/service/info/buergerbuero/',                                          ARRAY['de','en']),
    ((SELECT id FROM munich),    'FINANZAMT',        'Finanzamt München',                     'Deroystraße 18, 80335 München',    48.14380, 11.55060, 'https://www.finanzamt.bayern.de/Informationen/Aemter/Adressen/Default.php',                     ARRAY['de']),
    ((SELECT id FROM berlin),    'AUSLANDERBEHORDE', 'LEA Berlin (Landesamt für Einwanderung)','Friedrich-Krause-Ufer 24, 13353 Berlin', 52.54620, 13.36430, 'https://www.berlin.de/einwanderung/dienstleistungen/',                                         ARRAY['de','en']),
    ((SELECT id FROM berlin),    'BURGERAMT',        'Bürgeramt Berlin Mitte',                'Karl-Marx-Allee 31, 10178 Berlin', 52.51920, 13.42010, 'https://service.berlin.de/dienstleistung/120335/',                                              ARRAY['de','en']),
    ((SELECT id FROM berlin),    'FINANZAMT',        'Finanzamt Berlin Mitte',                'Neue Jakobstraße 6-7, 10179 Berlin', 52.51420, 13.41950, 'https://www.berlin.de/sen/finanzen/steuern/finanzaemter/',                                    ARRAY['de']),
    ((SELECT id FROM stuttgart), 'BURGERAMT',        'Bürgerbüro Stuttgart Mitte',            'Eberhardstraße 39, 70173 Stuttgart', 48.77380, 9.17880, 'https://www.stuttgart.de/leben/buergerbuero/',                                                ARRAY['de','en']),
    ((SELECT id FROM stuttgart), 'AUSLANDERBEHORDE', 'Ausländerbehörde Stuttgart',            'Eberhardstraße 39, 70173 Stuttgart', 48.77380, 9.17880, 'https://www.stuttgart.de/leben/auslaenderbehoerde/',                                          ARRAY['de','en']),
    ((SELECT id FROM stuttgart), 'FINANZAMT',        'Finanzamt Stuttgart Mitte',             'Rotebühlstraße 40, 70178 Stuttgart', 48.77370, 9.17030, 'https://finanzamt-bw.fv-bwl.de/,Lde/Startseite/Finanzamt/Stuttgart',                          ARRAY['de']);
