-- =============================================
-- SEAL HACKATHON – PHASE 3 PATCH
-- Round Advancement System
-- =============================================

-- ─────────────────────────────────────────────
-- PHASE 3: team_round_advancement table
-- WHY: Persists which teams advanced from a specific round to the next round.
--      This ensures that advancement is a hard state rather than just a dynamic
--      ranking calculation, allowing organizers to freeze advancement logic
--      and properly filter disqualified teams.
-- ─────────────────────────────────────────────
IF OBJECT_ID('team_round_advancement', 'U') IS NULL
BEGIN
    CREATE TABLE team_round_advancement (
        id            BIGINT IDENTITY(1,1) PRIMARY KEY,
        team_id       BIGINT NOT NULL,
        from_round_id BIGINT NOT NULL,
        to_round_id   BIGINT NOT NULL,
        advanced_by   BIGINT NOT NULL,
        advanced_at   DATETIME2 DEFAULT GETDATE() NOT NULL,
        CONSTRAINT fk_adv_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
        CONSTRAINT fk_adv_from_round FOREIGN KEY (from_round_id) REFERENCES round(id),
        CONSTRAINT fk_adv_to_round FOREIGN KEY (to_round_id) REFERENCES round(id),
        CONSTRAINT fk_adv_user FOREIGN KEY (advanced_by) REFERENCES _user(id),
        -- Ensure a team cannot be advanced multiple times from the same round to the same next round
        CONSTRAINT uq_team_round_adv UNIQUE (team_id, from_round_id, to_round_id)
    );
    CREATE INDEX idx_adv_from_round ON team_round_advancement(from_round_id);
    CREATE INDEX idx_adv_to_round   ON team_round_advancement(to_round_id);
    PRINT 'Created table: team_round_advancement';
END
GO

PRINT '=== patch_phase3.sql completed successfully ===';
GO
