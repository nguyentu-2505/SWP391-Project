package com.example.swp.features.hackathon_event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.example.swp.features.round.Round;
import com.example.swp.features.user.User;
import com.example.swp.features.judge_assignment.dto.response.JudgeAssignmentResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class HackathonEventScheduler {

    private final HackathonEventRepository hackathonEventRepository;
    private final HackathonEventService hackathonEventService;
    private final com.example.swp.features.round.RoundRepository roundRepository;
    private final com.example.swp.features.notification.NotificationRepository notificationRepository;
    private final com.example.swp.features.notification.NotificationService notificationService;
    private final com.example.swp.features.judge_assignment.JudgeAssignmentService judgeAssignmentService;
    private final com.example.swp.features.user.UserRepository userRepository;

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void checkAndStartEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<HackathonEvent> publishedEvents = hackathonEventRepository
                .findByStatusAndIsDeletedFalse(HackathonStatus.PUBLISHED);

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

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void checkAndNotifyGradingStart() {
        LocalDateTime now = LocalDateTime.now();
        List<Round> allRounds = roundRepository.findAll();

        for (Round round : allRounds) {
            // Check if grading period has started (now >= endTime) and grading is not
            // explicitly ended
            if (round.getEndTime() != null && !now.isBefore(round.getEndTime())
                    && !Boolean.TRUE.equals(round.getGradingEnded())) {
                // Check if already notified
                if (!notificationRepository.existsByTypeAndReferenceTypeAndReferenceId("GRADING_STARTED", "ROUND",
                        round.getId())) {
                    List<JudgeAssignmentResponse> assignments = judgeAssignmentService
                            .getAssignmentsForRound(round.getId());

                    List<User> judgesToNotify = assignments.stream()
                            .filter(a -> a != null && a.getJudgeId() != null)
                            .map(a -> userRepository.findById((long) a.getJudgeId()).orElse(null))
                            .filter(u -> u != null)
                            .distinct()
                            .collect(Collectors.toList());

                    if (!judgesToNotify.isEmpty()) {
                        notificationService.createNotifications(
                                judgesToNotify,
                                "Grading Started!",
                                "The grading period for round '" + round.getName()
                                        + "' has started. Please begin scoring the submissions.",
                                "GRADING_STARTED",
                                "ROUND",
                                round.getId());
                        log.info("Sent GRADING_STARTED notification to {} judges for round {}", judgesToNotify.size(),
                                round.getName());
                    }
                }
            }
        }
    }
}
