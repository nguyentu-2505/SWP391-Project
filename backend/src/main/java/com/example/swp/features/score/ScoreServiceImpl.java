package com.example.swp.features.score;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.judge_assignment.JudgeAssignmentRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements ScoreService {

    private final ScoreRepository scoreRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final CriterionRepository criterionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public List<ScoreResponse> saveScores(CreateScoreRequest request) {
        User judge = getCurrentUser();
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (!judgeAssignmentRepository.existsByJudgeIdAndSubmissionId(judge.getId(), submission.getId())) {
            throw new AccessDeniedException("You are not assigned to score this submission.");
        }
        
        List<Score> savedScores = new ArrayList<>();
        for (CreateScoreRequest.ScoreCriterion sc : request.getScores()) {
            Criterion criterion = criterionRepository.findById(sc.getCriterionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Criterion not found: " + sc.getCriterionId()));

            if (sc.getScoreValue() < 0 || sc.getScoreValue() > criterion.getMaxScore()) {
                throw new IllegalArgumentException(
                    "Score for criterion '" + criterion.getName() + "' must be between 0 and " + criterion.getMaxScore()
                );
            }

            Score score = scoreRepository.findBySubmissionIdAndJudgeIdAndCriterionId(submission.getId(), judge.getId(), criterion.getId())
                .orElse(new Score());
                
            if (score.isFinalized()) {
                throw new IllegalStateException("Scores for this submission have been finalized and cannot be changed.");
            }

            score.setSubmission(submission);
            score.setJudge(judge);
            score.setCriterion(criterion);
            score.setScoreValue(sc.getScoreValue());
            score.setComment(sc.getComment());
            score.setScoredAt(LocalDateTime.now());
            
            savedScores.add(scoreRepository.save(score));
        }

        return savedScores.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void finalizeScores(Long roundId) {
        auditLogService.logAction("FINALIZE_SCORES", "Round", roundId, null, "All scores for round " + roundId + " finalized.");
        scoreRepository.finalizeScoresByRound(roundId);
        log.info("Scores finalized successfully for round: {}", roundId);
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
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private ScoreResponse mapToResponse(Score score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .submissionId(score.getSubmission().getId())
                .judgeId(score.getJudge().getId())
                .criterionId(score.getCriterion().getId())
                .scoreValue(score.getScoreValue())
                .comment(score.getComment())
                .isFinalized(score.isFinalized())
                .scoredAt(score.getScoredAt())
                .build();
    }
}
