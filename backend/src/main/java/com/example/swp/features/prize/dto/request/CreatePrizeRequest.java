package com.example.swp.features.prize.dto.request;

import lombok.Data;

@Data
public class CreatePrizeRequest {
    private String name;
    private String description;
    private Long hackathonEventId;
    private Long trackId; // Optional
}
