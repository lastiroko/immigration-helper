package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.PartnerWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerWebhookEventRepository extends JpaRepository<PartnerWebhookEvent, String> {
}
