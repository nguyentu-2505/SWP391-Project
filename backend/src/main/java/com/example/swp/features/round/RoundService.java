package com.example.swp.features.round;

import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;

import java.util.List;

public interface RoundService {
    RoundResponse createRound(CreateRoundRequest request);
    List<RoundResponse> getRoundsByHackathonEvent(Long hackathonEventId);
}
