package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewApplicationRequest {
    private String status; // Expected values: Approved, Rejected, UnderReview, etc.
    private String reviewNotes;
    private String reviewedBy; // userId of reviewer
}
