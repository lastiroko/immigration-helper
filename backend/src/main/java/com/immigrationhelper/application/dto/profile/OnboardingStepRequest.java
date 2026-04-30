package com.immigrationhelper.application.dto.profile;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;

import java.time.LocalDate;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OnboardingStepRequest(
    String firstName,
    String nationality,
    UUID cityId,
    String citySlug,
    VisaPathway visaPathway,
    FamilyStatus familyStatus,
    Boolean familyInGermany,
    LocalDate arrivalDate,
    LocalDate anmeldungDate,
    LocalDate permitExpiryDate,
    String arrivalTimeline
) {}
