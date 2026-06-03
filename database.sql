-- =============================================
-- SEAL HACKATHON – UNIFIED DATABASE SCRIPT
-- Gộp: database.sql + patch.sql + patch_phase2/3/4.sql
-- Chỉ cần chạy DUY NHẤT file này.
-- Password mặc định: password123 (BCrypt hash)
-- =============================================

-- =============================================
-- 1. TẠO DATABASE
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HackathonDB')
BEGIN
    CREATE DATABASE HackathonDB;
END
GO

USE HackathonDB;
GO

-- =============================================
-- 2. XÓA BẢNG CŨ (THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI)
-- =============================================
IF OBJECT_ID('audit_log',              'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('mentorship_request',     'U') IS NOT NULL DROP TABLE mentorship_request;
IF OBJECT_ID('notification',           'U') IS NOT NULL DROP TABLE notification;
IF OBJECT_ID('team_round_advancement', 'U') IS NOT NULL DROP TABLE team_round_advancement;
IF OBJECT_ID('judge_assignment',       'U') IS NOT NULL DROP TABLE judge_assignment;
IF OBJECT_ID('team_invitation',        'U') IS NOT NULL DROP TABLE team_invitation;
IF OBJECT_ID('prize',                  'U') IS NOT NULL DROP TABLE prize;
IF OBJECT_ID('score',                  'U') IS NOT NULL DROP TABLE score;
IF OBJECT_ID('submission',             'U') IS NOT NULL DROP TABLE submission;
IF OBJECT_ID('team_member',            'U') IS NOT NULL DROP TABLE team_member;
IF OBJECT_ID('track_mentor',           'U') IS NOT NULL DROP TABLE track_mentor;
IF OBJECT_ID('team',                   'U') IS NOT NULL DROP TABLE team;
IF OBJECT_ID('criterion',              'U') IS NOT NULL DROP TABLE criterion;
IF OBJECT_ID('round',                  'U') IS NOT NULL DROP TABLE round;
IF OBJECT_ID('track',                  'U') IS NOT NULL DROP TABLE track;
IF OBJECT_ID('event_registration',     'U') IS NOT NULL DROP TABLE event_registration;
IF OBJECT_ID('hackathon_event',        'U') IS NOT NULL DROP TABLE hackathon_event;
IF OBJECT_ID('_user',                  'U') IS NOT NULL DROP TABLE _user;
GO

-- =============================================
-- 3. TẠO BẢNG
-- =============================================

-- Bảng _user
CREATE TABLE _user (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    username       NVARCHAR(255) NOT NULL UNIQUE,
    password       NVARCHAR(255) NOT NULL,
    email          NVARCHAR(255) NOT NULL UNIQUE,
    role           NVARCHAR(50),           -- ADMIN, ORGANIZER, JUDGE, GUEST_JUDGE, MENTOR, PARTICIPANT

    -- Thông tin sinh viên
    fpt_student_id NVARCHAR(255),
    school_name    NVARCHAR(255),

    -- Quản lý xét duyệt & Xác thực
    approved       BIT DEFAULT 0,          -- Admin duyệt Organizer/Judge/Mentor
    is_verified    BIT DEFAULT 0,          -- Participant tự xác thực qua OTP
    otp_code       VARCHAR(10),
    otp_expiry     DATETIME2,

    -- Profile cá nhân
    skills         NVARCHAR(MAX),
    github_url     NVARCHAR(255),
    full_name      NVARCHAR(255),
    phone          NVARCHAR(50),
    bio            NVARCHAR(MAX),
    avatar_url     NVARCHAR(255),

    -- Guest Judge flag (tài khoản tạm thời do Organizer tạo)
    is_temporary   BIT DEFAULT 0 NOT NULL
);

-- Bảng hackathon_event
CREATE TABLE hackathon_event (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    name               NVARCHAR(255) NOT NULL,
    slug               NVARCHAR(255) NOT NULL UNIQUE,
    description        NVARCHAR(MAX),
    status             NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    registration_start DATETIME2,
    registration_end   DATETIME2,
    start_time         DATETIME2 NOT NULL,
    end_time           DATETIME2 NOT NULL,
    max_team_size      INT DEFAULT 5,
    min_team_size      INT DEFAULT 2,
    rules              NVARCHAR(MAX),
    image_url          NVARCHAR(255),
    organizer_id       BIGINT,
    created_at         DATETIME2 DEFAULT GETDATE(),
    updated_at         DATETIME2 DEFAULT GETDATE(),
    is_deleted         BIT DEFAULT 0,
    FOREIGN KEY (organizer_id) REFERENCES _user(id)
);

-- Bảng track (Hạng mục thi đấu)
CREATE TABLE track (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    name               NVARCHAR(255) NOT NULL,
    description        NVARCHAR(MAX),
    hackathon_event_id BIGINT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng event_registration
CREATE TABLE event_registration (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    event_id      BIGINT NOT NULL,
    user_id       BIGINT NOT NULL,
    status        NVARCHAR(50) DEFAULT 'REGISTERED',
    registered_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES _user(id) ON DELETE CASCADE,
    UNIQUE (event_id, user_id)
);

-- Bảng round (Vòng thi)
CREATE TABLE round (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(255) NOT NULL,
    description         NVARCHAR(MAX),
    start_time          DATETIME2 NOT NULL,
    end_time            DATETIME2 NOT NULL,
    hackathon_event_id  BIGINT,
    -- Thêm từ patch_phase2: deadline nộp bài, số slot thăng hạng, thứ tự vòng
    submission_deadline DATETIME2,
    advancement_slots   INT,
    round_order         INT DEFAULT 1 NOT NULL,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng criterion (Tiêu chí chấm điểm)
CREATE TABLE criterion (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    name               NVARCHAR(255) NOT NULL,
    description        NVARCHAR(MAX),
    max_score          INT NOT NULL,
    weight             INT DEFAULT 1 NOT NULL,
    hackathon_event_id BIGINT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng team
CREATE TABLE team (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    name                    NVARCHAR(255) NOT NULL,
    project_name            NVARCHAR(255),
    project_description     NVARCHAR(MAX),
    track_id                BIGINT,
    event_id                BIGINT NOT NULL,
    status                  NVARCHAR(50) DEFAULT 'ACTIVE',
    created_at              DATETIME2 DEFAULT GETDATE(),
    -- Thêm từ patch_phase2 & patch_phase4: disqualification tracking
    disqualification_reason NVARCHAR(MAX),
    disqualified_at         DATETIME2,
    disqualified_by         BIGINT,
    FOREIGN KEY (track_id)        REFERENCES track(id),
    FOREIGN KEY (event_id)        REFERENCES hackathon_event(id),
    FOREIGN KEY (disqualified_by) REFERENCES _user(id),
    UNIQUE (name, event_id)
);

-- Bảng track_mentor (Phân công Mentor/Judge cho Track — thêm từ patch_phase2)
CREATE TABLE track_mentor (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    track_id    BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,   -- MENTOR hoặc JUDGE role
    event_id    BIGINT NOT NULL,   -- denormalized để lookup nhanh
    assigned_by BIGINT,            -- organizer_id thực hiện phân công
    assigned_at DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT uq_track_mentor UNIQUE (track_id, user_id),
    CONSTRAINT fk_tm_track    FOREIGN KEY (track_id)    REFERENCES track(id)          ON DELETE CASCADE,
    CONSTRAINT fk_tm_user     FOREIGN KEY (user_id)     REFERENCES _user(id),
    CONSTRAINT fk_tm_event    FOREIGN KEY (event_id)    REFERENCES hackathon_event(id),
    CONSTRAINT fk_tm_assigner FOREIGN KEY (assigned_by) REFERENCES _user(id)
);

-- Bảng team_member
CREATE TABLE team_member (
    id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id   BIGINT NOT NULL,
    user_id   BIGINT NOT NULL,
    is_leader BIT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES team(id)  ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng team_invitation (Quản lý lời mời vào nhóm)
CREATE TABLE team_invitation (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id       BIGINT NOT NULL,
    inviter_id    BIGINT NOT NULL,
    invitee_email NVARCHAR(255) NOT NULL,
    status        NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
    created_at    DATETIME2 DEFAULT GETDATE(),
    expires_at    DATETIME2,                       -- thêm từ patch.sql
    FOREIGN KEY (team_id)    REFERENCES team(id)  ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES _user(id)
);

-- Bảng submission (Nộp bài thi)
CREATE TABLE submission (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id        BIGINT NOT NULL,
    round_id       BIGINT NOT NULL,
    repository_url NVARCHAR(255),
    demo_url       NVARCHAR(255),
    report_url     NVARCHAR(255),
    version        INT DEFAULT 1,
    submitted_at   DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (team_id)  REFERENCES team(id)  ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES round(id)
);

-- Bảng judge_assignment (Phân công giám khảo cho bài nộp)
CREATE TABLE judge_assignment (
    id                       BIGINT IDENTITY(1,1) PRIMARY KEY,
    judge_id                 BIGINT NOT NULL,
    submission_id            BIGINT NOT NULL,
    assigned_by_organizer_id BIGINT,
    status                   NVARCHAR(50) DEFAULT 'ASSIGNED', -- thêm từ patch.sql
    assigned_at              DATETIME2 DEFAULT GETDATE(),      -- thêm từ patch.sql
    FOREIGN KEY (judge_id)                 REFERENCES _user(id),
    FOREIGN KEY (submission_id)            REFERENCES submission(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_organizer_id) REFERENCES _user(id),
    UNIQUE (judge_id, submission_id)
);

-- Bảng score (Điểm số)
CREATE TABLE score (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    judge_id      BIGINT NOT NULL,
    submission_id BIGINT NOT NULL,
    criterion_id  BIGINT NOT NULL,
    score_value   INT NOT NULL,
    comment       NVARCHAR(MAX),
    scored_at     DATETIME2 DEFAULT GETDATE(),
    is_finalized  BIT DEFAULT 0 NOT NULL,          -- thêm từ patch.sql
    UNIQUE (judge_id, submission_id, criterion_id),
    FOREIGN KEY (judge_id)      REFERENCES _user(id),
    FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
    FOREIGN KEY (criterion_id)  REFERENCES criterion(id)
);

-- Bảng prize (Giải thưởng)
CREATE TABLE prize (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    name               NVARCHAR(255) NOT NULL,
    description        NVARCHAR(MAX),
    hackathon_event_id BIGINT NOT NULL,
    track_id           BIGINT,
    winning_team_id    BIGINT,
    rank               INT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id),
    FOREIGN KEY (track_id)           REFERENCES track(id),
    FOREIGN KEY (winning_team_id)    REFERENCES team(id)
);

-- Bảng mentorship_request (Xin hỗ trợ từ Mentor)
CREATE TABLE mentorship_request (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id     BIGINT NOT NULL,
    mentor_id   BIGINT,                            -- NULL nếu chưa có mentor nhận
    title       NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    status      NVARCHAR(50) DEFAULT 'OPEN',       -- OPEN, IN_PROGRESS, RESOLVED
    created_at  DATETIME2 DEFAULT GETDATE(),
    resolved_at DATETIME2,                         -- thêm từ patch.sql
    FOREIGN KEY (team_id)   REFERENCES team(id)  ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES _user(id)
);

-- Bảng notification (Hệ thống thông báo)
CREATE TABLE notification (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    title          NVARCHAR(255) NOT NULL,
    message        NVARCHAR(MAX),
    is_read        BIT DEFAULT 0,
    type           NVARCHAR(255) NOT NULL DEFAULT 'INFO', -- thêm từ patch.sql
    reference_type NVARCHAR(255),                         -- thêm từ patch.sql
    reference_id   BIGINT,                                -- thêm từ patch.sql
    created_at     DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng team_round_advancement (Thăng hạng qua vòng — thêm từ patch_phase3)
CREATE TABLE team_round_advancement (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id       BIGINT NOT NULL,
    from_round_id BIGINT NOT NULL,
    to_round_id   BIGINT NOT NULL,
    advanced_by   BIGINT NOT NULL,
    advanced_at   DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT fk_adv_team       FOREIGN KEY (team_id)       REFERENCES team(id)  ON DELETE CASCADE,
    CONSTRAINT fk_adv_from_round FOREIGN KEY (from_round_id) REFERENCES round(id),
    CONSTRAINT fk_adv_to_round   FOREIGN KEY (to_round_id)   REFERENCES round(id),
    CONSTRAINT fk_adv_user       FOREIGN KEY (advanced_by)   REFERENCES _user(id),
    CONSTRAINT uq_team_round_adv UNIQUE (team_id, from_round_id, to_round_id)
);

-- Bảng audit_log
CREATE TABLE audit_log (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id    BIGINT,
    action     NVARCHAR(255) NOT NULL,
    details    NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES _user(id)
);
GO

-- =============================================
-- 4. INDEXES
-- =============================================
CREATE INDEX idx_submission_team_id           ON submission(team_id);
CREATE INDEX idx_score_submission_id          ON score(submission_id);
CREATE INDEX idx_notification_user_id_is_read ON notification(user_id, is_read);
CREATE INDEX idx_team_event_id                ON team(event_id);
CREATE INDEX idx_track_mentor_user_id         ON track_mentor(user_id);
CREATE INDEX idx_track_mentor_event_id        ON track_mentor(event_id);
CREATE INDEX idx_track_mentor_track_id        ON track_mentor(track_id);
CREATE INDEX idx_adv_from_round               ON team_round_advancement(from_round_id);
CREATE INDEX idx_adv_to_round                 ON team_round_advancement(to_round_id);
GO

-- =============================================
-- 5. SEED DATA
-- Password mặc định: password123 (BCrypt)
-- =============================================
INSERT INTO _user (username, password, email, role, fpt_student_id, school_name, approved, is_verified)
VALUES
    ('admin',      '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'admin@fpt.edu.vn',      'ADMIN',       NULL,       'FPT',           1, 1),
    ('organizer1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'organizer1@fpt.edu.vn', 'ORGANIZER',   NULL,       'FPT',           1, 1),
    ('judge1',     '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'judge1@fpt.edu.vn',     'JUDGE',       NULL,       'FPT',           1, 1),
    ('mentor1',    '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'mentor1@fpt.edu.vn',    'MENTOR',      NULL,       'FPT',           1, 1),
    ('student1',   '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student1@fpt.edu.vn',   'PARTICIPANT', 'SE170001', 'FPT University', 0, 1);

INSERT INTO hackathon_event (name, slug, description, start_time, end_time, organizer_id)
VALUES (N'FPT Hackathon 2026', 'fpt-hackathon-2026', N'Cuộc thi khởi nghiệp công nghệ', GETDATE(), DATEADD(day, 30, GETDATE()), 2);

PRINT '=== Unified Database Script chạy thành công! ===';
GO
