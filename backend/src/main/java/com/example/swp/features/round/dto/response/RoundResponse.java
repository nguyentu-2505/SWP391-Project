package com.example.swp.features.round.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class RoundResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long hackathonEventId;
    private Integer advancementSlots;

    public static RoundResponseBuilder builder() { return new RoundResponseBuilder(); }
    public static class RoundResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long hackathonEventId;
        private Integer advancementSlots;

        public RoundResponseBuilder id(Long id) { this.id = id; return this; }
        public RoundResponseBuilder name(String name) { this.name = name; return this; }
        public RoundResponseBuilder description(String description) { this.description = description; return this; }
        public RoundResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public RoundResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public RoundResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }
        public RoundResponseBuilder advancementSlots(Integer advancementSlots) { this.advancementSlots = advancementSlots; return this; }
        public RoundResponse build() {
            RoundResponse r = new RoundResponse();
            r.id = this.id; r.name = this.name; r.description = this.description;
            r.startTime = this.startTime; r.endTime = this.endTime; r.hackathonEventId = this.hackathonEventId;
            r.advancementSlots = this.advancementSlots;
            return r;
        }
    }
}


