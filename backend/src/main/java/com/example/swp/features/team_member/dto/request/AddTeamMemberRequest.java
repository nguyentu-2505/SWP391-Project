package com.example.swp.features.team_member.dto.request;

import lombok.Data;

@Data
public class AddTeamMemberRequest {
    private Long teamId;
    private Long userId;
    private boolean isLeader;
}
