package com.example.swp.features.round.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateRoundRequest {
    @NotBlank(message = "Round name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Start time cannot be null")
    @FutureOrPresent(message = "Start time must be in the present or future")
    private LocalDateTime startTime;

    @NotNull(message = "End time cannot be null")
    private LocalDateTime endTime; // Additional validation for endTime > startTime will be in service layer

    @NotNull(message = "Hackathon Event ID cannot be null")
    private Long hackathonEventId;

    private Integer advancementSlots;

    public Long getHackathonEventId() { return hackathonEventId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public Integer getAdvancementSlots() { return advancementSlots; }
}
