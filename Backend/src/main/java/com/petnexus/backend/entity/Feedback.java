package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Feedback entity — persisted to [PetNexus].[dbo].[feedback].
 */
@Entity
@Table(
    name = "feedback",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_feedback_feedback_id", columnNames = "feedbackId")
    },
    indexes = {
        @Index(name = "idx_feedback_user", columnList = "user_id"),
        @Index(name = "idx_feedback_category", columnList = "serviceCategory")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String feedbackId; // e.g., FDB-001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_feedback_user"), nullable = false)
    private User user;

    public String getUserId() {
        return user != null ? user.getUserId() : null;
    }

    @Column(nullable = false, length = 150)
    private String userName;

    @Column(nullable = false, length = 100)
    private String serviceCategory;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String comments;

    @Column(length = 150)
    @Builder.Default
    private String staffMentioned = "General Clinic Staff";

    @Column(length = 2000)
    private String managerResponse;

    @Column
    private LocalDateTime managerRespondedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
