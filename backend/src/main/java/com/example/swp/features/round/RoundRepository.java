package com.example.swp.features.round;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    List<Round> findByHackathonEventId(Long hackathonEventId);
    Optional<Round> findByHackathonEventIdAndName(Long hackathonEventId, String name);
    List<Round> findByHackathonEventIdAndRoundOrder(Long hackathonEventId, Integer roundOrder);
}
