package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentId(String appointmentId);

    boolean existsByAppointmentId(String appointmentId);

    long countByTokenNumberStartingWith(String prefix);

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:ownerId IS NULL OR a.ownerId = :ownerId) AND " +
           "(:vetId IS NULL OR a.vetId = :vetId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:date IS NULL OR a.appointmentDate = :date) " +
           "ORDER BY a.appointmentDate DESC, a.timeSlot ASC")
    List<Appointment> findWithFilters(
            @Param("ownerId") String ownerId,
            @Param("vetId") String vetId,
            @Param("status") AppointmentStatus status,
            @Param("date") LocalDate date
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDate = :date AND " +
           "a.timeSlot = :slot AND " +
           "((:vetId IS NOT NULL AND a.vetId = :vetId) OR a.vetName = :vetName) AND " +
           "a.status NOT IN :excludedStatuses")
    List<Appointment> findVetConflicts(
            @Param("date") LocalDate date,
            @Param("slot") String slot,
            @Param("vetId") String vetId,
            @Param("vetName") String vetName,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDate = :date AND " +
           "a.timeSlot = :slot AND " +
           "((:vetId IS NOT NULL AND a.vetId = :vetId) OR a.vetName = :vetName) AND " +
           "a.status NOT IN :excludedStatuses AND " +
           "a.appointmentId <> :excludeId")
    List<Appointment> findVetConflictsExcluding(
            @Param("date") LocalDate date,
            @Param("slot") String slot,
            @Param("vetId") String vetId,
            @Param("vetName") String vetName,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses,
            @Param("excludeId") String excludeId
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDate = :date AND " +
           "a.timeSlot = :slot AND " +
           "a.petId = :petId AND " +
           "a.status NOT IN :excludedStatuses")
    List<Appointment> findPetConflicts(
            @Param("date") LocalDate date,
            @Param("slot") String slot,
            @Param("petId") String petId,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDate = :date AND " +
           "a.timeSlot = :slot AND " +
           "a.petId = :petId AND " +
           "a.status NOT IN :excludedStatuses AND " +
           "a.appointmentId <> :excludeId")
    List<Appointment> findPetConflictsExcluding(
            @Param("date") LocalDate date,
            @Param("slot") String slot,
            @Param("petId") String petId,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses,
            @Param("excludeId") String excludeId
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDate = :date AND " +
           "((:vetName IS NULL OR :vetName = '') OR a.vetName = :vetName) AND " +
           "a.status NOT IN :excludedStatuses")
    List<Appointment> findActiveForDateAndVet(
            @Param("date") LocalDate date,
            @Param("vetName") String vetName,
            @Param("excludedStatuses") Collection<AppointmentStatus> excludedStatuses
    );
}
