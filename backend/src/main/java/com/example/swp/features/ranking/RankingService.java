package com.example.swp.features.ranking;

import com.example.swp.features.ranking.dto.RankingResponse;

import java.util.List;

public interface RankingService {
    List<RankingResponse> getRankingForRound(Long roundId);
    // Potentially add methods for overall event ranking, track ranking etc.
}
