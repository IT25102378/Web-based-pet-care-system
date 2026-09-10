package com.petnexus.backend.repository;

import com.petnexus.backend.entity.PetDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetDocumentRepository extends JpaRepository<PetDocument, Long> {
    Optional<PetDocument> findByDocumentId(String documentId);
    List<PetDocument> findByPet_PetId(String petId);
    List<PetDocument> findByOwnerId(String ownerId);
    List<PetDocument> findByPet_PetIdAndOwnerId(String petId, String ownerId);
    boolean existsByDocumentId(String documentId);
}
