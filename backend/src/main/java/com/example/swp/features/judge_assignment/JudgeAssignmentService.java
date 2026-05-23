package com.example.swp.features.judge_assignment;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.judge_assignment.dto.request.AssignJudgeRequest;
import com.example.swp.features.judge_assignment.dto.response.JudgeAssignmentResponse;
import com.example.swp.features.submission.Submission;
import com.example.swp.features.submission.SubmissionRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JudgeAssignmentService {

    private final JudgeAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    public JudgeAssignmentResponse assignJudge(AssignJudgeRequest request) {
        User judge = userRepository.findById(request.getJudgeId())
                .orElseThrow(() -> new ResourceNotFoundException("Judge not found"));
        if (judge.getRole() != Role.JUDGE) {
            throw new IllegalArgumentException("User is not a judge.");
        }
        
        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (assignmentRepository.existsByJudgeIdAndSubmissionId(judge.getId(), submission.getId())) {
            throw new IllegalStateException("Judge is already assigned to this submission.");
        }

        User assigner = getCurrentUser();

        JudgeAssignment assignment = JudgeAssignment.builder()
                .judge(judge)
                .submission(submission)
                .organizer(assigner)
                .build();
        
        JudgeAssignment savedAssignment = assignmentRepository.save(assignment);
        return mapToResponse(savedAssignment);
    }

    public List<JudgeAssignmentResponse> getAssignmentsForJudge(Long judgeId) {
        return assignmentRepository.findByJudgeId(judgeId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<JudgeAssignmentResponse> getMyAssignments() {
        User currentUser = getCurrentUser();
        return getAssignmentsForJudge(currentUser.getId());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private JudgeAssignmentResponse mapToResponse(JudgeAssignment assignment) {
        Submission submission = assignment.getSubmission();
        return JudgeAssignmentResponse.builder()
                .id(assignment.getId())
                .judgeId(assignment.getJudge().getId())
                .judgeName(assignment.getJudge().getUsername())
                .submissionId(submission.getId())
                .teamName(submission.getTeam().getName())
                .roundName(submission.getRound().getName())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}
