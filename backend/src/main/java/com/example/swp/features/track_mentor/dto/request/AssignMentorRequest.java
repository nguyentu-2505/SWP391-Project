package com.example.swp.features.track_mentor.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignMentorRequest {
    @NotNull(message = "Track ID cannot be null")
    private Long trackId;

    @NotNull(message = "Mentor ID cannot be null")
    private Long mentorId;
}
