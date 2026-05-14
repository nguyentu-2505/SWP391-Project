package com.example.swp.features.team_member;

import com.example.swp.features.team_member.dto.request.AddTeamMemberRequest;
import com.example.swp.features.team_member.dto.response.TeamMemberResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/team-members")
@RequiredArgsConstructor
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<TeamMemberResponse> addTeamMember(@Valid @RequestBody AddTeamMemberRequest request) {
        TeamMemberResponse response = teamMemberService.addTeamMember(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long teamId) {
        List<TeamMemberResponse> responses = teamMemberService.getTeamMembers(teamId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{teamMemberId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Void> removeTeamMember(@PathVariable Long teamMemberId) {
        teamMemberService.removeTeamMember(teamMemberId);
        return ResponseEntity.noContent().build();
    }
}
