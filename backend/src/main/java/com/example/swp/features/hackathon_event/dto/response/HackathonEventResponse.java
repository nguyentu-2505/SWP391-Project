package com.example.swp.features.hackathon_event.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HackathonEventResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String imageUrl;
}
