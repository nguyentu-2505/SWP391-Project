package com.example.swp.features.submission.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionResponse {
    private Long id;
    private Long teamId;
    private Long roundId;
    private String repositoryUrl;
    private String demoUrl;
    private String reportUrl;
    private LocalDateTime submittedAt;
}
