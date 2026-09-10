package com.petnexus.backend.repository;

import com.petnexus.backend.entity.AdoptionListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionListingRepository extends JpaRepository<AdoptionListing, String> {
    Optional<AdoptionListing> findByRescueCase_CaseId(String caseId);
    List<AdoptionListing> findByIsPublishedForAdoptionTrue();
}
