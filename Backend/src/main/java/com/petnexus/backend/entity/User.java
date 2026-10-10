package com.petnexus.backend.entity;

import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "`USER`",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_user_id", columnNames = "userId"),
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
    }
)
@Inheritance(strategy = InheritanceType.JOINED)
@org.hibernate.annotations.SQLDelete(sql = "UPDATE [USER] SET is_deleted = 1 WHERE user_id=?")
@org.hibernate.annotations.SQLRestriction("is_deleted = 0")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User {

    @Column(name = "is_deleted", nullable = false, columnDefinition = "bit default 0")
    @Builder.Default
    private boolean isDeleted = false;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "nic_no", nullable = false, length = 20)
    private String userId;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(length = 30)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(length = 200)
    private String emergencyContact;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private UserStatus status = UserStatus.PendingApproval;

    @Column(length = 500)
    private String rejectionReason;

    @Column(length = 500)
    private String suspensionReason;

    @Column(length = 100)
    private String passwordResetToken;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
