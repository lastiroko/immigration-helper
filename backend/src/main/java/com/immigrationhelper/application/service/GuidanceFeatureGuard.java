package com.immigrationhelper.application.service;

import com.immigrationhelper.application.exception.FeatureDisabledException;
import com.immigrationhelper.infrastructure.config.FeatureFlags;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GuidanceFeatureGuard {

    private final FeatureFlags flags;

    public void requireEnabled() {
        if (!flags.guidance().enabled()) {
            throw new FeatureDisabledException("Guidance is not enabled");
        }
    }
}
