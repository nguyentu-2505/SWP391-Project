package com.example.swp.features.round;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoundServiceImplTest {

    @Mock
    private RoundRepository roundRepository;

    @Mock
    private HackathonEventRepository hackathonEventRepository;

    @InjectMocks
    private RoundServiceImpl roundService;

    private HackathonEvent event;

    @BeforeEach
    void setUp() {
        event = new HackathonEvent();
        event.setId(1L);
        event.setStartTime(LocalDateTime.now().minusDays(1));
        event.setEndTime(LocalDateTime.now().plusDays(10));
        event.setRegistrationEnd(LocalDateTime.now().minusHours(2));
    }

    @Test
    void createRound_whenAdvancementSlotsSequenceIsValid_shouldSucceed() {
        when(hackathonEventRepository.findById(1L)).thenReturn(Optional.of(event));
        
        List<Round> existing = new ArrayList<>();
        Round r1 = Round.builder()
                .id(10L)
                .name("Round 1")
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .advancementSlots(10)
                .build();
        existing.add(r1);
        
        when(roundRepository.findByHackathonEventId(1L)).thenReturn(existing);
        when(roundRepository.save(any(Round.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRoundRequest request = new CreateRoundRequest();
        request.setHackathonEventId(1L);
        request.setName("Round 2");
        request.setStartTime(LocalDateTime.now().plusHours(4));
        request.setEndTime(LocalDateTime.now().plusHours(6));
        request.setAdvancementSlots(5);

        RoundResponse response = roundService.createRound(request);

        assertNotNull(response);
        verify(roundRepository, times(1)).save(any(Round.class));
    }

    @Test
    void createRound_whenAdvancementSlotsIncreaseSequentially_shouldThrowException() {
        when(hackathonEventRepository.findById(1L)).thenReturn(Optional.of(event));

        List<Round> existing = new ArrayList<>();
        Round r1 = Round.builder()
                .id(10L)
                .name("Round 1")
                .startTime(LocalDateTime.now().plusHours(1))
                .endTime(LocalDateTime.now().plusHours(3))
                .advancementSlots(5)
                .build();
        existing.add(r1);

        when(roundRepository.findByHackathonEventId(1L)).thenReturn(existing);

        CreateRoundRequest request = new CreateRoundRequest();
        request.setHackathonEventId(1L);
        request.setName("Round 2");
        request.setStartTime(LocalDateTime.now().plusHours(4));
        request.setEndTime(LocalDateTime.now().plusHours(6));
        request.setAdvancementSlots(10);

        assertThrows(IllegalArgumentException.class, () -> roundService.createRound(request));
    }
}
