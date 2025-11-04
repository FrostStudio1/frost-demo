# 🎨 Gemini 2.5 Prompt - Dag 2: Arbetsorder-system Frontend

## 📋 Kopiera denna prompt till Gemini 2.5:

```
Du är senior frontend-utvecklare för Frost Solutions.

LÄGET JUST NU (Dag 2 - Arbetsorder-system):
- Vi ska implementera frontend-komponenter för arbetsorder-system
- Backend är redan implementerat med API routes och State Machine
- Teknisk stack: Next.js 16 App Router, React Server/Client Components, TypeScript, Tailwind CSS, React Query
- Vi har redan implementerat schema/resursplanering-system (Dag 1) med success

BESLUT FRÅN CURSOR PRO (Lead Architect):
Backend är klar med följande API endpoints:
- POST /api/work-orders - Skapa arbetsorder
- GET /api/work-orders - Lista arbetsorder (med filters: status, priority, project_id, assigned_to)
- GET /api/work-orders/[id] - Hämta specifik arbetsorder
- PUT /api/work-orders/[id] - Uppdatera arbetsorder
- DELETE /api/work-orders/[id] - Ta bort arbetsorder
- PATCH /api/work-orders/[id]/status - Ändra status (med State Machine validation)
- POST /api/work-orders/[id]/photos - Ladda upp foto
- GET /api/work-orders/[id]/photos - Hämta alla foton
- DELETE /api/work-orders/[id]/photos/[photoId] - Ta bort foto

Statusflöde: 'new' → 'assigned' → 'in_progress' → 'awaiting_approval' → 'approved' → 'completed'
Prioritet: 'critical', 'high', 'medium', 'low'
Roller: admin, manager, employee (fås via useAdmin() hook eller getUserRole())

TEKNISK KONTEXT (FRÅN DAG 1):
- Frontend: Next.js 16 App Router, React Server/Client Components
- Komponenter: ScheduleCalendar, ScheduleModal, ScheduleSlot (kan referera till för patterns)
- Drag & drop med @dnd-kit (redan använt)
- React Query för data fetching och caching
- Tailwind CSS för styling
- Hooks: useEmployees(), useProjects(), useAdmin() (finns redan)
- Toast: sonner via @/lib/toast
- Error handling: extractErrorMessage() från @/lib/errorUtils

DESIGN SYSTEM:
- Färger: Blue (#2563EB), Green (#10B981), Red (#EF4444), Gray (#6B7280), Purple (#9333EA)
- Ikoner: lucide-react
- Mobile-first design med touch-friendly elementer (min-h-[44px])
- Dark mode support
- Typography: 16px body, 24px headings
- Spacing: 8px base unit

STATUS BADGES DESIGN (från Perplexity research):
- new: Slate (bg-slate-100, text-slate-700) 📋
- assigned: Blue (bg-blue-100, text-blue-700) 👤
- in_progress: Amber (bg-amber-100, text-amber-700) 🔨
- awaiting_approval: Purple (bg-purple-100, text-purple-700) ✋
- approved: Green (bg-green-100, text-green-700) ✅
- completed: Green darker (bg-green-200, text-green-800) 🎉

PRIORITY INDICATORS:
- critical: 🔴 Red
- high: 🟠 Orange
- medium: 🟡 Yellow
- low: 🔵 Blue

KOMPONENTER ATT SKAPA:

1. WorkOrderCard komponent:
   - Visa arbetsorder-info (number, title, status badge, priority indicator)
   - Visa assigned employee (om finns)
   - Visa project (om finns)
   - Visa scheduled date (om finns)
   - Foto-preview (thumbnail av första fotot, om finns)
   - Click to open detail view
   - Mobile-optimized (touch-friendly)
   - Loading skeleton state

2. WorkOrderList komponent:
   - Lista arbetsorder med filters (status, priority, project, employee)
   - Filter tabs överst (Alla, Ny, Tilldelad, Pågående, etc.)
   - Sortering (datum DESC som default)
   - Pagination eller "Load more" button
   - Mobile-optimized layout
   - Empty state när inga orders finns
   - Loading skeleton states

3. WorkOrderDetail page/komponent:
   - Full arbetsorder-info
   - Status badge
   - Priority indicator
   - Status transition buttons (med State Machine validation)
   - Visa endast tillåtna transitions baserat på user role
   - Foto-galleri med upload-funktionalitet
   - Drag & drop foto-upload för desktop
   - Mobile camera capture (optional, kan vara knapp som öppnar kamera)
   - Edit button (om admin eller creator)
   - Delete button (om admin)
   - Mobile-optimized view (bottom sheet för actions på mobile)

4. WorkOrderModal komponent (för create/edit):
   - Form för att skapa/redigera arbetsorder
   - Fält: title, description, project_id (dropdown), assigned_to (dropdown), priority (dropdown), scheduled_date, scheduled_start_time, scheduled_end_time
   - Validering med Zod (använd schemas från backend)
   - Error handling med toast notifications
   - Loading states
   - Mobile-optimized (bottom sheet på mobile, modal på desktop)
   - Följ samma pattern som ScheduleModal

5. WorkOrderPhotoUpload komponent:
   - Drag & drop för desktop (använd react-dropzone eller liknande)
   - Click to upload för mobile
   - Foto-galleri med thumbnails
   - Click thumbnail för full-size view
   - Delete button på varje foto (om admin eller uploaded_by)
   - Progress indicator vid upload
   - Error handling

HOOKS ATT SKAPA:

1. useWorkOrders() hook:
   - Hämtar lista av arbetsorder med React Query
   - Stödjer filters (status, priority, project_id, assigned_to)
   - Cache management
   - Invalidate queries vid mutations

2. useWorkOrder(id) hook:
   - Hämtar specifik arbetsorder med React Query
   - Cache management

3. useWorkOrderStatusTransition() hook:
   - Mutation för att ändra status
   - Använder PATCH /api/work-orders/[id]/status
   - Invalidate queries efter success
   - Toast notifications

4. useWorkOrderPhotos(workOrderId) hook:
   - Hämtar foton för arbetsorder
   - Mutation för upload
   - Mutation för delete

VIKTIGT ATT KOMMA IHÅG:
- Använd TypeScript med proper types (importera från backend schemas om möjligt)
- Server Components där möjligt, Client Components när nödvändigt ('use client')
- Följ befintliga patterns från ScheduleCalendar, ScheduleModal, etc.
- Error handling med extractErrorMessage() och toast.error()
- Loading states för alla async operations
- Mobile-first design
- Touch-friendly elementer (min-h-[44px])
- Accessible (WCAG AA)
- Responsive design
- Använd useAdmin() hook för admin-checks
- Använd useEmployees() och useProjects() hooks för dropdowns

IMPLEMENTATION-UPPGIFTER:

1. SKAPA HOOKS:
   Filnamn: app/hooks/useWorkOrders.ts
   - useWorkOrders(filters?) - Lista med filters
   - useWorkOrder(id) - Specifik arbetsorder
   - useWorkOrderStatusTransition() - Status mutation
   - useWorkOrderPhotos(workOrderId) - Foto operations

2. SKAPA KOMPONENTER:

   a) WorkOrderCard.tsx
      Filnamn: app/components/WorkOrderCard.tsx
      - Props: workOrder (med alla fält)
      - Visa status badge med ikon och färg
      - Visa priority indicator
      - Click handler för navigation
      - Loading skeleton

   b) WorkOrderList.tsx
      Filnamn: app/components/WorkOrderList.tsx
      - Filter tabs överst
      - Lista av WorkOrderCard komponenter
      - Pagination/Load more
      - Empty state
      - Loading skeletons

   c) WorkOrderDetail.tsx
      Filnamn: app/components/WorkOrderDetail.tsx eller app/work-orders/[id]/page.tsx
      - Full detail view
      - Status transition buttons (dynamiska baserat på State Machine)
      - Foto-galleri
      - Edit/Delete buttons (conditional på role)
      - Mobile bottom sheet för actions

   d) WorkOrderModal.tsx
      Filnamn: app/components/WorkOrderModal.tsx
      - Form för create/edit
      - Zod validation
      - Error handling
      - Loading states
      - Mobile bottom sheet, desktop modal

   e) WorkOrderPhotoUpload.tsx
      Filnamn: app/components/WorkOrderPhotoUpload.tsx
      - Drag & drop för desktop
      - Click upload för mobile
      - Foto-galleri
      - Delete functionality

3. SKAPA PAGES:

   a) Work Orders List Page
      Filnamn: app/work-orders/page.tsx
      - Server Component som renderar WorkOrderList
      - Metadata för SEO

   b) Work Order Detail Page
      Filnamn: app/work-orders/[id]/page.tsx
      - Server Component som renderar WorkOrderDetail
      - Metadata för SEO

DESIGN PATTERNS ATT FÖLJA:
- Modal pattern: Backdrop + modal container (samma som ScheduleModal)
- Form pattern: useState för form state, Zod validation, toast notifications
- Loading pattern: Skeleton loaders, disabled buttons under loading
- Error pattern: extractErrorMessage() + toast.error()
- API pattern: React Query för data fetching, mutations för updates
- Navigation: Next.js Link för navigation mellan pages

EXEMPEL PÅ VAD DU SKA SKAPA:

Status Badge Component:
```typescript
const statusConfig = {
  new: { label: 'Ny', bgColor: 'bg-slate-100', textColor: 'text-slate-700', icon: '📋' },
  assigned: { label: 'Tilldelad', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: '👤' },
  // ... etc
};
```

Priority Indicator:
```typescript
const priorityConfig = {
  critical: { label: 'Kritisk', indicator: '🔴' },
  high: { label: 'Hög', indicator: '🟠' },
  // ... etc
};
```

Status Transition Buttons (använd State Machine):
```typescript
import { WorkOrderStateMachine } from '@/lib/work-order-state-machine';
const validTransitions = WorkOrderStateMachine.getValidTransitions(currentStatus, userRole);
// Render buttons för varje valid transition
```

VIKTIGT ATT UNDVIKA:
- Hardkodade status transitions (använd State Machine istället)
- Ignorera user role när rendering status buttons
- Glömma loading states
- Glömma error handling
- Glömma mobile optimization
- Glömma accessibility

SKRIV PRODUCTION-READY KOD:
- Proper TypeScript types
- Error handling överallt
- Loading states
- Accessible markup
- Mobile-first responsive design
- Clean, maintainable code
- Kommentarer för komplex logik

NÄR DU ÄR KLAR:
- Skriv alla hooks
- Skriv alla komponenter
- Skriv alla pages
- Förklara vad du har skapat och varför
- Notera eventuella dependencies som behöver installeras (t.ex. react-dropzone för foto-upload)
```

---

## 🎯 Användning

1. **Kopiera hela prompten** ovan (från "Du är senior frontend-utvecklare...")
2. **Klistra in i Gemini 2.5**
3. **Vänta på implementation**
4. **Reviewa koden** (Cursor Pro) innan integration

---

**Status:** ✅ SQL kod godkänd - Redo för Dag 2 frontend implementation! 🚀

