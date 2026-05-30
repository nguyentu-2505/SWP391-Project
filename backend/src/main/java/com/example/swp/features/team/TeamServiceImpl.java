package com.example.swp.features.team;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.event_registration.EventRegistrationRepository;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.DisqualifyTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final HackathonEventRepository eventRepository;
    private final TrackRepository trackRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        HackathonEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));
                
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));

        // Check if user is registered for the event
        registrationRepository.findByEventAndUser(event, currentUser)
                .orElseThrow(() -> new IllegalStateException("You must be registered for the event to create a team."));

        // Business Rule: One team per hackathon (Task 2.4)
        if (isUserInAnotherTeamInEvent(currentUser, event.getId())) {
            throw new IllegalStateException("You are already in a team for this hackathon.");
        }

        Team team = Team.builder()
                .name(request.getName())
                .event(event)
                .track(track)
                .status(TeamStatus.ACTIVE)
                .build();
        Team savedTeam = teamRepository.save(team);

        TeamMember leader = TeamMember.builder()
                .team(savedTeam)
                .user(currentUser)
                .isLeader(true)
                .build();
        teamMemberRepository.save(leader);
        
        // Refresh team members from DB
        savedTeam.setTeamMembers(teamMemberRepository.findByTeamId(savedTeam.getId()));

        return mapToResponse(savedTeam);
    }

    @Override
    public TeamResponse getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        return mapToResponse(team);
    }

    @Override
    public List<TeamResponse> getTeamsByEvent(Long eventId) {
        return teamRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TeamResponse getMyTeamForEvent(Long eventId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeamMember membership = teamMemberRepository.findByUserId(currentUser.getId()).stream()
                .filter(m -> m.getTeam().getEvent().getId().equals(eventId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("You are not in a team for this event."));
        
        return mapToResponse(membership.getTeam());
    }
    
    @Override
    @Transactional
    public void disqualifyTeam(Long teamId, DisqualifyTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getStatus() == TeamStatus.DISQUALIFIED) {
            throw new IllegalStateException("Team is already disqualified");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        team.setStatus(TeamStatus.DISQUALIFIED);
        team.setDisqualificationReason(request.getReason());
        team.setDisqualifiedAt(LocalDateTime.now());
        team.setDisqualifiedBy(currentUser);

        teamRepository.save(team);

        auditLogService.logAction(
                "DISQUALIFY_TEAM",
                "TEAM",
                team.getId(),
                "ACTIVE",
                String.format("Team '%s' DISQUALIFIED by %s. Reason: %s", 
                        team.getName(), currentUser.getUsername(), request.getReason())
        );

        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        for (TeamMember member : members) {
            notificationService.createNotification(
                    member.getUser(),
                    "Team Disqualified",
                    "Your team '" + team.getName() + "' has been disqualified. Reason: " + request.getReason(),
                    "TEAM_DISQUALIFIED",
                    "TEAM",
                    team.getId()
            );
        }
    }

    private boolean isUserInAnotherTeamInEvent(User user, Long eventId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(user.getId());
        return memberships.stream().anyMatch(m -> m.getTeam().getEvent().getId().equals(eventId));
    }

    private TeamResponse mapToResponse(Team team) {
        // This mapping can be improved with a dedicated mapper class
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .projectName(team.getProjectName())
                .projectDescription(team.getProjectDescription())
                .eventId(team.getEvent().getId())
                .trackId(team.getTrack() != null ? team.getTrack().getId() : null)
                .trackName(team.getTrack() != null ? team.getTrack().getName() : null)
                .status(team.getStatus().name())
                .members(team.getTeamMembers() != null ? team.getTeamMembers().stream().map(tm -> 
                    TeamResponse.TeamMemberInfo.builder()
                        .userId(tm.getUser().getId())
                        .username(tm.getUser().getUsername())
                        .isLeader(tm.isLeader())
                        .build()
                ).collect(Collectors.toList()) : null)
                .build();
    }
}
