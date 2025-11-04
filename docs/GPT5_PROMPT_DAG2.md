# 🤖 GPT-5 Prompt - Dag 2: Arbetsorder-system Backend

## 📋 Kopiera denna prompt till GPT-5:

```
Du är senior backend-utvecklare för Frost Solutions.

LÄGET JUST NU (Dag 2 - Arbetsorder-system):
- Vi ska implementera backend för arbetsorder-system med statusflöde och foto-upload
- Teknisk stack: Next.js 16 (App Router), Supabase (PostgreSQL), TypeScript, Zod validation
- Vi har redan implementerat schema/resursplanering-system (Dag 1) med success
- Vi har redan foto-upload funktionalitet för ÄTA som vi kan referera till (/api/ata/[id]/photos/route.ts)

BESLUT FRÅN CURSOR PRO (Lead Architect):
Baserat på Perplexity research har jag tagit följande beslut:

1. STATUSFLÖDE:
   ✅ Använd status: 'new' → 'assigned' → 'in_progress' → 'awaiting_approval' → 'approved' → 'completed'
   ✅ Implementera TypeScript State Machine för type-safe transitions
   ✅ Role-based access: admin kan alla transitions, employee kan bara vissa
   ✅ PostgreSQL CHECK constraint för extra säkerhet (men State Machine är primär)

2. DATABASE SCHEMA:
   ✅ work_orders tabell med alla kolumner från research (se nedan)
   ✅ work_order_photos tabell för foto-metadata
   ✅ work_order_status_history tabell för audit trail
   ✅ push_subscriptions tabell för push notifications
   ✅ RLS policies för tenant isolation (följ samma pattern som schedule_slots)

3. FOTO-UPLOAD:
   ✅ Använd Sharp för server-side compression (inte client-side)
   ✅ Skapa thumbnails automatiskt (300x300)
   ✅ Supabase Storage bucket: 'work-order-photos'
   ✅ Max filstorlek: 50MB per foto
   ✅ Auto-rotate baserat på EXIF data

4. PRIORITET:
   ✅ Använd: 'critical', 'high', 'medium', 'low' (inte 'urgent')

5. API ENDPOINTS:
   ✅ POST /api/work-orders - Skapa arbetsorder
   ✅ GET /api/work-orders - Lista arbetsorder (med filters: status, priority, project_id, assigned_to)
   ✅ GET /api/work-orders/[id] - Hämta specifik arbetsorder
   ✅ PUT /api/work-orders/[id] - Uppdatera arbetsorder
   ✅ DELETE /api/work-orders/[id] - Ta bort arbetsorder
   ✅ PATCH /api/work-orders/[id]/status - Ändra status (med State Machine validation)
   ✅ POST /api/work-orders/[id]/photos - Ladda upp foto
   ✅ GET /api/work-orders/[id]/photos - Hämta alla foton för arbetsorder
   ✅ DELETE /api/work-orders/[id]/photos/[photoId] - Ta bort foto

TEKNISK KONTEXT (FRÅN DAG 1):
- Tenant isolation via getTenantId() (från JWT eller cookies)
- Service role Supabase client för admin-operationer
- Alla API routes använder getTenantId() för tenant resolution
- useAdmin() hook finns redan (frontend), backend behöver kolla employee.role
- Validering med Zod schemas
- Error handling med tydliga felmeddelanden på svenska
- Foto-upload pattern finns i /api/ata/[id]/photos/route.ts (kan referera till)

VIKTIGA PATTERNS ATT FÖLJA:
- Alltid filtrera på tenant_id i alla queries
- Använd service role för admin-operationer när nödvändigt
- Validera input med Zod schemas
- Returnera tydliga felmeddelanden på svenska
- Hantera edge cases (tomma resultat, null-värden, etc.)
- Använd TypeScript types för allt
- Följ Next.js 16 App Router patterns
- Använd samma error handling pattern som i schedule API routes

DATABASE SCHEMA REQUIREMENTS:

1. work_orders tabell:
   - id (UUID, PK)
   - tenant_id (UUID, FK, NOT NULL)
   - number (TEXT, NOT NULL) - Format: "WO-2025-001" (auto-generera)
   - title (TEXT, NOT NULL)
   - description (TEXT, nullable)
   - project_id (UUID, FK → projects.id, nullable)
   - assigned_to (UUID, FK → employees.id, nullable) - Nullable tills tilldelad
   - created_by (UUID, FK → users.id, NOT NULL)
   - status (TEXT, CHECK constraint) - 'new', 'assigned', 'in_progress', 'awaiting_approval', 'approved', 'completed'
   - priority (TEXT, CHECK constraint) - 'critical', 'high', 'medium', 'low'
   - scheduled_date (DATE, nullable)
   - scheduled_start_time (TIME, nullable)
   - scheduled_end_time (TIME, nullable)
   - completed_at (TIMESTAMP, nullable)
   - approved_at (TIMESTAMP, nullable)
   - approved_by (UUID, FK → users.id, nullable)
   - created_at (TIMESTAMP, DEFAULT NOW())
   - updated_at (TIMESTAMP, DEFAULT NOW())
   - Indexes: tenant_id, status, assigned_to, scheduled_date

2. work_order_photos tabell:
   - id (UUID, PK)
   - work_order_id (UUID, FK → work_orders.id, ON DELETE CASCADE)
   - file_path (TEXT, NOT NULL) - Supabase Storage path
   - thumbnail_path (TEXT, nullable) - Thumbnail path
   - file_size_bytes (INT, nullable)
   - mime_type (TEXT, nullable)
   - uploaded_by (UUID, FK → users.id, NOT NULL)
   - uploaded_at (TIMESTAMP, DEFAULT NOW())
   - CHECK constraint: file_size_bytes < 52428800 (50MB)

3. work_order_status_history tabell:
   - id (UUID, PK)
   - work_order_id (UUID, FK → work_orders.id, ON DELETE CASCADE)
   - from_status (TEXT, nullable)
   - to_status (TEXT, NOT NULL)
   - changed_by (UUID, FK → users.id, NOT NULL)
   - changed_at (TIMESTAMP, DEFAULT NOW())
   - reason (TEXT, nullable)
   - CHECK constraint: from_status != to_status

4. push_subscriptions tabell:
   - id (UUID, PK)
   - user_id (UUID, FK → users.id, ON DELETE CASCADE)
   - tenant_id (UUID, FK → tenants.id)
   - device_id (UUID, NOT NULL)
   - endpoint (TEXT, NOT NULL, UNIQUE)
   - p256dh (TEXT, NOT NULL)
   - auth (TEXT, NOT NULL)
   - user_agent (TEXT, nullable)
   - created_at (TIMESTAMP, DEFAULT NOW())

RLS POLICIES:
- work_orders: Admin kan se/edit alla inom tenant, employees kan bara se sina tilldelade + egna skapade
- work_order_photos: Samma som work_orders (via work_order_id)
- work_order_status_history: Samma som work_orders (via work_order_id)
- push_subscriptions: Users kan bara se sina egna subscriptions

IMPLEMENTATION-UPPGIFTER:

1. SKAPA SQL MIGRATION FIL:
   Filnamn: sql/CREATE_WORK_ORDERS_SYSTEM.sql
   - Skapa alla 4 tabeller enligt schema ovan
   - Lägg till alla indexes
   - Lägg till alla CHECK constraints
   - Skapa RLS policies för alla tabeller
   - Skapa trigger för work_order_status_history (auto-log vid status change)
   - Skapa trigger för updated_at (auto-update på work_orders)
   - Kommentera kolumner med COMMENT ON COLUMN

2. SKAPA STATE MACHINE LIBRARY:
   Filnamn: lib/work-order-state-machine.ts
   - Implementera WorkOrderStateMachine class enligt research-exempel
   - TypeScript enum för status och priority
   - getValidTransitions() metod
   - isValidTransition() metod
   - getTransitionError() metod med svenska felmeddelanden
   - Role types: 'admin' | 'manager' | 'employee'
   - Exportera alla typer och funktioner

3. SKAPA API ROUTES:

   a) POST /api/work-orders/route.ts
      - Validera input med Zod (title, description, project_id, priority, etc.)
      - Auto-generera number (WO-YYYY-NNN format)
      - Set created_by från autentiserad user
      - Set tenant_id från getTenantId()
      - Set status till 'new' som default
      - Returnera skapad arbetsorder

   b) GET /api/work-orders/route.ts
      - Query params: status, priority, project_id, assigned_to
      - Filtrera på tenant_id
      - Sortering: created_at DESC som default
      - Pagination: limit och offset (optional)
      - Returnera lista av arbetsorder

   c) GET /api/work-orders/[id]/route.ts
      - Hämta specifik arbetsorder via id
      - Verifiera tenant_id match
      - Inkludera relaterade data (project, assigned employee, photos count)
      - Returnera arbetsorder eller 404

   d) PUT /api/work-orders/[id]/route.ts
      - Validera input med Zod
      - Verifiera tenant_id match
      - Verifiera att user har behörighet (admin eller created_by)
      - Uppdatera arbetsorder
      - Returnera uppdaterad arbetsorder

   e) DELETE /api/work-orders/[id]/route.ts
      - Verifiera tenant_id match
      - Verifiera att user är admin
      - Ta bort arbetsorder (cascade tar bort photos och history)
      - Returnera success

   f) PATCH /api/work-orders/[id]/status/route.ts
      - Validera input: to_status (Zod enum), reason (optional)
      - Hämta current status från databas
      - Hämta user role från employees tabell
      - Använd State Machine för att validera transition
      - Om ogiltig: returnera 400 med svenskt felmeddelande
      - Om giltig: uppdatera status + logga i history
      - Om approved: set approved_by och approved_at
      - Returnera uppdaterad arbetsorder

   g) POST /api/work-orders/[id]/photos/route.ts
      - Verifiera tenant_id match för work_order
      - Parse FormData och hämta file
      - Validera file type (endast images)
      - Validera file size (max 50MB)
      - Använd Sharp för compression:
        * Resize till max 2000x2000 (behåll aspect ratio)
        * Convert till JPEG med 80% quality
        * Auto-rotate baserat på EXIF
      - Skapa thumbnail (300x300, cover, center)
      - Upload både original och thumbnail till Supabase Storage
      - Spara metadata i work_order_photos tabell
      - Returnera photo med signed URLs (7 dagar giltighet)

   h) GET /api/work-orders/[id]/photos/route.ts
      - Hämta alla photos för arbetsorder
      - Verifiera tenant_id match
      - Generera signed URLs för alla photos (7 dagar)
      - Returnera lista med photoUrl och thumbnailUrl

   i) DELETE /api/work-orders/[id]/photos/[photoId]/route.ts
      - Verifiera tenant_id match via work_order
      - Verifiera att user är admin eller uploaded_by
      - Ta bort photo från Storage (både original och thumbnail)
      - Ta bort metadata från databas
      - Returnera success

4. ZOD SCHEMAS:
   Skapa lib/schemas/work-order.ts med:
   - CreateWorkOrderSchema
   - UpdateWorkOrderSchema
   - UpdateStatusSchema
   - WorkOrderStatusEnum (Zod enum)
   - PriorityEnum (Zod enum)

5. HELPER FUNCTIONS:
   - getWorkOrderNumber() - Generera WO-YYYY-NNN format
   - getUserRole() - Hämta user role från employees tabell
   - verifyWorkOrderAccess() - Verifiera tenant + permissions

VIKTIGT ATT KOMMA IHÅG:
- Alla felmeddelanden på svenska
- Använd getTenantId() från @/lib/serverTenant (samma som Dag 1)
- Använd service role client för admin-checks (samma pattern som schedule API)
- Foto-upload: Följ samma pattern som /api/ata/[id]/photos/route.ts men anpassa för work orders
- State Machine: Implementera exakt enligt research-exempel men med svenska felmeddelanden
- Error handling: Använd NextResponse.json() med status codes
- Logging: Console.error för errors, men inte expose intern info till client
- TypeScript: Använd proper types, inga 'any'
- RLS: Testa att policies fungerar korrekt

PACKAGE DEPENDENCIES SOM BEHÖVS:
- sharp (för foto-compression) - installera: npm install sharp
- web-push (för push notifications) - installera: npm install web-push (för framtida implementation)

SKRIV PRODUCTION-READY KOD:
- Proper error handling överallt
- Input validation med Zod
- TypeScript types för allt
- Kommentarer för komplex logik
- Testa edge cases (null values, empty arrays, etc.)
- Performance: Använd indexes, optimera queries

NÄR DU ÄR KLAR:
- Skriv alla filer enligt ovan
- Skapa SQL migration fil
- Skapa State Machine library
- Skapa alla API routes
- Skapa Zod schemas
- Skapa helper functions
- Förklara vad du har skapat och varför
- Notera eventuella dependencies som behöver installeras
```

---

## 🎯 Användning

1. **Kopiera hela prompten** ovan (från "Du är senior backend-utvecklare...")
2. **Klistra in i GPT-5**
3. **Vänta på implementation**
4. **Reviewa koden** (Cursor Pro) innan integration

---

**Status:** ✅ Redo för Dag 2 backend implementation! 🚀

