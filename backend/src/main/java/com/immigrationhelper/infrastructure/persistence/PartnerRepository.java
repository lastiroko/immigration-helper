package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.Partner;
import com.immigrationhelper.domain.enums.PartnerCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {
    Optional<Partner> findBySlug(String slug);
    List<Partner> findByActiveTrueOrderByNameAsc();
    List<Partner> findByCategoryAndActiveTrueOrderByNameAsc(PartnerCategory category);
}
