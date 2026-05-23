package com.example.swp.features.judge_assignment;

import com.example.swp.features.submission.Submission;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "judge_assignment")
public class JudgeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_organizer_id")
    private User organizer;

    @Enumerated(EnumType.STRING)
    private JudgeAssignmentStatus status = JudgeAssignmentStatus.ASSIGNED;

    private java.time.LocalDateTime assignedAt;

    public Long getId() { return id; }
    public User getJudge() { return judge; }
    public Submission getSubmission() { return submission; }
    public JudgeAssignmentStatus getStatus() { return status; }
    public java.time.LocalDateTime getAssignedAt() { return assignedAt; }

    public static JudgeAssignmentBuilder builder() { return new JudgeAssignmentBuilder(); }
    public static class JudgeAssignmentBuilder {
        private Long id;
        private User judge;
        private Submission submission;
        private User organizer;
        private JudgeAssignmentStatus status;
        private java.time.LocalDateTime assignedAt;

        public JudgeAssignmentBuilder id(Long id) { this.id = id; return this; }
        public JudgeAssignmentBuilder judge(User judge) { this.judge = judge; return this; }
        public JudgeAssignmentBuilder submission(Submission submission) { this.submission = submission; return this; }
        public JudgeAssignmentBuilder organizer(User organizer) { this.organizer = organizer; return this; }
        public JudgeAssignmentBuilder status(JudgeAssignmentStatus status) { this.status = status; return this; }
        public JudgeAssignmentBuilder assignedAt(java.time.LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public JudgeAssignment build() {
            JudgeAssignment j = new JudgeAssignment();
            j.id = this.id; j.judge = this.judge; j.submission = this.submission;
            j.organizer = this.organizer; j.status = this.status; j.assignedAt = this.assignedAt;
            return j;
        }
    }
}