package com.example.swp.features.prize.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePrizeRequest {
    @NotBlank(message = "Prize name cannot be empty")
    private String name;
    private String description;
    
    @NotNull(message = "Hackathon event ID cannot be null")
    private Long hackathonEventId;
    private Long trackId; // Optional

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Long getHackathonEventId() { return hackathonEventId; }
    public Long getTrackId() { return trackId; }
}
