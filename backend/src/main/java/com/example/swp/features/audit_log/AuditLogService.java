package com.example.swp.features.audit_log;

import com.example.swp.features.audit_log.dto.request.CreateAuditLogRequest;
import com.example.swp.features.audit_log.dto.response.AuditLogResponse;

import java.util.List;

public interface AuditLogService {
    AuditLogResponse createAuditLog(CreateAuditLogRequest request);
    List<AuditLogResponse> getAllAuditLogs();
    List<AuditLogResponse> getAuditLogsByUser(Long userId);
    void logAction(String action, String entityType, Long entityId, String oldValue, String newValue);
}
