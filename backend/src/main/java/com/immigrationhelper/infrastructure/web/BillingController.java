package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.payment.CheckoutSessionRequest;
import com.immigrationhelper.application.dto.payment.SubscriptionStatusDto;
import com.immigrationhelper.application.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Stripe checkout, subscriptions, and webhooks")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/checkout-session")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a Stripe Checkout session for subscription upgrade")
    public Map<String, String> createCheckoutSession(@Valid @RequestBody CheckoutSessionRequest request) {
        return Map.of("checkoutUrl", billingService.createCheckoutSession(request));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook endpoint (idempotent on event id)")
    public ResponseEntity<Void> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        billingService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subscription")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get the current Stripe-backed subscription status for a user")
    public SubscriptionStatusDto getSubscriptionStatus(@RequestParam UUID userId) {
        return billingService.getSubscriptionStatus(userId);
    }
}
