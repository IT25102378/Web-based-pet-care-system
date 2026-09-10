package com.petnexus.backend.controller;

import com.petnexus.backend.dto.FeedbackRequest;
import com.petnexus.backend.dto.FeedbackRespondRequest;
import com.petnexus.backend.dto.FeedbackResponse;
import com.petnexus.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Client Reviews and Feedback.
 * Exactly matches Frontend/src/api/feedbackApi.js contract.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PreAuthorize("hasAnyRole('Admin', 'ClinicManager', 'PetOwner')")
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getFeedbacks(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String serviceCategory) {
        String cat = (category != null && !category.isBlank()) ? category : serviceCategory;
        return ResponseEntity.ok(feedbackService.getFeedbacks(userId, cat));
    }

    @PreAuthorize("hasAnyRole('Admin', 'ClinicManager', 'PetOwner')")
    @GetMapping("/{feedbackId}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable String feedbackId) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(feedbackId));
    }

    @PreAuthorize("hasRole('PetOwner')")
    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse created = feedbackService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('ClinicManager')")
    @PostMapping("/{feedbackId}/respond")
    public ResponseEntity<FeedbackResponse> respondToFeedback(
            @PathVariable String feedbackId,
            @Valid @RequestBody FeedbackRespondRequest request) {
        FeedbackResponse updated = feedbackService.respondToFeedback(feedbackId, request.getResponseText());
        return ResponseEntity.ok(updated);
    }
}
