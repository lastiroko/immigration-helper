package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.partner.PartnerCardDto;
import com.immigrationhelper.application.dto.partner.PartnerClickResponse;
import com.immigrationhelper.application.dto.partner.PartnerDetailDto;
import com.immigrationhelper.application.dto.partner.PartnerWebhookRequest;
import com.immigrationhelper.application.service.PartnerService;
import com.immigrationhelper.domain.enums.PartnerCategory;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Helfa partner marketplace")
public class MarketplaceController {

    private final PartnerService partnerService;
    private final UserRepository userRepository;

    @GetMapping("/api/v1/marketplace")
    @Operation(summary = "Browse partners (optionally filter by category)")
    public List<PartnerCardDto> marketplace(@RequestParam(required = false) PartnerCategory category) {
        return partnerService.listMarketplace(category);
    }

    @GetMapping("/api/v1/partners/{slug}")
    @Operation(summary = "Partner detail by slug")
    public PartnerDetailDto detail(@PathVariable String slug) {
        return partnerService.getPartner(slug);
    }

    @PostMapping("/api/v1/partners/{slug}/click")
    @Operation(summary = "Record an affiliate click and get the redirect URL")
    public PartnerClickResponse click(@PathVariable String slug,
                                      @RequestParam(required = false) String productCode,
                                      Authentication authentication) {
        UUID userId = authentication == null ? null
            : userRepository.findByEmail(authentication.getName()).map(u -> u.getId()).orElse(null);
        return partnerService.recordClick(slug, userId, productCode);
    }

    @PostMapping("/api/v1/partners/webhook")
    @Operation(summary = "Affiliate-network webhook (idempotent on eventId)")
    public ResponseEntity<Void> webhook(@Valid @RequestBody PartnerWebhookRequest request) {
        partnerService.handleWebhook(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
