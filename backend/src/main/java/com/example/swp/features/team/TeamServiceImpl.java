package com.example.swp.features.team;

import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.InviteToTeamRequest;
import com.example.swp.features.team.dto.request.RespondToInvitationRequest;
import com.example.swp.features.team.dto.response.TeamInvitationResponse;
import com.example.swp.features.team.dto.response.TeamResponse;
import com.example.swp.features.team_invitation.TeamInvitation;
import com.example.swp.features.team_invitation.TeamInvitationRepository;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.util.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TrackRepository trackRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request) {
        User currentUser = getCurrentUser();

        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new RuntimeException("Track not found"));

        Team newTeam = Team.builder()
                .name(request.getName())
                .projectName(request.getProjectName())
                .projectDescription(request.getProjectDescription())
                .track(track)
                .build();
        Team savedTeam = teamRepository.save(newTeam);

        TeamMember teamLeader = TeamMember.builder()
                .team(savedTeam)
                .user(currentUser)
                .isLeader(true)
                .build();
        teamMemberRepository.save(teamLeader);

        return mapToResponse(savedTeam);
    }

    @Override
    @Transactional
    public TeamInvitationResponse inviteToTeam(Long teamId, InviteToTeamRequest request) {
        User inviter = getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Security Check: Ensure inviter is part of the team
        if (teamMemberRepository.findByTeamIdAndUserId(teamId, inviter.getId()).isEmpty()) {
            throw new RuntimeException("You are not a member of this team.");
        }

        // Check if user is already in the team
        if (userRepository.findByEmail(request.getInviteeEmail()).isPresent()) {
            User invitee = userRepository.findByEmail(request.getInviteeEmail()).get();
            if (teamMemberRepository.findByTeamIdAndUserId(teamId, invitee.getId()).isPresent()) {
                throw new RuntimeException("User is already in this team.");
            }
        }

        TeamInvitation invitation = new TeamInvitation();
        invitation.setTeam(team);
        invitation.setInviter(inviter);
        invitation.setInviteeEmail(request.getInviteeEmail());
        invitation.setStatus("PENDING");
        invitation.setCreatedAt(LocalDateTime.now());
        TeamInvitation savedInvitation = teamInvitationRepository.save(invitation);

        // Send notification email
        String emailBody = String.format("You have been invited to join team '%s' by %s.", team.getName(), inviter.getUsername());
        emailService.sendSimpleMessage(request.getInviteeEmail(), "You're Invited to a Hackathon Team!", emailBody);

        return mapToInvitationResponse(savedInvitation);
    }

    @Override
    @Transactional
    public TeamInvitationResponse respondToInvitation(Long invitationId, RespondToInvitationRequest request) {
        User currentUser = getCurrentUser();
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        // Security Check: Ensure the user is the invitee
        if (!invitation.getInviteeEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("This invitation is not for you.");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new RuntimeException("This invitation has already been responded to.");
        }

        if ("ACCEPTED".equals(request.getStatus())) {
            invitation.setStatus("ACCEPTED");
            TeamMember newMember = TeamMember.builder()
                    .team(invitation.getTeam())
                    .user(currentUser)
                    .isLeader(false)
                    .build();
            teamMemberRepository.save(newMember);
        } else {
            invitation.setStatus("DECLINED");
        }

        TeamInvitation updatedInvitation = teamInvitationRepository.save(invitation);
        return mapToInvitationResponse(updatedInvitation);
    }

    @Override
    public List<TeamInvitationResponse> getPendingInvitations() {
        User currentUser = getCurrentUser();
        List<TeamInvitation> invitations = teamInvitationRepository.findByInviteeEmailAndStatus(currentUser.getEmail(), "PENDING");
        return invitations.stream().map(this::mapToInvitationResponse).collect(Collectors.toList());
    }

    @Override
    public TeamResponse getTeamById(Long id) {
        return teamRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    @Override
    public List<TeamResponse> getTeamsByTrack(Long trackId) {
        return teamRepository.findByTrackId(trackId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private TeamResponse mapToResponse(Team team) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .projectName(team.getProjectName())
                .projectDescription(team.getProjectDescription())
                .trackId(team.getTrack().getId())
                .build();
    }

    private TeamInvitationResponse mapToInvitationResponse(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .teamId(invitation.getTeam().getId())
                .teamName(invitation.getTeam().getName())
                .inviterName(invitation.getInviter().getUsername())
                .inviteeEmail(invitation.getInviteeEmail())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .build();
    }
}