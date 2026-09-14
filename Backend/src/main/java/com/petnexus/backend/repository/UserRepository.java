package com.petnexus.backend.repository;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    Optional<User> findByApprovalToken(String token);

    List<User> findByStatus(UserStatus status);

    List<User> findByStatusIn(List<UserStatus> statuses);

    List<User> findByRole(com.petnexus.backend.enums.UserRole role);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);
}
