package com.example.swp.features.hackathon_event;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.request.UpdateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import com.example.swp.features.hackathon_event.event.HackathonCompletedEvent;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.ranking.RankingService;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.round.Round;
import com.example.swp.features.round.RoundRepository;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.criterion.CriterionRepository;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HackathonEventServiceImpl implements HackathonEventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final RoundRepository roundRepository;
    private final RankingService rankingService;
    private final ApplicationEventPublisher eventPublisher;
    private final CriterionRepository criterionRepository;
    private final com.example.swp.features.team.TeamRepository teamRepository;
    private final com.example.swp.features.team_member.TeamMemberRepository teamMemberRepository;
    private final Slugify slugify = Slugify.builder().build();

    // ==================== CREATE ====================

    @Override
    @Transactional
    public HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request) {
        User organizer = getCurrentUser();

        // Validate: endTime phải sau startTime
        validateTimeRange(request.getStartTime(), request.getEndTime(), "Event end time must be after start time.");

        // Validate: registration window (nếu có)
        if (request.getRegistrationStart() != null && request.getRegistrationEnd() != null) {
            validateTimeRange(request.getRegistrationStart(), request.getRegistrationEnd(),
                    "Registration end time must be after registration start time.");
        }

        // Validate: registration start time must be before event start time
        if (request.getRegistrationStart() != null && request.getStartTime() != null
                && !request.getRegistrationStart().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("Registration start time must be before event start time.");
        }

        // Validate: registration end time must be before event end time
        if (request.getRegistrationEnd() != null && request.getEndTime() != null
                && !request.getRegistrationEnd().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Registration end time must be before event end time.");
        }

        // Validate: minTeamSize <= maxTeamSize (nếu có)
        if (request.getMinTeamSize() != null && request.getMaxTeamSize() != null
                && request.getMinTeamSize() > request.getMaxTeamSize()) {
            throw new IllegalArgumentException("Minimum team size cannot be greater than maximum team size.");
        }

        // Generate unique slug
        String baseSlug = slugify.slugify(request.getName());
        String uniqueSlug = generateUniqueSlug(baseSlug);

        HackathonEvent event = HackathonEvent.builder()
                .name(request.getName())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .registrationStart(request.getRegistrationStart())
                .registrationEnd(request.getRegistrationEnd())
                .minTeamSize(request.getMinTeamSize() != null ? request.getMinTeamSize() : 2)
                .maxTeamSize(request.getMaxTeamSize() != null ? request.getMaxTeamSize() : 5)
                .rules(request.getRules())
                .imageUrl(request.getImageUrl())
                .organizer(organizer)
                .status(HackathonStatus.DRAFT)
                .build();

        HackathonEvent savedEvent = hackathonEventRepository.save(event);
        // Auto-seed default criteria
        List<Criterion> defaultCriteria = criterionRepository.findByHackathonEventIsNull();
        if (!defaultCriteria.isEmpty()) {
            List<Criterion> clonedCriteria = defaultCriteria.stream()
                    .map(c -> Criterion.builder()
                            .name(c.getName())
                            .description(c.getDescription())
                            .maxScore(c.getMaxScore())
                            .weight(c.getWeight())
                            .hackathonEvent(savedEvent)
                            .build())
                    .collect(Collectors.toList());
            criterionRepository.saveAll(clonedCriteria);
            log.info("Auto-seeded {} default criteria for new event id={}", clonedCriteria.size(), savedEvent.getId());
        }

        auditLogService.logAction("CREATE_HACKATHON_EVENT", "HackathonEvent", savedEvent.getId(), null, "Created event: " + savedEvent.getName());
        log.info("Hackathon event created successfully: id={}, name={} by organizer={}", savedEvent.getId(), savedEvent.getName(), organizer.getUsername());
        return mapToResponse(savedEvent);
    }

    // ==================== READ ====================

    @Override
    @Transactional(readOnly = true)
    public Page<HackathonEventResponse> getAllHackathonEvents(Pageable pageable) {
        return hackathonEventRepository.findByIsDeletedFalseAndStatusIn(
                List.of(HackathonStatus.PUBLISHED, HackathonStatus.IN_PROGRESS), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HackathonEventResponse> getAllEventsForAdmin(Pageable pageable) {
        return hackathonEventRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HackathonEventResponse> getMyHackathonEvents() {
        User organizer = getCurrentUser();
        return hackathonEventRepository.findByOrganizerIdAndIsDeletedFalseOrderByCreatedAtDesc(organizer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HackathonEventResponse getHackathonEventBySlug(String slug) {
        HackathonEvent event = hackathonEventRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with slug: " + slug));
        return mapToResponse(event);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public HackathonEventResponse updateHackathonEvent(Long id, UpdateHackathonEventRequest request) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        // Chỉ cho phép edit khi event ở DRAFT hoặc PUBLISHED
        if (event.getStatus() != HackathonStatus.DRAFT && event.getStatus() != HackathonStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Cannot edit event in status: " + event.getStatus() + ". Only DRAFT and PUBLISHED events can be edited.");
        }

        // Partial update — chỉ update field non-null
        if (request.getName() != null) {
            event.setName(request.getName());
            event.setSlug(generateUniqueSlug(slugify.slugify(request.getName())));
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime());
        }
        if (request.getRegistrationStart() != null) {
            event.setRegistrationStart(request.getRegistrationStart());
        }
        if (request.getRegistrationEnd() != null) {
            event.setRegistrationEnd(request.getRegistrationEnd());
        }
        if (request.getMinTeamSize() != null) {
            event.setMinTeamSize(request.getMinTeamSize());
        }
        if (request.getMaxTeamSize() != null) {
            event.setMaxTeamSize(request.getMaxTeamSize());
        }
        if (request.getRules() != null) {
            event.setRules(request.getRules());
        }
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }

        // Validate sau khi merge: endTime > startTime
        validateTimeRange(event.getStartTime(), event.getEndTime(), "Event end time must be after start time.");

        // Validate: registration window (nếu cả 2 đều có)
        if (event.getRegistrationStart() != null && event.getRegistrationEnd() != null) {
            validateTimeRange(event.getRegistrationStart(), event.getRegistrationEnd(),
                    "Registration end time must be after registration start time.");
        }

        // Validate: registration start time must be before event start time
        if (event.getRegistrationStart() != null && event.getStartTime() != null
                && !event.getRegistrationStart().isBefore(event.getStartTime())) {
            throw new IllegalArgumentException("Registration start time must be before event start time.");
        }

        // Validate: registration end time must be before event end time
        if (event.getRegistrationEnd() != null && event.getEndTime() != null
                && !event.getRegistrationEnd().isBefore(event.getEndTime())) {
            throw new IllegalArgumentException("Registration end time must be before event end time.");
        }

        // Validate: minTeamSize <= maxTeamSize
        if (event.getMinTeamSize() != null && event.getMaxTeamSize() != null
                && event.getMinTeamSize() > event.getMaxTeamSize()) {
            throw new IllegalArgumentException("Minimum team size cannot be greater than maximum team size.");
        }

        HackathonEvent updatedEvent = hackathonEventRepository.save(event);
        auditLogService.logAction("UPDATE_HACKATHON_EVENT", "HackathonEvent",
                updatedEvent.getId(), null, "Updated event: " + updatedEvent.getName());
        log.info("Hackathon event updated: id={}, name='{}'", updatedEvent.getId(), updatedEvent.getName());

        return mapToResponse(updatedEvent);
    }

    // ==================== STATUS TRANSITION ====================

    @Override
    @Transactional
    public HackathonEventResponse updateHackathonEventStatus(Long id, HackathonStatus newStatus) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        HackathonStatus currentStatus = event.getStatus();

        // Validate state machine transition
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new IllegalStateException(String.format(
                    "Cannot transition from %s to %s. Allowed transitions: %s",
                    currentStatus, newStatus, currentStatus.getAllowedTransitions()));
        }

        // Validate that tracks and rounds exist before publishing
        if (newStatus == HackathonStatus.PUBLISHED) {
            if (event.getTracks() == null || event.getTracks().isEmpty()) {
                throw new IllegalStateException("Cannot publish event: At least one track must be configured first.");
            }
            if (event.getRounds() == null || event.getRounds().isEmpty()) {
                throw new IllegalStateException("Cannot publish event: At least one round must be configured first.");
            }
        }

        event.setStatus(newStatus);
        HackathonEvent updatedEvent = hackathonEventRepository.save(event);

        // NẾU EVENT ĐƯỢC PUBLISHED -> GỬI THÔNG BÁO CHO TẤT CẢ PARTICIPANT
        if (currentStatus == HackathonStatus.DRAFT && newStatus == HackathonStatus.PUBLISHED) {
            List<User> participants = userRepository.findByRole(Role.PARTICIPANT);
            String notiTitle = "🎉 Hackathon Mới: " + updatedEvent.getName();
            String notiMessage = "Hackathon " + updatedEvent.getName() + " đã chính thức mở đăng ký. Nhanh tay đăng ký tham gia ngay!";
            
            for (User participant : participants) {
                notificationService.createNotification(
                        participant,
                        notiTitle,
                        notiMessage,
                        "SYSTEM_ALERT",
                        "HACKATHON_EVENT",
                        updatedEvent.getId()
                );
            }
            log.info("Sent notifications to {} participants for newly published event id={}", participants.size(), updatedEvent.getId());
        }

        // NẾU EVENT CHUYỂN SANG IN_PROGRESS -> QUÉT VÀ LOẠI CÁC TEAM KHÔNG ĐỦ MIN_TEAM_SIZE
        if (currentStatus == HackathonStatus.PUBLISHED && newStatus == HackathonStatus.IN_PROGRESS) {
            List<com.example.swp.features.team.Team> eventTeams = teamRepository.findByEventId(updatedEvent.getId());
            int disqualifiedCount = 0;
            for (com.example.swp.features.team.Team team : eventTeams) {
                if (team.getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
                    long currentSize = teamMemberRepository.countByTeamId(team.getId());
                    if (currentSize < updatedEvent.getMinTeamSize()) {
                        team.setStatus(com.example.swp.features.team.TeamStatus.DISQUALIFIED);
                        team.setDisqualificationReason("Not enough members (" + currentSize + "/" + updatedEvent.getMinTeamSize() + ") when registration closed.");
                        team.setDisqualifiedAt(java.time.LocalDateTime.now());
                        teamRepository.save(team);
                        disqualifiedCount++;
                    }
                }
            }
            log.info("Transition to IN_PROGRESS: Disqualified {} teams for not meeting minTeamSize={}", disqualifiedCount, updatedEvent.getMinTeamSize());
        }

        // NẾU EVENT COMPLETED -> PUBLISH EVENT ĐỂ GỬI NOTIFICATION KẾT QUẢ TOP 1-2-3 (ASYNC)
        if (currentStatus == HackathonStatus.IN_PROGRESS && newStatus == HackathonStatus.COMPLETED) {
            // Tính ranking trong transaction (data consistency)
            List<TeamRankingResponse> top3 = List.of();
            var finalRound = roundRepository.findTopByHackathonEventIdOrderByRoundOrderDesc(event.getId());
            if (finalRound.isPresent()) {
                top3 = rankingService.getRankingForRound(finalRound.get().getId())
                        .stream().limit(3).collect(Collectors.toList());
            } else {
                log.warn("Event id={} completed but has no rounds — skipping ranking notification", event.getId());
            }

            // Publish event → sau khi COMMIT, HackathonEventListener sẽ xử lý async
            eventPublisher.publishEvent(new HackathonCompletedEvent(
                    updatedEvent.getId(), updatedEvent.getName(), top3));
            log.info("Published HackathonCompletedEvent for eventId={} with {} top teams",
                    updatedEvent.getId(), top3.size());
        }

        auditLogService.logAction("UPDATE_HACKATHON_EVENT_STATUS", "HackathonEvent",
                updatedEvent.getId(), "status: " + currentStatus.name(), "status: " + newStatus.name());
        log.info("Hackathon event status changed: id={}, {} → {}", id, currentStatus, newStatus);

        return mapToResponse(updatedEvent);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void deleteHackathonEvent(Long id) {
        HackathonEvent event = findEventById(id);
        requireOrganizerOrAdmin(event);

        // Không cho phép xóa event đang diễn ra
        if (event.getStatus() == HackathonStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Cannot delete an event that is currently IN_PROGRESS. Cancel it first.");
        }

        event.setDeleted(true);
        hackathonEventRepository.save(event);

        auditLogService.logAction("DELETE_HACKATHON_EVENT", "HackathonEvent",
                event.getId(), "isDeleted: false", "isDeleted: true");
        log.info("Hackathon event soft-deleted: id={}, name='{}'", event.getId(), event.getName());
    }

    // ==================== PRIVATE HELPERS ====================

    private HackathonEvent findEventById(Long id) {
        return hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with id: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Kiểm tra quyền: chỉ organizer của event hoặc ADMIN mới được thao tác.
     */
    private void requireOrganizerOrAdmin(HackathonEvent event) {
        User currentUser = getCurrentUser();
        boolean isOwner = event.getOrganizer().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the organizer or admin can perform this action.");
        }
    }

    /**
     * Validate start < end.
     */
    private void validateTimeRange(java.time.LocalDateTime start, java.time.LocalDateTime end, String message) {
        if (start != null && end != null && !end.isAfter(start)) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * Generate unique slug. Nếu slug đã tồn tại, append -1, -2, -3...
     */
    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (hackathonEventRepository.findBySlugAndIsDeletedFalse(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private HackathonEventResponse mapToResponse(HackathonEvent event) {
        return HackathonEventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .slug(event.getSlug())
                .description(event.getDescription())
                .status(event.getStatus().name())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .registrationStart(event.getRegistrationStart())
                .registrationEnd(event.getRegistrationEnd())
                .minTeamSize(event.getMinTeamSize())
                .maxTeamSize(event.getMaxTeamSize())
                .rules(event.getRules())
                .imageUrl(event.getImageUrl())
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getUsername() : null)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .allowedStatusTransitions(event.getStatus().getAllowedTransitions())
                .build();
    }
}
