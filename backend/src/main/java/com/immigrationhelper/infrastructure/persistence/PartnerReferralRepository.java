package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.PartnerReferral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerReferralRepository extends JpaRepository<PartnerReferral, UUID> {
    Optional<PartnerReferral> findByClickId(String clickId);
}
