package com.example.swp.features.judge_assignment;

import com.example.swp.features.judge_assignment.dto.AssignJudgeRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/judge-assignments")
@RequiredArgsConstructor
public class JudgeAssignmentController {

    private final JudgeAssignmentService judgeAssignmentService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ORGANIZER')")
    public ResponseEntity<Void> assignJudge(@Valid @RequestBody AssignJudgeRequest request) {
        judgeAssignmentService.assignJudge(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasAuthority('ROLE_JUDGE')")
    public ResponseEntity<List<SubmissionResponse>> getAssignedSubmissions() {
        List<SubmissionResponse> responses = judgeAssignmentService.getAssignedSubmissions();
        return ResponseEntity.ok(responses);
    }
}