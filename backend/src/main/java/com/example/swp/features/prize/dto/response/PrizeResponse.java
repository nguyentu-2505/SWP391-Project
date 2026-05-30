package com.example.swp.features.prize.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class PrizeResponse {
    private Long id;
    private String name;
    private String description;
    private Long hackathonEventId;
    private Long trackId;
    private Long winningTeamId;
    private String winningTeamName;

    public static PrizeResponseBuilder builder() { return new PrizeResponseBuilder(); }
    public static class PrizeResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private Long hackathonEventId;
        private Long trackId;
        private Long winningTeamId;
        private String winningTeamName;

        public PrizeResponseBuilder id(Long id) { this.id = id; return this; }
        public PrizeResponseBuilder name(String name) { this.name = name; return this; }
        public PrizeResponseBuilder description(String description) { this.description = description; return this; }
        public PrizeResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }
        public PrizeResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public PrizeResponseBuilder winningTeamId(Long winningTeamId) { this.winningTeamId = winningTeamId; return this; }
        public PrizeResponseBuilder winningTeamName(String winningTeamName) { this.winningTeamName = winningTeamName; return this; }

        public PrizeResponse build() {
            PrizeResponse p = new PrizeResponse();
            p.id = this.id; p.name = this.name; p.description = this.description;
            p.hackathonEventId = this.hackathonEventId; p.trackId = this.trackId;
            p.winningTeamId = this.winningTeamId; p.winningTeamName = this.winningTeamName;
            return p;
        }
    }
}


