package com.example.swp.features.team_invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    Optional<TeamInvitation> findByTeamIdAndInviteeEmail(Long teamId, String inviteeEmail);
    List<TeamInvitation> findByInviteeEmailAndStatus(String inviteeEmail, InvitationStatus status);
    List<TeamInvitation> findByTeamId(Long teamId);
}
