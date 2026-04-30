package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.partner.PartnerClickResponse;
import com.immigrationhelper.application.dto.partner.PartnerWebhookRequest;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.application.service.PartnerService;
import com.immigrationhelper.domain.entity.Partner;
import com.immigrationhelper.domain.entity.PartnerReferral;
import com.immigrationhelper.domain.entity.PartnerWebhookEvent;
import com.immigrationhelper.domain.enums.PartnerCategory;
import com.immigrationhelper.infrastructure.persistence.PartnerReferralRepository;
import com.immigrationhelper.infrastructure.persistence.PartnerRepository;
import com.immigrationhelper.infrastructure.persistence.PartnerWebhookEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PartnerServiceTest {

    @Mock PartnerRepository partnerRepository;
    @Mock PartnerReferralRepository referralRepository;
    @Mock PartnerWebhookEventRepository webhookEventRepository;

    @InjectMocks PartnerService service;

    private Partner fintiba;

    @BeforeEach
    void setUp() {
        fintiba = Partner.builder()
            .slug("fintiba").name("Fintiba")
            .category(PartnerCategory.BANK)
            .websiteUrl("https://fintiba.com")
            .affiliateUrlTemplate("https://fintiba.com/?aff_sub={tag}")
            .commissionDisclosure("We earn a referral fee.")
            .active(true)
            .build();
        fintiba.setId(UUID.randomUUID());
    }

    @Test
    void recordClick_persistsReferralAndRendersAffiliateUrl() {
        when(partnerRepository.findBySlug("fintiba")).thenReturn(Optional.of(fintiba));
        when(referralRepository.save(any(PartnerReferral.class))).thenAnswer(inv -> inv.getArgument(0));

        UUID userId = UUID.randomUUID();
        PartnerClickResponse resp = service.recordClick("fintiba", userId, "sperrkonto");
        assertThat(resp.clickId()).isNotBlank();
        assertThat(resp.redirectUrl()).contains(resp.clickId());
        verify(referralRepository).save(any(PartnerReferral.class));
    }

    @Test
    void recordClick_inactivePartner_throws() {
        fintiba.setActive(false);
        when(partnerRepository.findBySlug("fintiba")).thenReturn(Optional.of(fintiba));

        assertThatThrownBy(() -> service.recordClick("fintiba", null, null))
            .isInstanceOf(ValidationException.class);
    }

    @Test
    void recordClick_unknownPartner_throws404() {
        when(partnerRepository.findBySlug("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.recordClick("nope", null, null))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void handleWebhook_marksReferralConverted() {
        PartnerReferral referral = PartnerReferral.builder()
            .partnerId(fintiba.getId())
            .userId(UUID.randomUUID())
            .clickId("click-123")
            .clickedAt(LocalDateTime.now().minusHours(1))
            .build();
        referral.setId(UUID.randomUUID());

        when(webhookEventRepository.existsById("evt-1")).thenReturn(false);
        when(partnerRepository.findBySlug("fintiba")).thenReturn(Optional.of(fintiba));
        when(referralRepository.findByClickId("click-123")).thenReturn(Optional.of(referral));

        boolean processed = service.handleWebhook(new PartnerWebhookRequest(
            "evt-1", "fintiba", "click-123", new BigDecimal("25.00"), "{\"raw\":true}"));

        assertThat(processed).isTrue();
        assertThat(referral.getConvertedAt()).isNotNull();
        assertThat(referral.getCommission()).isEqualByComparingTo("25.00");
        verify(webhookEventRepository).save(any(PartnerWebhookEvent.class));
    }

    @Test
    void handleWebhook_replayOfSameEvent_isIgnored() {
        when(webhookEventRepository.existsById("evt-1")).thenReturn(true);

        boolean processed = service.handleWebhook(new PartnerWebhookRequest(
            "evt-1", "fintiba", "click-123", new BigDecimal("25.00"), null));

        assertThat(processed).isFalse();
        verify(referralRepository, never()).save(any());
        verify(webhookEventRepository, never()).save(any());
    }

    @Test
    void handleWebhook_alreadyConverted_doesNotDoubleCount() {
        PartnerReferral referral = PartnerReferral.builder()
            .partnerId(fintiba.getId())
            .clickId("click-123")
            .convertedAt(LocalDateTime.now().minusDays(1))
            .commission(new BigDecimal("25.00"))
            .build();
        referral.setId(UUID.randomUUID());

        when(webhookEventRepository.existsById("evt-2")).thenReturn(false);
        when(partnerRepository.findBySlug("fintiba")).thenReturn(Optional.of(fintiba));
        when(referralRepository.findByClickId("click-123")).thenReturn(Optional.of(referral));

        boolean processed = service.handleWebhook(new PartnerWebhookRequest(
            "evt-2", "fintiba", "click-123", new BigDecimal("99.00"), null));

        assertThat(processed).isFalse();
        verify(referralRepository, never()).save(any());
        // The new event ID is still recorded so a second replay also no-ops.
        verify(webhookEventRepository, times(1)).save(any());
        assertThat(referral.getCommission()).isEqualByComparingTo("25.00");
    }

    @Test
    void handleWebhook_partnerMismatch_throws() {
        PartnerReferral referralForOtherPartner = PartnerReferral.builder()
            .partnerId(UUID.randomUUID())
            .clickId("click-x")
            .build();
        referralForOtherPartner.setId(UUID.randomUUID());

        when(webhookEventRepository.existsById("evt-3")).thenReturn(false);
        when(partnerRepository.findBySlug("fintiba")).thenReturn(Optional.of(fintiba));
        when(referralRepository.findByClickId("click-x")).thenReturn(Optional.of(referralForOtherPartner));

        assertThatThrownBy(() -> service.handleWebhook(new PartnerWebhookRequest(
            "evt-3", "fintiba", "click-x", new BigDecimal("10.00"), null)))
            .isInstanceOf(ValidationException.class);
    }
}
