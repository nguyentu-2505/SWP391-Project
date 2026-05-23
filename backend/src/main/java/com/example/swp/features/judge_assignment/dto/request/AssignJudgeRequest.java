package com.example.swp.features.judge_assignment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignJudgeRequest {
    @NotNull
    private Long judgeId;
    @NotNull
    private Long submissionId;

    public Long getJudgeId() { return judgeId; }
    public Long getSubmissionId() { return submissionId; }
}
