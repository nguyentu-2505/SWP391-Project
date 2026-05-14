package com.example.swp.features.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findBySubmissionId(Long submissionId);
    List<Score> findByJudgeId(Long judgeId);
    List<Score> findBySubmissionIdAndJudgeId(Long submissionId, Long judgeId);
}
