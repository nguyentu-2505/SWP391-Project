package com.example.swp.features.judge_assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignJudgeRequest {
    @NotNull
    private Long judgeId;

    @NotNull
    private Long submissionId;
}