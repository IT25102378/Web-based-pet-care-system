package com.petnexus.backend.entity;

import com.petnexus.backend.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Notification entity — persisted to [PetNexus].[dbo].[notifications].
 */
@Entity
@Table(
    name = "notifications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_notifications_notification_id", columnNames = "notificationId")
    },
    indexes = {
        @Index(name = "idx_notifications_user", columnList = "user_id"),
        @Index(name = "idx_notifications_is_read", columnList = "isRead")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String notificationId; // e.g., NTF-01, NTF-1712345678901

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_notifications_user"), nullable = false)
    private User user;

    public String getUserId() {
        return user != null ? user.getUserId() : null;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(length = 300)
    private String link;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
