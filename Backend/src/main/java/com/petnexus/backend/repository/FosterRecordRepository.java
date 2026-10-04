package com.petnexus.backend.repository;

import com.petnexus.backend.entity.FosterRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FosterRecordRepository extends JpaRepository<FosterRecord, Long> {

    Optional<FosterRecord> findByFosterId(String fosterId);

    boolean existsByFosterId(String fosterId);

    long count();
}
