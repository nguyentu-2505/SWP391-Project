package com.example.swp.features.round;

import com.example.swp.features.hackathon_event.HackathonEvent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "round")
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id")
    private HackathonEvent hackathonEvent;
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public HackathonEvent getHackathonEvent() { return hackathonEvent; }

    public static RoundBuilder builder() { return new RoundBuilder(); }
    public static class RoundBuilder {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private HackathonEvent hackathonEvent;

        public RoundBuilder id(Long id) { this.id = id; return this; }
        public RoundBuilder name(String name) { this.name = name; return this; }
        public RoundBuilder description(String description) { this.description = description; return this; }
        public RoundBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public RoundBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public RoundBuilder hackathonEvent(HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }
        public Round build() {
            Round r = new Round();
            r.id = this.id; r.name = this.name; r.description = this.description;
            r.startTime = this.startTime; r.endTime = this.endTime; r.hackathonEvent = this.hackathonEvent;
            return r;
        }
    }
}
