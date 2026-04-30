package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.domain.entity.HelfaOffice;
import org.springframework.stereotype.Component;

@Component
public class OfficeMapper {

    public OfficeDto toDto(HelfaOffice office) {
        return toDtoWithDistance(office, null);
    }

    public OfficeDto toDtoWithDistance(HelfaOffice office, Double distanceKm) {
        return new OfficeDto(
            office.getId(),
            office.getCity() == null ? null : office.getCity().getSlug(),
            office.getCity() == null ? null : office.getCity().getName(),
            office.getType(),
            office.getName(),
            office.getAddress(),
            office.getLatitude(),
            office.getLongitude(),
            office.getBookingUrl(),
            office.getPhone(),
            office.getEmail(),
            office.getLanguagesSupported(),
            distanceKm
        );
    }
}
