package com.petnexus.backend.repository;

import com.petnexus.backend.entity.RescueCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescueCaseRepository extends JpaRepository<RescueCase, Long> {

    Optional<RescueCase> findByCaseId(String caseId);

    List<RescueCase> findByStatus(String status);

    List<RescueCase> findByIsPublishedForAdoptionTrueAndStatus(String status);

    boolean existsByCaseId(String caseId);

    long count();
}
