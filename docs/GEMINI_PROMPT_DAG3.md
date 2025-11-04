# 🎨 Gemini 2.5 Prompt - Dag 3: Offline-stöd & Sync UI Components

## 📋 Kopiera denna prompt till Gemini 2.5:

```
Du är UI/UX specialist och frontend-utvecklare för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Frontend komponenter är klara med sidebar och tillbaka-knapp
- ✅ Status-hantering är förenklad med tydlig "Nästa steg"-knapp
- ✅ Responsive design fungerar bra
- ✅ Dark mode support fungerar

DAG 3 MÅL: Offline-stöd & Sync UI Components
- Skapa offline UI components
- Status indicators (online/offline/synkar)
- Sync progress UI
- Offline-first UX patterns
- Toast notifications för sync status

TEKNISK STACK:
- Next.js 16 App Router (React Server/Client Components)
- TypeScript
- Tailwind CSS
- React Query (för data fetching)
- lucide-react (för ikoner)
- sonner (för toast notifications)

EXISTERANDE KODBASE:
- Komponenter: /app/components/WorkOrder*.tsx, Sidebar.tsx
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts
- Design system: Tailwind CSS med dark mode
- Toast: @/lib/toast (sonner)
- Ikoner: lucide-react

DESIGN SYSTEM:
- Färger: Blue (#2563EB), Green (#10B981), Red (#EF4444), Gray (#6B7280)
- Ikoner: lucide-react (Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle)
- Mobile-first design med touch-friendly elementer (min-h-[44px])
- Dark mode support
- Typography: 16px body, 24px headings
- Spacing: 8px base unit

DINA UPPGIFTER (Dag 3):

1. ONLINE/OFFLINE STATUS INDICATOR:
   - Liten status-indikator i header (höger övre hörnet)
   - Visar: "Online" / "Offline" / "Synkar..."
   - Ikoner: Wifi (online), WifiOff (offline), RefreshCw (synkar)
   - Färger: Green (online), Red (offline), Blue (synkar)
   - Animerad spinner när synkar

2. SYNC PROGRESS UI:
   - Progress bar för sync-progress
   - Visar antal items som synkas
   - "Synkar 3 av 10 arbetsordrar..."
   - Döljs automatiskt när sync klar

3. OFFLINE-FIRST UX:
   - Toast notification när går offline: "Du är offline. Ändringar sparas lokalt."
   - Toast notification när går online: "Du är online igen. Synkar ändringar..."
   - Toast notification när sync klar: "Alla ändringar synkade!"
   - Toast notification vid sync-fel: "Kunde inte synka. Försöker igen..."

4. OFFLINE BANNER (valfritt):
   - Banner längst upp när offline
   - "Du arbetar offline. Ändringar sparas lokalt och synkas när du är online igen."
   - Döljbar/ignorerad

5. SYNC STATUS I KOMPONENTER:
   - Visa "Offline" badge på arbetsordrar när offline
   - Visa "Synkar..." när sync pågår
   - Visa "Synkad" när klar (diskret, försvinner efter 2 sek)

VIKTIGA PATTERNS:
- Följ samma kodstil som WorkOrder-komponenter
- Använd Tailwind CSS classes
- Mobile-first design
- Dark mode support
- Accessibility (WCAG AA)
- Touch-friendly elementer (min-h-[44px])

KODKVALITET:
- Clean & simple UI
- Responsive design
- Proper TypeScript types
- Reusable components
- Accessibility considerations

BÖRJA MED:
1. Skapa OnlineStatusIndicator komponent
2. Skapa SyncProgress komponent
3. Skapa OfflineBanner komponent (valfritt)
4. Integrera med befintliga komponenter
5. Lägg till toast notifications

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Specifika UI-uppgifter

### 1. OnlineStatusIndicator
- Liten status-indikator i header
- Ikoner: Wifi, WifiOff, RefreshCw
- Färger: Green, Red, Blue
- Animerad spinner

### 2. SyncProgress
- Progress bar för sync
- Visar antal items
- Auto-dölj när klar

### 3. Toast Notifications
- Offline notification
- Online notification
- Sync progress
- Sync complete
- Sync error

### 4. Offline Banner (valfritt)
- Banner när offline
- Döljbar

### 5. Component Integration
- Integrera med WorkOrder komponenter
- Visa offline status
- Visa sync status

---

**Status:** ✅ Redo för implementation
**Fokus:** Clean UI och användarupplevelse

