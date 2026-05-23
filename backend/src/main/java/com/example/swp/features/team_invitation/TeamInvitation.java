package com.example.swp.features.team_invitation;

import com.example.swp.features.team.Team;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "inviter_id")
    private User inviter;

    @Column(name = "invitee_email")
    private String inviteeEmail;

    private String status; // PENDING, ACCEPTED, DECLINED

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}