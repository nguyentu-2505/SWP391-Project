-- =====================================================
-- FIX VIETNAMESE ENCODING IN DATABASE
-- Chạy script này trong SQL Server Management Studio
-- hoặc bất kỳ SQL client nào kết nối HackathonDB
-- =====================================================

USE HackathonDB;
GO

-- Xem tất cả round names hiện tại để kiểm tra
SELECT id, name, description FROM round ORDER BY id;
GO

-- Fix tất cả round names bị lỗi encoding
-- Cập nhật từng tên phổ biến bị mojibake

UPDATE round SET
    name = CASE
        WHEN name LIKE '%ng lo%i%' OR name LIKE 'V%ng lo%' THEN N'Vòng loại'
        WHEN name LIKE 'V%ng S%' OR name LIKE '%ng S%lo%i%' THEN N'Vòng Sơ loại'
        WHEN name LIKE 'V%ng Chung k%t' OR name LIKE 'V%ng Chung%' THEN N'Vòng Chung kết'
        WHEN name LIKE 'V%ng %t%ng' OR name LIKE 'V%ng %' AND name LIKE '%t%ng%' THEN N'Vòng Ý tưởng'
        WHEN name LIKE 'V%ng Prototype' THEN N'Vòng Prototype'
        WHEN name LIKE 'V%ng B%n k%t' THEN N'Vòng Bán kết'
        WHEN name LIKE 'Final%' OR name LIKE 'Chung k%t%' THEN N'Vòng Chung kết'
        ELSE name
    END,
    description = CASE
        WHEN description LIKE '%N%p b%n m%' THEN N'Nộp bản mô tả ý tưởng và kế hoạch thực hiện'
        WHEN description LIKE '%Demo%' OR description LIKE '%prototype%' THEN description
        ELSE description
    END
WHERE name NOT LIKE N'%[NVARCHAR unicode test]%';
GO

-- Xem kết quả sau fix
SELECT id, name, description FROM round ORDER BY id;
GO

-- Fix track names nếu bị lỗi
SELECT id, name FROM track ORDER BY id;
GO

-- Fix hackathon_event names nếu bị lỗi
SELECT id, name FROM hackathon_event ORDER BY id;
GO
