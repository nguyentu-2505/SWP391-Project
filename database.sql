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
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('mentorship_request', 'U') IS NOT NULL DROP TABLE mentorship_request;
IF OBJECT_ID('notification', 'U') IS NOT NULL DROP TABLE notification;
IF OBJECT_ID('judge_assignment', 'U') IS NOT NULL DROP TABLE judge_assignment; -- Mới
IF OBJECT_ID('team_invitation', 'U') IS NOT NULL DROP TABLE team_invitation;
IF OBJECT_ID('prize', 'U') IS NOT NULL DROP TABLE prize;
IF OBJECT_ID('score', 'U') IS NOT NULL DROP TABLE score;
IF OBJECT_ID('submission', 'U') IS NOT NULL DROP TABLE submission;
IF OBJECT_ID('team_member', 'U') IS NOT NULL DROP TABLE team_member;
IF OBJECT_ID('team', 'U') IS NOT NULL DROP TABLE team;
IF OBJECT_ID('criterion', 'U') IS NOT NULL DROP TABLE criterion;
IF OBJECT_ID('round', 'U') IS NOT NULL DROP TABLE round;
IF OBJECT_ID('track', 'U') IS NOT NULL DROP TABLE track;
IF OBJECT_ID('event_registration', 'U') IS NOT NULL DROP TABLE event_registration;
IF OBJECT_ID('hackathon_event', 'U') IS NOT NULL DROP TABLE hackathon_event;
IF OBJECT_ID('_user', 'U') IS NOT NULL DROP TABLE _user;
GO

-- =============================================
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
    max_team_size INT DEFAULT 5,
    min_team_size INT DEFAULT 2,
    rules NVARCHAR(MAX),
    image_url NVARCHAR(255),
    organizer_id BIGINT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (organizer_id) REFERENCES _user(id)
);

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