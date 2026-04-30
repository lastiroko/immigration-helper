package com.immigrationhelper.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "features.guidance.enabled=true")
class FeatureFlagsOverrideTest {

    @Autowired
    FeatureFlags flags;

    @Test
    void guidanceFlagReadsPropertyOverride() {
        assertThat(flags.guidance().enabled()).isTrue();
    }
}
