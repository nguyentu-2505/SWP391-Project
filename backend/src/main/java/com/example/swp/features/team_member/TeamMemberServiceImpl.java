package com.example.swp.features.team_member;

import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.team_member.dto.request.AddTeamMemberRequest;
import com.example.swp.features.team_member.dto.response.TeamMemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Override
    public TeamMemberResponse addTeamMember(AddTeamMemberRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already in the team
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId())) {
            throw new IllegalStateException("User is already a member of this team.");
        }

        // Check team size limit
        long currentSize = teamMemberRepository.countByTeamId(team.getId());
        if (currentSize >= 5) {
            throw new IllegalStateException("Team is full. Cannot add more than 5 members.");
        }

        // TODO: Add more validation logic (e.g., check if user is already in another team for this event)

        TeamMember newTeamMember = TeamMember.builder()
                .team(team)
                .user(user)
                .isLeader(request.isLeader())
                .build();

        TeamMember savedTeamMember = teamMemberRepository.save(newTeamMember);
        return mapToResponse(savedTeamMember);
    }

    @Override
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void removeTeamMember(Long teamMemberId) {
        // TODO: Add validation to ensure the person removing has permission (e.g., is a team leader or an admin)
        // TODO: Add logic to handle minimum team size (e.g., cannot remove if size becomes < 3)
        teamMemberRepository.deleteById(teamMemberId);
    }

    private TeamMemberResponse mapToResponse(TeamMember teamMember) {
        return TeamMemberResponse.builder()
                .id(teamMember.getId())
                .teamId(teamMember.getTeam().getId())
                .userId(teamMember.getUser().getId())
                .username(teamMember.getUser().getUsername())
                .isLeader(teamMember.isLeader())
                .build();
    }
}
