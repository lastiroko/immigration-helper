package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;

    @Transactional(readOnly = true)
    public UserProfileDto get(UUID userId) {
        return toDto(profileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId)));
    }

    @Transactional
    public UserProfileDto upsert(UUID userId, UpdateUserProfileRequest req) {
        UserProfile profile = profileRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            return UserProfile.builder().user(user).build();
        });
        applyPatch(profile, req);
        return toDto(profileRepository.save(profile));
    }

    private void applyPatch(UserProfile profile, UpdateUserProfileRequest req) {
        if (req.firstName() != null) profile.setFirstName(req.firstName());
        if (req.nationality() != null) profile.setNationality(req.nationality());
        if (req.cityId() != null) {
            City city = cityRepository.findById(req.cityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + req.cityId()));
            profile.setCity(city);
        }
        if (req.visaPathway() != null) profile.setVisaPathway(req.visaPathway());
        if (req.familyStatus() != null) profile.setFamilyStatus(req.familyStatus());
        if (req.familyInGermany() != null) profile.setFamilyInGermany(req.familyInGermany());
        if (req.arrivalDate() != null) profile.setArrivalDate(req.arrivalDate());
        if (req.anmeldungDate() != null) profile.setAnmeldungDate(req.anmeldungDate());
        if (req.permitExpiryDate() != null) profile.setPermitExpiryDate(req.permitExpiryDate());
    }

    static UserProfileDto toDto(UserProfile p) {
        return new UserProfileDto(
            p.getUserId(),
            p.getFirstName(),
            p.getNationality(),
            p.getCity() == null ? null : p.getCity().getId(),
            p.getCity() == null ? null : p.getCity().getSlug(),
            p.getVisaPathway(),
            p.getFamilyStatus(),
            p.isFamilyInGermany(),
            p.getArrivalDate(),
            p.getAnmeldungDate(),
            p.getPermitExpiryDate()
        );
    }
}
