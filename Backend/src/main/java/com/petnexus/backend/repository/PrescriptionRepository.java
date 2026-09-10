package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByPrescriptionId(String prescriptionId);

    boolean existsByPrescriptionId(String prescriptionId);

    List<Prescription> findByPetId(String petId);

    List<Prescription> findByVetId(String vetId);

    @Query("SELECT DISTINCT p FROM Prescription p LEFT JOIN FETCH p.items WHERE " +
           "(:petId IS NULL OR p.petId = :petId) AND " +
           "(:vetId IS NULL OR p.vetId = :vetId) " +
           "ORDER BY p.issueDate DESC")
    List<Prescription> findWithFilters(
            @Param("petId") String petId,
            @Param("vetId") String vetId
    );
}
