package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetDocumentRequest {
    @NotBlank(message = "Pet ID is required")
    private String petId;
    private String petName;
    private String ownerId;

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotBlank(message = "File name is required")
    private String fileName;
    private String fileUrl;
    private String fileSize;
    private String notes;
}
