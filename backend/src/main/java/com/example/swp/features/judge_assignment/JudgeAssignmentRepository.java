package com.example.swp.features.judge_assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Long> {
    List<JudgeAssignment> findByJudgeId(Long judgeId);
    boolean existsByJudgeIdAndSubmissionId(Long judgeId, Long submissionId);
}