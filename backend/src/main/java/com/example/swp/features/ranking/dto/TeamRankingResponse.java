package com.example.swp.features.ranking.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeamRankingResponse {
    private int rank;
    private Long teamId;
    private String teamName;
    private String projectName;
    private double finalScore;
    private List<CriterionScoreResponse> scoreDetails;
}