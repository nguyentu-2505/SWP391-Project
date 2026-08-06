package com.example.swp.features.ranking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RankOverrideRepository extends JpaRepository<RankOverride, Long> {

    /** Lấy tất cả override của 1 vòng thi */
    List<RankOverride> findByRoundId(Long roundId);

    /** Kiểm tra đội này có bị override trong vòng này không */
    Optional<RankOverride> findByRoundIdAndTeamId(Long roundId, Long teamId);

    /** Xóa override của 1 đội trong 1 vòng */
    void deleteByRoundIdAndTeamId(Long roundId, Long teamId);
}
