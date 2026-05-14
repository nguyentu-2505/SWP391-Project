package com.example.swp.features.team;

import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TrackRepository trackRepository;

    @Override
    public TeamResponse createTeam(CreateTeamRequest request) {
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new RuntimeException("Track not found")); // Replace with custom exception

        Team newTeam = Team.builder()
                .name(request.getName())
                .projectName(request.getProjectName())
                .projectDescription(request.getProjectDescription())
                .track(track)
                .build();

        Team savedTeam = teamRepository.save(newTeam);
        return mapToResponse(savedTeam);
    }

    @Override
    public TeamResponse getTeamById(Long id) {
        return teamRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Team not found")); // Replace with custom exception
    }

    @Override
    public List<TeamResponse> getTeamsByTrack(Long trackId) {
        return teamRepository.findByTrackId(trackId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TeamResponse mapToResponse(Team team) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .projectName(team.getProjectName())
                .projectDescription(team.getProjectDescription())
                .trackId(team.getTrack().getId())
                .build();
    }
}
