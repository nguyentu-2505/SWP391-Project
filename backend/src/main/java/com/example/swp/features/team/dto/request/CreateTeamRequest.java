package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTeamRequest {
    @NotBlank(message = "Team name cannot be empty")
    private String name;

    private String projectName;
    private String projectDescription;

    @NotNull(message = "Track ID cannot be null")
    private Long trackId;
}
