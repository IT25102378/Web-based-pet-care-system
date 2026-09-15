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

    // ------------------------------------------------------------------
    // Applicant answers from the adoption wizard.
    // These are what the rescue officer reads when deciding, so they are
    // stored rather than discarded. All are nullable: applications created
    // before these columns existed have none of them.
    // ------------------------------------------------------------------

    @Column(name = "applicant_email", length = 255)
    private String applicantEmail;

    @Column(name = "applicant_address", length = 500)
    private String applicantAddress;

    @Column(name = "occupation", length = 150)
    private String occupation;

    @Column(name = "housing_type", length = 100)
    private String housingType;

    @Column(name = "has_fenced_yard")
    private Boolean hasFencedYard;

    @Column(name = "pet_experience_years")
    private Integer petExperienceYears;

    @Column(name = "daily_alone_hours", length = 50)
    private String dailyAloneHours;

    @Column(name = "has_other_pets")
    private Boolean hasOtherPets;

    @Column(name = "other_pets_details", length = 1000)
    private String otherPetsDetails;

    @Column(name = "reason_for_adoption", length = 2000)
    private String reasonForAdoption;

    @Column(name = "terms_accepted")
    private Boolean termsAccepted;

    /** Base64 image of the signature drawn in the wizard, so it can be large. */
    @Column(name = "signature_data_url", columnDefinition = "varchar(MAX)")
    private String signatureDataUrl;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

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
