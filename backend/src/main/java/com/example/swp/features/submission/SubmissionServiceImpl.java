package com.example.swp.features.submission;

import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.submission.dto.request.CreateSubmissionRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import com.example.swp.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Override
    public SubmissionResponse createSubmission(CreateSubmissionRequest request) {
        // Get authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("User not authenticated.");
        }
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getId();

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));
        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new RuntimeException("Round not found"));

        // Validate if the current authenticated user is a member of the team they are submitting for
        if (!teamMemberRepository.existsByTeamIdAndUserId(team.getId(), currentUserId)) {
            throw new AccessDeniedException("You are not a member of this team and cannot submit on its behalf.");
        }

        // Add validation: check if submission deadline has passed
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(round.getStartTime())) {
            throw new IllegalStateException("Submission for this round has not started yet.");
        }
        if (now.isAfter(round.getEndTime())) {
            throw new IllegalStateException("Submission for this round has already ended.");
        }

        Submission newSubmission = Submission.builder()
                .team(team)
                .round(round)
                .repositoryUrl(request.getRepositoryUrl())
                .demoUrl(request.getDemoUrl())
                .reportUrl(request.getReportUrl())
                .build();

        Submission savedSubmission = submissionRepository.save(newSubmission);
        return mapToResponse(savedSubmission);
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByTeam(Long teamId) {
        return submissionRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByRound(Long roundId) {
        return submissionRepository.findByRoundId(roundId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SubmissionResponse getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .roundId(submission.getRound().getId())
                .repositoryUrl(submission.getRepositoryUrl())
                .demoUrl(submission.getDemoUrl())
                .reportUrl(submission.getReportUrl())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}
