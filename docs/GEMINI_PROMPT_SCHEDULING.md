# Gemini 2.5 Prompt: Frontend Components för Schema/Resursplanering

Du är senior frontend developer för Frost Solutions. Skapa UI-komponenter för schema/resursplanering med drag & drop.

## ⚠️ VIKTIGT - Redan Fixat (Använd Detta!)

**VIKTIGT:** Hooks och types är redan implementerade och fixade. Använd dessa exakt som de är:

### ✅ Redan Fixade Hooks (Använd dessa!)
```typescript
// app/hooks/useSchedules.ts - REDAN IMPLEMENTERAD
import { 
  useSchedules, 
  useCreateSchedule, 
  useUpdateSchedule, 
  useDeleteSchedule,
  useCompleteSchedule,
  useScheduleConflicts 
} from '@/hooks/useSchedules'

// app/hooks/useAbsences.ts - REDAN IMPLEMENTERAD  
import { 
  useAbsences, 
  useCreateAbsence, 
  useUpdateAbsence, 
  useDeleteAbsence 
} from '@/hooks/useAbsences'

// app/hooks/useEmployees.ts - FINNS REDAN
import { useEmployees } from '@/hooks/useEmployees'

// app/hooks/useProjects.ts - FINNS REDAN
import { useProjects } from '@/hooks/useProjects'
```

### ✅ Types (Använd dessa!)
```typescript
// app/types/scheduling.ts - REDAN FIXAT
import type { 
  ScheduleSlot, 
  Absence, 
  ScheduleFilters,
  CreateScheduleRequest,
  UpdateScheduleRequest 
} from '@/types/scheduling'
```

**VIKTIGT:** Backend returnerar INTE `employee_name` eller `project_name`. Du måste enricha dessa i komponenten med `useEmployees()` och `useProjects()` hooks!

---

## 🏗️ Vår Kodstruktur

### Import Paths (Använd dessa EXAKT!)
```typescript
// Types
import type { ScheduleSlot } from '@/types/scheduling'  // INTE @/app/types/scheduling

// Hooks  
import { useSchedules } from '@/hooks/useSchedules'
import { useEmployees } from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'

// Utils
import { useTenant } from '@/context/TenantContext'
import { extractErrorMessage } from '@/lib/errorUtils'
import { toast } from '@/lib/toast'  // INTE från 'sonner' direkt

// Icons - Använd lucide-react (INTE heroicons!)
import { Clock, User, Briefcase, AlertTriangle, MoreVertical, CheckCircle, Pencil, Trash } from 'lucide-react'
```

### Modal Pattern (Så gör vi modals)
```tsx
// Följ detta mönster exakt från CreateNotificationModal.tsx
if (!isOpen) return null

return (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
    />
    
    {/* Modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Content */}
      </div>
    </div>
  </>
)
```

### Toast Pattern
```typescript
import { toast } from '@/lib/toast'

// Success
toast.success('Schema sparat')

// Error  
toast.error(`Fel: ${extractErrorMessage(error)}`)
```

### Form Pattern (Vi använder React state, INTE React Hook Form)
```tsx
const [employeeId, setEmployeeId] = useState('')
const [projectId, setProjectId] = useState('')
const [startTime, setStartTime] = useState('')
const [endTime, setEndTime] = useState('')

// In form
<select 
  value={employeeId} 
  onChange={(e) => setEmployeeId(e.target.value)}
  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
>
  <option value="">Välj anställd</option>
  {employees.map(emp => (
    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
  ))}
</select>
```

---

## 📋 Komponenter Att Skapa

### 1. ScheduleCalendar.tsx (Huvudkomponent)
**Location:** `app/components/scheduling/ScheduleCalendar.tsx`

**Requirements:**
- Week/month view toggle
- Drag & drop med @dnd-kit
- Click på tidslott för att skapa ny schedule
- Click på schedule för att redigera
- Visa conflicts (röd highlight)
- Visa absences (grå overlay)
- Filter bar för employee/project/status
- Mobile-first (1 kolumn på mobile, 7 på desktop)

**VIKTIGT:**
- Använd `useSchedules(filters)` för att hämta data
- `filters` måste ha `start_date` och `end_date` i format `YYYY-MM-DD` (inte ISO timestamps!)
- Använd `useEmployees()` och `useProjects()` för att enricha schedules med names
- För calendar structure: Gruppera schedules per dag (måndag 1/1, tisdag 2/1, etc.)
- Varje dag är en kolumn med dess schedules
- Använd `useScheduleConflicts()` för realtidskonfliktcheck vid drag

### 2. ScheduleSlot.tsx (Draggable Card)
**Location:** `app/components/scheduling/ScheduleSlot.tsx`

**Requirements:**
- Använd `@dnd-kit/sortable` för drag & drop
- Visa employee name, project name, time range
- Status badge med färger:
  - `scheduled`: Amber/Yellow
  - `confirmed`: Blue
  - `completed`: Green
  - `cancelled`: Gray
- Conflict indicator (röd badge om `has_conflict` eller `isConflict` prop)
- Touch-friendly (44x44px min touch target)

**Icon Usage:**
```tsx
import { Clock, User, Briefcase, AlertTriangle } from 'lucide-react'

<Clock className="w-4 h-4 text-gray-500" />
<User className="w-4 h-4 text-gray-500" />
```

### 3. ScheduleModal.tsx (Create/Edit Form)
**Location:** `app/components/scheduling/ScheduleModal.tsx`

**Requirements:**
- Använd React state (inte React Hook Form)
- Employee selector (dropdown från `useEmployees()`)
- Project selector (dropdown från `useProjects()`)
- Datetime-local inputs för start/end time
- Status selector
- Notes textarea
- Validering: end_time > start_time, duration <= 12h
- Conflict check innan submit
- Modal pattern från CreateNotificationModal

**VIKTIGT om datetime-local:**
- Input type: `datetime-local`
- Vid submit: Konvertera till ISO: `new Date(value).toISOString()`
- Vid edit: Konvertera från ISO: `schedule.start_time.slice(0, 16)` (för datetime-local format)

### 4. ScheduleCard.tsx (List View Card)
**Location:** `app/components/scheduling/ScheduleCard.tsx`

**Requirements:**
- Visa schedule info (employee, project, time, status)
- Quick actions: Edit, Delete, Complete
- Status badge
- Conflict warning
- Mobile swipe gestures (optional, kan implementeras senare)

### 5. AbsenceCalendar.tsx (Frånvarokalender)
**Location:** `app/components/scheduling/AbsenceCalendar.tsx`

**Requirements:**
- Kalendervy med frånvaro
- Absence blocks färgade per type:
  - `vacation`: Green
  - `sick`: Red
  - `other`: Gray
- Click för att skapa/redigera frånvaro
- Använd `useAbsences()` hook

### 6. AbsenceModal.tsx (Create/Edit Frånvaro)
**Location:** `app/components/scheduling/AbsenceModal.tsx`

**Requirements:**
- Employee selector
- Date pickers för start_date/end_date (type="date")
- Type selector (vacation/sick/other)
- Reason textarea
- Status selector (vid edit)
- Använd `useCreateAbsence()` eller `useUpdateAbsence()`

---

## 🎨 Design System (Använd Exakt!)

### Colors
```css
Primary: Blue (#2563EB, bg-blue-600)
Success: Green (#10B981, bg-green-600)
Warning: Amber (#F59E0B, bg-amber-500)
Error: Red (#EF4444, bg-red-500)
Gray: (#6B7280, text-gray-600)
```

### Spacing (8px base)
```css
gap-2 = 8px
gap-4 = 16px
p-2 = 8px
p-4 = 16px
p-6 = 24px
```

### Status Badges
```tsx
const badgeColors = {
  scheduled: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800', 
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}
```

### Border Radius
```css
rounded-lg = 8px
rounded-xl = 12px
rounded-2xl = 16px
```

---

## 🔧 Tekniska Detaljer

### Drag & Drop Setup
```tsx
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

// Mobile-friendly sensors
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
)
```

### Employee/Project Name Enrichment
```tsx
// I ScheduleCalendar eller ScheduleSlot komponenten
const { data: employees } = useEmployees()
const { data: projects } = useProjects()

// Enrich schedule
const enrichedSchedule = {
  ...schedule,
  employee_name: employees?.find(e => e.id === schedule.employee_id)?.full_name || 'Okänd',
  project_name: projects?.find(p => p.id === schedule.project_id)?.name || 'Okänt projekt'
}
```

### Filter Date Format
```typescript
// VIKTIGT: start_date och end_date måste vara YYYY-MM-DD format!
const filters: ScheduleFilters = {
  start_date: '2025-01-01',  // INTE ISO timestamp!
  end_date: '2025-01-07',    // INTE ISO timestamp!
  employee_id: 'optional',
  project_id: 'optional',
  status: 'optional'
}
```

### Conflict Check vid Drag
```tsx
const checkConflicts = useScheduleConflicts()

// Vid drag over
const handleDragOver = async (event: DragOverEvent) => {
  // Calculate new start_time/end_time based on drop position
  const newStartTime = calculateNewTime(...)
  const newEndTime = calculateNewTime(...)
  
  const result = await checkConflicts.mutateAsync({
    employee_id: newEmployeeId,
    start_time: newStartTime.toISOString(),
    end_time: newEndTime.toISOString(),
    exclude_id: draggedSchedule.id
  })
  
  if (result.hasConflict) {
    setCurrentConflict(true)
  }
}
```

---

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44x44px för alla interaktiva element
- Long-press för drag (250ms delay)
- Swipe gestures för actions (optional, kan implementeras senare)

### Responsive Layout
```tsx
// Mobile: 1 kolumn
<div className="grid grid-cols-1 md:grid-cols-7 gap-2">
  {/* Calendar columns */}
</div>
```

### Bottom Sheet för Mobile (Alternativ)
För mobile, överväg att använda bottom sheet för modals istället för center modal. Men börja med center modal först.

---

## ✅ Checklista Innan Du Skriver Koden

- [ ] Använder korrekta import paths (`@/types/scheduling`, INTE `@/app/types`)
- [ ] Använder `lucide-react` icons (INTE heroicons)
- [ ] Använder `toast` från `@/lib/toast` (INTE sonner direkt)
- [ ] Enrichar schedules med employee/project names via hooks
- [ ] Använder `YYYY-MM-DD` format för filter dates
- [ ] Konverterar datetime-local till ISO vid submit
- [ ] Konverterar ISO till datetime-local vid edit
- [ ] Följer modal pattern från CreateNotificationModal
- [ ] Använder React state för forms (INTE React Hook Form)
- [ ] Touch-friendly drag & drop (250ms delay)
- [ ] Mobile-first responsive design
- [ ] Dark mode support (dark: prefix)

---

## 🚀 Börja Med

1. **ScheduleSlot.tsx** - Draggable card (enklast)
2. **ScheduleModal.tsx** - Create/edit form
3. **ScheduleCalendar.tsx** - Main calendar med D&D
4. **ScheduleCard.tsx** - List view card
5. **AbsenceCalendar.tsx** - Absence calendar
6. **AbsenceModal.tsx** - Absence form

Skriv alla komponenter klar och production-ready. Använd våra hooks exakt som de är implementerade. Inga mock-data - använd riktiga hooks och data!

**Make it production-ready! 🚀**

