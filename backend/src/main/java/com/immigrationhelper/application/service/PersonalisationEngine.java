package com.immigrationhelper.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Evaluates each TaskTemplate's `applicableTo` JSON rule against a UserProfile and
 * returns the matching template codes ordered by priority (lowest = most urgent).
 *
 * Rule schema (all fields optional):
 *   { "all": true }                                         — matches any profile
 *   { "visaPathway": ["STUDENT", "BLUE_CARD"] }             — profile.visaPathway must be in list
 *   { "familyStatus": ["MARRIED", "PARENT"] }
 *   { "cities": ["munich","berlin","stuttgart"] }           — matched against city.slug
 *   { "familyInGermany": true|false }
 *   { "minDaysFromArrival": 0, "maxDaysFromArrival": 30 }   — relative to profile.arrivalDate
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalisationEngine {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final TaskTemplateRepository templateRepository;

    public List<String> matchingTemplateCodes(UserProfile profile) {
        return matchAgainst(profile, templateRepository.findAll());
    }

    public List<String> matchAgainst(UserProfile profile, List<TaskTemplate> templates) {
        return templates.stream()
            .filter(t -> matches(profile, t))
            .sorted(Comparator.comparingInt(TaskTemplate::getPriority))
            .map(TaskTemplate::getCode)
            .toList();
    }

    boolean matches(UserProfile profile, TaskTemplate template) {
        Map<String, Object> rule = parseRule(template);
        if (rule == null || rule.isEmpty()) return false;
        if (Boolean.TRUE.equals(rule.get("all"))) return true;

        if (!checkList(rule, "visaPathway", profile.getVisaPathway() == null
                ? null : profile.getVisaPathway().name())) return false;
        if (!checkList(rule, "familyStatus", profile.getFamilyStatus() == null
                ? null : profile.getFamilyStatus().name())) return false;
        if (!checkList(rule, "cities", profile.getCity() == null ? null : profile.getCity().getSlug())) return false;
        if (!checkList(rule, "nationality", profile.getNationality())) return false;

        Object famGer = rule.get("familyInGermany");
        if (famGer instanceof Boolean b && b != profile.isFamilyInGermany()) return false;

        if (!checkArrivalWindow(rule, profile.getArrivalDate())) return false;

        // If none of the recognised filters were present (and all != true), don't match — defensive default.
        return rule.containsKey("visaPathway")
            || rule.containsKey("familyStatus")
            || rule.containsKey("cities")
            || rule.containsKey("nationality")
            || rule.containsKey("familyInGermany")
            || rule.containsKey("minDaysFromArrival")
            || rule.containsKey("maxDaysFromArrival");
    }

    @SuppressWarnings("unchecked")
    private boolean checkList(Map<String, Object> rule, String key, String profileValue) {
        Object raw = rule.get(key);
        if (raw == null) return true;
        if (profileValue == null) return false;
        if (!(raw instanceof List<?> list)) return false;
        return ((List<Object>) list).stream().anyMatch(v -> profileValue.equals(String.valueOf(v)));
    }

    private boolean checkArrivalWindow(Map<String, Object> rule, LocalDate arrivalDate) {
        Object min = rule.get("minDaysFromArrival");
        Object max = rule.get("maxDaysFromArrival");
        if (min == null && max == null) return true;
        if (arrivalDate == null) return false;
        long days = ChronoUnit.DAYS.between(arrivalDate, LocalDate.now());
        if (min instanceof Number n && days < n.longValue()) return false;
        return !(max instanceof Number n) || days <= n.longValue();
    }

    private Map<String, Object> parseRule(TaskTemplate template) {
        if (template.getApplicableTo() == null || template.getApplicableTo().isBlank()) return Map.of();
        try {
            return MAPPER.readValue(template.getApplicableTo(), new TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            log.warn("Invalid applicableTo for template {}: {}", template.getCode(), e.getMessage());
            return Map.of();
        }
    }
}
