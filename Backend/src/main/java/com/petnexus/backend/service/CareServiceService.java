package com.petnexus.backend.service;

import com.petnexus.backend.dto.CareServiceResponseDto;
import com.petnexus.backend.dto.CareServiceUpdateRequest;
import com.petnexus.backend.dto.CreateCareServiceRequest;
import com.petnexus.backend.entity.CareService;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.CareServiceRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing Care Services.
 * Business rules:
 * - Creator user must exist.
 * - Service ID must be unique.
 * - Name must be unique.
 * - Price must be positive.
 * - Duration must be positive.
 * - Activation/deactivation changes the status field.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CareServiceService {

    private final CareServiceRepository careServiceRepository;
    private final UserRepository userRepository;

    @Transactional
    public CareServiceResponseDto createService(CreateCareServiceRequest request) {
        // Resolve creator user
        User creator;
        if (request.getCreatedByUserId() != null && !request.getCreatedByUserId().isBlank()) {
            creator = userRepository.findByUserId(request.getCreatedByUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getCreatedByUserId()));
        } else {
            creator = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No user found to assign as creator"));
        }

        String serviceId = request.getServiceId();
        if (serviceId == null || serviceId.isBlank()) {
            long count = careServiceRepository.count() + 1;
            serviceId = String.format("CSR-%03d", count);
        } else if (careServiceRepository.existsByServiceId(serviceId)) {
            throw new BadRequestException("Service ID already exists: " + serviceId);
        }

        if (careServiceRepository.existsByName(request.getName())) {
            throw new BadRequestException("Service name already exists: " + request.getName());
        }
        // Validate price
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }
        int duration = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                ? request.getDurationMinutes() : 60;

        CareService service = CareService.builder()
                .serviceId(serviceId)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalValue(request.getOriginalValue())
                .discountPercent(request.getDiscountPercent())
                .badge(request.getBadge())
                .tagline(request.getTagline())
                .recommendedFor(request.getRecommendedFor())
                .durationMinutes(duration)
                .status(ServiceStatus.SCHEDULED)
                .createdBy(creator)
                .build();
        careServiceRepository.save(service);
        log.info("Created CareService {} by user {}", service.getServiceId(), creator.getUserId());
        return mapToResponse(service);
    }

    @Transactional(readOnly = true)
    public CareServiceResponseDto getService(String serviceId) {
        CareService service = careServiceRepository.findByServiceId(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("CareService not found: " + serviceId));
        return mapToResponse(service);
    }

    @Transactional(readOnly = true)
    public List<CareServiceResponseDto> listServices() {
        return careServiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareServiceResponseDto updateService(CareServiceUpdateRequest request) {
        CareService service = careServiceRepository.findByServiceId(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("CareService not found: " + request.getServiceId()));
        if (request.getName() != null) service.setName(request.getName());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price must be greater than zero");
            }
            service.setPrice(request.getPrice());
        }
        if (request.getOriginalValue() != null) service.setOriginalValue(request.getOriginalValue());
        if (request.getDiscountPercent() != null) service.setDiscountPercent(request.getDiscountPercent());
        if (request.getBadge() != null) service.setBadge(request.getBadge());
        if (request.getTagline() != null) service.setTagline(request.getTagline());
        if (request.getRecommendedFor() != null) service.setRecommendedFor(request.getRecommendedFor());
        if (request.getDurationMinutes() != null && request.getDurationMinutes() > 0) {
            service.setDurationMinutes(request.getDurationMinutes());
        }
        // active flag toggles status between SCHEDULED (active) and COMPLETED (inactive)
        if (request.getActive() != null) {
            service.setStatus(request.getActive() ? ServiceStatus.SCHEDULED : ServiceStatus.COMPLETED);
        }
        careServiceRepository.save(service);
        log.info("Updated CareService {}", service.getServiceId());
        return mapToResponse(service);
    }


    @Transactional
    public CareServiceResponseDto activateService(String serviceId) {
        CareService service = careServiceRepository.findByServiceId(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("CareService not found: " + serviceId));
        service.setStatus(ServiceStatus.SCHEDULED);
        careServiceRepository.save(service);
        return mapToResponse(service);
    }

    @Transactional
    public CareServiceResponseDto deactivateService(String serviceId) {
        CareService service = careServiceRepository.findByServiceId(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("CareService not found: " + serviceId));
        service.setStatus(ServiceStatus.COMPLETED); // treat COMPLETED as deactivated
        careServiceRepository.save(service);
        return mapToResponse(service);
    }

    private CareServiceResponseDto mapToResponse(CareService service) {
        CareServiceResponseDto dto = new CareServiceResponseDto();
        dto.setServiceId(service.getServiceId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setPrice(service.getPrice());
        dto.setOriginalValue(service.getOriginalValue());
        dto.setDiscountPercent(service.getDiscountPercent());
        dto.setBadge(service.getBadge());
        dto.setTagline(service.getTagline());
        dto.setRecommendedFor(service.getRecommendedFor());
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setStatus(service.getStatus());
        // active = true when status is SCHEDULED (the "live" state)
        dto.setActive(service.getStatus() == ServiceStatus.SCHEDULED);
        // Parse features from the description field (comma or newline separated)
        if (service.getDescription() != null && !service.getDescription().isBlank()) {
            java.util.List<String> features = java.util.Arrays.stream(
                    service.getDescription().split("[,\\r\\n]+")
            ).map(s -> s.trim()).filter(s -> !s.isEmpty()).collect(java.util.stream.Collectors.toList());
            dto.setFeatures(features);
        } else {
            dto.setFeatures(java.util.Collections.emptyList());
        }
        dto.setCreatedByUserId(service.getCreatedBy().getUserId());
        return dto;
    }
}
