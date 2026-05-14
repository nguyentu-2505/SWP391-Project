package com.example.swp.features.team.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamResponse {
    private Long id;
    private String name;
    private String projectName;
    private String projectDescription;
    private Long trackId;
}
