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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorshipRequestService {

    private final MentorshipRequestRepository requestRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;

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

        // Notify all available mentors
        List<User> mentors = userRepository.findByRole(Role.MENTOR);
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
        if (mentor.getRole() != Role.MENTOR) {
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

    public List<MentorshipRequestResponse> getOpenRequests() {
        return requestRepository.findByStatus(MentorshipRequestStatus.OPEN).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<MentorshipRequestResponse> getMyMentorshipRequests() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.MENTOR) {
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
