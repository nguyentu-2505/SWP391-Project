package com.example.swp.features.recruitment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRecruitmentPostRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotBlank(message = "Post type is required")
    private String type; // "LOOKING_FOR_TEAM" or "LOOKING_FOR_MEMBERS"

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private Long teamId; // Optional
}
