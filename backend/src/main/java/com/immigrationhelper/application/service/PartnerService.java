package com.immigrationhelper.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.partner.PartnerCardDto;
import com.immigrationhelper.application.dto.partner.PartnerClickResponse;
import com.immigrationhelper.application.dto.partner.PartnerDetailDto;
import com.immigrationhelper.application.dto.partner.PartnerWebhookRequest;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.Partner;
import com.immigrationhelper.domain.entity.PartnerReferral;
import com.immigrationhelper.domain.entity.PartnerWebhookEvent;
import com.immigrationhelper.domain.enums.PartnerCategory;
import com.immigrationhelper.infrastructure.persistence.PartnerReferralRepository;
import com.immigrationhelper.infrastructure.persistence.PartnerRepository;
import com.immigrationhelper.infrastructure.persistence.PartnerWebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartnerService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final PartnerRepository partnerRepository;
    private final PartnerReferralRepository referralRepository;
    private final PartnerWebhookEventRepository webhookEventRepository;

    @Transactional(readOnly = true)
    public List<PartnerCardDto> listMarketplace(PartnerCategory category) {
        List<Partner> partners = category == null
            ? partnerRepository.findByActiveTrueOrderByNameAsc()
            : partnerRepository.findByCategoryAndActiveTrueOrderByNameAsc(category);
        return partners.stream().map(PartnerService::toCard).toList();
    }

    @Transactional(readOnly = true)
    public PartnerDetailDto getPartner(String slug) {
        Partner partner = requireBySlug(slug);
        return new PartnerDetailDto(
            partner.getId(), partner.getSlug(), partner.getName(), partner.getCategory(),
            partner.getLogoUrl(), partner.getWebsiteUrl(), partner.getCommissionDisclosure(),
            partner.getRating(), partner.getSupportedNationalities());
    }

    /**
     * Records a click and returns the affiliate URL the client should redirect to.
     * userId may be null for anonymous traffic (logged-out marketing pages).
     */
    @Transactional
    public PartnerClickResponse recordClick(String slug, UUID userId, String productCode) {
        Partner partner = requireBySlug(slug);
        if (!partner.isActive()) {
            throw new ValidationException("Partner is not active: " + slug);
        }
        String clickId = UUID.randomUUID().toString();
        PartnerReferral referral = PartnerReferral.builder()
            .partnerId(partner.getId())
            .userId(userId)
            .productCode(productCode)
            .clickId(clickId)
            .clickedAt(LocalDateTime.now())
            .build();
        referralRepository.save(referral);

        String url = renderAffiliateUrl(partner, clickId);
        return new PartnerClickResponse(clickId, url);
    }

    /**
     * Records a partner conversion from an affiliate-network webhook. Idempotent on
     * (eventId): a replay of the same event leaves the referral unchanged.
     */
    @Transactional
    public boolean handleWebhook(PartnerWebhookRequest req) {
        if (webhookEventRepository.existsById(req.eventId())) {
            log.info("Partner webhook replay ignored: {}", req.eventId());
            return false;
        }
        Partner partner = requireBySlug(req.partnerSlug());
        webhookEventRepository.save(PartnerWebhookEvent.builder()
            .eventId(req.eventId())
            .partnerId(partner.getId())
            .build());

        PartnerReferral referral = referralRepository.findByClickId(req.clickId())
            .orElseThrow(() -> new ResourceNotFoundException("Referral not found for clickId: " + req.clickId()));
        if (!referral.getPartnerId().equals(partner.getId())) {
            throw new ValidationException("Referral partner mismatch");
        }
        if (referral.getConvertedAt() != null) {
            // Already converted in a previous, non-replayed webhook — bail.
            return false;
        }
        referral.setConvertedAt(LocalDateTime.now());
        referral.setCommission(req.commission());
        try {
            referral.setWebhookPayload(req.rawPayload() == null
                ? MAPPER.writeValueAsString(req)
                : req.rawPayload());
        } catch (Exception e) {
            log.warn("Failed to record webhook payload: {}", e.getMessage());
        }
        referralRepository.save(referral);
        log.info("Partner conversion: clickId={} commission={}", req.clickId(), req.commission());
        return true;
    }

    private Partner requireBySlug(String slug) {
        return partnerRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Partner not found: " + slug));
    }

    private static String renderAffiliateUrl(Partner partner, String clickId) {
        String template = partner.getAffiliateUrlTemplate();
        if (template == null || template.isBlank()) return partner.getWebsiteUrl();
        return template.replace("{tag}", clickId);
    }

    private static PartnerCardDto toCard(Partner p) {
        return new PartnerCardDto(p.getId(), p.getSlug(), p.getName(), p.getCategory(),
            p.getLogoUrl(), p.getCommissionDisclosure(), p.getRating());
    }
}
