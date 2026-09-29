package com.petnexus.backend.repository;

import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.enums.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByItemId(String itemId);
    Optional<InventoryItem> findBySku(String sku);
    boolean existsByItemId(String itemId);
    boolean existsBySku(String sku);

    List<InventoryItem> findByCategory(String category);
    List<InventoryItem> findByStatus(StockStatus status);
    List<InventoryItem> findByCategoryAndStatus(String category, StockStatus status);

    @Query("SELECT i FROM InventoryItem i WHERE i.currentStock <= i.minStockThreshold")
    List<InventoryItem> findLowStockItems();
}
