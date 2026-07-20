package com.example.swp.features.recruitment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentPostRepository extends JpaRepository<RecruitmentPost, Long> {
    List<RecruitmentPost> findByEventIdOrderByCreatedAtDesc(Long eventId);
}
