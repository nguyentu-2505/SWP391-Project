package com.example.swp.features.submission.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSubmissionRequest {
    @NotNull(message = "Team ID cannot be null")
    private Long teamId;

    @NotNull(message = "Round ID cannot be null")
    private Long roundId;

    private String repositoryUrl;
    private String demoUrl;
    private String reportUrl;
}
