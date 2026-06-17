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
import lombok.extern.slf4j.Slf4j;

import com.example.swp.features.judge_assignment.JudgeAssignment;
import com.example.swp.features.judge_assignment.JudgeAssignmentRepository;
import com.example.swp.features.user.Role;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;

    @Override
    @Transactional
    public SubmissionResponse createSubmission(CreateSubmissionRequest request) {
        User currentUser = getCurrentUser();
        
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        
        if (team.getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new IllegalStateException("Your team has been disqualified and cannot make submissions.");
        }

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
        log.info("Submission created/updated successfully: id={}, teamId={}, roundId={}", savedSubmission.getId(), team.getId(), round.getId());
        return mapToResponse(savedSubmission);
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByTeam(Long teamId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole().name().equals("PARTICIPANT")) {
            boolean isMember = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUser.getId()).isPresent();
            if (!isMember) {
                throw new AccessDeniedException("You can only view submissions for your own team.");
            }
        }
        return submissionRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubmissionResponse> getSubmissionsByRound(Long roundId) {
        User currentUser = getCurrentUser();
        
        if (currentUser.getRole() == Role.JUDGE || currentUser.getRole() == Role.GUEST_JUDGE) {
            List<JudgeAssignment> assignments = judgeAssignmentRepository.findByJudgeIdAndRoundId(currentUser.getId(), roundId);
            if (assignments.isEmpty()) {
                throw new AccessDeniedException("Bạn không được phân công chấm điểm trong vòng thi này.");
            }

            boolean isAssignedToAllTracks = assignments.stream()
                    .anyMatch(a -> a.getTrack() == null);

            if (!isAssignedToAllTracks) {
                Set<Long> assignedTrackIds = assignments.stream()
                        .map(a -> a.getTrack() != null ? a.getTrack().getId() : null)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

                return submissionRepository.findByRoundId(roundId).stream()
                        .filter(s -> s.getTeam().getTrack() != null && assignedTrackIds.contains(s.getTeam().getTrack().getId()))
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
            }
        }

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
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
                
        User currentUser = getCurrentUser();
        if (currentUser.getRole().name().equals("PARTICIPANT")) {
            boolean isMember = teamMemberRepository.findByTeamIdAndUserId(submission.getTeam().getId(), currentUser.getId()).isPresent();
            if (!isMember) {
                throw new AccessDeniedException("You can only view submissions for your own team.");
            }
        }
        return mapToResponse(submission);
    }
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        com.example.swp.features.track.Track track = submission.getTeam().getTrack();
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
                .trackId(track != null ? track.getId() : null)
                .trackName(track != null ? track.getName() : null)
                .build();
    }
}
