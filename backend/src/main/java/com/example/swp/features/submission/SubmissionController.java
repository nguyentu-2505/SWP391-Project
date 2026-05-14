package com.example.swp.features.submission;

import com.example.swp.features.submission.dto.request.CreateSubmissionRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasAuthority('TEAM_MEMBER')")
    public ResponseEntity<SubmissionResponse> createSubmission(@Valid @RequestBody CreateSubmissionRequest request) {
        // TODO: Add logic in service to check if the authenticated user is part of the team (request.getTeamId())
        SubmissionResponse response = submissionService.createSubmission(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR')")
    public ResponseEntity<SubmissionResponse> getSubmissionById(@PathVariable Long id) {
        SubmissionResponse response = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/team/{teamId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByTeam(@PathVariable Long teamId) {
        List<SubmissionResponse> responses = submissionService.getSubmissionsByTeam(teamId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/round/{roundId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByRound(@PathVariable Long roundId) {
        List<SubmissionResponse> responses = submissionService.getSubmissionsByRound(roundId);
        return ResponseEntity.ok(responses);
    }
}
