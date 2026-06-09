package com.example.swp.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long activeTeams;
    private long submissionsReceived;
    private long pendingReviews;
    private long daysRemaining;
}
