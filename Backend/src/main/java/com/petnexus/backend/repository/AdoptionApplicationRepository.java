package com.petnexus.backend.repository;

import com.petnexus.backend.entity.AdoptionApplication;
import com.petnexus.backend.enums.AdoptionApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionApplicationRepository extends JpaRepository<AdoptionApplication, String> {
    List<AdoptionApplication> findByRescueCase_CaseId(String caseId);
    List<AdoptionApplication> findByApplicant_UserId(String userId);
    boolean existsByRescueCase_CaseIdAndApplicant_UserIdAndStatusIn(String caseId, String userId, java.util.Collection<AdoptionApplicationStatus> statuses);
    Optional<AdoptionApplication> findByApplicationId(String applicationId);
}
