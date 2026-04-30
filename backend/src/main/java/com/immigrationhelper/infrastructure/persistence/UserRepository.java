package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByStripeCustomerId(String stripeCustomerId);
    List<User> findByStatusAndScheduledDeletionAtBefore(UserStatus status, LocalDateTime cutoff);
}
