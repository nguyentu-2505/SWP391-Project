package com.example.swp.features.track;

import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tracks")
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<TrackResponse> createTrack(@Valid @RequestBody CreateTrackRequest request) {
        TrackResponse response = trackService.createTrack(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/hackathon/{hackathonEventId}")
    public ResponseEntity<List<TrackResponse>> getTracksByHackathonEvent(@PathVariable Long hackathonEventId) {
        List<TrackResponse> responses = trackService.getTracksByHackathonEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }
}
