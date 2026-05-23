package com.example.swp.features.team;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        TeamResponse response = teamService.createTeam(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Team created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamById(@PathVariable Long id) {
        TeamResponse response = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeamsByEvent(@PathVariable Long eventId) {
        List<TeamResponse> responses = teamService.getTeamsByEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/my-team/event/{eventId}")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<TeamResponse>> getMyTeamForEvent(@PathVariable Long eventId) {
        TeamResponse response = teamService.getMyTeamForEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
