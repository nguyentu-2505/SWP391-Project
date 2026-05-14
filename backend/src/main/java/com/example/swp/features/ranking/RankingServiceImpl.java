package com.example.swp.features.ranking;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.ranking.dto.RankingResponse;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.team.Team;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final CriterionRepository criterionRepository;
    private final RoundRepository roundRepository; // To validate round existence

    @Override
    public List<RankingResponse> getRankingForRound(Long roundId) {
        // 1. Validate Round existence
        roundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Round not found with id: " + roundId));

        // 2. Get all submissions for the given round
        List<Submission> submissions = submissionRepository.findByRoundId(roundId);
        if (submissions.isEmpty()) {
            return List.of(); // No submissions, no ranking
        }

        // Map to store total scores for each team
        Map<Long, Double> teamScores = new HashMap<>();
        Map<Long, Team> teamsMap = new HashMap<>(); // To quickly get team details

        for (Submission submission : submissions) {
            Team team = submission.getTeam();
            teamsMap.putIfAbsent(team.getId(), team);

            // Get all scores for this submission
            List<Score> scores = scoreRepository.findBySubmissionId(submission.getId());

            double submissionTotalScore = 0.0;
            // Map to store criterion weights for quick lookup
            Map<Long, Integer> criterionWeights = new HashMap<>();

            // Fetch all criteria for the event (or default ones) to get weights
            // Assuming all criteria for a round belong to the same event as the round
            // This might need refinement if criteria can be round-specific without event link
            List<Criterion> criteria = criterionRepository.findAllByHackathonEventIdOrDefault(roundRepository.findById(roundId).get().getHackathonEvent().getId());
            criteria.forEach(c -> criterionWeights.put(c.getId(), c.getWeight()));


            // Calculate weighted score for the submission
            Map<Long, List<Score>> scoresByCriterion = scores.stream()
                    .collect(Collectors.groupingBy(s -> s.getCriterion().getId()));

            for (Map.Entry<Long, List<Score>> entry : scoresByCriterion.entrySet()) {
                Long criterionId = entry.getKey();
                List<Score> criterionScores = entry.getValue();

                // Calculate average score for this criterion across all judges
                double averageCriterionScore = criterionScores.stream()
                        .mapToInt(Score::getScoreValue)
                        .average()
                        .orElse(0.0);

                // Get weight for this criterion
                Integer weight = criterionWeights.getOrDefault(criterionId, 0); // Default to 0 if weight not found

                submissionTotalScore += averageCriterionScore * weight;
            }
            
            // Normalize the score by total weight if needed, or just use raw weighted sum
            // For simplicity, we'll use raw weighted sum for now.
            // If you want a score out of 100, you'd divide by sum of all weights * max_score_per_criterion
            
            teamScores.merge(team.getId(), submissionTotalScore, Double::sum);
        }

        // 3. Convert to RankingResponse and sort
        List<RankingResponse> ranking = teamScores.entrySet().stream()
                .map(entry -> RankingResponse.builder()
                        .teamId(entry.getKey())
                        .teamName(teamsMap.get(entry.getKey()).getName())
                        .totalScore(entry.getValue())
                        .build())
                .sorted(Comparator.comparingDouble(RankingResponse::getTotalScore).reversed()) // Sort descending
                .collect(Collectors.toList());

        // 4. Assign ranks
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setRank(i + 1);
        }

        return ranking;
    }
}
