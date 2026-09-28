package com.petnexus.backend.repository;

import com.petnexus.backend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderId(String orderId);
    List<PurchaseOrder> findBySupplierId(String supplierId);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
    List<PurchaseOrder> findByStatus(String status);
    boolean existsByOrderId(String orderId);
}
