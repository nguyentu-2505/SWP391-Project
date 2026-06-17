# Thong bao cho nhom: fix loi login sau khi pull code moi

Sau khi pull code moi, backend co them field `User.temporary` map voi cot `_user.is_temporary`.
Field Java dang la primitive `boolean`, nen database khong duoc de gia tri `NULL`.

Neu DB hien tai co `_user.is_temporary = NULL`, login se fail va API tra `401 Unauthorized`
du password/hash/role deu dung.

Moi nguoi chay file SQL:

```text
documentation/database-current-login-fix.sql
```

Hoac chay truc tiep noi dung fix chinh:

```sql
USE HackathonDB;
GO

IF COL_LENGTH('_user', 'is_temporary') IS NULL
BEGIN
    ALTER TABLE _user ADD is_temporary BIT NULL;
END;
GO

UPDATE _user
SET is_temporary = 0
WHERE is_temporary IS NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.default_constraints dc
    JOIN sys.columns c
      ON dc.parent_object_id = c.object_id
     AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('_user')
      AND c.name = 'is_temporary'
)
BEGIN
    ALTER TABLE _user
    ADD CONSTRAINT DF_user_is_temporary DEFAULT 0 FOR is_temporary;
END;
GO

ALTER TABLE _user
ALTER COLUMN is_temporary BIT NOT NULL;
GO
```

Sau khi chay xong, login lai:

```text
username: admin
password: password123
```

Neu van loi, xoa `accessToken` va `refreshToken` trong browser localStorage roi thu lai.
