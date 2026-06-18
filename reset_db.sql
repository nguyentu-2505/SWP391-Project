-- Reset database script for SWP391 Project
USE HackathonDB;
GO

-- 1. Delete rows in order of foreign key constraints
DELETE FROM score;
DELETE FROM submission;
DELETE FROM judge_assignment;
DELETE FROM team_round_advancement;
DELETE FROM prize;
DELETE FROM mentorship_request;
DELETE FROM notification;
DELETE FROM audit_log;
DELETE FROM team_member;
DELETE FROM team_invitation;
DELETE FROM track_mentor;
DELETE FROM team;
DELETE FROM event_registration;
DELETE FROM criterion;
DELETE FROM round;
DELETE FROM track;
DELETE FROM hackathon_event;
DELETE FROM refresh_token;
DELETE FROM password_reset_token;
GO

-- 2. Reseed identity keys
DBCC CHECKIDENT ('score', RESEED, 0);
DBCC CHECKIDENT ('submission', RESEED, 0);
DBCC CHECKIDENT ('judge_assignment', RESEED, 0);
DBCC CHECKIDENT ('team_round_advancement', RESEED, 0);
DBCC CHECKIDENT ('prize', RESEED, 0);
DBCC CHECKIDENT ('mentorship_request', RESEED, 0);
DBCC CHECKIDENT ('notification', RESEED, 0);
DBCC CHECKIDENT ('audit_log', RESEED, 0);
DBCC CHECKIDENT ('team_member', RESEED, 0);
DBCC CHECKIDENT ('team_invitation', RESEED, 0);
DBCC CHECKIDENT ('track_mentor', RESEED, 0);
DBCC CHECKIDENT ('team', RESEED, 0);
DBCC CHECKIDENT ('event_registration', RESEED, 0);
DBCC CHECKIDENT ('criterion', RESEED, 0);
DBCC CHECKIDENT ('round', RESEED, 0);
DBCC CHECKIDENT ('track', RESEED, 0);
DBCC CHECKIDENT ('hackathon_event', RESEED, 0);
DBCC CHECKIDENT ('refresh_token', RESEED, 0);
DBCC CHECKIDENT ('password_reset_token', RESEED, 0);
GO

-- 3. Update users and seed default events
UPDATE _user SET approved = 1 WHERE username = 'student1';

INSERT INTO hackathon_event (name, slug, description, status, start_time, end_time, organizer_id) 
VALUES 
(N'FPT Hackathon Mùa 2 - Cập Nhật', 'fpt-hackathon-mua-2-cap-nhat', N'Cuộc thi công nghệ FPT', 'REGISTRATION_OPEN', GETDATE(), DATEADD(day, 30, GETDATE()), 2),
(N'Chikawa Game Jam', 'chikawa-game-jam', N'Game Jam lập trình game 48h', 'REGISTRATION_OPEN', GETDATE(), DATEADD(day, 30, GETDATE()), 2),
(N'FPT Hackathon Mùa 2', 'fpt-hackathon-mua-2', N'Bản gốc sự kiện FPT', 'PUBLISHED', GETDATE(), DATEADD(day, 30, GETDATE()), 2);
GO

PRINT '=== Database reset & seeded successfully! ===';
GO
