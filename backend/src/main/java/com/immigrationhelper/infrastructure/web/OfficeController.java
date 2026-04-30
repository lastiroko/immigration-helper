package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.service.OfficeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offices")
@RequiredArgsConstructor
@Tag(name = "Offices", description = "Browse Helfa-supported authority offices")
public class OfficeController {

    private final OfficeService officeService;

    @GetMapping
    @Operation(summary = "List all offices")
    public List<OfficeDto> getAllOffices() {
        return officeService.getAllOffices();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an office by id")
    public OfficeDto getOffice(@PathVariable UUID id) {
        return officeService.getById(id);
    }

    @GetMapping("/nearest")
    @Operation(summary = "Find nearest offices by city slug, city name, or GPS coordinates")
    public List<OfficeDto> getNearestOffices(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lon,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return officeService.getNearestOffices(city, lat, lon, limit);
    }
}
