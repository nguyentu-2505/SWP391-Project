-- =============================================
-- SEAL HACKATHON – PHASE 4 PATCH
-- Team Disqualification System
-- =============================================

-- ─────────────────────────────────────────────
-- PHASE 4: disqualified_by column
-- WHY: We already added disqualification_reason and disqualified_at in phase 2.
--      Now we need to track WHO disqualified the team for full accountability.
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('team') AND name = 'disqualified_by')
BEGIN
    ALTER TABLE team ADD disqualified_by BIGINT;
    ALTER TABLE team ADD CONSTRAINT fk_team_disqualified_user FOREIGN KEY (disqualified_by) REFERENCES _user(id);
    PRINT 'Added column: team.disqualified_by';
END
GO

PRINT '=== patch_phase4.sql completed successfully ===';
GO
