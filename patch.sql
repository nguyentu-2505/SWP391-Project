
-- =============================================
-- 5. PHASE 4B UPDATES (ALTER TABLES & INDEXES)
-- =============================================

-- Missing columns in _user
ALTER TABLE _user ADD full_name NVARCHAR(255);
ALTER TABLE _user ADD phone NVARCHAR(50);
ALTER TABLE _user ADD bio NVARCHAR(MAX);
ALTER TABLE _user ADD avatar_url NVARCHAR(255);

-- Missing column in score
ALTER TABLE score ADD is_finalized BIT DEFAULT 0 NOT NULL;

-- Missing column in mentorship_request
ALTER TABLE mentorship_request ADD resolved_at DATETIME2;

-- Missing columns in notification
ALTER TABLE notification ADD type NVARCHAR(255) NOT NULL DEFAULT 'INFO';
ALTER TABLE notification ADD reference_type NVARCHAR(255);
ALTER TABLE notification ADD reference_id BIGINT;

-- Missing columns in team_invitation
ALTER TABLE team_invitation ADD expires_at DATETIME2;

-- Missing columns in judge_assignment
ALTER TABLE judge_assignment ADD status NVARCHAR(50) DEFAULT 'ASSIGNED';
ALTER TABLE judge_assignment ADD assigned_at DATETIME2 DEFAULT GETDATE();

-- Practical Indexes
CREATE INDEX idx_submission_team_id ON submission(team_id);
CREATE INDEX idx_score_submission_id ON score(submission_id);
CREATE INDEX idx_notification_user_id_is_read ON notification(user_id, is_read);
CREATE INDEX idx_team_event_id ON team(event_id);
GO
