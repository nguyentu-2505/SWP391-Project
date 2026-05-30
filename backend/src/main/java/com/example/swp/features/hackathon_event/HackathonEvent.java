package com.example.swp.features.hackathon_event;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.round.Round;
import com.example.swp.features.track.Track;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hackathon_event")
public class HackathonEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private HackathonStatus status = HackathonStatus.DRAFT;

    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    private Integer maxTeamSize = 5;
    private Integer minTeamSize = 2;

    @Lob
    private String rules;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Round> rounds;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Track> tracks;

    @OneToMany(mappedBy = "hackathonEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Criterion> criteria;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isDeleted = false;

    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setDeleted(boolean isDeleted) { this.isDeleted = isDeleted; }
    public void setStatus(HackathonStatus status) { this.status = status; }
    public HackathonStatus getStatus() { return status; }
    public LocalDateTime getRegistrationEnd() { return registrationEnd; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public String getImageUrl() { return imageUrl; }
    public User getOrganizer() { return organizer; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setDescription(String description) { this.description = description; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public static HackathonEventBuilder builder() { return new HackathonEventBuilder(); }
    public static class HackathonEventBuilder {
        private String name;
        private String slug;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String imageUrl;
        private User organizer;
        private HackathonStatus status;
        
        public HackathonEventBuilder name(String name) { this.name = name; return this; }
        public HackathonEventBuilder slug(String slug) { this.slug = slug; return this; }
        public HackathonEventBuilder description(String description) { this.description = description; return this; }
        public HackathonEventBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public HackathonEventBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public HackathonEventBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public HackathonEventBuilder organizer(User organizer) { this.organizer = organizer; return this; }
        public HackathonEventBuilder status(HackathonStatus status) { this.status = status; return this; }
        
        public HackathonEvent build() {
            HackathonEvent e = new HackathonEvent();
            e.name = this.name; e.slug = this.slug; e.description = this.description;
            e.startTime = this.startTime; e.endTime = this.endTime; e.imageUrl = this.imageUrl;
            e.organizer = this.organizer; e.status = this.status;
            return e;
        }
    }
}
