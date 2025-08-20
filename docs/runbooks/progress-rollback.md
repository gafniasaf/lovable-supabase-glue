# Runbook — Progress Table Rollback

Scope: Roll back `progress` table writes if needed.

Caution: This removes user lesson completion records.

Steps:
1) Take a backup snapshot of the table (CSV export).
2) Disable writes by taking the API endpoint offline temporarily if needed.
3) Rollback SQL (example):

```sql
-- Soft delete (move to archive)
create table if not exists progress_archive as table progress with no data;
insert into progress_archive select * from progress;
truncate table progress;
```

4) To restore, insert back from `progress_archive`.

Notes:
- RLS policies remain unchanged.
- Consider feature-flagging `/api/lessons/complete` before rollback.
