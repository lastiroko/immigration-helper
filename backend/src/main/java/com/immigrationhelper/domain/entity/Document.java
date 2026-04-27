package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.VisaType;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @ElementCollection(targetClass = VisaType.class)
    @CollectionTable(name = "document_visa_types", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "visa_types")
    @Enumerated(EnumType.STRING)
    private Set<VisaType> visaTypes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = true;

    @Column(length = 500)
    private String notes;
}
