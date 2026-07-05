package com.example.swp.features.score;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.example.swp.features.judge_assignment.JudgeAssignmentRepository;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.round.TeamRoundAdvancementRepository;
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
@SuppressWarnings("null")
public class ScoreServiceImpl implements ScoreService {

    private final ScoreRepository scoreRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final CriterionRepository criterionRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final TeamRoundAdvancementRepository advancementRepository;
    private final AuditLogService auditLogService;
    private final com.example.swp.features.round.RoundRepository roundRepository;

    @Override
    @Transactional
    public List<ScoreResponse> saveScores(CreateScoreRequest request) {
        User judge = getCurrentUser();
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        com.example.swp.features.hackathon_event.HackathonStatus eventStatus = submission.getRound().getHackathonEvent().getStatus();
        if (eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED || 
            eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot score or edit scores when the event is completed or cancelled.");
        }

        if (submission.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new IllegalStateException("Cannot score submissions from disqualified teams.");
        }

        Long roundId = submission.getRound().getId();
        Long trackId = submission.getTeam().getTrack() != null ? submission.getTeam().getTrack().getId() : null;

        boolean isAssignedToRound = judgeAssignmentRepository.existsByJudgeIdAndRoundIdAndTrackIdIsNull(judge.getId(), roundId);
        boolean isAssignedToTrack = trackId != null && judgeAssignmentRepository.existsByJudgeIdAndRoundIdAndTrackId(judge.getId(), roundId, trackId);

        if (!isAssignedToRound && !isAssignedToTrack) {
            throw new AccessDeniedException("You are not assigned to score submissions in this round/track.");
        }

        if (advancementRepository.existsByFromRoundId(submission.getRound().getId())) {
            throw new IllegalStateException("Scoring is frozen. Teams have already advanced from this round.");
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

        try {
            updateJudgeAssignmentStatus(judge, roundId);
        } catch (Exception e) {
            log.error("Failed to update judge assignment status: {}", e.getMessage());
        }

        if (!savedScores.isEmpty()) {
            auditLogService.logAction("SAVE_SCORES", "SCORE", submission.getId(), null, "Scores saved by judge " + judge.getUsername() + " for submission " + submission.getId(), submission.getRound().getHackathonEvent().getId());
        }

        return savedScores.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void updateJudgeAssignmentStatus(User judge, Long roundId) {
        List<com.example.swp.features.judge_assignment.JudgeAssignment> assignments =
                judgeAssignmentRepository.findByJudgeIdAndRoundId(judge.getId(), roundId);
        for (com.example.swp.features.judge_assignment.JudgeAssignment assignment : assignments) {
            if (assignment.getStatus() == com.example.swp.features.judge_assignment.JudgeAssignmentStatus.COMPLETED) {
                continue;
            }
            List<Submission> submissions = submissionRepository.findByRoundId(roundId);
            if (assignment.getTrack() != null) {
                submissions = submissions.stream()
                        .filter(s -> s.getTeam().getTrack() != null && s.getTeam().getTrack().getId().equals(assignment.getTrack().getId()))
                        .collect(Collectors.toList());
            }
            if (submissions.isEmpty()) continue;

            Long eventId = assignment.getRound().getHackathonEvent().getId();
            List<Criterion> criteria = criterionRepository.findByHackathonEventId(eventId);
            if (criteria.isEmpty()) continue;

            boolean allScored = true;
            for (Submission sub : submissions) {
                if (sub.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
                    continue;
                }
                for (Criterion crit : criteria) {
                    boolean hasScore = scoreRepository.findBySubmissionIdAndJudgeIdAndCriterionId(sub.getId(), judge.getId(), crit.getId()).isPresent();
                    if (!hasScore) {
                        allScored = false;
                        break;
                    }
                }
                if (!allScored) break;
            }

            if (allScored) {
                assignment.setStatus(com.example.swp.features.judge_assignment.JudgeAssignmentStatus.COMPLETED);
                judgeAssignmentRepository.save(assignment);
            }
        }
    }

    @Override
    @Transactional
    public void finalizeScores(Long roundId) {
        com.example.swp.features.round.Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found"));
        com.example.swp.features.hackathon_event.HackathonStatus eventStatus = round.getHackathonEvent().getStatus();
        if (eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED || 
            eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot finalize scores when the event is completed or cancelled.");
        }

        auditLogService.logAction("FINALIZE_SCORES", "Round", roundId, null, "All scores for round " + roundId + " finalized.", round.getHackathonEvent().getId());
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

    @Override
    public List<ScoreResponse> getMyScoresForRound(Long roundId) {
        User judge = getCurrentUser();
        return scoreRepository.findByRoundIdAndJudgeId(roundId, judge.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScoreResponse updateScore(Long scoreId, com.example.swp.features.score.dto.request.UpdateScoreRequest request) {
        User judge = getCurrentUser();

        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Score not found"));

        com.example.swp.features.hackathon_event.HackathonStatus eventStatus = score.getSubmission().getRound().getHackathonEvent().getStatus();
        if (eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED || 
            eventStatus == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot score or edit scores when the event is completed or cancelled.");
        }

        if (!score.getJudge().getId().equals(judge.getId())) {
            boolean isAdmin = judge.getRole() == com.example.swp.features.user.Role.ADMIN || judge.getRole() == com.example.swp.features.user.Role.ORGANIZER;
            if (!isAdmin) {
                throw new AccessDeniedException("You can only edit your own scores.");
            }
        }

        if (score.isFinalized()) {
            throw new IllegalStateException("Round is finalized. Cannot edit score.");
        }

        Criterion criterion = score.getCriterion();
        if (request.getScoreValue() != null) {
            if (request.getScoreValue() < 0 || request.getScoreValue() > criterion.getMaxScore()) {
                throw new IllegalArgumentException(
                    "Score for criterion '" + criterion.getName() + "' must be between 0 and " + criterion.getMaxScore()
                );
            }
            score.setScoreValue(request.getScoreValue());
        }

        if (request.getComment() != null) {
            score.setComment(request.getComment());
        }

        score.setScoredAt(LocalDateTime.now());
        Score updatedScore = scoreRepository.save(score);

        auditLogService.logAction("UPDATE_SCORE", "SCORE", score.getId(), null, "Score updated by " + judge.getUsername(), score.getSubmission().getRound().getHackathonEvent().getId());

        return mapToResponse(updatedScore);
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
