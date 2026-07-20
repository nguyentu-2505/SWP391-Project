package com.example.swp.features.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationRepository notificationRepository;

    /**
     * Delete read notifications that are older than 30 days.
     * Runs every Sunday at midnight (00:00).
     */
    @Scheduled(cron = "0 0 0 * * SUN")
    @Transactional
    public void cleanUpOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        log.info("Starting weekly notification clean-up. Deleting read notifications older than {}", cutoffDate);
        try {
            int deletedCount = notificationRepository.deleteReadNotificationsOlderThan(cutoffDate);
            log.info("Notification clean-up completed. Deleted {} read notifications.", deletedCount);
        } catch (Exception e) {
            log.error("Failed to run notification clean-up", e);
        }
    }
}
