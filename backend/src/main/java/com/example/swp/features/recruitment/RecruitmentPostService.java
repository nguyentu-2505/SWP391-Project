package com.example.swp.features.recruitment;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecruitmentPostService {

    private final RecruitmentPostRepository postRepository;
    private final HackathonEventRepository eventRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public RecruitmentPostResponse createPost(CreateRecruitmentPostRequest request) {
        User currentUser = getCurrentUser();
        HackathonEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (event.isDeleted()) {
            throw new ResourceNotFoundException("Hackathon event not found");
        }

        Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            
            // Check if user belongs to the team
            boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), currentUser.getId());
            if (!isMember) {
                throw new AccessDeniedException("You are not a member of this team");
            }
        }

        RecruitmentPost post = RecruitmentPost.builder()
                .event(event)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .user(currentUser)
                .team(team)
                .build();

        RecruitmentPost saved = postRepository.save(post);
        auditLogService.logAction(
                "CREATE_RECRUITMENT_POST",
                "RECRUITMENT_POST",
                saved.getId(),
                null,
                "Created recruitment post: " + saved.getTitle(),
                event.getId()
        );

        return mapToResponse(saved);
    }

    public List<RecruitmentPostResponse> getPostsByEvent(Long eventId) {
        return postRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long id) {
        User currentUser = getCurrentUser();
        RecruitmentPost post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment post not found"));

        boolean isOwner = post.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name()) || "ORGANIZER".equals(currentUser.getRole().name());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
        auditLogService.logAction(
                "DELETE_RECRUITMENT_POST",
                "RECRUITMENT_POST",
                id,
                null,
                "Deleted recruitment post id=" + id,
                post.getEvent().getId()
        );
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private RecruitmentPostResponse mapToResponse(RecruitmentPost post) {
        return RecruitmentPostResponse.builder()
                .id(post.getId())
                .type(post.getType())
                .title(post.getTitle())
                .content(post.getContent())
                .userId(post.getUser().getId())
                .username(post.getUser().getFullName() != null && !post.getUser().getFullName().trim().isEmpty() ? post.getUser().getFullName() : post.getUser().getUsername())
                .userEmail(post.getUser().getEmail())
                .teamId(post.getTeam() != null ? post.getTeam().getId() : null)
                .teamName(post.getTeam() != null ? post.getTeam().getName() : null)
                .eventId(post.getEvent().getId())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
