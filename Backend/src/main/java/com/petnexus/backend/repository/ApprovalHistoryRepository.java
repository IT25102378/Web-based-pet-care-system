package com.petnexus.backend.repository;

import com.petnexus.backend.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {
    Optional<ApprovalHistory> findByHistoryId(String historyId);
    List<ApprovalHistory> findAllByOrderByTimestampDesc();
    List<ApprovalHistory> findByUserIdOrderByTimestampDesc(String userId);
    boolean existsByHistoryId(String historyId);
}
