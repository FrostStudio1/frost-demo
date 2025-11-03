# 💻 GPT-5 Prompt: Backend Implementation för Schema/Resursplanering

```
Du är senior developer för Frost Solutions. Implementera schema/resursplanering backend.

## Context från Research

Vi har tagit följande beslut baserat på research:
- @dnd-kit för drag & drop (frontend)
- react-big-calendar för calendar (frontend)
- PostgreSQL GIST index + EXCLUDE constraint för conflict detection
- Event-driven sync för auto-time entry creation

## Requirements

### 1. Database Schema

Skapa två tabeller:

**schedule_slots:**
- id (UUID, primary key)
- tenant_id (UUID, FK → tenants)
- employee_id (UUID, FK → employees)
- project_id (UUID, FK → projects)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- status (TEXT: 'scheduled', 'confirmed', 'completed', 'cancelled')
- notes (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (UUID, FK → users/id)

**absences:**
- id (UUID, primary key)
- tenant_id (UUID, FK → tenants)
- employee_id (UUID, FK → employees)
- start_date (DATE)
- end_date (DATE)
- type (TEXT: 'vacation', 'sick', 'other')
- status (TEXT: 'pending', 'approved', 'rejected')
- reason (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 2. Database Constraints & Indexes

**För schedule_slots:**
- CHECK constraint: end_time > start_time
- CHECK constraint: end_time - start_time <= 12 hours
- GIST index för overlap queries:
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;
  CREATE INDEX idx_schedule_slots_time_range 
  ON schedule_slots USING GIST (employee_id, tsrange(start_time, end_time));
  ```
- EXCLUDE constraint för prevent_double_booking:
  ```sql
  ALTER TABLE schedule_slots
  ADD CONSTRAINT prevent_double_booking
  EXCLUDE USING GIST (
    employee_id WITH =,
    tsrange(start_time, end_time) WITH &&
  ) WHERE (status != 'cancelled');
  ```

**För absences:**
- CHECK constraint: end_date >= start_date

### 3. Row Level Security (RLS)

**schedule_slots policies:**
- SELECT: Employees kan se sina egna + admins kan se alla (per tenant)
- INSERT: Employees kan skapa sina egna + admins kan skapa alla (per tenant)
- UPDATE: Employees kan uppdatera sina egna + admins kan uppdatera alla (per tenant)
- DELETE: Employees kan ta bort sina egna + admins kan ta bort alla (per tenant)

**absences policies:**
- SELECT: Employees kan se sina egna + admins kan se alla (per tenant)
- INSERT: Employees kan skapa sina egna + admins kan skapa alla (per tenant)
- UPDATE: Employees kan uppdatera sina egna + admins kan uppdatera alla (per tenant)
- DELETE: Employees kan ta bort sina egna + admins kan ta bort alla (per tenant)

### 4. API Endpoints

**POST /api/schedules**
- Request body: { employee_id, project_id, start_time, end_time, status?, notes? }
- Validate: Time range valid, no conflicts (frontend + backend check)
- Return: Created schedule object

**GET /api/schedules**
- Query params: employee_id?, project_id?, start_date?, end_date?, status?
- Filter by tenant_id (automatic)
- Return: Array of schedule objects

**PUT /api/schedules/[id]**
- Request body: { start_time?, end_time?, status?, notes? }
- Validate: Time range valid, no conflicts, user has permission
- Return: Updated schedule object

**DELETE /api/schedules/[id]**
- Validate: User has permission
- Return: 204 No Content

**GET /api/schedules/conflicts**
- Query params: employee_id, start_time, end_time, exclude_id? (for updates)
- Check for conflicts using PostgreSQL query
- Return: { hasConflict: boolean, conflicts: Array }

**POST /api/schedules/[id]/complete**
- Mark schedule as 'completed'
- Auto-create draft time entry (if not exists)
- Return: { schedule: updated schedule, timeEntry: created/updated time entry }

**POST /api/absences**
- Request body: { employee_id, start_date, end_date, type, reason? }
- Validate: Date range valid
- Return: Created absence object

**GET /api/absences**
- Query params: employee_id?, start_date?, end_date?, status?
- Filter by tenant_id (automatic)
- Return: Array of absence objects

**PUT /api/absences/[id]**
- Request body: { start_date?, end_date?, type?, status?, reason? }
- Validate: User has permission
- Return: Updated absence object

**DELETE /api/absences/[id]**
- Validate: User has permission
- Return: 204 No Content

### 5. Conflict Detection Logic

**Frontend (application logic):**
- Sweep Line Algorithm för O(n log n) conflict detection
- Real-time validation när användare bokar
- Visual feedback för conflicts

**Backend (database-level):**
- PostgreSQL EXCLUDE constraint förhindrar overlaps
- Query för att hitta conflicts:
  ```sql
  SELECT id, start_time, end_time
  FROM schedule_slots
  WHERE employee_id = $1
    AND status != 'cancelled'
    AND tsrange(start_time, end_time) && tsrange($2, $3)
    AND ($4 IS NULL OR id != $4);
  ```

### 6. Auto-Time Entry Creation

**Pattern: Event-driven sync**

När schedule status ändras till 'completed':
1. Check if time entry already exists (via source_schedule_id)
2. Calculate hours: (end_time - start_time) in hours
3. Create draft time entry:
   - employee_id (from schedule)
   - project_id (from schedule)
   - date (from schedule.start_time)
   - hours (calculated)
   - description: "Auto-genererad från schema"
   - source_schedule_id: schedule.id
   - is_auto_generated: true
   - status: 'draft'
4. Return created/updated time entry

**Service function:**
```typescript
async function createTimeEntryFromSchedule(scheduleId: string): Promise<TimeEntry> {
  // Implementation
}
```

### 7. Error Handling

- 400 Bad Request: Invalid time range, invalid date format
- 403 Forbidden: User doesn't have permission
- 409 Conflict: Overlapping schedule detected
- 404 Not Found: Schedule/absence not found
- 500 Internal Server Error: Database error

### 8. TypeScript Types

Skapa TypeScript interfaces för:
- ScheduleSlot
- Absence
- CreateScheduleRequest
- UpdateScheduleRequest
- ConflictCheckRequest
- ConflictCheckResponse

## Existing Codebase Patterns

- Supabase client: `createClient` från `@/utils/supabase/supabaseClient`
- Service role: `createAdminClient` från `@/utils/supabase/admin`
- Tenant isolation: Always filter by tenant_id
- RLS: Policies enforced via Supabase
- Error handling: Use `extractErrorMessage` från `@/lib/errorUtils`
- API routes: Next.js App Router API routes

## Code Style

- TypeScript strict mode
- Async/await (not promises)
- Error handling med try/catch
- Return proper HTTP status codes
- Use Supabase types where possible
- Progressive fallback för missing columns

## Make it Production-Ready

- Proper error handling
- Validation på alla inputs
- Tenant isolation enforced
- RLS policies correct
- Database constraints working
- Performance optimized queries
- TypeScript types complete

Skriv:
1. SQL migration fil (idempotent)
2. API route handlers (alla endpoints ovan)
3. Business logic för conflict detection
4. Service function för auto-time entry creation
5. TypeScript types/interfaces

Börja med SQL migration, sedan API endpoints, sedan business logic.
```

