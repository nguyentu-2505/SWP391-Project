package com.example.swp.features.team;

import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.InviteToTeamRequest;
import com.example.swp.features.team.dto.request.RespondToInvitationRequest;
import com.example.swp.features.team.dto.response.TeamInvitationResponse;
import com.example.swp.features.team.dto.response.TeamResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PARTICIPANT')")
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        TeamResponse response = teamService.createTeam(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long id) {
        TeamResponse response = teamService.getTeamById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackId}")
    public ResponseEntity<List<TeamResponse>> getTeamsByTrack(@PathVariable Long trackId) {
        List<TeamResponse> responses = teamService.getTeamsByTrack(trackId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{teamId}/invitations")
    @PreAuthorize("hasAuthority('ROLE_PARTICIPANT')")
    public ResponseEntity<TeamInvitationResponse> inviteToTeam(@PathVariable Long teamId, @Valid @RequestBody InviteToTeamRequest request) {
        TeamInvitationResponse response = teamService.inviteToTeam(teamId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invitations/pending")
    @PreAuthorize("hasAuthority('ROLE_PARTICIPANT')")
    public ResponseEntity<List<TeamInvitationResponse>> getPendingInvitations() {
        List<TeamInvitationResponse> responses = teamService.getPendingInvitations();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/invitations/{invitationId}/respond")
    @PreAuthorize("hasAuthority('ROLE_PARTICIPANT')")
    public ResponseEntity<TeamInvitationResponse> respondToInvitation(@PathVariable Long invitationId, @Valid @RequestBody RespondToInvitationRequest request) {
        TeamInvitationResponse response = teamService.respondToInvitation(invitationId, request);
        return ResponseEntity.ok(response);
    }
}