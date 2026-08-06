package com.example.swp.features.ranking;

import com.example.swp.features.round.Round;
import com.example.swp.features.team.Team;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Lưu trữ thông tin Admin/Organizer can thiệp thủ công vào thứ hạng.
 * Mỗi bản ghi gắn với 1 đội trong 1 vòng cụ thể.
 * Bắt buộc có lý do (reason) và ghi Audit Log khi tạo.
 */
@Entity
@Table(name = "rank_override",
    uniqueConstraints = @UniqueConstraint(columnNames = {"round_id", "team_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    /** Thứ hạng mới do Admin/Organizer chỉ định thủ công */
    @Column(name = "override_rank", nullable = false)
    private int overrideRank;

    /** Lý do can thiệp — bắt buộc nhập */
    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    /** Người thực hiện override */
    @Column(name = "overridden_by", nullable = false)
    private String overriddenBy;

    /** Thời điểm thực hiện override */
    @Column(name = "overridden_at", nullable = false)
    private LocalDateTime overriddenAt;
}
