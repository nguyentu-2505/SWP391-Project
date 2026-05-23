package com.example.swp.features.judge_assignment;

import com.example.swp.features.judge_assignment.dto.AssignJudgeRequest;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JudgeAssignmentServiceImpl implements JudgeAssignmentService {

    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    @Override
    public void assignJudge(AssignJudgeRequest request) {
        User organizer = getCurrentUser();
        
        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new RuntimeException("Judge not found"));
        if (judge.getRole() != Role.JUDGE) {
            throw new IllegalArgumentException("The assigned user is not a judge.");
        }

        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (judgeAssignmentRepository.existsByJudgeIdAndSubmissionId(judge.getId(), submission.getId())) {
            throw new IllegalStateException("This judge is already assigned to this submission.");
        }

        JudgeAssignment assignment = JudgeAssignment.builder()
                .judge(judge)
                .submission(submission)
                .organizer(organizer)
                .build();
        
        judgeAssignmentRepository.save(assignment);
    }

    @Override
    public List<SubmissionResponse> getAssignedSubmissions() {
        User judge = getCurrentUser();
        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByJudgeId(judge.getId());

        return assignments.stream()
                .map(JudgeAssignment::getSubmission)
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private SubmissionResponse mapToSubmissionResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .teamId(submission.getTeam().getId())
                .roundId(submission.getRound().getId())
                .repositoryUrl(submission.getRepositoryUrl())
                .demoUrl(submission.getDemoUrl())
                .reportUrl(submission.getReportUrl())
                .version(submission.getVersion())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}