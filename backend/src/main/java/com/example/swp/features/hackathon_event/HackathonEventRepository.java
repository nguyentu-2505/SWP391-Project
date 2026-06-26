package com.example.swp.features.hackathon_event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, Long> {
    @Override
    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"organizer"})
    Optional<HackathonEvent> findBySlugAndIsDeletedFalse(String slug);

    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findByIsDeletedFalseAndStatus(HackathonStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"organizer"})
    Page<HackathonEvent> findByIsDeletedFalseAndStatusIn(List<HackathonStatus> statuses, Pageable pageable);

    @EntityGraph(attributePaths = {"organizer"})
    List<HackathonEvent> findByOrganizerIdAndIsDeletedFalseOrderByCreatedAtDesc(Long organizerId);

    @EntityGraph(attributePaths = {"organizer"})
    Optional<HackathonEvent> findById(Long id);
}
