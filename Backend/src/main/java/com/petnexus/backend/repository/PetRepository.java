package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    Optional<Pet> findByPetId(String petId);
    List<Pet> findByOwner_UserId(String ownerId);
    boolean existsByPetId(String petId);
}
