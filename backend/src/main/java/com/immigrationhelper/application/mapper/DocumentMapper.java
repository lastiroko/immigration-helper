package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.document.DocumentDto;
import com.immigrationhelper.domain.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DocumentMapper {
    DocumentDto toDto(Document document);
}
