package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.service.UserProfileService;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock UserProfileRepository profileRepository;
    @Mock UserRepository userRepository;
    @Mock CityRepository cityRepository;

    @InjectMocks UserProfileService service;

    private UUID userId;
    private User user;
    private City munich;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder().id(userId).email("u@test.com").name("U").passwordHash("x").build();
        munich = City.builder().slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build();
    }

    @Test
    void upsert_createsProfileWhenAbsent() {
        when(profileRepository.findById(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserProfileRequest req = new UpdateUserProfileRequest(
            "Alice", "DE", null, VisaPathway.STUDENT, FamilyStatus.SINGLE,
            false, LocalDate.of(2026, 9, 1), null, null);

        UserProfileDto dto = service.upsert(userId, req);
        assertThat(dto.firstName()).isEqualTo("Alice");
        assertThat(dto.nationality()).isEqualTo("DE");
        assertThat(dto.visaPathway()).isEqualTo(VisaPathway.STUDENT);
    }

    @Test
    void upsert_resolvesCityFromCityId() {
        UUID cityId = UUID.randomUUID();
        when(profileRepository.findById(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cityRepository.findById(cityId)).thenReturn(Optional.of(munich));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserProfileRequest req = new UpdateUserProfileRequest(
            null, null, cityId, null, null, null, null, null, null);

        UserProfileDto dto = service.upsert(userId, req);
        assertThat(dto.citySlug()).isEqualTo("munich");
    }

    @Test
    void upsert_unknownCity_throwsResourceNotFound() {
        UUID cityId = UUID.randomUUID();
        when(profileRepository.findById(userId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cityRepository.findById(cityId)).thenReturn(Optional.empty());

        UpdateUserProfileRequest req = new UpdateUserProfileRequest(
            null, null, cityId, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.upsert(userId, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void upsert_partialPatch_leavesUnsetFieldsAlone() {
        UserProfile existing = UserProfile.builder()
            .userId(userId).user(user)
            .firstName("Bob").nationality("GB")
            .visaPathway(VisaPathway.BLUE_CARD).familyStatus(FamilyStatus.MARRIED)
            .build();
        when(profileRepository.findById(userId)).thenReturn(Optional.of(existing));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserProfileRequest patch = new UpdateUserProfileRequest(
            "Roberta", null, null, null, null, null, null, null, null);

        UserProfileDto dto = service.upsert(userId, patch);
        assertThat(dto.firstName()).isEqualTo("Roberta");
        assertThat(dto.nationality()).isEqualTo("GB");
        assertThat(dto.visaPathway()).isEqualTo(VisaPathway.BLUE_CARD);
        assertThat(dto.familyStatus()).isEqualTo(FamilyStatus.MARRIED);
    }

    @Test
    void get_missingProfile_throwsResourceNotFound() {
        when(profileRepository.findById(userId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.get(userId))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
