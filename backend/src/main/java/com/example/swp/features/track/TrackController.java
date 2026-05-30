package com.example.swp.features.track;

import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackMentorResponse;
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

    // ── Existing endpoints – UNCHANGED ────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<TrackResponse> createTrack(@Valid @RequestBody CreateTrackRequest request) {
        TrackResponse response = trackService.createTrack(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/hackathon/{hackathonEventId}")
    public ResponseEntity<List<TrackResponse>> getTracksByHackathonEvent(@PathVariable Long hackathonEventId) {
        List<TrackResponse> responses = trackService.getTracksByHackathonEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }

    // ── Track-Mentor assignment endpoints (Phase 1) ───────────────────────────

    /**
     * Assign a mentor/internal-judge to a track.
     * This creates the record used for conflict-of-interest validation.
     */
    @PostMapping("/{trackId}/mentors/{mentorUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<TrackMentorResponse> assignMentor(
            @PathVariable Long trackId,
            @PathVariable Long mentorUserId) {
        TrackMentorResponse response = trackService.assignMentor(trackId, mentorUserId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Remove a mentor from a track.
     */
    @DeleteMapping("/{trackId}/mentors/{mentorUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Void> removeMentor(
            @PathVariable Long trackId,
            @PathVariable Long mentorUserId) {
        trackService.removeMentor(trackId, mentorUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * List all mentors assigned to a track.
     */
    @GetMapping("/{trackId}/mentors")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<List<TrackMentorResponse>> getMentorsByTrack(@PathVariable Long trackId) {
        List<TrackMentorResponse> responses = trackService.getMentorsByTrack(trackId);
        return ResponseEntity.ok(responses);
    }
}