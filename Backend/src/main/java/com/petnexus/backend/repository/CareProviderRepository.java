package com.petnexus.backend.repository;

import com.petnexus.backend.entity.CareProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CareProviderRepository extends JpaRepository<CareProvider, Long> {
    Optional<CareProvider> findByProviderId(String providerId);
    boolean existsByProviderId(String providerId);
    Optional<CareProvider> findByUser_Id(Long userId);
}
