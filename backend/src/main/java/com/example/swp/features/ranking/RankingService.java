package com.example.swp.features.ranking;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.ranking.dto.RankOverrideRequest;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team.TeamStatus;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/**
 * RankingService — Dịch vụ xếp hạng đội thi trong SEAL Hackathon.
 *
 * ===== LUỒNG XẾP HẠNG (RANKING FLOW) =====
 *
 * 1. Lấy tất cả submissions của vòng thi (roundId).
 * 2. Loại bỏ các đội có status = DISQUALIFIED khỏi bảng xếp hạng.
 * 3. Chỉ tính xếp hạng cho đội đã có ít nhất 1 điểm được finalized.
 * 4. Tính finalScore theo công thức:
 * - Với mỗi judge: Tính tổng điểm có trọng số = sum(score × weight) /
 * sum(weight)
 * - finalScore = trung bình cộng điểm của tất cả các judge
 * 5. Xếp hạng THEO TỪNG HẠng mục (Track) — không xếp chung toàn bộ sự kiện.
 * 6. Áp dụng Admin Override (nếu có) — thay thứ hạng tự động bằng thứ hạng thủ
 * công.
 *
 * ===== TIE-BREAKING (PHÂN ĐỊNH BẰNG ĐIỂM) =====
 *
 * Khi 2 đội có finalScore bằng nhau (trong ngưỡng EPSILON = 0.001):
 *
 * Tie-Breaker 1: So sánh lần lượt điểm trung bình của các tiêu chí,
 * theo thứ tự trọng số GIẢM DẦN (40% → 30% → 20% → 10%)
 * Đội có điểm cao hơn ở tiêu chí quan trọng hơn sẽ thắng.
 *
 * Tie-Breaker 2: So sánh thời gian nộp bài cuối cùng (submittedAt).
 * submittedAt = thời điểm nộp/cập nhật bài gần nhất (Last Submit).
 * Đội nộp sớm hơn (trước deadline) sẽ xếp trước.
 *
 * Tie-Breaker 3: So sánh teamId (fallback deterministic).
 * Đảm bảo thuật toán luôn cho ra 1 kết quả duy nhất,
 * không bị đảo lộn ngẫu nhiên mỗi lần load trang.
 *
 * ===== ADMIN OVERRIDE =====
 *
 * Admin/Organizer có thể can thiệp thủ công vào thứ hạng nếu cần thiết.
 * Điều kiện bắt buộc:
 * - Phải nhập lý do (reason) — không được để trống.
 * - Hành động sẽ được ghi vào Audit Log tự động.
 * - Bảng xếp hạng sẽ hiển thị badge ⚠️ "Manually Adjusted" trên team đó.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class RankingService {

        /**
         * EPSILON — Ngưỡng sai số chấp nhận được khi so sánh điểm số kiểu
         * double/BigDecimal.
         * Nếu |scoreA - scoreB| < EPSILON → coi 2 đội BẰNG ĐIỂM → kích hoạt
         * Tie-Breaking.
         * Tránh lỗi floating-point: ví dụ 91.5000000 vs 91.4999999 bị coi là khác nhau.
         */
        private static final double EPSILON = 0.001;

        private final SubmissionRepository submissionRepository;
        private final ScoreRepository scoreRepository;
        private final RankOverrideRepository rankOverrideRepository;
        private final RoundRepository roundRepository;
        private final TeamRepository teamRepository;
        private final UserRepository userRepository;
        private final AuditLogService auditLogService;

        // =========================================================================
        // GET RANKING
        // =========================================================================

        public List<TeamRankingResponse> getRankingForRound(Long roundId) {
                List<Submission> submissions = submissionRepository.findByRoundId(roundId);

                if (submissions.isEmpty()) {
                        return List.of();
                }

                // BƯỚC 1: Loại bỏ các đội bị DISQUALIFIED — không đưa vào bảng xếp hạng
                // (Đội DQ không được xuất hiện ở cuối bảng, phải loại hoàn toàn)
                List<Submission> activeSubmissions = submissions.stream()
                                .filter(s -> s.getTeam() != null &&
                                                s.getTeam().getStatus() != TeamStatus.DISQUALIFIED)
                                .collect(Collectors.toList());

                if (activeSubmissions.isEmpty()) {
                        return List.of();
                }

                List<Long> submissionIds = activeSubmissions.stream()
                                .map(Submission::getId)
                                .collect(Collectors.toList());

                // BƯỚC 2: Chỉ lấy điểm đã được finalized (judge đã xác nhận chấm xong)
                List<Score> scoresForRound = scoreRepository.findBySubmissionIdIn(submissionIds).stream()
                                .filter(Score::isFinalized)
                                .collect(Collectors.toList());

                Map<Submission, List<Score>> scoresBySubmission = scoresForRound.stream()
                                .collect(Collectors.groupingBy(Score::getSubmission));

                // BƯỚC 3: Tính finalScore và xây dựng danh sách ranking
                List<TeamRankingResponse> rankings = scoresBySubmission.entrySet().stream()
                                .map(entry -> {
                                        Submission submission = entry.getKey();
                                        List<Score> submissionScores = entry.getValue();

                                        // finalScore = trung bình cộng điểm có trọng số của tất cả judge
                                        BigDecimal finalScore = calculateFinalScore(submissionScores);

                                        // Tính điểm trung bình cho từng tiêu chí (dùng cho Tie-Breaker 1)
                                        Map<Criterion, Double> avgScores = submissionScores.stream()
                                                        .collect(Collectors.groupingBy(
                                                                        Score::getCriterion,
                                                                        Collectors.averagingDouble(
                                                                                        Score::getScoreValue)));

                                        List<TeamRankingResponse.CriterionScoreDto> breakdown = avgScores.entrySet()
                                                        .stream()
                                                        .map(e -> TeamRankingResponse.CriterionScoreDto.builder()
                                                                        .criterionId(e.getKey().getId())
                                                                        .criterionName(e.getKey().getName())
                                                                        .averageScore(BigDecimal.valueOf(e.getValue())
                                                                                        .setScale(2, RoundingMode.HALF_UP)
                                                                                        .doubleValue())
                                                                        .weight(e.getKey().getWeight())
                                                                        .build())
                                                        .collect(Collectors.toList());

                                        com.example.swp.features.track.Track track = submission.getTeam().getTrack();

                                        return TeamRankingResponse.builder()
                                                        .teamId(submission.getTeam().getId())
                                                        .teamName(submission.getTeam().getName())
                                                        .projectName(submission.getTeam().getProjectName())
                                                        .finalScore(finalScore)
                                                        .trackId(track != null ? track.getId() : null)
                                                        .trackName(track != null ? track.getName() : null)
                                                        .criterionBreakdown(breakdown)
                                                        // submittedAt = thời điểm nộp/cập nhật bài gần nhất (Last
                                                        // Submit)
                                                        // Được cập nhật mỗi lần team update submission (không phải lần
                                                        // đầu tiên)
                                                        .submittedAt(submission.getSubmittedAt())
                                                        .build();
                                })
                                .collect(Collectors.toList());

                // BƯỚC 4: Lấy tất cả Admin Override cho vòng này
                Map<Long, RankOverride> overridesByTeamId = rankOverrideRepository.findByRoundId(roundId)
                                .stream()
                                .collect(Collectors.toMap(
                                                o -> o.getTeam().getId(),
                                                o -> o));

                // BƯỚC 5: Xếp hạng theo từng Track (hạng mục thi đấu)
                Map<Long, List<TeamRankingResponse>> groupedByTrack = rankings.stream()
                                .collect(Collectors.groupingBy(r -> r.getTrackId() != null ? r.getTrackId() : -1L));

                List<TeamRankingResponse> finalRankings = new java.util.ArrayList<>();

                for (List<TeamRankingResponse> trackRankings : groupedByTrack.values()) {
                        // Sắp xếp tự động theo Tie-Breaking chain
                        trackRankings.sort((r1, r2) -> {
                                // So sánh finalScore với EPSILON để tránh lỗi floating-point
                                double score1 = r1.getFinalScore() != null ? r1.getFinalScore().doubleValue() : 0.0;
                                double score2 = r2.getFinalScore() != null ? r2.getFinalScore().doubleValue() : 0.0;
                                if (Math.abs(score2 - score1) >= EPSILON) {
                                        return Double.compare(score2, score1); // Điểm cao hơn xếp trước
                                }

                                // TIE-BREAKER 1: Duyệt lần lượt từng tiêu chí theo trọng số giảm dần
                                // Ví dụ: 40% → 30% → 20% → 10%
                                // Chỉ khi bằng nhau ở TẤT CẢ tiêu chí mới chuyển sang Tie-Breaker 2
                                List<TeamRankingResponse.CriterionScoreDto> b1 = r1.getCriterionBreakdown();
                                List<TeamRankingResponse.CriterionScoreDto> b2 = r2.getCriterionBreakdown();
                                if (b1 != null && b2 != null) {
                                        List<TeamRankingResponse.CriterionScoreDto> s1 = b1.stream()
                                                        .sorted(Comparator.comparingInt(
                                                                        TeamRankingResponse.CriterionScoreDto::getWeight)
                                                                        .reversed())
                                                        .collect(Collectors.toList());
                                        List<TeamRankingResponse.CriterionScoreDto> s2 = b2.stream()
                                                        .sorted(Comparator.comparingInt(
                                                                        TeamRankingResponse.CriterionScoreDto::getWeight)
                                                                        .reversed())
                                                        .collect(Collectors.toList());
                                        int size = Math.min(s1.size(), s2.size());
                                        for (int i = 0; i < size; i++) {
                                                double avg1 = s1.get(i).getAverageScore();
                                                double avg2 = s2.get(i).getAverageScore();
                                                if (Double.compare(avg2, avg1) != 0) {
                                                        return Double.compare(avg2, avg1);
                                                }
                                        }
                                }

                                // TIE-BREAKER 2: Thời gian nộp bài cuối cùng (Last Submit trước deadline)
                                // submittedAt được cập nhật mỗi lần team update bài — không phải lần nộp đầu
                                // tiên
                                if (r1.getSubmittedAt() != null && r2.getSubmittedAt() != null) {
                                        return r1.getSubmittedAt().compareTo(r2.getSubmittedAt());
                                }

                                // TIE-BREAKER 3: Team ID (fallback deterministic)
                                // Đảm bảo thuật toán cho ra 1 kết quả duy nhất — không bị đảo lộn ngẫu nhiên
                                return r1.getTeamId().compareTo(r2.getTeamId());
                        });

                        // Gán rank tự động (1, 2, 3...)
                        for (int i = 0; i < trackRankings.size(); i++) {
                                trackRankings.get(i).setRank(i + 1);
                        }

                        // BƯỚC 6: Áp dụng Admin Override với SWAP LOGIC
                        // Khi đội A được override lên rank X:
                        // → Đội B đang ở rank X (tự động) sẽ bị đẩy xuống rank cũ của đội A
                        // → Chỉ áp dụng swap cho đội KHÔNG CÓ override riêng (auto rank)
                        // Ví dụ: 4 đội, override đội rank 4 → rank 3
                        // → Đội rank 3 (auto) tự động xuống rank 4

                        // Map: autoRank → response (chỉ lấy những đội chưa có override)
                        Map<Integer, TeamRankingResponse> autoRankMap = new java.util.HashMap<>();
                        for (TeamRankingResponse r : trackRankings) {
                                if (!overridesByTeamId.containsKey(r.getTeamId())) {
                                        autoRankMap.put(r.getRank(), r);
                                }
                        }

                        // Áp dụng override và thu thập rank cũ của những đội bị override
                        List<Integer> freedAutoRanks = new java.util.ArrayList<>();
                        for (TeamRankingResponse r : trackRankings) {
                                RankOverride override = overridesByTeamId.get(r.getTeamId());
                                if (override != null) {
                                        int oldAutoRank = r.getRank(); // rank tự động trước override
                                        freedAutoRanks.add(oldAutoRank); // rank này sẽ được nhường cho đội bị đẩy
                                        r.setRank(override.getOverrideRank());
                                        r.setManuallyAdjusted(true);
                                        r.setOverrideReason(override.getReason());
                                        log.info("Applied manual rank override: teamId={}, autoRank={} → overrideRank={}, reason={}",
                                                        r.getTeamId(), oldAutoRank, override.getOverrideRank(),
                                                        override.getReason());
                                }
                        }

                        // Xác định những rank bị "chiếm" bởi override (cần được fill lại)
                        // → Đội auto đang ở rank đó phải nhường chỗ, lấy rank freed từ đội bị override
                        java.util.Iterator<Integer> freedIter = freedAutoRanks.iterator();
                        for (RankOverride override : overridesByTeamId.values()) {
                                int occupiedRank = override.getOverrideRank();
                                TeamRankingResponse displaced = autoRankMap.get(occupiedRank);
                                if (displaced != null && freedIter.hasNext()) {
                                        int assignedRank = freedIter.next();
                                        log.info("Swap: team '{}' displaced from rank {} → assigned rank {}",
                                                        displaced.getTeamName(), occupiedRank, assignedRank);
                                        displaced.setRank(assignedRank);
                                }
                        }

                        // Sắp xếp lại sau khi áp dụng swap để đảm bảo thứ tự đúng
                        trackRankings.sort(Comparator.comparingInt(TeamRankingResponse::getRank));
                        finalRankings.addAll(trackRankings);
                }

                // Sắp xếp output theo trackId rồi rank
                finalRankings.sort(Comparator
                                .comparing((TeamRankingResponse r) -> r.getTrackId() != null ? r.getTrackId() : -1L)
                                .thenComparing(TeamRankingResponse::getRank));

                return finalRankings;
        }

        // =========================================================================
        // ADMIN OVERRIDE RANK
        // =========================================================================

        /**
         * Admin/Organizer điều chỉnh thứ hạng thủ công cho 1 đội trong 1 vòng thi.
         *
         * Điều kiện bắt buộc:
         * - Phải nhập reason (lý do) — không được để trống.
         * - Hành động sẽ được ghi vào Audit Log với đầy đủ thông tin.
         * - UI sẽ hiển thị badge ⚠️ "Manually Adjusted" trên team đó.
         *
         * @param roundId ID vòng thi
         * @param request Thông tin override (teamId, overrideRank, reason)
         */
        @Transactional
        public void overrideTeamRank(Long roundId, RankOverrideRequest request) {
                Round round = roundRepository.findById(roundId)
                                .orElseThrow(() -> new ResourceNotFoundException("Round not found: " + roundId));

                Team team = teamRepository.findById(request.getTeamId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Team not found: " + request.getTeamId()));

                // Lấy user đang thực hiện override
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

                // Upsert: nếu đã có override trước đó thì cập nhật, nếu chưa thì tạo mới
                RankOverride override = rankOverrideRepository
                                .findByRoundIdAndTeamId(roundId, request.getTeamId())
                                .orElse(new RankOverride());

                int oldRank = override.getOverrideRank();
                override.setRound(round);
                override.setTeam(team);
                override.setOverrideRank(request.getOverrideRank());
                override.setReason(request.getReason());
                override.setOverriddenBy(username);
                override.setOverriddenAt(LocalDateTime.now());

                rankOverrideRepository.save(override);

                // Ghi Audit Log bắt buộc — đầy đủ thông tin
                String auditMessage = String.format(
                                "Admin '%s' manually overrode rank for team '%s' (ID: %d) in round '%s' (ID: %d). " +
                                                "Old rank: %d → New rank: %d. Reason: %s",
                                username, team.getName(), team.getId(),
                                round.getName(), round.getId(),
                                oldRank, request.getOverrideRank(),
                                request.getReason());

                auditLogService.logAction(
                                "MANUAL_RANK_OVERRIDE",
                                "RANK_OVERRIDE",
                                team.getId(),
                                oldRank > 0 ? "Rank #" + oldRank : "Auto",
                                "Rank #" + request.getOverrideRank(),
                                round.getHackathonEvent().getId());

                log.warn("MANUAL RANK OVERRIDE: {}", auditMessage);
        }

        /**
         * Xóa Admin Override — khôi phục về thứ hạng tự động.
         *
         * @param roundId ID vòng thi
         * @param teamId  ID đội thi cần khôi phục thứ hạng tự động
         */
        @Transactional
        public void removeRankOverride(Long roundId, Long teamId) {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();

                rankOverrideRepository.deleteByRoundIdAndTeamId(roundId, teamId);

                auditLogService.logAction(
                                "REMOVE_RANK_OVERRIDE",
                                "RANK_OVERRIDE",
                                teamId,
                                "Manual Override",
                                "Auto Ranking Restored",
                                null);

                log.info("Rank override removed: roundId={}, teamId={}, removedBy={}", roundId, teamId, username);
        }

        // =========================================================================
        // CALCULATE FINAL SCORE
        // =========================================================================

        /**
         * Tính điểm tổng kết của 1 đội trong 1 vòng thi.
         *
         * Công thức:
         * - Với mỗi judge: judgeTotalScore = sum(score × weight) / sum(weight)
         * - finalScore = trung bình cộng judgeTotalScore của tất cả judge
         *
         * Lưu ý: Chỉ tính các điểm đã được finalized (isFinalized = true).
         * Nếu 1 judge chưa chấm xong → điểm của judge đó không được tính.
         */
        public BigDecimal calculateFinalScore(List<Score> scores) {
                if (scores.isEmpty()) {
                        return BigDecimal.ZERO;
                }

                // Group điểm theo từng judge
                Map<Long, List<Score>> scoresByJudge = scores.stream()
                                .collect(Collectors.groupingBy(score -> score.getJudge().getId()));

                BigDecimal totalScoreFromAllJudges = BigDecimal.ZERO;
                for (List<Score> judgeScores : scoresByJudge.values()) {
                        BigDecimal judgeTotalWeightedScore = BigDecimal.ZERO;
                        BigDecimal totalWeight = BigDecimal.ZERO;

                        for (Score score : judgeScores) {
                                BigDecimal scoreValue = BigDecimal.valueOf(score.getScoreValue());
                                BigDecimal weight = BigDecimal.valueOf(score.getCriterion().getWeight());
                                judgeTotalWeightedScore = judgeTotalWeightedScore.add(scoreValue.multiply(weight));
                                totalWeight = totalWeight.add(weight);
                        }

                        if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                                totalScoreFromAllJudges = totalScoreFromAllJudges.add(
                                                judgeTotalWeightedScore.divide(totalWeight, 4, RoundingMode.HALF_UP));
                        }
                }

                return totalScoreFromAllJudges.divide(
                                BigDecimal.valueOf(scoresByJudge.size()), 2, RoundingMode.HALF_UP);
        }
}
