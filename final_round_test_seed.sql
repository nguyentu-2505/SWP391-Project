-- Seed database for Final Round test
USE HackathonDB;
GO

-- 1. Xóa sạch dữ liệu cũ
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

-- 2. Reset ID tự tăng
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
GO

-- 3. Cập duyệt tài khoản hoạt động
UPDATE _user SET approved = 1, is_verified = 1;
GO

-- 4. Tạo Hackathon Event (ID = 1, status: DRAFT)
INSERT INTO hackathon_event (name, slug, description, status, start_time, end_time, organizer_id)
VALUES (N'FPT Hackathon Season 2 - Updated', 'fpt-hackathon-mua-2-cap-nhat', N'FPT Technology Competition', 'IN_PROGRESS', GETDATE(), DATEADD(day, 30, GETDATE()), 2);
GO

-- 5. Tạo Track (ID = 1)
INSERT INTO track (name, description, hackathon_event_id)
VALUES (N'AI & IoT', N'Developing technology solutions combining AI and IoT', 1);
GO

-- 6. Tạo Vòng thi (Vòng 1 - ID = 1, Vòng 2 là vòng cuối - ID = 2)
-- Đặt endTime của Vòng 2 ở quá khứ (lùi về 5 phút trước) để cho phép thăng hạng/kết thúc
INSERT INTO round (name, description, start_time, end_time, hackathon_event_id, round_order, advancement_slots)
VALUES 
(N'Preliminary Round', N'Knockout round evaluating initial products', '2026-06-10T00:00:00', '2026-06-11T20:00:00', 1, 1, 2),
(N'Final Round', N'Final round product presentation', '2026-06-12T08:00:00', DATEADD(minute, -5, GETDATE()), 1, 2, 1);
GO

-- 7. Tạo Tiêu chí (ID = 1)
INSERT INTO criterion (name, description, max_score, weight, hackathon_event_id)
VALUES (N'Creativity', N'Breakthrough and novel ideas', 10, 2, 1);
GO

-- 8. Đăng ký sự kiện & Tạo đội thi (Team ID = 1, Leader là student1 ID = 8)
INSERT INTO event_registration (event_id, user_id, status, registered_at)
VALUES (1, 8, 'REGISTERED', GETDATE());

INSERT INTO team (name, project_name, project_description, track_id, event_id, status, created_at)
VALUES (N'Super Coders', N'AI Waste Bin', N'AI waste bin with automatic sorting', 1, 1, 'ACTIVE', GETDATE());

INSERT INTO team_member (team_id, user_id, is_leader)
VALUES (1, 8, 1);
GO

-- 9. Thăng hạng đội thi từ Vòng 1 sang Vòng 2
INSERT INTO team_round_advancement (team_id, from_round_id, to_round_id, advanced_by, advanced_at)
VALUES (1, 1, 2, 2, GETDATE());
GO

-- 10. Đội thi nộp bài cho Vòng 2 (Vòng Chung Kết - Submission ID = 1)
INSERT INTO submission (team_id, round_id, repository_url, demo_url, report_url, version, submitted_at)
VALUES (1, 2, 'https://github.com/super-coders/ai-bin-final', 'https://youtube.com/watch?v=ai-bin-final-demo', 'https://drive.google.com/file/d/ai-bin-final-report', 1, GETDATE());
GO

-- 11. Phân công giám khảo chấm bài Vòng 2 (judge1 ID = 4 chấm Round 2)
INSERT INTO judge_assignment (judge_id, round_id, track_id, assigned_by_organizer_id, status, assigned_at)
VALUES (4, 2, NULL, 2, 'ASSIGNED', GETDATE());
GO

-- 12. Giám khảo chấm điểm bài Vòng 2 (9 điểm) & Ban tổ chức chốt điểm (is_finalized = 1)
INSERT INTO score (judge_id, submission_id, criterion_id, score_value, comment, scored_at, is_finalized)
VALUES (4, 1, 1, 9, N'Excellent finished product!', GETDATE(), 1);
GO

PRINT '=== Seeded database successfully for Final Round test! ===';
GO
