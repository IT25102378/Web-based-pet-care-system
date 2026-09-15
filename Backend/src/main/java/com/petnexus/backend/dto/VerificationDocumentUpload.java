package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The shape the registration form sends for the uploaded document.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDocumentUpload {
    private String name;
    private String url;
    private String size;
}
