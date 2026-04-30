package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.UserJourney;
import com.immigrationhelper.domain.enums.JourneyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserJourneyRepository extends JpaRepository<UserJourney, UUID> {
    List<UserJourney> findByUserIdOrderByStartedAtDesc(UUID userId);
    List<UserJourney> findByUserIdAndStatus(UUID userId, JourneyStatus status);
}
