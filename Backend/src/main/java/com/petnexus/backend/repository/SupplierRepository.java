package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findBySupplierId(String supplierId);
    boolean existsBySupplierId(String supplierId);
    boolean existsByCompanyNameIgnoreCase(String companyName);
    List<Supplier> findByActiveTrue();
}
