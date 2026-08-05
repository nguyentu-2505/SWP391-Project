package com.example.swp.features.ranking;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.ranking.dto.RankOverrideRequest;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    /**
     * GET /api/v1/rankings/round/{roundId}
     * Lấy bảng xếp hạng của 1 vòng thi — công khai, ai cũng xem được.
     * Trả về danh sách xếp theo từng Track, kèm flag manuallyAdjusted nếu có Admin Override.
     */
    @GetMapping("/round/{roundId}")
    @PreAuthorize("permitAll()") // Publicly accessible leaderboard
    public ResponseEntity<ApiResponse<List<TeamRankingResponse>>> getRankingForRound(
            @PathVariable Long roundId) {
        List<TeamRankingResponse> rankings = rankingService.getRankingForRound(roundId);
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }

    /**
     * POST /api/v1/rankings/round/{roundId}/override
     * Admin/Organizer điều chỉnh thứ hạng thủ công cho 1 đội.
     *
     * Điều kiện bắt buộc:
     * - reason không được để trống
     * - Hành động được ghi Audit Log tự động
     * - Badge ⚠️ "Manually Adjusted" sẽ hiện trên UI
     *
     * Body: { "teamId": 123, "overrideRank": 1, "reason": "Lý do..." }
     */
    @PostMapping("/round/{roundId}/override")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<String>> overrideTeamRank(
            @PathVariable Long roundId,
            @Valid @RequestBody RankOverrideRequest request) {
        rankingService.overrideTeamRank(roundId, request);
        return ResponseEntity.ok(ApiResponse.success(
                "Rank override applied successfully for team " + request.getTeamId() +
                " → Rank #" + request.getOverrideRank()));
    }

    /**
     * DELETE /api/v1/rankings/round/{roundId}/override/{teamId}
     * Xóa Admin Override — khôi phục về thứ hạng tự động.
     */
    @DeleteMapping("/round/{roundId}/override/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<String>> removeRankOverride(
            @PathVariable Long roundId,
            @PathVariable Long teamId) {
        rankingService.removeRankOverride(roundId, teamId);
        return ResponseEntity.ok(ApiResponse.success(
                "Rank override removed. Team " + teamId + " will use auto-ranking."));
    }
}
