package com.example.swp.features.hackathon_event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class HackathonEventScheduler {

    private final HackathonEventRepository hackathonEventRepository;
    private final HackathonEventService hackathonEventService;

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void checkAndStartEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<HackathonEvent> publishedEvents = hackathonEventRepository.findByStatusAndIsDeletedFalse(HackathonStatus.PUBLISHED);

        for (HackathonEvent event : publishedEvents) {
            // Nếu đã qua hoặc bằng thời gian bắt đầu
            if (event.getStartTime() != null && !now.isBefore(event.getStartTime())) {
                log.info("Attempting to auto-start event: {}", event.getName());
                try {
                    hackathonEventService.updateHackathonEventStatus(event.getId(), HackathonStatus.IN_PROGRESS);
                    log.info("Successfully auto-started event: {}", event.getName());
                } catch (Exception e) {
                    // Ignored silently, we will retry next minute.
                    log.debug("Auto-start conditions not met for event: {} - {}", event.getName(), e.getMessage());
                }
            }
        }
    }
}
