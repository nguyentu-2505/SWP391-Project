package com.example.swp.features.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findBySubmissionId(Long submissionId);
    List<Score> findByJudgeId(Long judgeId);
    List<Score> findBySubmissionIdAndJudgeId(Long submissionId, Long judgeId);
    Optional<Score> findBySubmissionIdAndJudgeIdAndCriterionId(Long submissionId, Long judgeId, Long criterionId);
}