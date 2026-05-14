package com.example.swp.features.hackathon_event;

import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hackathon-events")
@RequiredArgsConstructor
public class HackathonEventController {

    private final HackathonEventService hackathonEventService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<HackathonEventResponse> createHackathonEvent(@Valid @RequestBody CreateHackathonEventRequest request) {
        HackathonEventResponse response = hackathonEventService.createHackathonEvent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HackathonEventResponse>> getAllHackathonEvents() {
        List<HackathonEventResponse> responses = hackathonEventService.getAllHackathonEvents();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<HackathonEventResponse> getHackathonEventBySlug(@PathVariable String slug) {
        HackathonEventResponse response = hackathonEventService.getHackathonEventBySlug(slug);
        return ResponseEntity.ok(response);
    }
}
