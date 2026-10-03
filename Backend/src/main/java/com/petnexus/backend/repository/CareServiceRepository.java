package com.petnexus.backend.repository;

import com.petnexus.backend.entity.CareService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CareServiceRepository extends JpaRepository<CareService, Long> {
    Optional<CareService> findByServiceId(String serviceId);
    boolean existsByServiceId(String serviceId);
    boolean existsByName(String name);
    // Find all active services
    java.util.List<CareService> findByStatus(com.petnexus.backend.enums.ServiceStatus status);
}
