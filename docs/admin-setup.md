# Klyron Admin Setup

The private dashboard is available at `/admin`. Complete these steps once in Supabase:

1. Open **SQL Editor** and run [`supabase/admin-dashboard.sql`](../supabase/admin-dashboard.sql).
2. Open **Authentication → Users** and create the administrator with an email and password.
3. Return to **SQL Editor** and grant access:

```sql
insert into public.admin_users (user_id, full_name, role)
select id, 'Klyron Administrator', 'admin'
from auth.users
where email = 'replace-with-your-admin-email@example.com';
```

4. Visit `https://www.klyronconsulting.com/admin` and sign in.

The dashboard uses row-level security. Public visitors may submit booking and contact forms, but cannot read records, change statuses, or access internal notes.
