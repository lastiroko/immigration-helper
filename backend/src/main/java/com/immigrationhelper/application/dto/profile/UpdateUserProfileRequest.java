package com.immigrationhelper.application.dto.profile;

import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateUserProfileRequest(
    String firstName,
    @Pattern(regexp = "^[A-Z]{2}$", message = "must be ISO 3166-1 alpha-2") String nationality,
    UUID cityId,
    VisaPathway visaPathway,
    FamilyStatus familyStatus,
    Boolean familyInGermany,
    LocalDate arrivalDate,
    LocalDate anmeldungDate,
    LocalDate permitExpiryDate
) {}
