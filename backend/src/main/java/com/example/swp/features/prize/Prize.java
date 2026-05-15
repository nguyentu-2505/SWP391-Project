package com.example.swp.features.prize;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.team.Team;
import com.example.swp.features.track.Track;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prize")
public class Prize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    // The event this prize belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_event_id", nullable = false)
    private HackathonEvent hackathonEvent;

    // Optional: for track-specific prizes (e.g., "Winner of AI Track")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    // Optional: The team that won this prize. Can be assigned later.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_team_id")
    private Team winningTeam;

    @Column(name = "rank")
    private int rank;
}