package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.payment.CheckoutSessionRequest;
import com.immigrationhelper.application.dto.payment.SubscriptionStatusDto;
import com.immigrationhelper.application.service.PaymentService;
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
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Stripe payment and subscription management")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-checkout-session")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create Stripe checkout session for subscription upgrade")
    public Map<String, String> createCheckoutSession(@Valid @RequestBody CheckoutSessionRequest request) {
        String url = paymentService.createCheckoutSession(request);
        return Map.of("checkoutUrl", url);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook endpoint — called by Stripe only")
    public ResponseEntity<Void> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subscription-status")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get subscription status for a user")
    public SubscriptionStatusDto getSubscriptionStatus(@RequestParam UUID userId) {
        return paymentService.getSubscriptionStatus(userId);
    }
}
