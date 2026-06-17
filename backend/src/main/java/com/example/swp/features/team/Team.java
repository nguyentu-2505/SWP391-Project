package com.example.swp.features.team;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.track.Track;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "team", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "event_id"})
})
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TeamStatus status = TeamStatus.ACTIVE;

    @Column(name = "disqualification_reason", columnDefinition = "NVARCHAR(MAX)")
    private String disqualificationReason;

    @Column(name = "disqualified_at")
    private LocalDateTime disqualifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disqualified_by")
    private User disqualifiedBy;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    @Column(name = "final_score", precision = 10, scale = 4)
    private java.math.BigDecimal finalScore;

    @CreationTimestamp
    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getProjectName() { return projectName; }
    public String getProjectDescription() { return projectDescription; }
    public Track getTrack() { return track; }
    public HackathonEvent getEvent() { return event; }
    public TeamStatus getStatus() { return status; }
    public String getDisqualificationReason() { return disqualificationReason; }
    public LocalDateTime getDisqualifiedAt() { return disqualifiedAt; }
    public User getDisqualifiedBy() { return disqualifiedBy; }
    public List<TeamMember> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMember> teamMembers) { this.teamMembers = teamMembers; }
    public java.math.BigDecimal getFinalScore() { return finalScore; }
    public void setFinalScore(java.math.BigDecimal finalScore) { this.finalScore = finalScore; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static TeamBuilder builder() { return new TeamBuilder(); }
    public static class TeamBuilder {
        private Long id;
        private String name;
        private String projectName;
        private String projectDescription;
        private Track track;
        private HackathonEvent event;
        private TeamStatus status;
        private String disqualificationReason;
        private LocalDateTime disqualifiedAt;
        private User disqualifiedBy;
        private List<TeamMember> teamMembers;
        private java.math.BigDecimal finalScore;
        private LocalDateTime createdAt;

        public TeamBuilder id(Long id) { this.id = id; return this; }
        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public TeamBuilder projectDescription(String projectDescription) { this.projectDescription = projectDescription; return this; }
        public TeamBuilder track(Track track) { this.track = track; return this; }
        public TeamBuilder event(HackathonEvent event) { this.event = event; return this; }
        public TeamBuilder status(TeamStatus status) { this.status = status; return this; }
        public TeamBuilder disqualificationReason(String disqualificationReason) { this.disqualificationReason = disqualificationReason; return this; }
        public TeamBuilder disqualifiedAt(LocalDateTime disqualifiedAt) { this.disqualifiedAt = disqualifiedAt; return this; }
        public TeamBuilder disqualifiedBy(User disqualifiedBy) { this.disqualifiedBy = disqualifiedBy; return this; }
        public TeamBuilder teamMembers(List<TeamMember> teamMembers) { this.teamMembers = teamMembers; return this; }
        public TeamBuilder finalScore(java.math.BigDecimal finalScore) { this.finalScore = finalScore; return this; }
        public TeamBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        
        public Team build() {
            Team t = new Team();
            t.id = this.id; t.name = this.name; t.projectName = this.projectName;
            t.projectDescription = this.projectDescription; t.track = this.track;
            t.event = this.event; t.status = this.status; t.teamMembers = this.teamMembers;
            t.disqualificationReason = this.disqualificationReason;
            t.disqualifiedAt = this.disqualifiedAt;
            t.disqualifiedBy = this.disqualifiedBy;
            t.finalScore = this.finalScore;
            t.createdAt = this.createdAt;
            return t;
        }
    }
}
