package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.payment.CheckoutSessionRequest;
import com.immigrationhelper.application.dto.payment.SubscriptionStatusDto;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
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

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final UserRepository userRepository;

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

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            log.error("Invalid Stripe webhook signature", e);
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.deleted" -> handleSubscriptionCancelled(event);
            default -> log.debug("Unhandled Stripe event: {}", event.getType());
        }
    }

    private void handleCheckoutCompleted(Event event) {
        event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
            if (obj instanceof Session session) {
                String userId = session.getMetadata().get("userId");
                String tier = session.getMetadata().get("tier");
                if (userId != null && tier != null) {
                    userRepository.findById(UUID.fromString(userId)).ifPresent(user -> {
                        user.setSubscriptionTier(SubscriptionTier.valueOf(tier));
                        userRepository.save(user);
                        log.info("Upgraded user {} to {}", user.getEmail(), tier);
                    });
                }
            }
        });
    }

    private void handleSubscriptionCancelled(Event event) {
        event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
            if (obj instanceof Subscription sub) {
                userRepository.findByStripeCustomerId(sub.getCustomer()).ifPresent(user -> {
                    user.setSubscriptionTier(SubscriptionTier.FREE);
                    userRepository.save(user);
                    log.info("Downgraded user {} to FREE after subscription cancellation", user.getEmail());
                });
            }
        });
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDto getSubscriptionStatus(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        return new SubscriptionStatusDto(
            user.getId(),
            user.getSubscriptionTier(),
            user.getStripeCustomerId(),
            null,
            user.getSubscriptionTier() == SubscriptionTier.FREE ? "inactive" : "active",
            null
        );
    }
}
