package com.example.swp.features.hackathon_event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, Long> {
    Optional<HackathonEvent> findBySlug(String slug);
}
