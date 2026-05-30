package com.example.swp.features.ranking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamRankingResponse {
    private int rank;
    private Long teamId;
    private String teamName;
    private String projectName;
    private BigDecimal finalScore;

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public BigDecimal getFinalScore() { return finalScore; }

    public static TeamRankingResponseBuilder builder() { return new TeamRankingResponseBuilder(); }
    public static class TeamRankingResponseBuilder {
        private int rank;
        private Long teamId;
        private String teamName;
        private String projectName;
        private BigDecimal finalScore;

        public TeamRankingResponseBuilder rank(int rank) { this.rank = rank; return this; }
        public TeamRankingResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TeamRankingResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public TeamRankingResponseBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public TeamRankingResponseBuilder finalScore(BigDecimal finalScore) { this.finalScore = finalScore; return this; }
        public TeamRankingResponse build() {
            TeamRankingResponse r = new TeamRankingResponse();
            r.rank = this.rank; r.teamId = this.teamId; r.teamName = this.teamName;
            r.projectName = this.projectName; r.finalScore = this.finalScore;
            return r;
        }
    }
}


