# 🎨 Gemini 2.5 Prompt - Dag 4: Visma/Fortnox Integration UI

## 📋 Kopiera denna prompt till Gemini 2.5:

```
Du är UI/UX specialist och frontend-utvecklare för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 3):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Offline-stöd & Sync är FULLT IMPLEMENTERAT
- ✅ Backend integration logic kommer implementeras av GPT-5 och Cursor
- ✅ IndexedDB är uppdelad i moduler

DAG 4 MÅL: Visma/Fortnox Integration UI
- Skapa integrations settings page
- OAuth connection flow UI
- Sync status display
- Manual sync button
- Settings för auto-sync
- Cool UI med moderna design-element

TEKNISK STACK:
- Next.js 16 App Router (React Server/Client Components)
- TypeScript
- Tailwind CSS
- lucide-react (för ikoner)
- sonner (för toast notifications)

EXISTERANDE KODBASE:
- Komponenter: /app/components/*.tsx
- Hooks: /app/hooks/*.ts
- Design system: Tailwind CSS med dark mode
- Toast: @/lib/toast (sonner)
- Ikoner: lucide-react
- Sidebar: /app/components/Sidebar.tsx

DINA UPPGIFTER (Dag 4):

1. INTEGRATIONS SETTINGS PAGE:
   - Skapa /app/integrations/page.tsx
   - Visa lista över integrations (Fortnox, Visma)
   - Status för varje integration (Connected, Disconnected, Error)
   - "Connect" knapp för varje integration
   - Cool card-design med gradients

2. OAUTH CONNECTION FLOW:
   - Modal eller wizard för OAuth flow
   - Steg 1: "Connect to Fortnox/Visma" knapp
   - Steg 2: OAuth redirect till provider
   - Steg 3: Callback handler med success/error
   - Steg 4: "Connected!" confirmation
   - Loading states och progress indicators

3. SYNC STATUS DISPLAY:
   - Visa senaste sync-tid
   - Visa antal synkade items
   - Visa sync-fel (om några)
   - Progress bar för pågående sync
   - "Sync now" knapp

4. SETTINGS UI:
   - Toggle för auto-sync (varje timme)
   - Välj vad som ska synkas (kunder, fakturor, båda)
   - Sync direction (export, import, båda)
   - Cool toggle switches med animationer

5. ERROR HANDLING UI:
   - Visa API-fel på ett användarvänligt sätt
   - "Retry" knappar
   - Error details i expandable section
   - Toast notifications för sync-status

DESIGN-GUIDELINES:
- Använd samma design-system som resten av appen
- Gradient buttons för primary actions
- Card-based layout
- Dark mode support
- Mobile responsive
- Smooth animations
- Loading states överallt

VIKTIGA PATTERNS:
- Följ samma komponent-struktur som WorkOrder-komponenter
- Använd TypeScript strikt
- Använd toast() för notifications
- Använd lucide-react för ikoner
- Client components för interaktivitet

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Accessibility (ARIA labels)
- Mobile-first design

BÖRJA MED:
1. Skapa integrations settings page
2. Implementera OAuth connection flow UI
3. Skapa sync status components
4. Lägg till settings för auto-sync

VIKTIGT: 
- Ge INGA svar nu - bara förbered dig för imorgon
- Tänk på användarupplevelsen
- Designa cool UI med moderna element
- Föreslå animationer och transitions

Fråga mig imorgon om något är oklart eller om du behöver mer context!
```

---

**Status:** ✅ Redo för implementation imorgon
**Nästa steg:** Vänta på backend API:er från GPT-5/Cursor

