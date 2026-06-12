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

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static AuditLogBuilder builder() { return new AuditLogBuilder(); }
    public static class AuditLogBuilder {
        private User user;
        private String action;
        private String details;

        public AuditLogBuilder user(User user) { this.user = user; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder details(String details) { this.details = details; return this; }

        public AuditLog build() {
            AuditLog al = new AuditLog();
            al.user = this.user;
            al.action = this.action;
            al.details = this.details;
            return al;
        }
    }
}
