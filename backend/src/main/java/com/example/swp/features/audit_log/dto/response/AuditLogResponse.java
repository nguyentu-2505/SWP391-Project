package com.example.swp.features.audit_log.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String details;
    private LocalDateTime createdAt;
}
