package com.example.swp.features.ranking;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.ranking.dto.CriterionScoreResponse;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.score.Score;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final CriterionRepository criterionRepository;
    private final RoundRepository roundRepository;

    @Override
    public List<TeamRankingResponse> getRankingForRound(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Round not found"));

        List<Submission> submissions = submissionRepository.findByRoundId(roundId);
        List<Criterion> criteria = criterionRepository.findAllByHackathonEventIdOrDefault(round.getHackathonEvent().getId());
        int totalWeight = criteria.stream().mapToInt(Criterion::getWeight).sum();

        List<TeamRankingResponse> teamRankings = new ArrayList<>();

        for (Submission submission : submissions) {
            List<Score> scores = scoreRepository.findBySubmissionId(submission.getId());
            Map<Long, List<Score>> scoresByCriterion = scores.stream()
                    .collect(Collectors.groupingBy(score -> score.getCriterion().getId()));

            double finalScore = 0;
            List<CriterionScoreResponse> scoreDetails = new ArrayList<>();

            for (Criterion criterion : criteria) {
                List<Score> criterionScores = scoresByCriterion.getOrDefault(criterion.getId(), Collections.emptyList());
                double averageScore = criterionScores.stream()
                        .mapToInt(Score::getScoreValue)
                        .average()
                        .orElse(0.0);

                finalScore += averageScore * criterion.getWeight();
                
                scoreDetails.add(CriterionScoreResponse.builder()
                        .criterionId(criterion.getId())
                        .criterionName(criterion.getName())
                        .averageScore(averageScore)
                        .build());
            }
            
            // Normalize the final score to be out of 100
            double normalizedScore = (totalWeight > 0) ? (finalScore / totalWeight) * 10 : 0;

            teamRankings.add(TeamRankingResponse.builder()
                    .teamId(submission.getTeam().getId())
                    .teamName(submission.getTeam().getName())
                    .projectName(submission.getTeam().getProjectName())
                    .finalScore(normalizedScore)
                    .scoreDetails(scoreDetails)
                    .build());
        }

        // Sort teams by final score in descending order
        teamRankings.sort(Comparator.comparingDouble(TeamRankingResponse::getFinalScore).reversed());

        // Assign ranks
        for (int i = 0; i < teamRankings.size(); i++) {
            teamRankings.get(i).setRank(i + 1);
        }

        return teamRankings;
    }
}