package com.example.swp.features.team_member.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamMemberResponse {
    private Long id;
    private Long teamId;
    private Long userId;
    private String username; // To show user's name in response
    private boolean isLeader;
}
