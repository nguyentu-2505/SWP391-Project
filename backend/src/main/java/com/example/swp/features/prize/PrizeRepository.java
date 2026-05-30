package com.example.swp.features.prize;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, Long> {
    @EntityGraph(attributePaths = {"hackathonEvent", "track", "winningTeam"})
    List<Prize> findByHackathonEventId(Long hackathonEventId);
    
    @EntityGraph(attributePaths = {"hackathonEvent", "track", "winningTeam"})
    List<Prize> findByTrackId(Long trackId);

    @EntityGraph(attributePaths = {"hackathonEvent", "track", "winningTeam"})
    Optional<Prize> findById(Long id);
}
