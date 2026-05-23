package com.example.swp.features.team;

import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request);
    TeamResponse getTeamById(Long id);
    List<TeamResponse> getTeamsByEvent(Long eventId);
    TeamResponse getMyTeamForEvent(Long eventId);
}
