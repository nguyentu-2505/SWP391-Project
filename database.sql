-- =============================================
<<<<<<< HEAD
-- 1. T?O DATABASE
=======
-- 1. TẠO DATABASE
>>>>>>> main
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HackathonDB')
BEGIN
    CREATE DATABASE HackathonDB;
END
GO

USE HackathonDB;
GO

-- =============================================
<<<<<<< HEAD
-- 2. X�A B?NG CU (THEO TH? T? R�NG BU?C KH�A NGO?I)
=======
-- 2. XÓA BẢNG CŨ (THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI)
>>>>>>> main
-- =============================================
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('mentorship_request', 'U') IS NOT NULL DROP TABLE mentorship_request;
IF OBJECT_ID('notification', 'U') IS NOT NULL DROP TABLE notification;
<<<<<<< HEAD
IF OBJECT_ID('judge_assignment', 'U') IS NOT NULL DROP TABLE judge_assignment; -- M?i
=======
IF OBJECT_ID('judge_assignment', 'U') IS NOT NULL DROP TABLE judge_assignment; -- Mới
>>>>>>> main
IF OBJECT_ID('team_invitation', 'U') IS NOT NULL DROP TABLE team_invitation;
IF OBJECT_ID('prize', 'U') IS NOT NULL DROP TABLE prize;
IF OBJECT_ID('score', 'U') IS NOT NULL DROP TABLE score;
IF OBJECT_ID('submission', 'U') IS NOT NULL DROP TABLE submission;
IF OBJECT_ID('team_member', 'U') IS NOT NULL DROP TABLE team_member;
IF OBJECT_ID('team', 'U') IS NOT NULL DROP TABLE team;
IF OBJECT_ID('criterion', 'U') IS NOT NULL DROP TABLE criterion;
IF OBJECT_ID('round', 'U') IS NOT NULL DROP TABLE round;
IF OBJECT_ID('track', 'U') IS NOT NULL DROP TABLE track;
<<<<<<< HEAD
=======
IF OBJECT_ID('event_registration', 'U') IS NOT NULL DROP TABLE event_registration;
>>>>>>> main
IF OBJECT_ID('hackathon_event', 'U') IS NOT NULL DROP TABLE hackathon_event;
IF OBJECT_ID('_user', 'U') IS NOT NULL DROP TABLE _user;
GO

-- =============================================
<<<<<<< HEAD
-- 3. T?O B?NG
-- =============================================

-- B?ng User (�� n�ng c?p)
CREATE TABLE _user (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    role NVARCHAR(50), -- ROLE_ADMIN, ROLE_ORGANIZER, ROLE_JUDGE, ROLE_MENTOR, ROLE_PARTICIPANT
    fpt_student_id NVARCHAR(255),
    school_name NVARCHAR(255),

    -- C?t qu?n l� x�t duy?t & X�c th?c
    approved BIT DEFAULT 0,       -- D�nh cho Admin duy?t Organizer/Judge/Mentor
    is_verified BIT DEFAULT 0,    -- D�nh cho Participant t? x�c th?c email
    otp_code VARCHAR(10),         -- M� OTP g?i qua mail
    otp_expiry DATETIME2,         -- Th?i gian h?t h?n OTP

    -- C?t Profile c� nh�n
    skills NVARCHAR(MAX),
    github_url NVARCHAR(255)
);

-- B?ng Hackathon Event
=======
-- 3. TẠO BẢNG
-- =============================================

-- Bảng User (Đã nâng cấp)
CREATE TABLE _user (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       username NVARCHAR(255) NOT NULL UNIQUE,
                       password NVARCHAR(255) NOT NULL,
                       email NVARCHAR(255) NOT NULL UNIQUE,
                       role NVARCHAR(50), -- ADMIN, ORGANIZER, JUDGE, MENTOR, PARTICIPANT
                       fpt_student_id NVARCHAR(255),
                       school_name NVARCHAR(255),

    -- Cột quản lý xét duyệt & Xác thực
                       approved BIT DEFAULT 0,       -- Dành cho Admin duyệt Organizer/Judge/Mentor
                       is_verified BIT DEFAULT 0,    -- Dành cho Participant tự xác thực email
                       otp_code VARCHAR(10),         -- Mã OTP gửi qua mail
                       otp_expiry DATETIME2,         -- Thời gian hết hạn OTP

    -- Cột Profile cá nhân
                       skills NVARCHAR(MAX),
                       github_url NVARCHAR(255)
);

-- Bảng Hackathon Event
>>>>>>> main
CREATE TABLE hackathon_event (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    registration_start DATETIME2,
    registration_end DATETIME2,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
<<<<<<< HEAD
    image_url NVARCHAR(255)
);

-- B?ng Track (H?ng m?c thi d?u)
CREATE TABLE track (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    hackathon_event_id BIGINT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- B?ng Round (V�ng thi)
CREATE TABLE round (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    hackathon_event_id BIGINT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- B?ng Criterion (Ti�u ch� ch?m di?m)
CREATE TABLE criterion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    weight INT NOT NULL,
    hackathon_event_id BIGINT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- B?ng Team
CREATE TABLE team (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    project_name NVARCHAR(255),
    project_description NVARCHAR(MAX),
    track_id BIGINT,
    FOREIGN KEY (track_id) REFERENCES track(id)
);

-- B?ng Team Member
CREATE TABLE team_member (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_leader BIT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- B?ng Team Invitation (M?i - Qu?n l� l?i m?i v�o nh�m)
CREATE TABLE team_invitation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id BIGINT NOT NULL,
    inviter_id BIGINT NOT NULL,
    invitee_email NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES _user(id)
);

-- B?ng Submission (N?p b�i thi)
CREATE TABLE submission (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id BIGINT NOT NULL,
    round_id BIGINT NOT NULL,
    repository_url NVARCHAR(255),
    demo_url NVARCHAR(255),
    report_url NVARCHAR(255),
    version INT DEFAULT 1,
    submitted_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES round(id)
);

-- B?ng Judge Assignment (M?i - Ph�n c�ng gi�m kh?o cho b�i n?p)
CREATE TABLE judge_assignment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    judge_id BIGINT NOT NULL,
    submission_id BIGINT NOT NULL,
    assigned_by_organizer_id BIGINT,
    FOREIGN KEY (judge_id) REFERENCES _user(id),
    FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_organizer_id) REFERENCES _user(id),
    UNIQUE (judge_id, submission_id) -- M?t gi�m kh?o ch? du?c g�n cho m?t b�i n?p m?t l?n
);

-- B?ng Score (�i?m s?)
CREATE TABLE score (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    judge_id BIGINT NOT NULL,
    submission_id BIGINT NOT NULL,
    criterion_id BIGINT NOT NULL,
    score_value INT NOT NULL,
    comment NVARCHAR(MAX),
    scored_at DATETIME2 DEFAULT GETDATE(),
    UNIQUE (judge_id, submission_id, criterion_id),
    FOREIGN KEY (judge_id) REFERENCES _user(id),
    FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
    FOREIGN KEY (criterion_id) REFERENCES criterion(id)
);

-- B?ng Prize (Gi?i thu?ng)
CREATE TABLE prize (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    hackathon_event_id BIGINT NOT NULL,
    track_id BIGINT,
    winning_team_id BIGINT,
    rank INT,
    FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id),
    FOREIGN KEY (track_id) REFERENCES track(id),
    FOREIGN KEY (winning_team_id) REFERENCES team(id)
);

-- B?ng Mentorship Request (M?i - Xin h? tr? t? Mentor)
CREATE TABLE mentorship_request (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    team_id BIGINT NOT NULL,
    mentor_id BIGINT, -- NULL n?u chua c� mentor nh?n
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES _user(id)
);

-- B?ng Notification (M?i - H? th?ng th�ng b�o)
CREATE TABLE notification (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- B?ng Audit Log
CREATE TABLE audit_log (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT,
    action NVARCHAR(255) NOT NULL,
    details NVARCHAR(MAX),
=======
    max_team_size INT DEFAULT 5,
    min_team_size INT DEFAULT 2,
    rules NVARCHAR(MAX),
    image_url NVARCHAR(255),
    organizer_id BIGINT,
>>>>>>> main
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (organizer_id) REFERENCES _user(id)
);
<<<<<<< HEAD
GO

-- =============================================
-- 4. INSERT D? LI?U M?U (SEED DATA)
-- Password m?c d?nh: password123
-- Luu �: �� th�m ti?n t? ROLE_ d? Spring Security nh?n di?n
-- =============================================
INSERT INTO _user (username, password, email, role, fpt_student_id, school_name, approved, is_verified)
VALUES
('admin', 'password123', 'admin@fpt.edu.vn', 'ROLE_ADMIN', NULL, 'FPT', 1, 1),
('organizer1', 'password123', 'organizer1@fpt.edu.vn', 'ROLE_ORGANIZER', NULL, 'FPT', 1, 1),
('judge1', 'password123', 'judge1@fpt.edu.vn', 'ROLE_JUDGE', NULL, 'FPT', 1, 1),
('mentor1', 'password123', 'mentor1@fpt.edu.vn', 'ROLE_MENTOR', NULL, 'FPT', 1, 1),
('student1', 'password123', 'student1@fpt.edu.vn', 'ROLE_PARTICIPANT', 'SE170001', 'FPT University', 0, 1);

INSERT INTO hackathon_event (name, slug, description, start_time, end_time)
VALUES ('FPT Hackathon 2026', 'fpt-hackathon-2026', 'Cu?c thi kh?i nghi?p c�ng ngh?', GETDATE(), DATEADD(day, 30, GETDATE()));

PRINT '=== Script Database ch?y th�nh c�ng! ===';
GO
=======

-- Bảng Track (Hạng mục thi đấu)
CREATE TABLE track (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng Event Registration (Mới)
CREATE TABLE event_registration (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                    event_id BIGINT NOT NULL,
                                    user_id BIGINT NOT NULL,
                                    status NVARCHAR(50) DEFAULT 'REGISTERED',
                                    registered_at DATETIME2 DEFAULT GETDATE(),
                                    FOREIGN KEY (event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE,
                                    FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE,
                                    UNIQUE (event_id, user_id)
);

-- Bảng Round (Vòng thi)
CREATE TABLE round (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       start_time DATETIME2 NOT NULL,
                       end_time DATETIME2 NOT NULL,
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng Criterion (Tiêu chí chấm điểm)
CREATE TABLE criterion (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name NVARCHAR(255) NOT NULL,
                           description NVARCHAR(MAX),
                           max_score INT NOT NULL,
                           weight INT DEFAULT 1 NOT NULL,
                           hackathon_event_id BIGINT,
                           FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id) ON DELETE CASCADE
);

-- Bảng Team
CREATE TABLE team (
                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                      name NVARCHAR(255) NOT NULL,
                      project_name NVARCHAR(255),
                      project_description NVARCHAR(MAX),
                      track_id BIGINT,
                      event_id BIGINT NOT NULL,
                      status NVARCHAR(50) DEFAULT 'ACTIVE',
                      created_at DATETIME2 DEFAULT GETDATE(),
                      FOREIGN KEY (track_id) REFERENCES track(id),
                      FOREIGN KEY (event_id) REFERENCES hackathon_event(id),
                      UNIQUE (name, event_id)
);

-- Bảng Team Member
CREATE TABLE team_member (
                             id BIGINT IDENTITY(1,1) PRIMARY KEY,
                             team_id BIGINT NOT NULL,
                             user_id BIGINT NOT NULL,
                             is_leader BIT DEFAULT 0,
                             FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
                             FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng Team Invitation (Mới - Quản lý lời mời vào nhóm)
CREATE TABLE team_invitation (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 team_id BIGINT NOT NULL,
                                 inviter_id BIGINT NOT NULL,
                                 invitee_email NVARCHAR(255) NOT NULL,
                                 status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
                                 created_at DATETIME2 DEFAULT GETDATE(),
                                 FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
                                 FOREIGN KEY (inviter_id) REFERENCES _user(id)
);

-- Bảng Submission (Nộp bài thi)
CREATE TABLE submission (
                            id BIGINT IDENTITY(1,1) PRIMARY KEY,
                            team_id BIGINT NOT NULL,
                            round_id BIGINT NOT NULL,
                            repository_url NVARCHAR(255),
                            demo_url NVARCHAR(255),
                            report_url NVARCHAR(255),
                            version INT DEFAULT 1,
                            submitted_at DATETIME2 DEFAULT GETDATE(),
                            FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
                            FOREIGN KEY (round_id) REFERENCES round(id)
);

-- Bảng Judge Assignment (Mới - Phân công giám khảo cho bài nộp)
CREATE TABLE judge_assignment (
                                  id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                  judge_id BIGINT NOT NULL,
                                  submission_id BIGINT NOT NULL,
                                  assigned_by_organizer_id BIGINT,
                                  FOREIGN KEY (judge_id) REFERENCES _user(id),
                                  FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
                                  FOREIGN KEY (assigned_by_organizer_id) REFERENCES _user(id),
                                  UNIQUE (judge_id, submission_id) -- Một giám khảo chỉ được gán cho một bài nộp một lần
);

-- Bảng Score (Điểm số)
CREATE TABLE score (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       judge_id BIGINT NOT NULL,
                       submission_id BIGINT NOT NULL,
                       criterion_id BIGINT NOT NULL,
                       score_value INT NOT NULL,
                       comment NVARCHAR(MAX),
                       scored_at DATETIME2 DEFAULT GETDATE(),
                       UNIQUE (judge_id, submission_id, criterion_id),
                       FOREIGN KEY (judge_id) REFERENCES _user(id),
                       FOREIGN KEY (submission_id) REFERENCES submission(id) ON DELETE CASCADE,
                       FOREIGN KEY (criterion_id) REFERENCES criterion(id)
);

-- Bảng Prize (Giải thưởng)
CREATE TABLE prize (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       hackathon_event_id BIGINT NOT NULL,
                       track_id BIGINT,
                       winning_team_id BIGINT,
                       rank INT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id),
                       FOREIGN KEY (track_id) REFERENCES track(id),
                       FOREIGN KEY (winning_team_id) REFERENCES team(id)
);

-- Bảng Mentorship Request (Mới - Xin hỗ trợ từ Mentor)
CREATE TABLE mentorship_request (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                    team_id BIGINT NOT NULL,
                                    mentor_id BIGINT, -- NULL nếu chưa có mentor nhận
                                    title NVARCHAR(255) NOT NULL,
                                    description NVARCHAR(MAX),
                                    status NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
                                    created_at DATETIME2 DEFAULT GETDATE(),
                                    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
                                    FOREIGN KEY (mentor_id) REFERENCES _user(id)
);

-- Bảng Notification (Mới - Hệ thống thông báo)
CREATE TABLE notification (
                              id BIGINT IDENTITY(1,1) PRIMARY KEY,
                              user_id BIGINT NOT NULL,
                              title NVARCHAR(255) NOT NULL,
                              message NVARCHAR(MAX),
                              is_read BIT DEFAULT 0,
                              created_at DATETIME2 DEFAULT GETDATE(),
                              FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- Bảng Audit Log
CREATE TABLE audit_log (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           user_id BIGINT,
                           action NVARCHAR(255) NOT NULL,
                           details NVARCHAR(MAX),
                           created_at DATETIME2 DEFAULT GETDATE(),
                           FOREIGN KEY (user_id) REFERENCES _user(id)
);
GO

-- =============================================
-- 4. INSERT DỮ LIỆU MẪU (SEED DATA)
-- Password mặc định: password123 (đã được hash bằng BCrypt)
-- =============================================
INSERT INTO _user (username, password, email, role, fpt_student_id, school_name, approved, is_verified)
VALUES
('admin', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'admin@fpt.edu.vn', 'ADMIN', NULL, 'FPT', 1, 1),
('organizer1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'organizer1@fpt.edu.vn', 'ORGANIZER', NULL, 'FPT', 1, 1),
('judge1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'judge1@fpt.edu.vn', 'JUDGE', NULL, 'FPT', 1, 1),
('mentor1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'mentor1@fpt.edu.vn', 'MENTOR', NULL, 'FPT', 1, 1),
('student1', '$2a$10$lj8/uT7YJgOHJnoi7fxajuiaEWepHCxRWA1xtOqYv5iGdjG6KdVru', 'student1@fpt.edu.vn', 'PARTICIPANT', 'SE170001', 'FPT University', 0, 1);

INSERT INTO hackathon_event (name, slug, description, start_time, end_time, organizer_id)
VALUES ('FPT Hackathon 2026', 'fpt-hackathon-2026', 'Cuộc thi khởi nghiệp công nghệ', GETDATE(), DATEADD(day, 30, GETDATE()), 2);

PRINT '=== Script Database chạy thành công! ===';
GO
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
>>>>>>> main
