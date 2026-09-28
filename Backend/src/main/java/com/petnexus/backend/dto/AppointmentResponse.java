package com.petnexus.backend.dto;

import com.petnexus.backend.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private String appointmentId;
    private String petId;
    private String petName;
    private String species;
    private String breed;
    private String ownerId;
    private String ownerName;
    private String ownerPhone;
    private String vetId;
    private String vetName;
    private String serviceType;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String status;
    private String tokenNumber;
    private String reason;
    private String symptoms;
    private String notes;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private RescheduledFromDto rescheduledFrom;
    private String rescheduleReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AppointmentResponse from(Appointment a) {
        if (a == null) return null;
        RescheduledFromDto resched = null;
        if (a.getRescheduledFromDate() != null) {
            resched = RescheduledFromDto.builder()
                    .date(a.getRescheduledFromDate())
                    .timeSlot(a.getRescheduledFromTimeSlot())
                    .vetName(a.getRescheduledFromVetName())
                    .build();
        }

        return AppointmentResponse.builder()
                .id(a.getId())
                .appointmentId(a.getAppointmentId())
                .petId(a.getPetId())
                .petName(a.getPetName())
                .species(a.getSpecies())
                .breed(a.getBreed())
                .ownerId(a.getOwnerId())
                .ownerName(a.getOwnerName())
                .ownerPhone(a.getOwnerPhone())
                .vetId(a.getVetId())
                .vetName(a.getVetName())
                .serviceType(a.getServiceType())
                .appointmentDate(a.getAppointmentDate())
                .timeSlot(a.getTimeSlot())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .tokenNumber(a.getTokenNumber())
                .reason(a.getReason())
                .symptoms(a.getSymptoms())
                .notes(a.getNotes())
                .cancellationReason(a.getCancellationReason())
                .cancelledAt(a.getCancelledAt())
                .rescheduledFrom(resched)
                .rescheduleReason(a.getRescheduleReason())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
