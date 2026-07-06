package com.example.swp.features.support_ticket;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.support_ticket.dto.CreateTicketRequest;
import com.example.swp.features.support_ticket.dto.SupportTicketResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    @Override
    @Transactional
    public SupportTicketResponse createTicket(CreateTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .message(request.getMessage())
                .status(TicketStatus.PENDING)
                .build();
        
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        log.info("New support ticket created by: {}", savedTicket.getEmail());
        
        return mapToResponse(savedTicket);
    }

    @Override
    public Page<SupportTicketResponse> getAllTickets(Pageable pageable) {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public SupportTicketResponse resolveTicket(Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found with id: " + id));
        
        ticket.setStatus(TicketStatus.RESOLVED);
        SupportTicket savedTicket = supportTicketRepository.save(ticket);
        
        log.info("Support ticket {} resolved", id);
        
        return mapToResponse(savedTicket);
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .fullName(ticket.getFullName())
                .email(ticket.getEmail())
                .message(ticket.getMessage())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
