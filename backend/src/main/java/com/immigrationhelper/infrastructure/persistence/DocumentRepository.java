package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.Document;
import com.immigrationhelper.domain.enums.VisaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT DISTINCT d FROM Document d JOIN d.visaTypes vt WHERE vt = :visaType")
    List<Document> findByVisaTypesContaining(@Param("visaType") VisaType visaType);

    @Query("SELECT DISTINCT d FROM Document d JOIN d.visaTypes vt WHERE vt = :visaType AND d.required = :required")
    List<Document> findByVisaTypesContainingAndRequired(
        @Param("visaType") VisaType visaType,
        @Param("required") boolean required
    );
}
