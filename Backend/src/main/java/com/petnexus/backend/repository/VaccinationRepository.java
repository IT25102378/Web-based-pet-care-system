package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    Optional<Vaccination> findByVaccineId(String vaccineId);
    List<Vaccination> findByPet_PetId(String petId);
    boolean existsByVaccineId(String vaccineId);
}
