package com.example.swp.features.ranking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body khi Admin/Organizer muốn override thứ hạng của 1 đội.
 * reason là bắt buộc — sẽ được ghi vào Audit Log.
 */
@Data
public class RankOverrideRequest {

    @NotNull(message = "teamId is required")
    private Long teamId;

    @Min(value = 1, message = "Override rank must be at least 1")
    private int overrideRank;

    @NotBlank(message = "Reason is required — must explain why rank is being manually adjusted")
    private String reason;
}
