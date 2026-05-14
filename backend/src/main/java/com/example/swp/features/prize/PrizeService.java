package com.example.swp.features.prize;

import com.example.swp.features.prize.dto.request.AssignPrizeRequest;
import com.example.swp.features.prize.dto.request.CreatePrizeRequest;
import com.example.swp.features.prize.dto.response.PrizeResponse;

import java.util.List;

public interface PrizeService {
    PrizeResponse createPrize(CreatePrizeRequest request);
    PrizeResponse assignPrizeToTeam(Long prizeId, AssignPrizeRequest request);
    List<PrizeResponse> getPrizesByEvent(Long hackathonEventId);
}
