package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.mapper.OfficeMapper;
import com.immigrationhelper.domain.entity.HelfaOffice;
import com.immigrationhelper.infrastructure.persistence.HelfaOfficeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeService {

    private final HelfaOfficeRepository officeRepository;
    private final OfficeMapper officeMapper;

    @Transactional(readOnly = true)
    public List<OfficeDto> getAllOffices() {
        return officeRepository.findAll().stream()
            .map(officeMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public OfficeDto getById(UUID id) {
        return officeRepository.findById(id)
            .map(officeMapper::toDto)
            .orElseThrow(() -> new EntityNotFoundException("Office not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<OfficeDto> getNearestOffices(String city, Double lat, Double lon, int limit) {
        if (lat != null && lon != null) {
            return officeRepository.findAll().stream()
                .map(office -> officeMapper.toDtoWithDistance(office, distanceKmTo(lat, lon, office)))
                .sorted(Comparator.comparingDouble(o -> o.distanceKm() != null ? o.distanceKm() : Double.MAX_VALUE))
                .limit(limit)
                .toList();
        }

        if (city != null && !city.isBlank()) {
            // Treat the parameter as a city slug first; fall back to a name-contains match.
            List<HelfaOffice> hits = officeRepository.findByCity_SlugIgnoreCase(city);
            if (hits.isEmpty()) {
                hits = officeRepository.findByCity_NameContainingIgnoreCase(city);
            }
            return hits.stream().map(officeMapper::toDto).limit(limit).toList();
        }

        return getAllOffices().stream().limit(limit).toList();
    }

    private static Double distanceKmTo(double fromLat, double fromLon, HelfaOffice office) {
        BigDecimal lat = office.getLatitude();
        BigDecimal lon = office.getLongitude();
        if (lat == null || lon == null) return null;
        return haversineKm(fromLat, fromLon, lat.doubleValue(), lon.doubleValue());
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
