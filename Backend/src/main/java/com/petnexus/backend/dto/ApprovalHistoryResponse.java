package com.petnexus.backend.dto;

import com.petnexus.backend.entity.ApprovalHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for returning approval history to the System Administrator.
 * Contains only safe auditing fields; excludes all sensitive authentication fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalHistoryResponse {

    private String historyId;
    private String userId;
    private String userFullName;
    private String action;
    private String adminId;
    private String reason;
    private LocalDateTime timestamp;

    public static ApprovalHistoryResponse from(ApprovalHistory history) {
        return ApprovalHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .userId(history.getUserId())
                .userFullName(history.getUserFullName())
                .action(history.getAction())
                .adminId(history.getAdminId())
                .reason(history.getReason())
                .timestamp(history.getTimestamp())
                .build();
    }
}
