package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByConsultationId(String consultationId);

    boolean existsByConsultationId(String consultationId);

    boolean existsByAppointmentId(String appointmentId);

    List<Consultation> findByPetId(String petId);

    List<Consultation> findByCaseId(String caseId);

    List<Consultation> findByVetId(String vetId);

    @Query("SELECT c FROM Consultation c WHERE " +
           "(:petId IS NULL OR c.petId = :petId) AND " +
           "(:caseId IS NULL OR c.caseId = :caseId) AND " +
           "(:vetId IS NULL OR c.vetId = :vetId) " +
           "ORDER BY c.consultationDate DESC")
    List<Consultation> findWithFilters(
            @Param("petId") String petId,
            @Param("caseId") String caseId,
            @Param("vetId") String vetId
    );
}
