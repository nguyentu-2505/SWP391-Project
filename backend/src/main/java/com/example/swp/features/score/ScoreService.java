package com.example.swp.features.score;

import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;

import java.util.List;

public interface ScoreService {
    List<ScoreResponse> saveScores(CreateScoreRequest request);
    List<ScoreResponse> getScoresForSubmission(Long submissionId);
    List<ScoreResponse> getScoresForSubmissionByJudge(Long submissionId, Long judgeId);
}
