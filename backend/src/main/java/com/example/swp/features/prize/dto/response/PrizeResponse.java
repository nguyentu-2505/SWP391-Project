package com.example.swp.features.prize.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrizeResponse {
    private Long id;
    private String name;
    private String description;
    private Long hackathonEventId;
    private Long trackId;
    private Long winningTeamId;
    private String winningTeamName;
}
