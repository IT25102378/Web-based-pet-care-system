package com.petnexus.backend.entity;

import com.petnexus.backend.enums.AdoptionApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionApplication {
    @Id
    @Column(name = "application_id", nullable = false, updatable = false)
    private String applicationId; // e.g., APP-0001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private RescueCase rescueCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @Column(name = "pet_name", nullable = false)
    private String petName;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_phone", nullable = false)
    private String applicantPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AdoptionApplicationStatus status;

    @Column(name = "review_notes")
    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
