package com.petnexus.backend.repository;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    /** Same as findByUserId but takes a database write lock until the transaction ends (used to serialise bookings). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserIdForUpdate(@Param("userId") String userId);


    Optional<User> findByPasswordResetToken(String token);

    Optional<User> findByApprovalToken(String token);

    List<User> findByStatus(UserStatus status);

    List<User> findByStatusIn(List<UserStatus> statuses);

    List<User> findByRole(com.petnexus.backend.enums.UserRole role);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);

    List<User> findTop10ByEmailContainingIgnoreCase(String query);

    List<User> findTop10ByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(String email, String fullName);
}
