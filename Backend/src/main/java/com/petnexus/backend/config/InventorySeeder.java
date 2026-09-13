package com.petnexus.backend.config;

import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds the suppliers and the pharmacy inventory items (M5).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventorySeeder {

    private final SupplierRepository supplierRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public void seed() {
        // ------------------------------------------------------------------
        // Phase 8: Suppliers & Inventory Items
        // ------------------------------------------------------------------
        if (supplierRepository.count() == 0) {
            log.info("Seeding initial Suppliers into PetNexus database...");
            Supplier sup01 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-01")
                    .companyName("Zoetis Animal Health Sri Lanka (Pvt) Ltd")
                    .contactPerson("Ruwan Abeysekara")
                    .email("orders@zoetis-sl.com")
                    .phone("+94 11 234 7700")
                    .category("Pharmaceuticals & Vaccines")
                    .leadTimeDays(2)
                    .rating(new BigDecimal("4.9"))
                    .address("117 Sir James Peiris Mawatha, Colombo 02")
                    .active(true)
                    .build());

            Supplier sup02 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-02")
                    .companyName("Sathosa Veterinary & Medical Supplies (Pvt) Ltd")
                    .contactPerson("Pradeep Kumara")
                    .email("supply@sathosamedicalsupplies.lk")
                    .phone("+94 11 456 8800")
                    .category("Surgical & Clinical Equipment")
                    .leadTimeDays(3)
                    .rating(new BigDecimal("4.8"))
                    .address("45 Vauxhall Street, Colombo 02")
                    .active(true)
                    .build());

            Supplier sup03 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-03")
                    .companyName("Royal Canin Sri Lanka & Hill's Science Nutrition")
                    .contactPerson("Anoma Rajapaksha")
                    .email("vetcare@royalcanin-sl.com")
                    .phone("+94 11 789 5500")
                    .category("Prescription Diets & Nutrition")
                    .leadTimeDays(4)
                    .rating(new BigDecimal("4.7"))
                    .address("23 R.A. De Mel Mawatha, Colombo 04")
                    .active(true)
                    .build());

            log.info("Seeded 3 suppliers.");

            if (inventoryItemRepository.count() == 0) {
                log.info("Seeding initial Inventory Items into PetNexus database...");
                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-101")
                        .name("Apoquel 16mg (Oclacitinib) 100ct")
                        .category("Pharmaceuticals")
                        .sku("MED-APQ-016")
                        .batchNumber("BT-88912")
                        .currentStock(18)
                        .minStockThreshold(10)
                        .unit("Bottles")
                        .unitPrice(new BigDecimal("38000.00"))
                        .sellingPrice(new BigDecimal("52000.00"))
                        .expiryDate(LocalDate.of(2027, 11, 30))
                        .supplier(sup01)
                        .supplierName(sup01.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-102")
                        .name("Rabies 3-Year Canine/Feline Vaccine 50-Dose")
                        .category("Vaccines")
                        .sku("VAC-RAB-03Y")
                        .batchNumber("BT-99411")
                        .currentStock(4)
                        .minStockThreshold(8)
                        .unit("Vials (Pack)")
                        .unitPrice(new BigDecimal("22500.00"))
                        .sellingPrice(new BigDecimal("38500.00"))
                        .expiryDate(LocalDate.of(2027, 4, 15))
                        .supplier(sup01)
                        .supplierName(sup01.getCompanyName())
                        .status(StockStatus.LOW_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-103")
                        .name("Surgical Suture Vicryl 3-0 with Reverse Cutting Needle")
                        .category("Surgical Supplies")
                        .sku("SUR-SUT-VIC30")
                        .batchNumber("BT-44102")
                        .currentStock(32)
                        .minStockThreshold(15)
                        .unit("Boxes (12/pk)")
                        .unitPrice(new BigDecimal("11000.00"))
                        .sellingPrice(new BigDecimal("17500.00"))
                        .expiryDate(LocalDate.of(2028, 9, 1))
                        .supplier(sup02)
                        .supplierName(sup02.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-104")
                        .name("Royal Canin Veterinary Gastrointestinal Low Fat 12kg")
                        .category("Prescription Diet")
                        .sku("NUT-RC-GI-12K")
                        .batchNumber("BT-10293")
                        .currentStock(2)
                        .minStockThreshold(6)
                        .unit("Bags")
                        .unitPrice(new BigDecimal("18000.00"))
                        .sellingPrice(new BigDecimal("25000.00"))
                        .expiryDate(LocalDate.of(2026, 12, 15))
                        .supplier(sup03)
                        .supplierName(sup03.getCompanyName())
                        .status(StockStatus.LOW_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-105")
                        .name("Isoflurane Inhalation Anesthetic USP 250ml")
                        .category("Anesthetics")
                        .sku("MED-ISO-250ML")
                        .batchNumber("BT-66129")
                        .currentStock(12)
                        .minStockThreshold(5)
                        .unit("Bottles")
                        .unitPrice(new BigDecimal("14500.00"))
                        .sellingPrice(new BigDecimal("21500.00"))
                        .expiryDate(LocalDate.of(2028, 1, 20))
                        .supplier(sup02)
                        .supplierName(sup02.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                log.info("Seeded 5 inventory items.");
            }
        }
    }
}
