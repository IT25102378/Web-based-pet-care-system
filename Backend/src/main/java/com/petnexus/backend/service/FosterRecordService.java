package com.petnexus.backend.service;

import com.petnexus.backend.dto.FosterRecordResponse;
import com.petnexus.backend.entity.FosterRecord;
import com.petnexus.backend.repository.FosterRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * FosterRecordService — read-only directory of registered foster families.
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
