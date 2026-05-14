package com.example.swp.features.score.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ScoreResponse {
    private Long id;
    private Long judgeId;
    private Long submissionId;
    private Long criterionId;
    private int scoreValue;
    private String comment;
    private LocalDateTime scoredAt;
}
