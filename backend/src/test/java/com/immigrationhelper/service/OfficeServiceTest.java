package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.mapper.OfficeMapper;
import com.immigrationhelper.application.service.OfficeService;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import com.immigrationhelper.infrastructure.persistence.ImmigrationOfficeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfficeServiceTest {

    @Mock ImmigrationOfficeRepository officeRepository;
    @Mock OfficeMapper officeMapper;

    @InjectMocks OfficeService officeService;

    private ImmigrationOffice berlinOffice;
    private ImmigrationOffice munichOffice;

    @BeforeEach
    void setUp() {
        berlinOffice = ImmigrationOffice.builder()
            .id(1L).name("Ausländerbehörde Berlin").city("Berlin")
            .latitude(52.4894).longitude(13.3810).address("Yorckstraße 4-11").build();

        munichOffice = ImmigrationOffice.builder()
            .id(2L).name("Ausländerbehörde München").city("Munich")
            .latitude(48.1275).longitude(11.5536).address("Ruppertstraße 19").build();
    }

    @Test
    void getAllOffices_returnsAllOffices() {
        when(officeRepository.findAll()).thenReturn(List.of(berlinOffice, munichOffice));
        when(officeMapper.toDto(berlinOffice)).thenReturn(mockDto(1L, "Berlin", 52.4894, 13.3810));
        when(officeMapper.toDto(munichOffice)).thenReturn(mockDto(2L, "Munich", 48.1275, 11.5536));

        List<OfficeDto> offices = officeService.getAllOffices();

        assertThat(offices).hasSize(2);
    }

    @Test
    void getById_withValidId_returnsOffice() {
        when(officeRepository.findById(1L)).thenReturn(Optional.of(berlinOffice));
        when(officeMapper.toDto(berlinOffice)).thenReturn(mockDto(1L, "Berlin", 52.4894, 13.3810));

        OfficeDto dto = officeService.getById(1L);

        assertThat(dto.id()).isEqualTo(1L);
    }

    @Test
    void getById_withInvalidId_throwsEntityNotFoundException() {
        when(officeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> officeService.getById(999L))
            .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getNearestOffices_withCoordinates_sortsByDistance() {
        when(officeRepository.findAll()).thenReturn(List.of(berlinOffice, munichOffice));
        when(officeMapper.toDtoWithDistance(eq(berlinOffice), anyDouble()))
            .thenReturn(mockDtoWithDistance(1L, "Berlin", 52.4894, 13.3810, 5.0));
        when(officeMapper.toDtoWithDistance(eq(munichOffice), anyDouble()))
            .thenReturn(mockDtoWithDistance(2L, "Munich", 48.1275, 11.5536, 600.0));

        // Query from Berlin coords — Berlin office should come first
        List<OfficeDto> offices = officeService.getNearestOffices(null, 52.52, 13.405, 10);

        assertThat(offices).hasSize(2);
        assertThat(offices.get(0).city()).isEqualTo("Berlin");
    }

    private OfficeDto mockDto(Long id, String city, double lat, double lon) {
        return new OfficeDto(id, "Test Office", "Test Address", city, "12345", lat, lon,
            null, null, null, null, null);
    }

    private OfficeDto mockDtoWithDistance(Long id, String city, double lat, double lon, double dist) {
        return new OfficeDto(id, "Test Office", "Test Address", city, "12345", lat, lon,
            null, null, null, null, dist);
    }
}
