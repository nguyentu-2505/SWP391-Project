package com.example.swp.features.prize.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdatePrizeRequest {
    private String name;
    private String description;
    @jakarta.validation.constraints.NotNull(message = "Hackathon event ID cannot be null")
    private Long hackathonEventId;
    private Long trackId;
    @Min(value = 1, message = "Rank must be at least 1")
    private Integer rank;

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Long getHackathonEventId() { return hackathonEventId; }
    public Long getTrackId() { return trackId; }
    public Integer getRank() { return rank; }
}
