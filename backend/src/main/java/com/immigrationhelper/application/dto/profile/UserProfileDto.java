package com.immigrationhelper.application.dto.profile;

import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;

import java.time.LocalDate;
import java.util.UUID;

public record UserProfileDto(
    UUID userId,
    String firstName,
    String nationality,
    UUID cityId,
    String citySlug,
    VisaPathway visaPathway,
    FamilyStatus familyStatus,
    boolean familyInGermany,
    LocalDate arrivalDate,
    LocalDate anmeldungDate,
    LocalDate permitExpiryDate
) {}
