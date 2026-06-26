package com.example.swp.features.track_mentor.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrackMentorResponse {
    private Long id;
    private Long trackId;
    private String trackName;
    private Long mentorId;
    private String mentorName;
    private Long eventId;
    private String eventName;
    private Long assignedById;
    private String assignedByName;
    private LocalDateTime assignedAt;
}
