package com.example.swp.features.score.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateScoreRequest {
    @NotNull(message = "Submission ID cannot be null")
    private Long submissionId;

    @NotNull(message = "Judge ID cannot be null")
    private Long judgeId;

    @NotEmpty(message = "Scores list cannot be empty")
    @Valid // This is important to trigger validation on the objects inside the list
    private List<ScoreCriterion> scores;

    @Data
    public static class ScoreCriterion {
        @NotNull(message = "Criterion ID cannot be null")
        private Long criterionId;

        @Min(value = 1, message = "Score value must be at least 1")
        @Max(value = 10, message = "Score value must be at most 10")
        private int scoreValue;

        private String comment;
    }
}
