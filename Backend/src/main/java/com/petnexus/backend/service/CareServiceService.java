package com.petnexus.backend.service;

import com.petnexus.backend.dto.CareServiceDto;
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

import java.math.BigDecimal;
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
        // Validate price and duration
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new BadRequestException("Duration must be greater than zero");
        }
        CareService service = CareService.builder()
                .serviceId(serviceId)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .status(ServiceStatus.SCHEDULED) // default status for an active service
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
            if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price must be greater than zero");
            }
            service.setPrice(request.getPrice());
        }
        if (request.getDurationMinutes() != null) {
            if (request.getDurationMinutes() <= 0) {
                throw new BadRequestException("Duration must be greater than zero");
            }
            service.setDurationMinutes(request.getDurationMinutes());
        }
        // active flag toggles status between SCHEDULED (active) and INACTIVE (custom status)
        if (request.getActive() != null) {
            service.setStatus(request.getActive() ? ServiceStatus.SCHEDULED : ServiceStatus.COMPLETED); // using COMPLETED as inactive placeholder
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
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setStatus(service.getStatus());
        dto.setCreatedByUserId(service.getCreatedBy().getUserId());
        return dto;
    }
}
