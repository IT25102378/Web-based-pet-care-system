package com.petnexus.backend.service;

import com.petnexus.backend.dto.CareProviderResponseDto;
import com.petnexus.backend.dto.CreateCareProviderRequest;
import com.petnexus.backend.entity.CareProvider;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.CareProviderRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing Care Providers.
 * Enforces:
 * - User must exist.
 * - User must have role PET_CARE_PROVIDER.
 * - providerId must be unique.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CareProviderService {

    private final CareProviderRepository careProviderRepository;
    private final UserRepository userRepository;

    /**
     * Create a new Care Provider.
     */
    @Transactional
    public CareProviderResponseDto createProvider(CreateCareProviderRequest request) {
        // Validate user existence
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));
        // Validate role
        if (!UserRole.PetCareProvider.equals(user.getRole())) {
            throw new BadRequestException("User does not have PetCareProvider role");
        }
        // Ensure providerId uniqueness
        if (careProviderRepository.existsByProviderId(request.getProviderId())) {
            throw new BadRequestException("Provider ID already exists: " + request.getProviderId());
        }
        // Ensure a user cannot have multiple providers
        if (careProviderRepository.findByUser_Id(user.getId()).isPresent()) {
            throw new BadRequestException("User already linked to a care provider");
        }
        CareProvider provider = CareProvider.builder()
                .providerId(request.getProviderId())
                .user(user)
                .providerName(request.getProviderName())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .active(request.getActive() != null ? request.getActive() : Boolean.TRUE)
                .build();
        careProviderRepository.save(provider);
        log.info("Created CareProvider {} for user {}", provider.getProviderId(), user.getUserId());
        return mapToResponse(provider);
    }

    @Transactional(readOnly = true)
    public List<CareProviderResponseDto> listProviders() {
        return careProviderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve provider by providerId.
     */
    @Transactional(readOnly = true)
    public CareProviderResponseDto getProvider(String providerId) {
        CareProvider provider = careProviderRepository.findByProviderId(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("CareProvider not found: " + providerId));
        return mapToResponse(provider);
    }

    /**
     * Activate provider.
     */
    @Transactional
    public CareProviderResponseDto activateProvider(String providerId) {
        CareProvider provider = careProviderRepository.findByProviderId(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("CareProvider not found: " + providerId));
        provider.setActive(true);
        careProviderRepository.save(provider);
        return mapToResponse(provider);
    }

    /**
     * Deactivate provider.
     */
    @Transactional
    public CareProviderResponseDto deactivateProvider(String providerId) {
        CareProvider provider = careProviderRepository.findByProviderId(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("CareProvider not found: " + providerId));
        provider.setActive(false);
        careProviderRepository.save(provider);
        return mapToResponse(provider);
    }

    private CareProviderResponseDto mapToResponse(CareProvider provider) {
        CareProviderResponseDto dto = new CareProviderResponseDto();
        dto.setProviderId(provider.getProviderId());
        dto.setUserId(provider.getUser().getUserId());
        dto.setProviderName(provider.getProviderName());
        dto.setContactPhone(provider.getContactPhone());
        dto.setContactEmail(provider.getContactEmail());
        dto.setActive(provider.isActive());
        return dto;
    }
}
