package com.petnexus.backend.service;

import com.petnexus.backend.dto.ApprovalHistoryResponse;
import com.petnexus.backend.entity.ApprovalHistory;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.repository.ApprovalHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing persistent administrator approval history.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalHistoryService {

    private final ApprovalHistoryRepository approvalHistoryRepository;

    /**
     * Retrieves all approval history records, newest first.
     */
    @Transactional(readOnly = true)
    public List<ApprovalHistoryResponse> getApprovalHistory() {
        return approvalHistoryRepository.findAllByOrderByTimestampDesc().stream()
                .map(ApprovalHistoryResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Records an administrative action (APPROVED, REJECTED, SUSPENDED, REACTIVATED).
     *
     * @param targetUser The user being affected
     * @param action The action performed
     * @param adminId The administrator who performed the action
     * @param reason Optional reason (e.g., for rejection or suspension)
     */
    @Transactional
    public void recordAction(User targetUser, String action, String adminId, String reason) {
        String historyId = generateHistoryId();

        ApprovalHistory history = ApprovalHistory.builder()
                .historyId(historyId)
                .userId(targetUser.getUserId())
                .userFullName(targetUser.getFullName())
                .action(action)
                .adminId(adminId != null ? adminId : "System")
                .reason(reason)
                .build();

        approvalHistoryRepository.save(history);
        log.info("Recorded {} action for user {} by admin {}", action, targetUser.getUserId(), adminId);
    }

    private String generateHistoryId() {
        long count = approvalHistoryRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("AH-%06d", count++);
        } while (approvalHistoryRepository.existsByHistoryId(candidate));
        return candidate;
    }
}
