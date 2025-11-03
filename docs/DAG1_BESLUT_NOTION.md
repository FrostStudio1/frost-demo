# 📋 Notion Documentation: Dag 1 Beslut - Resursplanering

## ✅ Final Beslut: Tech Stack för Schema/Resursplanering

**Datum:** [Dagens datum]
**Beslutat av:** Cursor Pro (Lead Architect)
**Baserat på:** Perplexity Pro research

---

## 🎯 Beslut 1: Drag & Drop Library

**Val:** @dnd-kit ✅

**Motivation:**
- ✅ Aktivit maintained (15.9k+ stars, uppdaterad för 25 dagar sedan)
- ✅ TypeScript-native (byggt i TypeScript från grunden)
- ✅ Bättre performance (~10kb vs 35kb+ för react-beautiful-dnd)
- ✅ react-beautiful-dnd är deprecated (oktober 2024)

**Alternativ övervägda:**
- ❌ react-beautiful-dnd - Deprecated
- ⚠️ Pragmatic Drag and Drop - Bättre för stora organisationer, överkill för oss

**Implementation:**
- Använd `@dnd-kit/core` + `@dnd-kit/sortable`
- Implementera med React.memo för performance
- Använd DragOverlay för smooth drag experience
- Touch sensor med delay för mobile support

---

## 🎯 Beslut 2: Calendar Component

**Val:** react-big-calendar med custom mobile optimization ✅

**Motivation:**
- ✅ Gratis och open source
- ✅ Flexibel customization via components prop
- ✅ Etablerad community (8k+ stars)
- ✅ Bra performance med caching

**OBS:**
- ⚠️ Begränsat mobile support (kräver `longPressThreshold`)
- ✅ Lösning: Custom mobile view eller FullCalendar för mobile

**Implementation:**
- Använd react-big-calendar för desktop
- Custom mobile-optimized view för mobile
- Implementera drag & drop med @dnd-kit integration
- Använd moment eller dayjs för date handling

**Alternativ övervägda:**
- ⚠️ FullCalendar - Premium features kostar, men bättre mobile support
- ⚠️ Custom solution - För mycket tid för MVP

**Plan:**
- Starta med react-big-calendar
- Om mobile support blir problem → överväg FullCalendar eller custom

---

## 🎯 Beslut 3: Conflict Detection

**Val:** Dual-layer approach ✅

**1. Frontend (Application Logic):**
- Sweep Line Algorithm (O(n log n))
- Real-time validation när användare bokar
- Visual feedback för conflicts

**2. Backend (Database Level):**
- PostgreSQL GIST index
- EXCLUDE constraint med tsrange
- Förhindra overlaps på database-level

**Motivation:**
- ✅ Frontal för snabb feedback
- ✅ Database-level för data integrity
- ✅ Förhindrar race conditions

**Implementation:**
```sql
-- PostgreSQL EXCLUDE constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE schedule_slots
ADD CONSTRAINT prevent_double_booking
EXCLUDE USING GIST (
  employee_id WITH =,
  tsrange(start_time, end_time) WITH &&
) WHERE (status != 'cancelled');
```

---

## 🎯 Beslut 4: Auto-Time Entry Creation

**Val:** Event-driven sync med draft workflow ✅

**Pattern:**
1. Schema status ändras till "completed" → Trigger
2. Auto-create time entry som "draft"
3. Employee granskar och godkänner
4. Submit → Approval workflow

**Motivation:**
- ✅ Employee har kontroll (kan granska innan submit)
- ✅ Automatiserad men säker
- ✅ Hantera schema changes utan att förlora data

**Implementation:**
- Event-driven: Webhook/trigger när schedule completed
- Backup: Cron job för batch sync (körs dagligen kl 01:00)
- Status: Time entries börjar som "draft"
- Link: `source_schedule_id` för att kunna uppdatera vid schema changes

**Best Practices:**
- ✅ Låt employees granska auto-genererade entries
- ✅ Hantera schema changes (uppdatera linked time entries)
- ✅ Timezone safety med dayjs/moment
- ✅ Hantera cancelled schedules (ta bort draft entries)

---

## 📦 Tech Stack Summary

### Frontend:
- `@dnd-kit/core` + `@dnd-kit/sortable` - Drag & drop
- `react-big-calendar` - Calendar component
- `moment` eller `dayjs` - Date handling
- TypeScript - Type safety

### Backend:
- PostgreSQL - Database
- GIST index - För overlap queries
- EXCLUDE constraint - Förhindra double booking
- Event-driven triggers - För auto-time entry creation

### Integration:
- Real-time conflict validation (frontend)
- Database-level enforcement (backend)
- Auto-create draft time entries
- Employee approval workflow

---

## 📋 Implementation Checklist

### Database (GPT-5):
- [ ] Skapa `schedule_slots` tabell
- [ ] Skapa `absences` tabell
- [ ] GIST index för overlap queries
- [ ] EXCLUDE constraint för prevent_double_booking
- [ ] RLS policies för tenant isolation

### Backend API (GPT-5):
- [ ] POST /api/schedules - Create schedule
- [ ] GET /api/schedules - List schedules (with filters)
- [ ] PUT /api/schedules/[id] - Update schedule
- [ ] DELETE /api/schedules/[id] - Delete schedule
- [ ] GET /api/schedules/conflicts - Check conflicts
- [ ] POST /api/schedules/[id]/complete - Mark as completed (trigger time entry)

### Frontend Components (Gemini 2.5):
- [ ] ScheduleCalendar component (react-big-calendar)
- [ ] ScheduleCard component
- [ ] Drag & drop integration (@dnd-kit)
- [ ] Mobile-optimized view
- [ ] Conflict visualization

### Integration (Cursor Pro):
- [ ] Integrera calendar med projects
- [ ] Integrera med time entries
- [ ] Testa full flow
- [ ] Fixa bugs
- [ ] Performance optimization

---

## 🎯 Next Steps

1. **GPT-5:** Implementera backend (SQL + API)
2. **Gemini 2.5:** Implementera frontend components
3. **Cursor Pro:** Integrera och testa
4. **Notion Pro:** Dokumentera progress

---

## 📝 Notes

- Mobile support kan behöva förbättras senare (överväg FullCalendar)
- Testa conflict detection noggrant (edge cases)
- Employee approval workflow är viktig för adoption
- Timezone handling måste vara korrekt (använd UTC/ISO)

---

**Status:** ✅ Beslut fattat - Ready för implementation!

