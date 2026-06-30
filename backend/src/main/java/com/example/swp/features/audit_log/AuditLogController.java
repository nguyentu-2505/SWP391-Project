package com.example.swp.features.audit_log;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.audit_log.dto.response.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAllAuditLogs() {
        List<AuditLogResponse> responses = auditLogService.getAllAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByUser(@PathVariable Long userId) {
        List<AuditLogResponse> responses = auditLogService.getAuditLogsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByEvent(@PathVariable Long eventId) {
        List<AuditLogResponse> responses = auditLogService.getAuditLogsByEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}