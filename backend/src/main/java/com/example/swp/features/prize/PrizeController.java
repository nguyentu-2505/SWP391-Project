package com.example.swp.features.prize;

import com.example.swp.features.prize.dto.request.AssignPrizeRequest;
import com.example.swp.features.prize.dto.request.CreatePrizeRequest;
import com.example.swp.features.prize.dto.response.PrizeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prizes")
@RequiredArgsConstructor
public class PrizeController {

    private final PrizeService prizeService;

    @PostMapping
    public ResponseEntity<PrizeResponse> createPrize(@RequestBody CreatePrizeRequest request) {
        PrizeResponse response = prizeService.createPrize(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{prizeId}/assign")
    public ResponseEntity<PrizeResponse> assignPrizeToTeam(@PathVariable Long prizeId, @RequestBody AssignPrizeRequest request) {
        PrizeResponse response = prizeService.assignPrizeToTeam(prizeId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{hackathonEventId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEvent(@PathVariable Long hackathonEventId) {
        List<PrizeResponse> responses = prizeService.getPrizesByEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }
}
