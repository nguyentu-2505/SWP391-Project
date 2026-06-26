package com.example.swp.features.track_mentor;

import com.example.swp.features.track.TrackMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TrackMentor assignments – uses the canonical entity
 * from the track package to avoid duplicate entity mapping on the same table.
 */
@Repository("trackMentorFeatureRepository")
public interface TrackMentorRepository extends JpaRepository<TrackMentor, Long> {

    List<TrackMentor> findByTrackId(Long trackId);

    /** Find by the "mentor" field (User) id */
    List<TrackMentor> findByMentorId(Long mentorId);

    Optional<TrackMentor> findByTrackIdAndMentorId(Long trackId, Long mentorId);
}
