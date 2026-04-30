-- Helfa Phase 2 seed: the three MVP cities.
-- Repeatable migration: re-applied whenever the file content changes.

INSERT INTO cities (slug, name, bundesland, population, supported_from_phase, latitude, longitude)
VALUES
    ('munich',    'Munich',    'Bayern',                1488202, 'MVP', 48.13743,  11.57549),
    ('berlin',    'Berlin',    'Berlin',                3645000, 'MVP', 52.52000,  13.40500),
    ('stuttgart', 'Stuttgart', 'Baden-Württemberg',      635000, 'MVP', 48.77584,   9.18293)
ON CONFLICT (slug) DO UPDATE SET
    name                 = EXCLUDED.name,
    bundesland           = EXCLUDED.bundesland,
    population           = EXCLUDED.population,
    supported_from_phase = EXCLUDED.supported_from_phase,
    latitude             = EXCLUDED.latitude,
    longitude            = EXCLUDED.longitude;
