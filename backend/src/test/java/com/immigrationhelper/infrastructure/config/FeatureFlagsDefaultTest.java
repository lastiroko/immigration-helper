package com.immigrationhelper.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class FeatureFlagsDefaultTest {

    @Autowired
    FeatureFlags flags;

    @Test
    void guidanceFlagDefaultsToTrue() {
        // Phase 4 cutover: Helfa is now the primary product, so the flag is on by default.
        assertThat(flags.guidance().enabled()).isTrue();
    }
}
