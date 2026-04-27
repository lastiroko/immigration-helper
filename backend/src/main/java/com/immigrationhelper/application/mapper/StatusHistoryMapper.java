package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.application.StatusHistoryDto;
import com.immigrationhelper.domain.entity.ApplicationStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface StatusHistoryMapper {

    @Mapping(source = "changedBy.email", target = "changedByEmail")
    StatusHistoryDto toDto(ApplicationStatusHistory entity);
}
