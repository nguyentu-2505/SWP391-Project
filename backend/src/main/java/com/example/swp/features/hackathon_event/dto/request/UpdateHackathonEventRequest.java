package com.example.swp.features.hackathon_event.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateHackathonEventRequest {
    @NotBlank(message = "Hackathon event name cannot be empty")
    private String name;

    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String imageUrl;
}
