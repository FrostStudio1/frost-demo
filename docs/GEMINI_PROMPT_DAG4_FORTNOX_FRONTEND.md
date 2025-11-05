# 🎨 Gemini 2.5 Prompt - Dag 4: Fortnox Integration Frontend (OPTIMERAD)

## 📋 Kopiera denna prompt till Gemini 2.5:

```
Du är Frontend Specialist & UI/UX Designer för Frost Solutions.

LÄGET JUST NU (Dag 4):
- ✅ Backend är FULLT IMPLEMENTERAT av GPT-5
- ✅ Fortnox OAuth flow är klart
- ✅ API endpoints finns och fungerar
- ✅ Sync-logik är implementerad
- ✅ Visma är borttaget - vi fokuserar BARA på Fortnox

DAG 4 MÅL: Fortnox Integration UI
- Skapa settings-sida för integration management
- Implementera OAuth connect flow med UI feedback
- Skapa sync status dashboard
- Implementera manual export-knappar
- Visa sync history och logs
- Skapa användarvänlig error handling

TEKNISK STACK:
- Next.js 16 App Router (Server/Client Components)
- TypeScript
- Tailwind CSS
- React Query (@tanstack/react-query)
- Sonner (toast notifications)
- Lucide React (icons)
- Existing patterns från projektet

EXISTERANDE KODBASE:
- API routes: `/app/api/integrations/fortnox/connect`, `/callback`, `/[id]/sync`, `/[id]/status`, `/[id]/export`
- Hooks: `useTenant`, `useAdmin`, `useEmployees`, `useProjects`
- Components: `Sidebar`, `SidebarClient`, `WorkOrderCard`, etc.
- Toast: `@/lib/toast` (via sonner)
- Error handling: `extractErrorMessage` från `@/lib/errorUtils`
- Patterns: Tenant isolation, admin-only, TypeScript strikt

DINA UPPGIFTER (Dag 4):

1. SETTINGS PAGE - `/app/settings/integrations/page.tsx`
   Skapa en sida för integration management:
   
   - Visa status för Fortnox integration (connected/disconnected/error)
   - "Anslut till Fortnox" knapp (om disconnected)
   - Visa connection info (status, last sync, error messages)
   - "Disconnect" knapp (om connected)
   - Visa sync statistics (antal synkade fakturor, kunder, etc.)
   - Använd admin-only access (check `useAdmin` hook)
   
   **Layout:**
   - Card-baserad layout (liknande dashboard)
   - Status badge med färger (green=connected, red=error, gray=disconnected)
   - Clear visual feedback för alla states
   - Loading states för async operations

2. OAUTH CONNECT FLOW
   
   **Component: `/app/components/integrations/FortnoxConnectButton.tsx`**
   - Knapp som triggar OAuth flow
   - POST till `/api/integrations/fortnox/connect`
   - Redirect till authorization URL från response
   - Loading state under process
   - Error handling med toast
   
   **Callback Handler:**
   - OAuth callback redirects till `/settings/integrations?connected=fortnox` eller `?error=...`
   - Visa success/error toast baserat på query params
   - Auto-refresh integration status

3. INTEGRATION STATUS CARD - `/app/components/integrations/IntegrationStatusCard.tsx`
   
   Visa integration information:
   - Status badge (connected/disconnected/error)
   - Last sync timestamp
   - Error message (om error)
   - Sync statistics (antal fakturor, kunder, etc.)
   - Quick actions (sync now, disconnect)
   
   **Data fetching:**
   - GET `/api/integrations/[id]/status`
   - React Query hook: `useIntegrationStatus(integrationId)`
   - Auto-refresh varje 30 sekunder

4. SYNC DASHBOARD - `/app/components/integrations/SyncDashboard.tsx`
   
   Visa sync history och status:
   - Lista över senaste sync jobs (queued, running, success, failed)
   - Progress bar för running jobs
   - Error messages för failed jobs
   - Retry-knapp för failed jobs
   - Filter: Alla / Queued / Running / Success / Failed
   
   **Data:**
   - Hämta från `integration_jobs` tabell (read-only för employees)
   - Visa: job_type, status, created_at, finished_at, last_error
   - Real-time updates (polling eller React Query refetch)

5. MANUAL EXPORT BUTTONS
   
   **Component: `/app/components/integrations/ExportButtons.tsx`**
   
   Knappar för manuell export:
   - "Exportera faktura" (visa modal med lista över fakturor)
   - "Exportera kund" (visa modal med lista över kunder)
   - "Exportera alla fakturor" (bulk export)
   - "Exportera alla kunder" (bulk export)
   
   **Flow:**
   - POST `/api/integrations/[id]/export` med `{ type: 'invoice'|'customer', id: uuid }`
   - Visa loading state
   - Toast success/error
   - Auto-refresh sync dashboard

6. SYNC HISTORY & LOGS - `/app/components/integrations/SyncHistory.tsx`
   
   Visa sync logs (audit trail):
   - Lista över sync events från `sync_logs` tabell
   - Filter: Alla / Info / Warning / Error
   - Sortering: Senaste först
   - Expandable rows för att se context (JSON)
   - Pagination (20 per sida)
   
   **Data:**
   - Hämta från `sync_logs` tabell
   - Visa: level, message, created_at, context

7. REACT QUERY HOOKS
   
   **`/app/hooks/useIntegrations.ts`**
   - `useIntegrations()` - Lista alla integrations för tenant
   - `useIntegrationStatus(id)` - Status för specifik integration
   - `useSyncJobs(integrationId)` - Lista sync jobs
   - `useSyncLogs(integrationId)` - Lista sync logs
   - `useConnectFortnox()` - Mutation för OAuth connect
   - `useDisconnectIntegration(id)` - Mutation för disconnect
   - `useExportToFortnox(integrationId, type, id)` - Mutation för export
   - `useSyncNow(integrationId)` - Mutation för manual sync

8. ERROR HANDLING & UX
   
   - Toast notifications för alla actions (success/error)
   - Loading states för alla async operations
   - Error boundaries för robust error handling
   - Clear error messages (använd `extractErrorMessage`)
   - Retry buttons för failed operations
   - Confirmation dialogs för destructive actions (disconnect)

VIKTIGA PATTERNS:
- Följ samma kodstil som i resten av projektet
- Använd TypeScript strikt
- Använd `useTenant()` för tenant isolation
- Använd `useAdmin()` för admin-only features
- Använd `extractErrorMessage()` för error handling
- Använd `toast()` för användarfeedback
- Responsive design (mobile-first)
- Accessibility (ARIA labels, keyboard navigation)

UI/UX DESIGN:
- Följ samma design system som resten av appen
- Använd Tailwind CSS classes
- Använd Lucide React icons
- Status badges med färger (green/red/gray/yellow)
- Loading spinners för async operations
- Skeleton loaders för initial load
- Smooth transitions och animations
- Clear visual hierarchy

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Kommentarer för komplex logik
- Reusable components
- Performance optimization (memoization där det behövs)

BÖRJA MED:
1. Skapa settings page structure
2. Implementera OAuth connect flow
3. Skapa integration status card
4. Implementera sync dashboard
5. Lägg till manual export buttons
6. Implementera sync history
7. Testa alla flows

REFERENS:
- Backend API: Se `docs/INTEGRATION_IMPLEMENTATION_NOTES.md`
- Existing patterns: `app/components/`, `app/hooks/`
- Design system: Tailwind CSS + existing components

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Viktiga Implementation-Detaljer

### API Endpoints som finns:
- `POST /api/integrations/fortnox/connect` - Startar OAuth flow, returnerar `{ url: string }`
- `GET /api/integrations/fortnox/callback` - OAuth callback, redirectar till `/settings/integrations?connected=fortnox`
- `GET /api/integrations/[id]/status` - Hämtar integration status
- `POST /api/integrations/[id]/sync` - Queue sync job
- `POST /api/integrations/[id]/export` - Manual export (`{ type: 'invoice'|'customer', id: uuid }`)

### Data Structure:
```typescript
// Integration
{
  id: string;
  provider: 'fortnox';
  status: 'disconnected' | 'connected' | 'error';
  last_synced_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

// Sync Job
{
  id: string;
  job_type: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'retry';
  payload: any;
  attempts: number;
  last_error: string | null;
  created_at: string;
  finished_at: string | null;
}

// Sync Log
{
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: any;
  created_at: string;
}
```

### Exempel på React Query Hook:
```typescript
// app/hooks/useIntegrations.ts
export function useIntegrations() {
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ['integrations', tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations?tenant=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return res.json();
    },
    enabled: !!tenantId,
  });
}
```

---

**Status:** ✅ OPTIMERAD PROMPT KLAR FÖR GEMINI 2.5
**Nästa steg:** Kopiera prompten till Gemini och börja implementation

