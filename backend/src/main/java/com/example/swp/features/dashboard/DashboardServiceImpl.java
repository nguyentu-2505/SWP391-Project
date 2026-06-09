package com.example.swp.features.dashboard;

import com.example.swp.features.dashboard.dto.DashboardStatsResponse;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.hackathon_event.HackathonStatus;
import com.example.swp.features.mentorship_request.MentorshipRequestRepository;
import com.example.swp.features.mentorship_request.MentorshipRequestStatus;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.team.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final HackathonEventRepository hackathonEventRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long activeTeams = teamRepository.count();
        long submissionsReceived = submissionRepository.count();
        
        // Count pending reviews from mentorship requests (or we could fetch from judge assignments if available)
        long pendingReviews = mentorshipRequestRepository.findByStatus(MentorshipRequestStatus.OPEN).size();
        
        long daysRemaining = 0;
        
        // Try to get an active event to calculate days remaining
        Page<HackathonEvent> activeEvents = hackathonEventRepository.findByIsDeletedFalseAndStatus(
                HackathonStatus.IN_PROGRESS, PageRequest.of(0, 1));
                
        if (activeEvents.isEmpty()) {
            activeEvents = hackathonEventRepository.findByIsDeletedFalseAndStatus(
                HackathonStatus.PUBLISHED, PageRequest.of(0, 1));
        }

        if (!activeEvents.isEmpty()) {
            HackathonEvent event = activeEvents.getContent().get(0);
            if (event.getEndTime() != null && event.getEndTime().isAfter(LocalDateTime.now())) {
                daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getEndTime());
            }
        }

        return DashboardStatsResponse.builder()
                .activeTeams(activeTeams)
                .submissionsReceived(submissionsReceived)
                .pendingReviews(pendingReviews)
                .daysRemaining(daysRemaining)
                .build();
    }
}
