package com.example.swp.features.team;

import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.InviteToTeamRequest;
import com.example.swp.features.team.dto.request.RespondToInvitationRequest;
import com.example.swp.features.team.dto.response.TeamInvitationResponse;
import com.example.swp.features.team.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request);
    TeamResponse getTeamById(Long id);
    List<TeamResponse> getTeamsByTrack(Long trackId);
    TeamInvitationResponse inviteToTeam(Long teamId, InviteToTeamRequest request);
    TeamInvitationResponse respondToInvitation(Long invitationId, RespondToInvitationRequest request);
    List<TeamInvitationResponse> getPendingInvitations();
}