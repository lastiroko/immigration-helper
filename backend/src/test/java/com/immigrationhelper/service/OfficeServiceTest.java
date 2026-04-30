package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.mapper.OfficeMapper;
import com.immigrationhelper.application.service.OfficeService;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.HelfaOffice;
import com.immigrationhelper.domain.enums.OfficeType;
import com.immigrationhelper.infrastructure.persistence.HelfaOfficeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfficeServiceTest {

    @Mock HelfaOfficeRepository officeRepository;

    OfficeService officeService;

    private HelfaOffice berlin;
    private HelfaOffice munich;

    @BeforeEach
    void setUp() {
        // Use a real OfficeMapper rather than mocking — the service exercises both toDto paths.
        officeService = new OfficeService(officeRepository, new OfficeMapper());

        City berlinCity = City.builder().slug("berlin").name("Berlin").bundesland("Berlin").supportedFromPhase("MVP").build();
        City munichCity = City.builder().slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build();

        berlin = HelfaOffice.builder()
            .city(berlinCity).type(OfficeType.AUSLANDERBEHORDE).name("LEA Berlin")
            .address("Friedrich-Krause-Ufer 24, 13353 Berlin")
            .latitude(BigDecimal.valueOf(52.4894)).longitude(BigDecimal.valueOf(13.3810))
            .build();
        berlin.setId(UUID.randomUUID());

        munich = HelfaOffice.builder()
            .city(munichCity).type(OfficeType.AUSLANDERBEHORDE).name("KVR München")
            .address("Ruppertstraße 19, 80337 München")
            .latitude(BigDecimal.valueOf(48.1275)).longitude(BigDecimal.valueOf(11.5536))
            .build();
        munich.setId(UUID.randomUUID());
    }

    @Test
    void getAllOffices_returnsAllOffices() {
        when(officeRepository.findAll()).thenReturn(List.of(berlin, munich));

        List<OfficeDto> offices = officeService.getAllOffices();
        assertThat(offices).hasSize(2);
        assertThat(offices).extracting(OfficeDto::cityName)
            .containsExactly("Berlin", "Munich");
    }

    @Test
    void getById_withValidId_returnsOffice() {
        when(officeRepository.findById(berlin.getId())).thenReturn(Optional.of(berlin));

        OfficeDto dto = officeService.getById(berlin.getId());
        assertThat(dto.id()).isEqualTo(berlin.getId());
        assertThat(dto.citySlug()).isEqualTo("berlin");
    }

    @Test
    void getById_withInvalidId_throwsEntityNotFoundException() {
        UUID unknownId = UUID.randomUUID();
        when(officeRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> officeService.getById(unknownId))
            .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getNearestOffices_withCoordinates_sortsByDistance() {
        when(officeRepository.findAll()).thenReturn(List.of(berlin, munich));

        // Query from Berlin coords — Berlin office should come first.
        List<OfficeDto> offices = officeService.getNearestOffices(null, 52.52, 13.405, 10);
        assertThat(offices).hasSize(2);
        assertThat(offices.get(0).cityName()).isEqualTo("Berlin");
        assertThat(offices.get(0).distanceKm()).isLessThan(offices.get(1).distanceKm());
    }

    @Test
    void getNearestOffices_withCitySlug_returnsCityMatches() {
        when(officeRepository.findByCity_SlugIgnoreCase("munich")).thenReturn(List.of(munich));

        List<OfficeDto> offices = officeService.getNearestOffices("munich", null, null, 10);
        assertThat(offices).hasSize(1);
        assertThat(offices.get(0).cityName()).isEqualTo("Munich");
    }
}
