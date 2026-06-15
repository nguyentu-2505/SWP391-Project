-- Clean submissions, scores, advancements, and logs to test flow from scratch
USE HackathonDB;
GO

-- 1. Xóa các bảng dữ liệu phát sinh sau khi tạo Đội thi
DELETE FROM score;
DELETE FROM submission;
DELETE FROM judge_assignment;
DELETE FROM team_round_advancement;
DELETE FROM mentorship_request;
DELETE FROM notification;
DELETE FROM audit_log;
DELETE FROM prize;
DELETE FROM team_invitation;
GO

-- 2. Reset ID tự tăng về 0
DBCC CHECKIDENT ('score', RESEED, 0);
DBCC CHECKIDENT ('submission', RESEED, 0);
DBCC CHECKIDENT ('judge_assignment', RESEED, 0);
DBCC CHECKIDENT ('team_round_advancement', RESEED, 0);
DBCC CHECKIDENT ('mentorship_request', RESEED, 0);
DBCC CHECKIDENT ('notification', RESEED, 0);
DBCC CHECKIDENT ('audit_log', RESEED, 0);
DBCC CHECKIDENT ('prize', RESEED, 0);
DBCC CHECKIDENT ('team_invitation', RESEED, 0);
GO

PRINT '=== Database cleaned! Ready for submission and scoring flow from scratch ===';
GO
