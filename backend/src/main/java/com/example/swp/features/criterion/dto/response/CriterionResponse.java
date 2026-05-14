package com.example.swp.features.criterion.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CriterionResponse {
    private Long id;
    private String name;
    private String description;
    private int weight;
    private Long hackathonEventId;
    private boolean isDefault;
}
