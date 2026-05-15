package com.example.swp.features.criterion;

import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.request.UpdateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/criteria")
@RequiredArgsConstructor
public class CriterionController {

    private final CriterionService criterionService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<CriterionResponse> createCriterion(@RequestBody CreateCriterionRequest request) {
        CriterionResponse response = criterionService.createCriterion(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/event/{hackathonEventId}")
    public ResponseEntity<List<CriterionResponse>> getCriteriaForEvent(@PathVariable Long hackathonEventId) {
        List<CriterionResponse> responses = criterionService.getCriteriaForEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/default")
    public ResponseEntity<List<CriterionResponse>> getDefaultCriteria() {
        List<CriterionResponse> responses = criterionService.getDefaultCriteria();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<CriterionResponse> updateCriterion(@PathVariable Long id, @Valid @RequestBody UpdateCriterionRequest request) {
        CriterionResponse response = criterionService.updateCriterion(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Void> deleteCriterion(@PathVariable Long id) {
        criterionService.deleteCriterion(id);
        return ResponseEntity.noContent().build();
    }
}
