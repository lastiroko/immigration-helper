package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.document.ApplicationDocumentDto;
import com.immigrationhelper.domain.entity.ApplicationDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ApplicationDocumentMapper {

    @Mapping(source = "uploadedBy.email", target = "uploadedByEmail")
    ApplicationDocumentDto toDto(ApplicationDocument entity);
}
