package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Represents a purchased service package (e.g., grooming package) containing a number of sessions.
 * The frontend expects fields such as totalSessions, remainingSessions, status, etc.
 */
@Entity
@Table(name = "service_package_bookings",
        uniqueConstraints = @UniqueConstraint(name = "uk_service_package_booking_id", columnNames = {"bookingId"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackageBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String bookingId; // e.g., PKB-001

    @Column(nullable = false, length = 20)
    private String ownerId; // references User.userId

    @Column(nullable = false, length = 100)
    private String packageName;

    @Column(nullable = false)
    private Integer totalSessions;

    @Column(nullable = false)
    private Integer completedSessions;

    @Column(nullable = false)
    private Integer remainingSessions;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false, length = 30)
    private String status; // Active, Completed, etc.

    // Timestamps
    @Column(nullable = false)
    private LocalDate createdAt;
}
