package com.example.swp.features.audit_log;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.dto.request.CreateAuditLogRequest;
import com.example.swp.features.audit_log.dto.response.AuditLogResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public AuditLogResponse createAuditLog(CreateAuditLogRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .details(details)
                .build();
        
        AuditLog savedLog = auditLogRepository.save(auditLog);
        return mapToResponse(savedLog);
    }

    @Override
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public void logAction(String action, String entityType, Long entityId, String oldValue, String newValue) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null); // Can be null for system actions

        String details = String.format("Entity: %s, ID: %d", entityType, entityId);
        if (oldValue != null) details += ", Old: " + oldValue;
        if (newValue != null) details += ", New: " + newValue;

        AuditLog auditLog = AuditLog.builder()
                .user(currentUser)
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUser() != null ? auditLog.getUser().getId() : null)
                .username(auditLog.getUser() != null ? auditLog.getUser().getUsername() : "SYSTEM")
                .action(auditLog.getAction())
                .details(auditLog.getDetails())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
