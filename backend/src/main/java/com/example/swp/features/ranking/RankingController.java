package com.example.swp.features.ranking;

import com.example.swp.features.ranking.dto.RankingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/round/{roundId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR', 'TEAM_MEMBER')")
    public ResponseEntity<List<RankingResponse>> getRankingForRound(@PathVariable Long roundId) {
        List<RankingResponse> rankings = rankingService.getRankingForRound(roundId);
        return ResponseEntity.ok(rankings);
    }
}
