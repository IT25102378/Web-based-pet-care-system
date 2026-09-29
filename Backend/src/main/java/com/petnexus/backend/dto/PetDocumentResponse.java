package com.petnexus.backend.dto;

import com.petnexus.backend.entity.PetDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetDocumentResponse {
    private Long id;
    private String documentId;
    private String petId;
    private String petName;
    private String ownerId;
    private String documentType;
    private String fileName;
    private String fileUrl;
    private String fileSize;
    private String notes;
    private LocalDateTime uploadedAt;

    public static PetDocumentResponse from(PetDocument doc) {
        if (doc == null) return null;
        return PetDocumentResponse.builder()
                .id(doc.getId())
                .documentId(doc.getDocumentId())
                .petId(doc.getPet() != null ? doc.getPet().getPetId() : null)
                .petName(doc.getPetName() != null ? doc.getPetName() : (doc.getPet() != null ? doc.getPet().getName() : null))
                .ownerId(doc.getOwnerId() != null ? doc.getOwnerId() : (doc.getPet() != null && doc.getPet().getOwner() != null ? doc.getPet().getOwner().getUserId() : null))
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .fileUrl(doc.getFileUrl())
                .fileSize(doc.getFileSize())
                .notes(doc.getNotes())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
