package com.petnexus.backend.repository;

import com.petnexus.backend.entity.ServicePackageBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePackageBookingRepository extends JpaRepository<ServicePackageBooking, Long> {
    Optional<ServicePackageBooking> findByBookingId(String bookingId);
    List<ServicePackageBooking> findByOwnerId(String ownerId);
    boolean existsByOwnerIdAndPackageNameAndStatus(String ownerId, String packageName, String status);
    // Additional query methods can be added as needed
}
