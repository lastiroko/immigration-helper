package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.document.DocumentDto;
import com.immigrationhelper.application.service.DocumentService;
import com.immigrationhelper.domain.enums.VisaType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document requirements per visa type")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @Operation(summary = "Get all documents for a visa type")
    public List<DocumentDto> getDocuments(@RequestParam VisaType visaType) {
        return documentService.getByVisaType(visaType);
    }

    @GetMapping("/checklist")
    @Operation(summary = "Get required document checklist for a visa type")
    public List<DocumentDto> getChecklist(@RequestParam VisaType visaType) {
        return documentService.getChecklist(visaType);
    }
}
