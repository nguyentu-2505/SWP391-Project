package com.example.swp.features.team_member.dto.request;

import lombok.Data;

@Data
public class AddTeamMemberRequest {
    private Long teamId;
    private Long userId;
    private boolean isLeader;

    public Long getTeamId() { return teamId; }
    public Long getUserId() { return userId; }
    public boolean isLeader() { return isLeader; }
}
