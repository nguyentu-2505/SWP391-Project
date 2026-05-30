package com.example.swp.features.judge_assignment.dto.response;

import com.example.swp.features.judge_assignment.JudgeAssignmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeAssignmentResponse {
    private Long id;
    private Long judgeId;
    private String judgeName;
    private Long submissionId;
    private String teamName;
    private String roundName;
    private JudgeAssignmentStatus status;
    private LocalDateTime assignedAt;

    public static JudgeAssignmentResponseBuilder builder() { return new JudgeAssignmentResponseBuilder(); }
    public static class JudgeAssignmentResponseBuilder {
        private Long id;
        private Long judgeId;
        private String judgeName;
        private Long submissionId;
        private String teamName;
        private String roundName;
        private JudgeAssignmentStatus status;
        private LocalDateTime assignedAt;

        public JudgeAssignmentResponseBuilder id(Long id) { this.id = id; return this; }
        public JudgeAssignmentResponseBuilder judgeId(Long judgeId) { this.judgeId = judgeId; return this; }
        public JudgeAssignmentResponseBuilder judgeName(String judgeName) { this.judgeName = judgeName; return this; }
        public JudgeAssignmentResponseBuilder submissionId(Long submissionId) { this.submissionId = submissionId; return this; }
        public JudgeAssignmentResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public JudgeAssignmentResponseBuilder roundName(String roundName) { this.roundName = roundName; return this; }
        public JudgeAssignmentResponseBuilder status(JudgeAssignmentStatus status) { this.status = status; return this; }
        public JudgeAssignmentResponseBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public JudgeAssignmentResponse build() {
            JudgeAssignmentResponse j = new JudgeAssignmentResponse();
            j.id = this.id; j.judgeId = this.judgeId; j.judgeName = this.judgeName;
            j.submissionId = this.submissionId; j.teamName = this.teamName;
            j.roundName = this.roundName; j.status = this.status;
            j.assignedAt = this.assignedAt;
            return j;
        }
    }
}

