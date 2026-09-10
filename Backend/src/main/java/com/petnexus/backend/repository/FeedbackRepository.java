package com.petnexus.backend.repository;

import com.petnexus.backend.entity.Feedback;
import com.petnexus.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByFeedbackId(String feedbackId);

    List<Feedback> findByUserOrderByCreatedAtDesc(User user);

    List<Feedback> findByServiceCategoryIgnoreCase(String serviceCategory);

    List<Feedback> findAllByOrderByCreatedAtDesc();
}
