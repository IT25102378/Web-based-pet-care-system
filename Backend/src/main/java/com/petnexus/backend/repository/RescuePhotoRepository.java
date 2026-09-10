package com.petnexus.backend.repository;

import com.petnexus.backend.entity.RescuePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescuePhotoRepository extends JpaRepository<RescuePhoto, Long> {

    List<RescuePhoto> findByCaseIdOrderByUploadedAtDesc(String caseId);

    long count();
}
