package com.petnexus.backend.service;

import com.petnexus.backend.dto.AdoptionListingDto;
import com.petnexus.backend.dto.CreateListingRequest;
import com.petnexus.backend.dto.UpdateListingRequest;
import com.petnexus.backend.entity.AdoptionListing;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.AdoptionListingRepository;
import com.petnexus.backend.repository.RescueCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdoptionListingService {

    private final AdoptionListingRepository listingRepository;
    private final RescueCaseRepository rescueCaseRepository;

    @Transactional(readOnly = true)
    public List<AdoptionListingDto> getPublishedListings() {
        return listingRepository.findByIsPublishedForAdoptionTrue()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdoptionListingDto getListingByCaseId(String caseId) {
        AdoptionListing listing = listingRepository.findByRescueCase_CaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Adoption listing not found for caseId: " + caseId));
        return toDto(listing);
    }

    @Transactional
    public AdoptionListingDto createListing(CreateListingRequest request) {
        // Validate rescue case
        RescueCase rescueCase = rescueCaseRepository.findByCaseId(request.getCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Rescue case not found: " + request.getCaseId()));
        
        // If received from provider in InFoster, allow transitioning to ReadyForAdoption
        if ("InFoster".equals(rescueCase.getStatus())) {
            rescueCase.setStatus("ReadyForAdoption");
        } else if (!"ReadyForAdoption".equals(rescueCase.getStatus())) {
            throw new BadRequestException("Only rescue cases marked InFoster or ReadyForAdoption can be listed for adoption.");
        }

        // If listing already exists, publish it directly rather than throwing an error
        Optional<AdoptionListing> existing = listingRepository.findByRescueCase_CaseId(request.getCaseId());
        if (existing.isPresent()) {
            AdoptionListing listing = existing.get();
            listing.setPublishedForAdoption(true);
            rescueCase.setIsPublishedForAdoption(true);
            rescueCaseRepository.save(rescueCase);
            listingRepository.save(listing);
            return toDto(listing);
        }

        // Generate ID
        int year = Year.now().getValue();
        long count = listingRepository.count() + 1;
        String listingId = String.format("ADL-%d-%03d", year, count);

        // Create listing
        AdoptionListing listing = new AdoptionListing();
        listing.setListingId(listingId);
        listing.setRescueCase(rescueCase);
        listing.setPublishedForAdoption(true);
        rescueCase.setIsPublishedForAdoption(true);
        rescueCaseRepository.save(rescueCase);
        listingRepository.save(listing);
        return toDto(listing);
    }

    @Transactional
    public AdoptionListingDto updateListing(String caseId, UpdateListingRequest request) {
        AdoptionListing listing = listingRepository.findByRescueCase_CaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Adoption listing not found for caseId: " + caseId));
        RescueCase rescueCase = listing.getRescueCase();

        // If publishing, ensure status is ReadyForAdoption
        if (request.isPublishedForAdoption()) {
            if ("InFoster".equals(rescueCase.getStatus())) {
                rescueCase.setStatus("ReadyForAdoption");
            } else if (!"ReadyForAdoption".equals(rescueCase.getStatus())) {
                throw new BadRequestException("Only ReadyForAdoption cases can be published.");
            }
            rescueCase.setIsPublishedForAdoption(true);
        } else {
            rescueCase.setIsPublishedForAdoption(false);
        }
        rescueCaseRepository.save(rescueCase);
        listing.setPublishedForAdoption(request.isPublishedForAdoption());
        listingRepository.save(listing);
        return toDto(listing);
    }

    private AdoptionListingDto toDto(AdoptionListing listing) {
        return new AdoptionListingDto(
                listing.getListingId(),
                listing.getRescueCase().getCaseId(),
                listing.isPublishedForAdoption(),
                listing.getCreatedAt(),
                listing.getUpdatedAt()
        );
    }
}
