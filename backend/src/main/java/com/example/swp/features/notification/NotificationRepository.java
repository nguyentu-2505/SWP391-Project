package com.example.swp.features.notification;

import com.example.swp.features.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    boolean existsByTypeAndReferenceTypeAndReferenceId(String type, String referenceType, Long referenceId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
    void markAllAsReadForUser(User user);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.createdAt < :cutoffDate")
    int deleteReadNotificationsOlderThan(java.time.LocalDateTime cutoffDate);
}
