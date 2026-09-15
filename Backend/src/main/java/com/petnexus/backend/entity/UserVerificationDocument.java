package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * The proof of identity or professional credential an applicant uploads when
 * registering. The administrator reads it before approving the account.
 *
 * The file is held in the database as a data URL rather than on a cloud
 * service, so the system works with no network connection.
 */
@Entity
@Table(name = "user_verification_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVerificationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false, unique = true, length = 30)
    private String documentId; // e.g. VD-0001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(name = "file_name", length = 255)
    private String fileName;

    /** Human-readable size as shown on the upload control, for example "1.2 MB". */
    @Column(name = "file_size", length = 40)
    private String fileSize;

    /** Base64 data URL of the uploaded file, so it can be large. */
    @Column(name = "file_url", columnDefinition = "varchar(MAX)")
    private String fileUrl;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
