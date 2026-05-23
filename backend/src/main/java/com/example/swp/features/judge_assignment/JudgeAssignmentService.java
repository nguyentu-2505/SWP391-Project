package com.example.swp.features.judge_assignment;

import com.example.swp.features.judge_assignment.dto.AssignJudgeRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;

import java.util.List;

public interface JudgeAssignmentService {
    void assignJudge(AssignJudgeRequest request);
    List<SubmissionResponse> getAssignedSubmissions();
}