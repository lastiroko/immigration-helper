package com.immigrationhelper.service;

import com.immigrationhelper.application.service.PersonalisationEngine;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class PersonalisationEngineTest {

    @Mock TaskTemplateRepository templateRepository;

    @InjectMocks PersonalisationEngine engine;

    private List<TaskTemplate> templates;

    @BeforeEach
    void setUp() {
        templates = List.of(
            template("PASSPORT_VALID",     "{\"all\":true}",                                          10),
            template("ANMELDUNG_REGISTER", "{\"all\":true}",                                           5),
            template("SPERRKONTO_OPEN",    "{\"visaPathway\":[\"STUDENT\",\"CHANCENKARTE\"]}",        15),
            template("UNI_MATRICULATE",    "{\"visaPathway\":[\"STUDENT\"]}",                         25),
            template("ZAB_RECOGNITION",    "{\"visaPathway\":[\"BLUE_CARD\",\"CHANCENKARTE\"]}",      35),
            template("WORK_CONTRACT",      "{\"visaPathway\":[\"BLUE_CARD\",\"CHANCENKARTE\"]}",      25),
            template("JOB_SEEKER_REGISTER","{\"visaPathway\":[\"CHANCENKARTE\"]}",                    40),
            template("SPOUSE_A1_GERMAN",   "{\"visaPathway\":[\"FAMILY_REUNION\"]}",                  30),
            template("CHILDCARE_KITA",     "{\"familyStatus\":[\"PARENT\"]}",                         45),
            template("SPRACHKURS",         "{\"visaPathway\":[\"REFUGEE\",\"FAMILY_REUNION\"]}",      55),
            template("MUNICH_KVR_TIPS",    "{\"cities\":[\"munich\"]}",                               60)
        );
    }

    // Persona 1 — Chiamaka, non-EU master's student in Munich.
    @Test
    void chiamaka_studentMunich_getsStudentTemplates() {
        UserProfile p = profile(VisaPathway.STUDENT, FamilyStatus.SINGLE, "munich", "NG");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("PASSPORT_VALID", "ANMELDUNG_REGISTER", "SPERRKONTO_OPEN",
            "UNI_MATRICULATE", "MUNICH_KVR_TIPS");
        assertThat(matches).doesNotContain("ZAB_RECOGNITION", "JOB_SEEKER_REGISTER",
            "SPOUSE_A1_GERMAN", "CHILDCARE_KITA", "SPRACHKURS");
    }

    // Persona 2 — Arjun, Blue Card worker in Berlin.
    @Test
    void arjun_blueCardBerlin_getsBlueCardTemplates() {
        UserProfile p = profile(VisaPathway.BLUE_CARD, FamilyStatus.MARRIED, "berlin", "IN");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("PASSPORT_VALID", "ANMELDUNG_REGISTER",
            "ZAB_RECOGNITION", "WORK_CONTRACT");
        assertThat(matches).doesNotContain("UNI_MATRICULATE", "SPERRKONTO_OPEN",
            "JOB_SEEKER_REGISTER", "MUNICH_KVR_TIPS");
    }

    // Persona 3 — Olena, Chancenkarte holder in Munich (job-seeker).
    @Test
    void olena_chancenkarteMunich_getsJobSeekerTemplates() {
        UserProfile p = profile(VisaPathway.CHANCENKARTE, FamilyStatus.SINGLE, "munich", "UA");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("SPERRKONTO_OPEN", "ZAB_RECOGNITION",
            "WORK_CONTRACT", "JOB_SEEKER_REGISTER", "MUNICH_KVR_TIPS");
        assertThat(matches).doesNotContain("UNI_MATRICULATE", "SPOUSE_A1_GERMAN", "SPRACHKURS");
    }

    // Persona 4 — Marwan, family reunion in Stuttgart.
    @Test
    void marwan_familyReunionStuttgart_getsFamilyTemplates() {
        UserProfile p = profile(VisaPathway.FAMILY_REUNION, FamilyStatus.MARRIED, "stuttgart", "SY");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("SPOUSE_A1_GERMAN", "SPRACHKURS",
            "PASSPORT_VALID", "ANMELDUNG_REGISTER");
        assertThat(matches).doesNotContain("MUNICH_KVR_TIPS", "JOB_SEEKER_REGISTER",
            "UNI_MATRICULATE", "CHILDCARE_KITA");
    }

    // Persona 5 — Sahar, refugee in Berlin with children.
    @Test
    void sahar_refugeeBerlinParent_getsRefugeePlusChildcare() {
        UserProfile p = profile(VisaPathway.REFUGEE, FamilyStatus.PARENT, "berlin", "AF");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("SPRACHKURS", "CHILDCARE_KITA",
            "PASSPORT_VALID", "ANMELDUNG_REGISTER");
        assertThat(matches).doesNotContain("MUNICH_KVR_TIPS", "WORK_CONTRACT",
            "JOB_SEEKER_REGISTER", "SPERRKONTO_OPEN", "UNI_MATRICULATE");
    }

    // Persona 6 — Rachel, US spouse on §28 in Stuttgart.
    @Test
    void rachel_familyReunionStuttgart_singleParent_getsFamilyTemplatesNotChildcare() {
        UserProfile p = profile(VisaPathway.FAMILY_REUNION, FamilyStatus.MARRIED, "stuttgart", "US");
        var matches = engine.matchAgainst(p, templates);
        assertThat(matches).contains("SPOUSE_A1_GERMAN", "SPRACHKURS",
            "PASSPORT_VALID", "ANMELDUNG_REGISTER");
        assertThat(matches).doesNotContain("CHILDCARE_KITA");
    }

    @Test
    void resultsAreSortedByPriorityAscending() {
        UserProfile p = profile(VisaPathway.STUDENT, FamilyStatus.SINGLE, "munich", "NG");
        var matches = engine.matchAgainst(p, templates);
        // ANMELDUNG_REGISTER (priority 5) must come before PASSPORT_VALID (10) and SPERRKONTO_OPEN (15).
        assertThat(matches.indexOf("ANMELDUNG_REGISTER"))
            .isLessThan(matches.indexOf("PASSPORT_VALID"));
        assertThat(matches.indexOf("PASSPORT_VALID"))
            .isLessThan(matches.indexOf("SPERRKONTO_OPEN"));
    }

    @Test
    void emptyApplicableTo_doesNotMatchAnyone() {
        TaskTemplate orphan = template("ORPHAN", "{}", 99);
        UserProfile p = profile(VisaPathway.STUDENT, FamilyStatus.SINGLE, "munich", "NG");
        var matches = engine.matchAgainst(p, List.of(orphan));
        assertThat(matches).isEmpty();
    }

    @Test
    void invalidApplicableToJson_isSkippedNotThrown() {
        TaskTemplate broken = template("BROKEN", "not json", 99);
        UserProfile p = profile(VisaPathway.STUDENT, FamilyStatus.SINGLE, "munich", "NG");
        var matches = engine.matchAgainst(p, List.of(broken));
        assertThat(matches).isEmpty();
    }

    private static TaskTemplate template(String code, String applicableTo, int priority) {
        return TaskTemplate.builder()
            .code(code)
            .title("{\"en\":\"" + code + "\"}")
            .description("{\"en\":\"\"}")
            .applicableTo(applicableTo)
            .priority(priority)
            .phase("MVP")
            .build();
    }

    private static UserProfile profile(VisaPathway pathway, FamilyStatus familyStatus, String citySlug, String nationality) {
        City city = City.builder().slug(citySlug).name(citySlug).bundesland("X").supportedFromPhase("MVP").build();
        return UserProfile.builder()
            .nationality(nationality)
            .city(city)
            .visaPathway(pathway)
            .familyStatus(familyStatus)
            .arrivalDate(LocalDate.now().minusDays(7))
            .build();
    }
}
