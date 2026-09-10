package com.petnexus.backend.repository;

import com.petnexus.backend.entity.CareServiceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CareServiceLogRepository extends JpaRepository<CareServiceLog, Long> {
    Optional<CareServiceLog> findByServiceLogId(String serviceLogId);
    List<CareServiceLog> findByProviderId(String providerId);
    List<CareServiceLog> findByStatus(com.petnexus.backend.enums.ServiceStatus status);
    List<CareServiceLog> findByCaseId(String caseId);
    List<CareServiceLog> findByOwnerId(String ownerId);
    // Conflict detection: same provider and same date
    boolean existsByProviderIdAndServiceDate(String providerId, java.time.LocalDate serviceDate);
    // Conflict detection: same pet (or case) and same date
    boolean existsByPetIdAndServiceDate(String petId, java.time.LocalDate serviceDate);
    boolean existsByCaseIdAndServiceDate(String caseId, java.time.LocalDate serviceDate);
}
