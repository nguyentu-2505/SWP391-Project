package com.example.swp.features.ranking;

import com.example.swp.features.ranking.dto.TeamRankingResponse;

import java.util.List;

public interface RankingService {
    List<TeamRankingResponse> getRankingForRound(Long roundId);
}