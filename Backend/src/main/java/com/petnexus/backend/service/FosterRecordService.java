package com.petnexus.backend.service;

import com.petnexus.backend.dto.FosterRecordRequest;
import com.petnexus.backend.dto.FosterRecordResponse;
import com.petnexus.backend.entity.FosterRecord;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.FosterRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * FosterRecordService — directory and CRUD operations for registered foster families.
 */
@Service
@RequiredArgsConstructor
public class FosterRecordService {

    private final FosterRecordRepository fosterRecordRepository;

    @Transactional(readOnly = true)
    public List<FosterRecordResponse> getAllFosterRecords() {
        return fosterRecordRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FosterRecordResponse getFosterRecord(String fosterId) {
        FosterRecord fr = fosterRecordRepository.findByFosterId(fosterId)
                .orElseThrow(() -> new ResourceNotFoundException("Foster record not found with ID: " + fosterId));
        return toResponse(fr);
    }

    @Transactional
    public FosterRecordResponse createFosterRecord(FosterRecordRequest req) {
        long count = fosterRecordRepository.count() + 1;
        String fosterId = String.format("FST-%03d", count);
        while (fosterRecordRepository.existsByFosterId(fosterId)) {
            count++;
            fosterId = String.format("FST-%03d", count);
        }

        String fullName = req.getFullName() != null ? req.getFullName().trim() : "Foster Family";

        FosterRecord fr = FosterRecord.builder()
                .fosterId(fosterId)
                .fullName(fullName)
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .email(req.getEmail() != null ? req.getEmail().trim() : null)
                .address(req.getAddress() != null ? req.getAddress().trim() : null)
                .homeType(req.getHomeType() != null ? req.getHomeType().trim() : "Single family home with fenced yard")
                .activePlacements(req.getActivePlacements() != null ? req.getActivePlacements() : 0)
                .maxCapacity(req.getMaxCapacity() != null ? req.getMaxCapacity() : 2)
                .rating(req.getRating() != null ? req.getRating() : new BigDecimal("5.0"))
                .status(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus().trim() : "Active")
                .build();

        FosterRecord saved = fosterRecordRepository.save(fr);
        return toResponse(saved);
    }

    @Transactional
    public FosterRecordResponse updateFosterRecord(String fosterId, FosterRecordRequest req) {
        FosterRecord fr = fosterRecordRepository.findByFosterId(fosterId)
                .orElseThrow(() -> new ResourceNotFoundException("Foster record not found with ID: " + fosterId));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            fr.setFullName(req.getFullName().trim());
        }
        if (req.getPhone() != null) fr.setPhone(req.getPhone().trim());
        if (req.getEmail() != null) fr.setEmail(req.getEmail().trim());
        if (req.getAddress() != null) fr.setAddress(req.getAddress().trim());
        if (req.getHomeType() != null) fr.setHomeType(req.getHomeType().trim());
        if (req.getActivePlacements() != null) fr.setActivePlacements(req.getActivePlacements());
        if (req.getMaxCapacity() != null) fr.setMaxCapacity(req.getMaxCapacity());
        if (req.getRating() != null) fr.setRating(req.getRating());
        if (req.getStatus() != null && !req.getStatus().isBlank()) fr.setStatus(req.getStatus().trim());

        FosterRecord saved = fosterRecordRepository.save(fr);
        return toResponse(saved);
    }

    @Transactional
    public void deleteFosterRecord(String fosterId) {
        FosterRecord fr = fosterRecordRepository.findByFosterId(fosterId)
                .orElseThrow(() -> new ResourceNotFoundException("Foster record not found with ID: " + fosterId));
        fosterRecordRepository.delete(fr);
    }

    private FosterRecordResponse toResponse(FosterRecord fr) {
        return FosterRecordResponse.builder()
                .fosterId(fr.getFosterId())
                .fullName(fr.getFullName())
                .phone(fr.getPhone())
                .email(fr.getEmail())
                .address(fr.getAddress())
                .homeType(fr.getHomeType())
                .activePlacements(fr.getActivePlacements())
                .maxCapacity(fr.getMaxCapacity())
                .rating(fr.getRating())
                .status(fr.getStatus())
                .build();
    }
}
