package com.example.swp.features.round.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradingProgressDto {
    private Long judgeId;
    private String judgeName;
    private int assignedSubmissions;
    private int gradedSubmissions;
    private double progressPercentage;
}
