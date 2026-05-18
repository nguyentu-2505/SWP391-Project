-- 1. Tạo Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HackathonDB')
BEGIN
    CREATE DATABASE HackathonDB;
END
GO

USE HackathonDB;
GO

-- 2. Xóa bảng cũ nếu có (để đảm bảo chạy lại script không bị lỗi)
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('score', 'U') IS NOT NULL DROP TABLE score;
IF OBJECT_ID('submission', 'U') IS NOT NULL DROP TABLE submission;
IF OBJECT_ID('prize', 'U') IS NOT NULL DROP TABLE prize;
IF OBJECT_ID('team_member', 'U') IS NOT NULL DROP TABLE team_member;
IF OBJECT_ID('team', 'U') IS NOT NULL DROP TABLE team;
IF OBJECT_ID('criterion', 'U') IS NOT NULL DROP TABLE criterion;
IF OBJECT_ID('round', 'U') IS NOT NULL DROP TABLE round;
IF OBJECT_ID('track', 'U') IS NOT NULL DROP TABLE track;
IF OBJECT_ID('hackathon_event', 'U') IS NOT NULL DROP TABLE hackathon_event;
IF OBJECT_ID('_user', 'U') IS NOT NULL DROP TABLE _user;
GO

-- 3. Tạo bảng User
CREATE TABLE _user (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       username NVARCHAR(255) NOT NULL UNIQUE,
                       password NVARCHAR(255) NOT NULL,
                       email NVARCHAR(255) NOT NULL UNIQUE,
                       role NVARCHAR(50),
                       fpt_student_id NVARCHAR(255),
                       school_name NVARCHAR(255),
                       approved BIT DEFAULT 0
);

-- 4. Tạo bảng Hackathon Event
CREATE TABLE hackathon_event (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 name NVARCHAR(255) NOT NULL,
                                 slug NVARCHAR(255) NOT NULL UNIQUE,
                                 description NVARCHAR(MAX),
                                 start_time DATETIME2 NOT NULL,
                                 end_time DATETIME2 NOT NULL,
                                 image_url NVARCHAR(255)
);

-- 5. Tạo bảng Track
CREATE TABLE track (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

-- 6. Tạo bảng Round
CREATE TABLE round (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       start_time DATETIME2 NOT NULL,
                       end_time DATETIME2 NOT NULL,
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

-- 7. Tạo bảng Team
CREATE TABLE team (
                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                      name NVARCHAR(255) NOT NULL UNIQUE,
                      project_name NVARCHAR(255),
                      project_description NVARCHAR(MAX),
                      track_id BIGINT,
                      FOREIGN KEY (track_id) REFERENCES track(id)
);

-- 8. Tạo bảng Team Member
CREATE TABLE team_member (
                             id BIGINT IDENTITY(1,1) PRIMARY KEY,
                             team_id BIGINT NOT NULL,
                             user_id BIGINT NOT NULL,
                             is_leader BIT DEFAULT 0,
                             FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
                             FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE
);

-- 9. Tạo bảng Submission
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

-- 10. Tạo bảng Criterion
CREATE TABLE criterion (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name NVARCHAR(255) NOT NULL,
                           description NVARCHAR(MAX),
                           weight INT NOT NULL,
                           hackathon_event_id BIGINT,
                           FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

-- 11. Tạo bảng Score
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

-- 12. Tạo bảng Prize
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

-- 13. Tạo bảng Audit Log
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
-- INSERT DỮ LIỆU MẪU (SEED DATA)
-- Password cho TẤT CẢ các tài khoản: password123
-- =============================================

INSERT INTO _user (username, password, email, role, fpt_student_id, school_name, approved)
VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@fpt.edu.vn', 'ADMIN', NULL, 'FPT University', 1),
('organizer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'organizer1@fpt.edu.vn', 'ORGANIZER', NULL, 'FPT University', 1),
('judge1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'judge1@fpt.edu.vn', 'JUDGE', NULL, 'FPT University', 1),
('student1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student1@fpt.edu.vn', 'TEAM_MEMBER', 'SE170001', 'FPT University HCM', 1);

-- Thêm sự kiện mẫu
INSERT INTO hackathon_event (name, slug, description, start_time, end_time)
VALUES ('Hackathon 2026', 'hackathon-2026', 'Cuộc thi lập trình 2026', GETDATE(), DATEADD(day, 7, GETDATE()));

PRINT '=== Script executed successfully! ===';
PRINT 'Login username: admin | password: password123';
GO
GO