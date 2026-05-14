package com.example.swp.features.round;

import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rounds")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<RoundResponse> createRound(@Valid @RequestBody CreateRoundRequest request) {
        RoundResponse response = roundService.createRound(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/hackathon/{hackathonEventId}")
    public ResponseEntity<List<RoundResponse>> getRoundsByHackathonEvent(@PathVariable Long hackathonEventId) {
        List<RoundResponse> responses = roundService.getRoundsByHackathonEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }
}
