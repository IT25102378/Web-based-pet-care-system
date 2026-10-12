package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Pet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    Optional<Pet> findByPetId(String petId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pet p WHERE p.petId = :petId")
    Optional<Pet> findByPetIdForUpdate(@Param("petId") String petId);
    List<Pet> findByOwner_UserId(String ownerId);
    boolean existsByPetId(String petId);
}
