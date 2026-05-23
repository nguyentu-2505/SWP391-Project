package com.example.swp.features.submission;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.submission.dto.request.CreateSubmissionRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SubmissionResponse createSubmission(CreateSubmissionRequest request) {
        User currentUser = getCurrentUser();
        
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new ResourceNotFoundException("Round not found"));

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(team.getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this team."));
        
        if (!teamMember.isLeader()) {
            throw new AccessDeniedException("Only the team leader can make a submission.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (round.getStartTime() != null && now.isBefore(round.getStartTime())) {
            throw new IllegalStateException("The submission period for this round has not started yet.");
        }
        if (round.getEndTime() != null && now.isAfter(round.getEndTime())) {
            throw new IllegalStateException("The submission period for this round has ended.");
        }

        Optional<Submission> existingSubmissionOpt = submissionRepository.findByTeamIdAndRoundId(team.getId(), round.getId());

        Submission submission;
        if (existingSubmissionOpt.isPresent()) {
            submission = existingSubmissionOpt.get();
            submission.setRepositoryUrl(request.getRepositoryUrl());
            submission.setDemoUrl(request.getDemoUrl());
            submission.setReportUrl(request.getReportUrl());
            submission.setVersion(submission.getVersion() + 1);
            submission.setSubmittedAt(LocalDateTime.now());
        } else {
            submission = Submission.builder()
                    .team(team)
                    .round(round)
                    .repositoryUrl(request.getRepositoryUrl())
                    .demoUrl(request.getDemoUrl())
                    .reportUrl(request.getReportUrl())
                    .version(1)
                    .build();
        }

        Submission savedSubmission = submissionRepository.save(submission);
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
    public List<SubmissionResponse> getSubmissionsByEvent(Long eventId) {
        return submissionRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SubmissionResponse getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .teamName(submission.getTeam().getName())
                .roundId(submission.getRound().getId())
                .roundName(submission.getRound().getName())
                .repositoryUrl(submission.getRepositoryUrl())
                .demoUrl(submission.getDemoUrl())
                .reportUrl(submission.getReportUrl())
                .version(submission.getVersion())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}
