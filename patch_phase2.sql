-- =============================================
-- SEAL HACKATHON – PHASE 2 PATCH
-- Run AFTER patch.sql (phase 4b)
-- =============================================

-- ─────────────────────────────────────────────
-- PHASE 1: Track-Mentor Assignment Table
-- WHY: Business rule – a lecturer can mentor Track A and judge Track B
--      in the same event. We need a table to track this assignment
--      so we can validate conflict-of-interest when assigning judges.
-- ─────────────────────────────────────────────
IF OBJECT_ID('track_mentor', 'U') IS NULL
BEGIN
    CREATE TABLE track_mentor (
        id          BIGINT IDENTITY(1,1) PRIMARY KEY,
        track_id    BIGINT NOT NULL,
        user_id     BIGINT NOT NULL,           -- MENTOR or JUDGE (internal) role
        event_id    BIGINT NOT NULL,           -- denormalized for fast lookup
        assigned_by BIGINT,                    -- organizer_id who made the assignment
        assigned_at DATETIME2 DEFAULT GETDATE() NOT NULL,
        CONSTRAINT uq_track_mentor UNIQUE (track_id, user_id),
        CONSTRAINT fk_tm_track    FOREIGN KEY (track_id)    REFERENCES track(id)           ON DELETE CASCADE,
        CONSTRAINT fk_tm_user     FOREIGN KEY (user_id)     REFERENCES _user(id),
        CONSTRAINT fk_tm_event    FOREIGN KEY (event_id)    REFERENCES hackathon_event(id),
        CONSTRAINT fk_tm_assigner FOREIGN KEY (assigned_by) REFERENCES _user(id)
    );
    CREATE INDEX idx_track_mentor_user_id  ON track_mentor(user_id);
    CREATE INDEX idx_track_mentor_event_id ON track_mentor(event_id);
    CREATE INDEX idx_track_mentor_track_id ON track_mentor(track_id);
    PRINT 'Created table: track_mentor';
END
GO

-- ─────────────────────────────────────────────
-- PHASE 2: Guest Judge – temporary flag on _user
-- WHY: Organizer creates guest judge accounts directly (no OTP flow).
--      We mark them as temporary to distinguish from normal accounts.
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('_user') AND name = 'is_temporary')
BEGIN
    ALTER TABLE _user ADD is_temporary BIT DEFAULT 0 NOT NULL;
    PRINT 'Added column: _user.is_temporary';
END
GO

-- ─────────────────────────────────────────────
-- PHASE 3: Round – submission deadline & advancement slots
-- WHY: Submission deadline can differ from round end time.
--      advancement_slots defines top-N teams advancing to next round.
--      round_order allows sorting rounds within an event.
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('round') AND name = 'submission_deadline')
BEGIN
    ALTER TABLE round ADD submission_deadline DATETIME2;
    PRINT 'Added column: round.submission_deadline';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('round') AND name = 'advancement_slots')
BEGIN
    ALTER TABLE round ADD advancement_slots INT;
    PRINT 'Added column: round.advancement_slots';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('round') AND name = 'round_order')
BEGIN
    ALTER TABLE round ADD round_order INT DEFAULT 1 NOT NULL;
    PRINT 'Added column: round.round_order';
END
GO

-- ─────────────────────────────────────────────
-- PHASE 4: Team – disqualification tracking
-- WHY: Organizer can disqualify teams for rule violations.
--      We record reason + timestamp for audit trail.
-- ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('team') AND name = 'disqualification_reason')
BEGIN
    ALTER TABLE team ADD disqualification_reason NVARCHAR(MAX);
    PRINT 'Added column: team.disqualification_reason';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('team') AND name = 'disqualified_at')
BEGIN
    ALTER TABLE team ADD disqualified_at DATETIME2;
    PRINT 'Added column: team.disqualified_at';
END
GO

-- ─────────────────────────────────────────────
-- VERIFY
-- ─────────────────────────────────────────────
PRINT '=== patch_phase2.sql completed successfully ===';
GO
