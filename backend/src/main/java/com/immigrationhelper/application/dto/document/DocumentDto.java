package com.immigrationhelper.application.dto.document;

import com.immigrationhelper.domain.enums.VisaType;

import java.util.Set;

public record DocumentDto(
    Long id,
    String name,
    String description,
    Set<VisaType> visaTypes,
    Boolean required,
    String notes
) {}
