package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Response DTO for a Service Package Booking.
 */
public class ServicePackageBookingResponseDto {

    @NotBlank
    private String bookingId;

    @NotBlank
    private String ownerId;

    @NotBlank
    private String packageName;

    @NotNull
    private Integer totalSessions;

    @NotNull
    private Integer completedSessions;

    @NotNull
    private Integer remainingSessions;

    @NotNull
    private LocalDate purchaseDate;

    @NotNull
    private LocalDate expiryDate;

    @NotBlank
    private String status;

    // Getters and setters
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
    public Integer getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(Integer completedSessions) { this.completedSessions = completedSessions; }
    public Integer getRemainingSessions() { return remainingSessions; }
    public void setRemainingSessions(Integer remainingSessions) { this.remainingSessions = remainingSessions; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
