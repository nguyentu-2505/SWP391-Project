package com.example.swp.features.judge_assignment;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.judge_assignment.dto.request.AssignJudgeRequest;
import com.example.swp.features.judge_assignment.dto.response.JudgeAssignmentResponse;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.track.TrackMentorRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class JudgeAssignmentService {

    private final JudgeAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final TrackMentorRepository trackMentorRepository;

    public JudgeAssignmentResponse assignJudge(AssignJudgeRequest request) {
        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Judge not found"));

        if (judge.getRole() != Role.JUDGE && judge.getRole() != Role.GUEST_JUDGE) {
            throw new IllegalArgumentException(
                "User '" + judge.getUsername() + "' is not a judge. Current role: " + judge.getRole()
            );
        }
        
        Round round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new ResourceNotFoundException("Round not found"));

        Track track = null;
        if (request.getTrackId() != null) {
            track = trackRepository.findById(request.getTrackId())
                    .orElseThrow(() -> new ResourceNotFoundException("Track not found"));

            // Đảm bảo Track này thuộc Event của Round
            if (track.getHackathonEvent() == null || !track.getHackathonEvent().getId().equals(round.getHackathonEvent().getId())) {
                throw new IllegalArgumentException("Track does not belong to the hackathon event of this round.");
            }

            // Conflict of interest check
            if (trackMentorRepository.existsByTrackIdAndMentorId(track.getId(), judge.getId())) {
                throw new IllegalStateException(
                    "Judge '" + judge.getUsername() + "' is currently assigned as mentor for this track " +
                    "and cannot judge submissions in the same track (conflict of interest)."
                );
            }

            if (assignmentRepository.existsByJudgeIdAndRoundIdAndTrackId(judge.getId(), round.getId(), track.getId())) {
                throw new IllegalStateException("Judge is already assigned to this track in this round.");
            }
        } else {
            // Conflict of interest check for all tracks in round
            Long eventId = round.getHackathonEvent().getId();
            List<com.example.swp.features.track.TrackMentor> mentorTracks = trackMentorRepository.findByMentorId(judge.getId());
            boolean hasMentorConflictInEvent = mentorTracks.stream()
                    .anyMatch(tm -> tm.getTrack().getHackathonEvent() != null && 
                                    tm.getTrack().getHackathonEvent().getId().equals(eventId));
            
            if (hasMentorConflictInEvent) {
                throw new IllegalStateException(
                    "Judge '" + judge.getUsername() + "' is assigned as mentor for one or more tracks in this hackathon. " +
                    "Cannot assign to judge all tracks in this round. Please assign specific tracks instead."
                );
            }

            if (assignmentRepository.existsByJudgeIdAndRoundIdAndTrackIdIsNull(judge.getId(), round.getId())) {
                throw new IllegalStateException("Judge is already assigned to all tracks in this round.");
            }
        }

        User assigner = getCurrentUser();

        JudgeAssignment assignment = JudgeAssignment.builder()
                .judge(judge)
                .round(round)
                .track(track)
                .organizer(assigner)
                .status(JudgeAssignmentStatus.ASSIGNED)
                .assignedAt(java.time.LocalDateTime.now())
                .build();
        
        JudgeAssignment savedAssignment = assignmentRepository.save(assignment);
        return mapToResponse(savedAssignment);
    }

    public List<JudgeAssignmentResponse> getAssignmentsForJudge(Long judgeId) {
        return assignmentRepository.findByJudgeId(judgeId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<JudgeAssignmentResponse> getMyAssignments() {
        User currentUser = getCurrentUser();
        return getAssignmentsForJudge(currentUser.getId());
    }

    public List<JudgeAssignmentResponse> getAssignmentsForRound(Long roundId) {
        return assignmentRepository.findByRoundId(roundId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public List<JudgeAssignmentResponse> getAssignmentsForEvent(Long eventId) {
        return assignmentRepository.findByRoundHackathonEventId(eventId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void unassignJudge(Long assignmentId) {
        JudgeAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        assignmentRepository.delete(assignment);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JudgeAssignmentResponse mapToResponse(JudgeAssignment assignment) {
        return JudgeAssignmentResponse.builder()
                .id(assignment.getId())
                .judgeId(assignment.getJudge().getId())
                .judgeName(assignment.getJudge().getUsername())
                .roundId(assignment.getRound().getId())
                .roundName(assignment.getRound().getName())
                .trackId(assignment.getTrack() != null ? assignment.getTrack().getId() : null)
                .trackName(assignment.getTrack() != null ? assignment.getTrack().getName() : "All Tracks")
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}
