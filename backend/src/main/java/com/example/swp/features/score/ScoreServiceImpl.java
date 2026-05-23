package com.example.swp.features.score;

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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final JudgeAssignmentRepository judgeAssignmentRepository;

    @Override
    @Transactional
    public List<ScoreResponse> saveScores(CreateScoreRequest request) {
        User judge = getCurrentUser();
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Security Check: Ensure the judge is assigned to this submission
        if (!judgeAssignmentRepository.existsByJudgeIdAndSubmissionId(judge.getId(), submission.getId())) {
            throw new AccessDeniedException("You are not assigned to score this submission.");
        }
        
        // Optional: Add a check to see if scoring is locked by the organizer
        // This would require a new field in the hackathon_event or round table.

        List<Score> savedScores = new ArrayList<>();
        for (CreateScoreRequest.ScoreCriterion sc : request.getScores()) {
            Criterion criterion = criterionRepository.findById(sc.getCriterionId())
                    .orElseThrow(() -> new RuntimeException("Criterion not found: " + sc.getCriterionId()));

            // Find existing score or create a new one
            Score score = scoreRepository.findBySubmissionIdAndJudgeIdAndCriterionId(submission.getId(), judge.getId(), criterion.getId())
                .orElse(new Score());

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
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
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