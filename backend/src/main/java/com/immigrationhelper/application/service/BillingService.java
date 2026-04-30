package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.payment.CheckoutSessionRequest;
import com.immigrationhelper.application.dto.payment.SubscriptionStatusDto;
import com.immigrationhelper.domain.entity.StripeWebhookEvent;
import com.immigrationhelper.domain.entity.Subscription;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.StripeWebhookEventRepository;
import com.immigrationhelper.infrastructure.persistence.SubscriptionRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Billing service: Stripe checkout + webhook ingestion + Subscription persistence.
 *
 * Replaces the Phase 1 PaymentService. Two new behaviours over the old version:
 * - Webhooks are idempotent on event_id via stripe_webhook_events.
 * - Each checkout completion / subscription update writes a row into the
 *   subscriptions table; user.subscriptionTier remains as the cached fast-read.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final StripeWebhookEventRepository webhookEventRepository;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.premium-price-id}")
    private String premiumPriceId;

    @Value("${stripe.enterprise-price-id}")
    private String enterprisePriceId;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Transactional
    public String createCheckoutSession(CheckoutSessionRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + request.userId()));

        try {
            if (user.getStripeCustomerId() == null) {
                Customer customer = Customer.create(
                    CustomerCreateParams.builder()
                        .setEmail(user.getEmail())
                        .setName(user.getName())
                        .build()
                );
                user.setStripeCustomerId(customer.getId());
                userRepository.save(user);
            }

            String priceId = request.tier() == SubscriptionTier.ENTERPRISE ? enterprisePriceId : premiumPriceId;

            Session session = Session.create(
                SessionCreateParams.builder()
                    .setCustomer(user.getStripeCustomerId())
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build())
                    .setSuccessUrl(request.successUrl() != null ? request.successUrl() : "http://localhost:3000/success")
                    .setCancelUrl(request.cancelUrl() != null ? request.cancelUrl() : "http://localhost:3000/cancel")
                    .putMetadata("userId", request.userId().toString())
                    .putMetadata("tier", request.tier().name())
                    .build()
            );

            log.info("Created Stripe checkout session for user {}", user.getEmail());
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Stripe error creating checkout session", e);
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the Stripe signature, then idempotently records the event_id and dispatches.
     * Returns true if the event was newly processed, false if it was a replay.
     */
    @Transactional
    public boolean handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new IllegalArgumentException("Invalid webhook signature");
        }
        return processEvent(event);
    }

    /** Test seam: process a pre-verified event. */
    @Transactional
    public boolean processEvent(Event event) {
        if (webhookEventRepository.existsById(event.getId())) {
            log.info("Stripe webhook replay ignored: {}", event.getId());
            return false;
        }
        webhookEventRepository.save(StripeWebhookEvent.builder()
            .eventId(event.getId())
            .type(event.getType())
            .build());

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.deleted" -> handleSubscriptionCancelled(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            default -> log.debug("Unhandled Stripe event: {}", event.getType());
        }
        return true;
    }

    private void handleCheckoutCompleted(Event event) {
        event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
            if (obj instanceof Session session) {
                String userId = session.getMetadata().get("userId");
                String tier = session.getMetadata().get("tier");
                if (userId == null || tier == null) return;

                userRepository.findById(UUID.fromString(userId)).ifPresent(user -> {
                    user.setSubscriptionTier(SubscriptionTier.valueOf(tier));
                    userRepository.save(user);

                    Subscription sub = subscriptionRepository.findByUserId(user.getId())
                        .orElseGet(() -> Subscription.builder()
                            .userId(user.getId())
                            .stripeCustomerId(session.getCustomer())
                            .build());
                    sub.setStripeSubscriptionId(session.getSubscription());
                    sub.setTier(tier);
                    sub.setStatus(SubscriptionStatus.ACTIVE);
                    sub.setCurrentPeriodStart(LocalDateTime.now());
                    subscriptionRepository.save(sub);
                    log.info("Upgraded user {} to {}", user.getEmail(), tier);
                });
            }
        });
    }

    private void handleSubscriptionCancelled(Event event) {
        event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
            if (obj instanceof com.stripe.model.Subscription sub) {
                userRepository.findByStripeCustomerId(sub.getCustomer()).ifPresent(user -> {
                    user.setSubscriptionTier(SubscriptionTier.FREE);
                    userRepository.save(user);

                    subscriptionRepository.findByUserId(user.getId()).ifPresent(s -> {
                        s.setStatus(SubscriptionStatus.CANCELLED);
                        s.setCancelledAt(LocalDateTime.now());
                        subscriptionRepository.save(s);
                    });
                    log.info("Downgraded user {} to FREE after subscription cancellation", user.getEmail());
                });
            }
        });
    }

    private void handleSubscriptionUpdated(Event event) {
        event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
            if (obj instanceof com.stripe.model.Subscription stripeSub) {
                subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(local -> {
                    local.setStatus(SubscriptionStatus.valueOf(mapStatus(stripeSub.getStatus())));
                    subscriptionRepository.save(local);
                });
            }
        });
    }

    private static String mapStatus(String stripeStatus) {
        return switch (stripeStatus == null ? "" : stripeStatus) {
            case "active", "trialing" -> "ACTIVE";
            case "past_due", "unpaid" -> "PAST_DUE";
            case "canceled" -> "CANCELLED";
            default -> "EXPIRED";
        };
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDto getSubscriptionStatus(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        Subscription sub = subscriptionRepository.findByUserId(userId).orElse(null);

        return new SubscriptionStatusDto(
            user.getId(),
            user.getSubscriptionTier(),
            user.getStripeCustomerId(),
            sub == null ? null : sub.getStripeSubscriptionId(),
            sub == null
                ? (user.getSubscriptionTier() == SubscriptionTier.FREE ? "inactive" : "active")
                : sub.getStatus().name().toLowerCase(),
            sub == null ? null : sub.getCurrentPeriodEnd()
        );
    }
}
