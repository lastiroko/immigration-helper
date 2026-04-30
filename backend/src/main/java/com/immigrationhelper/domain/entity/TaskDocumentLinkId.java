package com.immigrationhelper.domain.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TaskDocumentLinkId implements Serializable {
    private UUID taskId;
    private UUID documentId;
}
