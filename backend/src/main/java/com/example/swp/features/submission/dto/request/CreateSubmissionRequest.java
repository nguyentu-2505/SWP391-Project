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

    public Long getTeamId() { return teamId; }
    public Long getRoundId() { return roundId; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public String getDemoUrl() { return demoUrl; }
    public String getReportUrl() { return reportUrl; }
}
