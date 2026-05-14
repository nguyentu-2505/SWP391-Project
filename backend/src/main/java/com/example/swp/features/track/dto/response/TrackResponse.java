package com.example.swp.features.track.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrackResponse {
    private Long id;
    private String name;
    private String description;
    private Long hackathonEventId;
}
