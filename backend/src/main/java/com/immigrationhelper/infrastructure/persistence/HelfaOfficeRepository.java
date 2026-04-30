package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.HelfaOffice;
import com.immigrationhelper.domain.enums.OfficeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HelfaOfficeRepository extends JpaRepository<HelfaOffice, UUID> {
    List<HelfaOffice> findByCityId(UUID cityId);
    Optional<HelfaOffice> findByCityIdAndType(UUID cityId, OfficeType type);
    List<HelfaOffice> findByCity_SlugIgnoreCase(String slug);
    List<HelfaOffice> findByCity_NameContainingIgnoreCase(String cityName);
}
