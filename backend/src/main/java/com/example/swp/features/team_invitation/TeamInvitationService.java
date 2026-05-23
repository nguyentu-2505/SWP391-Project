package com.example.swp.features.team_invitation;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_invitation.dto.request.InviteMemberRequest;
import com.example.swp.features.team_invitation.dto.response.TeamInvitationResponse;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamInvitationService {

    private final TeamInvitationRepository invitationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;

    @Transactional
    public TeamInvitationResponse inviteMember(InviteMemberRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User inviter = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Inviter not found"));

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        teamMemberRepository.findByTeamIdAndUserId(team.getId(), inviter.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new IllegalStateException("Only the team leader can invite members."));

        User invitee = userRepository.findByEmail(request.getInviteeEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invitee with email " + request.getInviteeEmail() + " not found."));

        if (isUserInAnotherTeamInEvent(invitee, team.getEvent().getId())) {
            throw new IllegalStateException("Invitee is already in another team for this hackathon.");
        }
        
        long currentSize = teamMemberRepository.countByTeamId(team.getId());
        if (team.getEvent().getMaxTeamSize() != null && currentSize >= team.getEvent().getMaxTeamSize()) {
            throw new IllegalStateException("Team is full. Cannot invite more members.");
        }

        invitationRepository.findByTeamIdAndInviteeEmail(team.getId(), request.getInviteeEmail()).ifPresent(i -> {
            throw new IllegalStateException("Invitation already sent to this user for this team.");
        });

        TeamInvitation invitation = TeamInvitation.builder()
                .team(team)
                .inviter(inviter)
                .inviteeEmail(request.getInviteeEmail())
                .status(InvitationStatus.PENDING)
                .build();

        TeamInvitation savedInvitation = invitationRepository.save(invitation);
        
        // Create notification
        String title = "Team Invitation";
        String message = inviter.getUsername() + " has invited you to join the team '" + team.getName() + "'.";
        notificationService.createNotification(invitee, title, message, "TEAM_INVITATION", "TeamInvitation", savedInvitation.getId());

        return mapToResponse(savedInvitation);
    }

    @Transactional
    public TeamInvitationResponse respondToInvitation(Long invitationId, InvitationStatus response) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInviteeEmail().equals(currentUser.getEmail())) {
            throw new IllegalStateException("You are not authorized to respond to this invitation.");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("This invitation has already been responded to or has expired.");
        }

        Team team = invitation.getTeam();

        if (response == InvitationStatus.ACCEPTED) {
            
            if (isUserInAnotherTeamInEvent(currentUser, team.getEvent().getId())) {
                throw new IllegalStateException("You are already in another team for this hackathon.");
            }
            
            long currentSize = teamMemberRepository.countByTeamId(team.getId());
            if (team.getEvent().getMaxTeamSize() != null && currentSize >= team.getEvent().getMaxTeamSize()) {
                invitation.setStatus(InvitationStatus.CANCELLED);
                invitationRepository.save(invitation);
                throw new IllegalStateException("Team was full when you tried to accept.");
            }

            invitation.setStatus(InvitationStatus.ACCEPTED);
            
            TeamMember newMember = TeamMember.builder()
                    .team(team)
                    .user(currentUser)
                    .isLeader(false)
                    .build();
            teamMemberRepository.save(newMember);
            
            // Notify leader
            String title = "Invitation Accepted";
            String message = currentUser.getUsername() + " has accepted your invitation to join '" + team.getName() + "'.";
            notificationService.createNotification(invitation.getInviter(), title, message, "INVITATION_ACCEPTED", "Team", team.getId());

            cancelOtherPendingInvitations(currentUser.getEmail(), team.getEvent().getId());

        } else if (response == InvitationStatus.DECLINED) {
            invitation.setStatus(InvitationStatus.DECLINED);
             // Notify leader
            String title = "Invitation Declined";
            String message = currentUser.getUsername() + " has declined your invitation to join '" + team.getName() + "'.";
            notificationService.createNotification(invitation.getInviter(), title, message, "INVITATION_DECLINED", "Team", team.getId());
        } else {
            throw new IllegalArgumentException("Invalid response status.");
        }

        TeamInvitation updatedInvitation = invitationRepository.save(invitation);
        return mapToResponse(updatedInvitation);
    }
    
    public List<TeamInvitationResponse> getPendingInvitations() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return invitationRepository.findByInviteeEmailAndStatus(currentUser.getEmail(), InvitationStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean isUserInAnotherTeamInEvent(User user, Long eventId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(user.getId());
        return memberships.stream().anyMatch(m -> m.getTeam().getEvent().getId().equals(eventId));
    }
    
    private void cancelOtherPendingInvitations(String userEmail, Long eventId) {
        List<TeamInvitation> pendingInvitations = invitationRepository.findByInviteeEmailAndStatus(userEmail, InvitationStatus.PENDING);
        for (TeamInvitation inv : pendingInvitations) {
            if (inv.getTeam().getEvent().getId().equals(eventId)) {
                inv.setStatus(InvitationStatus.CANCELLED);
                invitationRepository.save(inv);
            }
        }
    }

    private TeamInvitationResponse mapToResponse(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .teamId(invitation.getTeam().getId())
                .teamName(invitation.getTeam().getName())
                .inviterId(invitation.getInviter().getId())
                .inviterName(invitation.getInviter().getUsername())
                .inviteeEmail(invitation.getInviteeEmail())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .build();
    }
}
