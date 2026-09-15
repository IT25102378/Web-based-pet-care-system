package com.petnexus.backend.repository;

import com.petnexus.backend.entity.UserVerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserVerificationDocumentRepository extends JpaRepository<UserVerificationDocument, Long> {

    List<UserVerificationDocument> findByUser_UserId(String userId);

    long countByUser_UserId(String userId);
}
