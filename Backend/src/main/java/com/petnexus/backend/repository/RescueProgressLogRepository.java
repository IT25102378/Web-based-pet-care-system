package com.petnexus.backend.repository;

import com.petnexus.backend.entity.RescueProgressLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueProgressLogRepository extends JpaRepository<RescueProgressLog, Long> {

    List<RescueProgressLog> findByCaseIdOrderByLogDateDesc(String caseId);

    long count();
}
