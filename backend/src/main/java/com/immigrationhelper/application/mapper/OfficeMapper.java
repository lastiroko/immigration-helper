package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OfficeMapper {

    @Mapping(target = "distanceKm", ignore = true)
    OfficeDto toDto(ImmigrationOffice office);

    default OfficeDto toDtoWithDistance(ImmigrationOffice office, Double distanceKm) {
        OfficeDto dto = toDto(office);
        return new OfficeDto(
            dto.id(), dto.name(), dto.address(), dto.city(), dto.postalCode(),
            dto.latitude(), dto.longitude(), dto.phone(), dto.email(),
            dto.appointmentUrl(), dto.createdAt(), distanceKm
        );
    }
}
