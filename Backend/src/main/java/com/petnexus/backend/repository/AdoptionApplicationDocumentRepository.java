package com.petnexus.backend.repository;

import com.petnexus.backend.entity.AdoptionApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionApplicationDocumentRepository extends JpaRepository<AdoptionApplicationDocument, Long> {
    List<AdoptionApplicationDocument> findByApplication_ApplicationId(String applicationId);
}
