package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for tracking administrative approval/rejection/suspension history.
 * Persisted to [PetNexus].[dbo].[approval_history].
 */
@Entity
@Table(
    name = "approval_history",
    indexes = {
        @Index(name = "idx_approval_history_user_id", columnList = "userId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String historyId; // e.g., AH-123456

    @Column(nullable = false, length = 20)
    private String userId; // The user who was approved/rejected

    @Column(nullable = false, length = 150)
    private String userFullName;

    @Column(nullable = false, length = 50)
    private String action; // APPROVED, REJECTED, SUSPENDED, REACTIVATED

    @Column(nullable = false, length = 20)
    private String adminId; // The administrator who performed the action

    @Column(length = 500)
    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
