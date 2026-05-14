package com.example.swp.features.score;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements ScoreService {

    private final ScoreRepository scoreRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final CriterionRepository criterionRepository;

    @Override
    @Transactional
    public List<ScoreResponse> saveScores(CreateScoreRequest request) {
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new RuntimeException("Judge not found"));

        List<Score> savedScores = new ArrayList<>();
        for (CreateScoreRequest.ScoreCriterion sc : request.getScores()) {
            Criterion criterion = criterionRepository.findById(sc.getCriterionId())
                    .orElseThrow(() -> new RuntimeException("Criterion not found: " + sc.getCriterionId()));

            // Use a custom method to find and update, or create a new score
            Score score = scoreRepository.findBySubmissionIdAndJudgeId(submission.getId(), judge.getId())
                .stream()
                .filter(s -> s.getCriterion().getId().equals(criterion.getId()))
                .findFirst()
                .orElse(new Score());

            score.setSubmission(submission);
            score.setJudge(judge);
            score.setCriterion(criterion);
            score.setScoreValue(sc.getScoreValue());
            score.setComment(sc.getComment());
            
            savedScores.add(scoreRepository.save(score));
        }

        return savedScores.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ScoreResponse> getScoresForSubmission(Long submissionId) {
        return scoreRepository.findBySubmissionId(submissionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScoreResponse> getScoresForSubmissionByJudge(Long submissionId, Long judgeId) {
        return scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    private ScoreResponse mapToResponse(Score score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .submissionId(score.getSubmission().getId())
                .judgeId(score.getJudge().getId())
                .criterionId(score.getCriterion().getId())
                .scoreValue(score.getScoreValue())
                .comment(score.getComment())
                .scoredAt(score.getScoredAt())
                .build();
    }
}
