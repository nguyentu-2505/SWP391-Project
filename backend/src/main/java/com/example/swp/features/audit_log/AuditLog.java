package com.example.swp.features.audit_log;

import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action; // e.g., "DELETE_SUBMISSION", "APPROVE_USER"

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // e.g., "User 'admin' deleted submission with ID 123 for reason: 'Plagiarism'"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }

    public static AuditLogBuilder builder() { return new AuditLogBuilder(); }
    public static class AuditLogBuilder {
        private User user;
        private String action;
        private String details;
        private String entityType;
        private Long entityId;
        private String oldValue;
        private String newValue;

        public AuditLogBuilder user(User user) { this.user = user; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder details(String details) { this.details = details; return this; }
        public AuditLogBuilder entityType(String entityType) { this.entityType = entityType; return this; }
        public AuditLogBuilder entityId(Long entityId) { this.entityId = entityId; return this; }
        public AuditLogBuilder oldValue(String oldValue) { this.oldValue = oldValue; return this; }
        public AuditLogBuilder newValue(String newValue) { this.newValue = newValue; return this; }

        public AuditLog build() {
            AuditLog al = new AuditLog();
            al.user = this.user;
            al.action = this.action;
            al.details = this.details;
            al.entityType = this.entityType;
            al.entityId = this.entityId;
            al.oldValue = this.oldValue;
            al.newValue = this.newValue;
            return al;
        }
    }
}
