package com.immigrationhelper.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "features")
public record FeatureFlags(Guidance guidance) {

    public FeatureFlags {
        if (guidance == null) {
            guidance = new Guidance(true);
        }
    }

    public record Guidance(boolean enabled) {}
}
