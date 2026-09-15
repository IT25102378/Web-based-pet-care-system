package com.petnexus.backend.dto;

import com.petnexus.backend.entity.UserVerificationDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Field names match what the approval queue screen reads.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDocumentDto {
    private String documentId;
    private String documentType;
    private String fileName;
    private String fileSize;
    private String fileUrl;
    private LocalDateTime uploadedAt;

    public static VerificationDocumentDto from(UserVerificationDocument d) {
        return new VerificationDocumentDto(
                d.getDocumentId(), d.getDocumentType(), d.getFileName(),
                d.getFileSize(), d.getFileUrl(), d.getUploadedAt());
    }
}
