package com.example.swp.features.track_mentor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackMentorRepository extends JpaRepository<TrackMentor, Long> {
    List<TrackMentor> findByTrackId(Long trackId);
    List<TrackMentor> findByUserId(Long userId);
    Optional<TrackMentor> findByTrackIdAndUserId(Long trackId, Long userId);
}
