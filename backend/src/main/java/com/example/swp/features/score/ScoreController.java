package com.example.swp.features.score;

import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_JUDGE')")
    public ResponseEntity<List<ScoreResponse>> saveScores(@Valid @RequestBody CreateScoreRequest request) {
        List<ScoreResponse> responses = scoreService.saveScores(request);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ORGANIZER', 'ROLE_JUDGE', 'ROLE_MENTOR')")
    public ResponseEntity<List<ScoreResponse>> getScoresForSubmission(@PathVariable Long submissionId) {
        List<ScoreResponse> responses = scoreService.getScoresForSubmission(submissionId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/submission/{submissionId}/judge/{judgeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_ORGANIZER', 'ROLE_JUDGE', 'ROLE_MENTOR')")
    public ResponseEntity<List<ScoreResponse>> getScoresForSubmissionByJudge(@PathVariable Long submissionId, @PathVariable Long judgeId) {
        List<ScoreResponse> responses = scoreService.getScoresForSubmissionByJudge(submissionId, judgeId);
        return ResponseEntity.ok(responses);
    }
}