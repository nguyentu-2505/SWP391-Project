package com.example.swp.features.mentorship_request;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.mentorship_request.dto.request.CreateMentorshipRequest;
import com.example.swp.features.mentorship_request.dto.response.MentorshipRequestResponse;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.swp.features.track.TrackMentor;
import com.example.swp.features.track_mentor.TrackMentorRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MentorshipRequestService {

    private final MentorshipRequestRepository requestRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final TrackMentorRepository trackMentorRepository;

    @Transactional
    public MentorshipRequestResponse createRequest(CreateMentorshipRequest request) {
        User currentUser = getCurrentUser();
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        teamMemberRepository.findByTeamIdAndUserId(team.getId(), currentUser.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new AccessDeniedException("Only the team leader can request mentorship."));

        MentorshipRequest newRequest = MentorshipRequest.builder()
                .team(team)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(MentorshipRequestStatus.OPEN)
                .build();
        
        MentorshipRequest savedRequest = requestRepository.save(newRequest);

        // Notify mentors assigned to the track, fallback to all mentors if none assigned
        List<User> mentors;
        if (team.getTrack() != null) {
            List<TrackMentor> trackMentors = trackMentorRepository.findByTrackId(team.getTrack().getId());
            if (!trackMentors.isEmpty()) {
                mentors = trackMentors.stream()
                        .map(TrackMentor::getMentor)
                        .collect(Collectors.toList());
            } else {
                mentors = userRepository.findByRole(Role.MENTOR);
            }
        } else {
            mentors = userRepository.findByRole(Role.MENTOR);
        }

        for (User mentor : mentors) {
            notificationService.createNotification(
                mentor, 
                "New Mentorship Request", 
                "Team '" + team.getName() + "' has requested mentorship.", 
                "MENTORSHIP_REQUEST", 
                "MentorshipRequest", 
                savedRequest.getId()
            );
        }

        return mapToResponse(savedRequest);
    }

    @Transactional
    public MentorshipRequestResponse acceptRequest(Long requestId) {
        User mentor = getCurrentUser();

        // Explicit block: Guest Judges are external reviewers only, not mentors.
        if (mentor.getRole() == Role.GUEST_JUDGE) {
            throw new AccessDeniedException("Guest judges cannot accept mentorship requests.");
        }
        // Internal judges (JUDGE role) CAN be mentors on different tracks – allow them.
        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.JUDGE) {
            throw new AccessDeniedException("Only mentors can accept requests.");
        }

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        if (request.getStatus() != MentorshipRequestStatus.OPEN) {
            throw new IllegalStateException("This request is no longer open.");
        }

        request.setMentor(mentor);
        request.setStatus(MentorshipRequestStatus.IN_PROGRESS);
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        // Notify team leader
        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Accepted",
                "Mentor " + mentor.getUsername() + " has accepted your request.",
                "MENTORSHIP_ACCEPTED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }
    
    @Transactional
    public MentorshipRequestResponse resolveRequest(Long requestId) {
        User currentUser = getCurrentUser();
        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        boolean isMentorOfRequest = request.getMentor() != null && request.getMentor().getId().equals(currentUser.getId());
        boolean isLeaderOfTeam = findTeamLeader(request.getTeam()).getId().equals(currentUser.getId());

        if (!isMentorOfRequest && !isLeaderOfTeam) {
            throw new AccessDeniedException("Only the assigned mentor or team leader can resolve this request.");
        }

        request.setStatus(MentorshipRequestStatus.RESOLVED);
        request.setResolvedAt(LocalDateTime.now());
        
        MentorshipRequest updatedRequest = requestRepository.save(request);
        return mapToResponse(updatedRequest);
    }

    @Transactional
    public MentorshipRequestResponse rejectRequest(Long requestId) {
        User mentor = getCurrentUser();

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        if (!request.getMentor().getId().equals(mentor.getId())) {
            throw new AccessDeniedException("You are not the mentor assigned to this request.");
        }

        if (request.getStatus() != MentorshipRequestStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress requests can be rejected.");
        }

        request.setStatus(MentorshipRequestStatus.OPEN);
        request.setMentor(null);
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Rejected",
                "Mentor " + mentor.getUsername() + " has backed out of your request. It is now open again.",
                "MENTORSHIP_REJECTED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }

    @Transactional
    public void cancelRequest(Long requestId) {
        User currentUser = getCurrentUser();
        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        boolean isLeaderOfTeam = findTeamLeader(request.getTeam()).getId().equals(currentUser.getId());
        if (!isLeaderOfTeam && currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.ORGANIZER) {
            throw new AccessDeniedException("Only the team leader or an admin can cancel this request.");
        }

        requestRepository.delete(request);
    }

    public List<MentorshipRequestResponse> getOpenRequests() {
        User currentUser = getCurrentUser();

        // If the current user is a mentor or judge, only show requests for their assigned tracks
        if (currentUser.getRole() == Role.MENTOR || currentUser.getRole() == Role.JUDGE) {
            List<TrackMentor> assignments = trackMentorRepository.findByMentorId(currentUser.getId());
            List<Long> assignedTrackIds = assignments.stream()
                    .map(tm -> tm.getTrack().getId())
                    .collect(Collectors.toList());

            return requestRepository.findByStatus(MentorshipRequestStatus.OPEN).stream()
                    .filter(req -> req.getTeam().getTrack() != null && assignedTrackIds.contains(req.getTeam().getTrack().getId()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Default fallback (e.g. ADMIN or ORGANIZER)
        return requestRepository.findByStatus(MentorshipRequestStatus.OPEN).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    public MentorshipRequestResponse getRequestById(Long id) {
        MentorshipRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));
        return mapToResponse(request);
    }
    
    public List<MentorshipRequestResponse> getMyMentorshipRequests() {
        User currentUser = getCurrentUser();
        // Internal mentors and internal judges who can also mentor
        if (currentUser.getRole() == Role.MENTOR || currentUser.getRole() == Role.JUDGE) {
            return requestRepository.findByMentorId(currentUser.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
        }
        if (currentUser.getRole() == Role.PARTICIPANT) {
            User teamLeader = getCurrentUser();
            TeamMember membership = teamMemberRepository.findByUserId(teamLeader.getId()).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("You are not in any team."));
            return requestRepository.findByTeamId(membership.getTeam().getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
        }
        return List.of();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private User findTeamLeader(Team team) {
        return team.getTeamMembers().stream()
            .filter(TeamMember::isLeader)
            .map(TeamMember::getUser)
            .findFirst()
            .orElse(null);
    }

    private MentorshipRequestResponse mapToResponse(MentorshipRequest request) {
        return MentorshipRequestResponse.builder()
                .id(request.getId())
                .teamId(request.getTeam().getId())
                .teamName(request.getTeam().getName())
                .mentorId(request.getMentor() != null ? request.getMentor().getId() : null)
                .mentorName(request.getMentor() != null ? request.getMentor().getUsername() : null)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();
    }
}
