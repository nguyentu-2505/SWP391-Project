package com.example.swp.features.track;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final HackathonEventRepository hackathonEventRepository;

    @Override
    public TrackResponse createTrack(CreateTrackRequest request) {
        HackathonEvent hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new RuntimeException("Hackathon event not found")); // Replace with custom exception

        Track newTrack = Track.builder()
                .name(request.getName())
                .description(request.getDescription())
                .hackathonEvent(hackathonEvent)
                .build();

        Track savedTrack = trackRepository.save(newTrack);
        return mapToResponse(savedTrack);
    }

    @Override
    public List<TrackResponse> getTracksByHackathonEvent(Long hackathonEventId) {
        return trackRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TrackResponse mapToResponse(Track track) {
        return TrackResponse.builder()
                .id(track.getId())
                .name(track.getName())
                .description(track.getDescription())
                .hackathonEventId(track.getHackathonEvent().getId())
                .build();
    }
}
