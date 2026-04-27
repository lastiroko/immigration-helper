package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.domain.entity.VisaApplication;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {UserMapper.class, OfficeMapper.class})
public interface VisaApplicationMapper {
    ApplicationDto toDto(VisaApplication application);
}
