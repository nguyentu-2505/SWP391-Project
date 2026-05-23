package com.example.swp.features.team;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.track.Track;
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

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    @CreationTimestamp
    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getProjectName() { return projectName; }
    public String getProjectDescription() { return projectDescription; }
    public Track getTrack() { return track; }
    public HackathonEvent getEvent() { return event; }
    public TeamStatus getStatus() { return status; }
    public List<TeamMember> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMember> teamMembers) { this.teamMembers = teamMembers; }
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
        private List<TeamMember> teamMembers;
        private LocalDateTime createdAt;

        public TeamBuilder id(Long id) { this.id = id; return this; }
        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public TeamBuilder projectDescription(String projectDescription) { this.projectDescription = projectDescription; return this; }
        public TeamBuilder track(Track track) { this.track = track; return this; }
        public TeamBuilder event(HackathonEvent event) { this.event = event; return this; }
        public TeamBuilder status(TeamStatus status) { this.status = status; return this; }
        public TeamBuilder teamMembers(List<TeamMember> teamMembers) { this.teamMembers = teamMembers; return this; }
        public TeamBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        
        public Team build() {
            Team t = new Team();
            t.id = this.id; t.name = this.name; t.projectName = this.projectName;
            t.projectDescription = this.projectDescription; t.track = this.track;
            t.event = this.event; t.status = this.status; t.teamMembers = this.teamMembers;
            t.createdAt = this.createdAt;
            return t;
        }
    }
}
