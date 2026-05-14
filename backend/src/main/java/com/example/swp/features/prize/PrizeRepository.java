package com.example.swp.features.prize;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, Long> {
    List<Prize> findByHackathonEventId(Long hackathonEventId);
    List<Prize> findByTrackId(Long trackId);
}
