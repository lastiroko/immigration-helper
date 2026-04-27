package com.immigrationhelper.repository;

import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Test
    void findByEmail_withExistingEmail_returnsUser() {
        User user = userRepository.save(User.builder()
            .email("repo.test@example.com")
            .passwordHash("$2a$12$hash")
            .name("Repo Test User")
            .subscriptionTier(SubscriptionTier.FREE)
            .build());

        Optional<User> found = userRepository.findByEmail("repo.test@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(user.getId());
    }

    @Test
    void existsByEmail_withExistingEmail_returnsTrue() {
        userRepository.save(User.builder()
            .email("exists.test@example.com")
            .passwordHash("$2a$12$hash")
            .name("Exists Test User")
            .subscriptionTier(SubscriptionTier.FREE)
            .build());

        assertThat(userRepository.existsByEmail("exists.test@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("nonexistent@example.com")).isFalse();
    }

    @Test
    void findByEmail_withNonExistingEmail_returnsEmpty() {
        Optional<User> found = userRepository.findByEmail("notfound@example.com");
        assertThat(found).isEmpty();
    }

    @Test
    void findByStripeCustomerId_withKnownId_returnsUser() {
        userRepository.save(User.builder()
            .email("stripe.test@example.com")
            .passwordHash("$2a$12$hash")
            .name("Stripe Test User")
            .subscriptionTier(SubscriptionTier.PREMIUM)
            .stripeCustomerId("cus_test_12345")
            .build());

        Optional<User> found = userRepository.findByStripeCustomerId("cus_test_12345");

        assertThat(found).isPresent();
        assertThat(found.get().getSubscriptionTier()).isEqualTo(SubscriptionTier.PREMIUM);
    }
}
