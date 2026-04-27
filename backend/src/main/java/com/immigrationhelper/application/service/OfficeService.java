package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.mapper.OfficeMapper;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import com.immigrationhelper.infrastructure.persistence.ImmigrationOfficeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeService {

    private final ImmigrationOfficeRepository officeRepository;
    private final OfficeMapper officeMapper;

    @Transactional(readOnly = true)
    public List<OfficeDto> getAllOffices() {
        return officeRepository.findAll().stream()
            .map(officeMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public OfficeDto getById(Long id) {
        return officeRepository.findById(id)
            .map(officeMapper::toDto)
            .orElseThrow(() -> new EntityNotFoundException("Office not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<OfficeDto> getNearestOffices(String city, Double lat, Double lon, int limit) {
        if (lat != null && lon != null) {
            return officeRepository.findAll().stream()
                .map(office -> {
                    double dist = haversineKm(lat, lon, office.getLatitude(), office.getLongitude());
                    return officeMapper.toDtoWithDistance(office, dist);
                })
                .sorted(Comparator.comparingDouble(o -> o.distanceKm() != null ? o.distanceKm() : Double.MAX_VALUE))
                .limit(limit)
                .toList();
        }

        if (city != null && !city.isBlank()) {
            return officeRepository.findByCityContainingIgnoreCase(city).stream()
                .map(officeMapper::toDto)
                .limit(limit)
                .toList();
        }

        return getAllOffices().stream().limit(limit).toList();
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
