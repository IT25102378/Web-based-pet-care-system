package com.petnexus.backend.service;

import com.petnexus.backend.dto.CareServiceLogCreateRequest;
import com.petnexus.backend.dto.CareServiceLogResponseDto;
import com.petnexus.backend.entity.CareServiceLog;
import com.petnexus.backend.entity.CareProvider;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.CareProviderRepository;
import com.petnexus.backend.repository.CareServiceLogRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.RescueCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing care service logs (grooming / boarding / care sessions).
 * Handles both owned pets and rescue animals.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CareServiceLogService {

    private final CareServiceLogRepository logRepository;
    private final CareProviderRepository providerRepository;
    private final PetRepository petRepository;
    private final RescueCaseRepository rescueCaseRepository;
    private final InventoryService inventoryService;
    private final com.petnexus.backend.repository.InventoryItemRepository inventoryItemRepository;

    @Transactional
    public CareServiceLogResponseDto createLog(CareServiceLogCreateRequest request) {
        validateServiceDate(request.getServiceDate());
        LocalDate serviceDate = request.getServiceDate() != null ? request.getServiceDate() : LocalDate.now();
        ServiceStatus status = request.getStatus() != null ? request.getStatus() : ServiceStatus.CHECKED_IN;

        String providerId = request.getProviderId();
        String providerName = request.getProviderName();

        if (providerId != null) {
            Optional<CareProvider> optProvider = providerRepository.findByProviderId(providerId);
            if (optProvider.isPresent()) {
                CareProvider provider = optProvider.get();
                if (!provider.isActive()) {
                    throw new BadRequestException("Provider is inactive: " + providerId);
                }
                providerName = provider.getProviderName();
            }
        }

        String petId = null;
        String petName = request.getPetName();
        String ownerId = request.getOwnerId();
        String ownerName = request.getOwnerName();
        String caseId = request.getCaseId();
        boolean returnToRescue = request.isReturnToRescue() || (caseId != null);

        if (caseId != null && !caseId.isBlank()) {
            RescueCase rescueCase = rescueCaseRepository.findByCaseId(caseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rescue case not found: " + caseId));
            petName = rescueCase.getTemporaryName();
            ownerName = (ownerName != null && !ownerName.isBlank()) ? ownerName : "Rescue Organization";
            // NOTE: Multiple logs per rescue case per day are intentional —
            // the vet creates an intake/handoff log, then the provider creates a care/grooming log.
            // Per-day uniqueness is NOT enforced for rescue cases.
        } else if (request.getPetId() != null && !request.getPetId().isBlank()) {
            Pet pet = petRepository.findByPetId(request.getPetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet not found: " + request.getPetId()));
            petId = pet.getPetId();
            petName = pet.getName();
            if (pet.getOwner() != null) {
                ownerId = pet.getOwner().getUserId();
                ownerName = pet.getOwner().getFullName();
            }
            if (request.getServiceDate() != null && logRepository.existsByPetIdAndServiceDate(petId, serviceDate)) {
                throw new BadRequestException("Pet already has a service scheduled on this date: " + serviceDate);
            }
        } else {
            throw new BadRequestException("Either petId or caseId must be provided");
        }

        long count = logRepository.count() + 1;
        String serviceLogId = String.format("CSL-%04d", count);
        while (logRepository.existsByServiceLogId(serviceLogId)) {
            count++;
            serviceLogId = String.format("CSL-%04d", count);
        }

        CareServiceLog serviceLog = CareServiceLog.builder()
                .serviceLogId(serviceLogId)
                .serviceType(request.getServiceType() != null ? request.getServiceType() : "General Grooming")
                .intakeCondition(request.getIntakeCondition())
                .servicesPerformed(request.getServicesPerformed())
                .notes(request.getNotes())
                .returnToRescue(returnToRescue)
                .serviceDate(serviceDate)
                .status(status)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .petId(petId)
                .petName(petName)
                .caseId(caseId)
                .providerId(providerId)
                .providerName(providerName)
                .createdAt(LocalDate.now())
                .build();

        logRepository.save(serviceLog);
        log.info("Created CareServiceLog {} for pet/case {} ({})", serviceLog.getServiceLogId(), petName, status);

        // Deduct requisitioned care & grooming products from clinic inventory
        deductCareProductsForService(serviceLog);

        return mapToResponse(serviceLog);
    }

    @Transactional(readOnly = true)
    public CareServiceLogResponseDto getLog(String serviceLogId) {
        CareServiceLog serviceLog = logRepository.findByServiceLogId(serviceLogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceLog not found: " + serviceLogId));
        return mapToResponse(serviceLog);
    }

    @Transactional(readOnly = true)
    public List<CareServiceLogResponseDto> listLogs(String providerId, String ownerId, String status) {
        List<CareServiceLog> logs = logRepository.findAll();
        return logs.stream()
                .filter(l -> providerId == null || providerId.equals(l.getProviderId()))
                .filter(l -> ownerId == null || ownerId.equals(l.getOwnerId()))
                .filter(l -> status == null || status.equalsIgnoreCase(l.getStatus().name())
                        || (l.getStatus().getJsonValue() != null && l.getStatus().getJsonValue().equalsIgnoreCase(status)))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareServiceLogResponseDto updateStatus(String serviceLogId, ServiceStatus newStatus, String notes) {
        if (newStatus == null) {
            throw new BadRequestException("New status is required");
        }
        CareServiceLog serviceLog = logRepository.findByServiceLogId(serviceLogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceLog not found: " + serviceLogId));

        ServiceStatus current = serviceLog.getStatus();
        if (!isValidTransition(current, newStatus)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + newStatus);
        }

        serviceLog.setStatus(newStatus);
        if (notes != null) {
            serviceLog.setNotes(notes);
        }

        // Deduct grooming supplies if progressing to In Progress or Completed and not already deducted
        if ((newStatus == ServiceStatus.IN_PROGRESS || newStatus == ServiceStatus.COMPLETED)) {
            deductCareProductsForService(serviceLog);
        }

        logRepository.save(serviceLog);
        log.info("Updated CareServiceLog {} status to {}", serviceLogId, newStatus);
        return mapToResponse(serviceLog);
    }

    @Transactional
    public CareServiceLogResponseDto updateLog(String serviceLogId, com.petnexus.backend.dto.CareServiceLogUpdateRequest request) {
        CareServiceLog serviceLog = logRepository.findByServiceLogId(serviceLogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceLog not found: " + serviceLogId));

        if (request.getServiceType() != null && !request.getServiceType().isBlank()) {
            serviceLog.setServiceType(request.getServiceType().trim());
        }
        if (request.getIntakeCondition() != null) {
            serviceLog.setIntakeCondition(request.getIntakeCondition().trim());
        }
        if (request.getServicesPerformed() != null) {
            serviceLog.setServicesPerformed(request.getServicesPerformed().trim());
        }
        if (request.getNotes() != null) {
            serviceLog.setNotes(request.getNotes().trim());
        }
        if (request.getServiceDate() != null) {
            if (!request.getServiceDate().equals(serviceLog.getServiceDate())) {
                validateServiceDate(request.getServiceDate());
            }
            serviceLog.setServiceDate(request.getServiceDate());
        }
        if (request.getStatus() != null) {
            serviceLog.setStatus(request.getStatus());
        }
        if (request.getReturnToRescue() != null) {
            serviceLog.setReturnToRescue(request.getReturnToRescue());
        }
        if (request.getProviderId() != null && !request.getProviderId().isBlank()) {
            serviceLog.setProviderId(request.getProviderId().trim());
            if (request.getProviderName() != null && !request.getProviderName().isBlank()) {
                serviceLog.setProviderName(request.getProviderName().trim());
            }
        }

        logRepository.save(serviceLog);
        log.info("Updated CareServiceLog details for {}", serviceLogId);
        return mapToResponse(serviceLog);
    }

    @Transactional
    public void deleteLog(String serviceLogId) {
        CareServiceLog serviceLog = logRepository.findByServiceLogId(serviceLogId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceLog not found: " + serviceLogId));
        logRepository.delete(serviceLog);
        log.info("Deleted CareServiceLog {}", serviceLogId);
    }

    private boolean isValidTransition(ServiceStatus from, ServiceStatus to) {
        if (to == null) return false;
        // Allow all non-null status transitions for pet care services
        return true;
    }

    private void deductCareProductsForService(CareServiceLog serviceLog) {
        String existingNotes = serviceLog.getNotes() != null ? serviceLog.getNotes() : "";
        if (existingNotes.contains("[Supplies Dispensed from Inventory]")) {
            return; // Already deducted for this service log
        }

        String serviceType = serviceLog.getServiceType() != null ? serviceLog.getServiceType().toLowerCase() : "";
        String providerName = serviceLog.getProviderName() != null ? serviceLog.getProviderName() : "Pet Care Provider";
        String logId = serviceLog.getServiceLogId();
        String petName = serviceLog.getPetName() != null ? serviceLog.getPetName() : "Patient";

        List<String> targetKeywords = new ArrayList<>();
        if (serviceType.contains("deluxe") || serviceType.contains("spa") || serviceType.contains("hydrotherapy")) {
            targetKeywords.add("oatmeal");
            targetKeywords.add("paw pad");
            targetKeywords.add("ear flush");
        } else if (serviceType.contains("de-shedding") || serviceType.contains("blowout") || serviceType.contains("undercoat")) {
            targetKeywords.add("de-shedding");
            targetKeywords.add("paw pad");
        } else if (serviceType.contains("puppy")) {
            targetKeywords.add("oatmeal");
            targetKeywords.add("coconut");
        } else if (serviceType.contains("medicated") || serviceType.contains("rehabilitation") || serviceType.contains("foster") || serviceType.contains("desensitization")) {
            targetKeywords.add("chlorhexidine shampoo");
            targetKeywords.add("flea");
        } else {
            targetKeywords.add("oatmeal");
        }

        List<com.petnexus.backend.entity.InventoryItem> allItems = inventoryItemRepository.findAll();
        List<String> dispensedNames = new ArrayList<>();

        for (String kw : targetKeywords) {
            allItems.stream()
                    .filter(i -> i.getName().toLowerCase().contains(kw) || (i.getSku() != null && i.getSku().toLowerCase().contains(kw)))
                    .findFirst()
                    .ifPresent(item -> {
                        try {
                            inventoryService.updateStock(item.getItemId(), -1,
                                    "Care Service " + logId + " (" + serviceLog.getServiceType() + ") on " + petName + " by " + providerName);
                            dispensedNames.add(item.getName());
                            log.info("Deducted 1 unit of {} for care log {}", item.getName(), logId);
                        } catch (Exception e) {
                            log.warn("Could not deduct inventory item {} for care log {}: {}", item.getItemId(), logId, e.getMessage());
                        }
                    });
        }

        if (!dispensedNames.isEmpty()) {
            String tag = "\n[Supplies Dispensed from Inventory: " + String.join(", ", dispensedNames) + "]";
            serviceLog.setNotes(existingNotes.isEmpty() ? tag.trim() : existingNotes + tag);
            logRepository.save(serviceLog);
        }
    }

    private CareServiceLogResponseDto mapToResponse(CareServiceLog serviceLog) {
        CareServiceLogResponseDto dto = new CareServiceLogResponseDto();
        dto.setServiceLogId(serviceLog.getServiceLogId());
        dto.setServiceType(serviceLog.getServiceType());
        dto.setIntakeCondition(serviceLog.getIntakeCondition());
        dto.setServicesPerformed(serviceLog.getServicesPerformed());
        dto.setNotes(serviceLog.getNotes());
        dto.setReturnToRescue(serviceLog.isReturnToRescue());
        boolean transferred = serviceLog.getNotes() != null && 
                (serviceLog.getNotes().contains("Transferred to Rescue Officer") || serviceLog.getNotes().contains("Rehabilitation care"));
        dto.setTransferredToRescue(transferred);
        dto.setHandedOverToRescue(transferred);
        dto.setServiceDate(serviceLog.getServiceDate());
        dto.setStatus(serviceLog.getStatus().getJsonValue());
        dto.setOwnerId(serviceLog.getOwnerId());
        dto.setOwnerName(serviceLog.getOwnerName());
        dto.setPetId(serviceLog.getPetId());
        dto.setPetName(serviceLog.getPetName());
        dto.setCaseId(serviceLog.getCaseId());
        dto.setProviderId(serviceLog.getProviderId());
        dto.setProviderName(serviceLog.getProviderName());
        dto.setCreatedAt(serviceLog.getCreatedAt());
        return dto;
    }

    /** A service log records recent or upcoming work: at most one year back or one year ahead. */
    private void validateServiceDate(LocalDate serviceDate) {
        if (serviceDate == null) return;
        LocalDate today = LocalDate.now();
        if (serviceDate.isBefore(today.minusYears(1))) {
            throw new BadRequestException("Service date cannot be more than 1 year in the past.");
        }
        if (serviceDate.isAfter(today.plusYears(1))) {
            throw new BadRequestException("Service date cannot be more than 1 year in the future.");
        }
    }
}
