package com.example.swp.features.prize;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.prize.dto.request.AssignPrizeRequest;
import com.example.swp.features.prize.dto.request.CreatePrizeRequest;
import com.example.swp.features.prize.dto.response.PrizeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeRepository prizeRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;

    @Override
    public PrizeResponse createPrize(CreatePrizeRequest request) {
        HackathonEvent event = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new RuntimeException("Hackathon event not found"));

        Track track = null;
        if (request.getTrackId() != null) {
            track = trackRepository.findById(request.getTrackId())
                    .orElseThrow(() -> new RuntimeException("Track not found"));
        }

        Prize newPrize = Prize.builder()
                .name(request.getName())
                .description(request.getDescription())
                .hackathonEvent(event)
                .track(track)
                .build();

        Prize savedPrize = prizeRepository.save(newPrize);
        return mapToResponse(savedPrize);
    }

    @Override
    public PrizeResponse assignPrizeToTeam(Long prizeId, AssignPrizeRequest request) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> new RuntimeException("Prize not found"));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        prize.setWinningTeam(team);
        Prize updatedPrize = prizeRepository.save(prize);
        return mapToResponse(updatedPrize);
    }

    @Override
    public List<PrizeResponse> getPrizesByEvent(Long hackathonEventId) {
        return prizeRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PrizeResponse mapToResponse(Prize prize) {
        return PrizeResponse.builder()
                .id(prize.getId())
                .name(prize.getName())
                .description(prize.getDescription())
                .hackathonEventId(prize.getHackathonEvent().getId())
                .trackId(prize.getTrack() != null ? prize.getTrack().getId() : null)
                .winningTeamId(prize.getWinningTeam() != null ? prize.getWinningTeam().getId() : null)
                .winningTeamName(prize.getWinningTeam() != null ? prize.getWinningTeam().getName() : null)
                .build();
    }
}
