package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.document.DocumentDto;
import com.immigrationhelper.application.mapper.DocumentMapper;
import com.immigrationhelper.domain.enums.VisaType;
import com.immigrationhelper.infrastructure.persistence.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;

    @Transactional(readOnly = true)
    public List<DocumentDto> getByVisaType(VisaType visaType) {
        return documentRepository.findByVisaTypesContaining(visaType).stream()
            .map(documentMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getChecklist(VisaType visaType) {
        return documentRepository.findByVisaTypesContainingAndRequired(visaType, true).stream()
            .map(documentMapper::toDto)
            .toList();
    }
}
