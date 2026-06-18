package com.example.swp.features.ranking;

import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.criterion.Criterion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;

    public List<TeamRankingResponse> getRankingForRound(Long roundId) {
        List<Submission> submissions = submissionRepository.findByRoundId(roundId).stream()
                .filter(sub -> sub.getTeam().getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED)
                .collect(Collectors.toList());
                
        if (submissions.isEmpty()) {
            return List.of();
        }

        List<Long> submissionIds = submissions.stream().map(Submission::getId).collect(Collectors.toList());

        // Fetch all scores for submissions in this round (avoids N+1)
        List<Score> scoresForRound = scoreRepository.findBySubmissionIdIn(submissionIds);


        Map<Submission, List<Score>> scoresBySubmission = scoresForRound.stream()
                .collect(Collectors.groupingBy(Score::getSubmission));

        List<TeamRankingResponse> rankings = scoresBySubmission.entrySet().stream()
                .map(entry -> {
                    Submission submission = entry.getKey();
                    List<Score> submissionScores = entry.getValue();
                    BigDecimal finalScore = calculateFinalScore(submissionScores);

                    // Tính điểm trung bình cho từng tiêu chí
                    Map<Criterion, Double> avgScores = submissionScores.stream()
                            .collect(Collectors.groupingBy(
                                    Score::getCriterion,
                                    Collectors.averagingDouble(Score::getScoreValue)
                            ));

                    List<TeamRankingResponse.CriterionScoreDto> breakdown = avgScores.entrySet().stream()
                            .map(e -> TeamRankingResponse.CriterionScoreDto.builder()
                                    .criterionId(e.getKey().getId())
                                    .criterionName(e.getKey().getName())
                                    .averageScore(BigDecimal.valueOf(e.getValue()).setScale(2, RoundingMode.HALF_UP).doubleValue())
                                    .weight(e.getKey().getWeight())
                                    .build())
                            .collect(Collectors.toList());

                    return TeamRankingResponse.builder()
                            .teamId(submission.getTeam().getId())
                            .teamName(submission.getTeam().getName())
                            .projectName(submission.getTeam().getProjectName())
                            .finalScore(finalScore)
                            .criterionBreakdown(breakdown)
                            .build();
                })
                .sorted(Comparator.comparing(TeamRankingResponse::getFinalScore).reversed())
                .collect(Collectors.toList());

        // Assign ranks
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRank(i + 1);
        }

        return rankings;
    }

    private BigDecimal calculateFinalScore(List<Score> scores) {
        if (scores.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Group scores by judge
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
                totalScoreFromAllJudges = totalScoreFromAllJudges.add(judgeTotalWeightedScore.divide(totalWeight, 4, RoundingMode.HALF_UP));
            }
        }

        return totalScoreFromAllJudges.divide(BigDecimal.valueOf(scoresByJudge.size()), 2, RoundingMode.HALF_UP);
    }
}
