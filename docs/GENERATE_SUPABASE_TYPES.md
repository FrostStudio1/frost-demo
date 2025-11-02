# 🔧 Guide: Generera Supabase TypeScript Types

## Metod 1: Via Supabase Dashboard (Enklast)

1. **Gå till Supabase Dashboard:**
   - Logga in på https://supabase.com/dashboard
   - Välj ditt projekt (Project ID: `bd78c62b-dc19-4a13-adc4-d7c268babc7c`)

2. **Hitta Project Reference:**
   - Gå till **Settings** → **General**
   - Kopiera **Reference ID** (t.ex. `abcdefghijklmnopqrst`)

3. **Generera Types:**
   ```bash
   npx supabase gen types typescript --project-id YOUR_REFERENCE_ID > types/supabase-generated.ts
   ```

## Metod 2: Via Supabase CLI (Om installerad)

1. **Logga in:**
   ```bash
   npx supabase login
   ```

2. **Länka projekt:**
   ```bash
   npx supabase link --project-ref YOUR_REFERENCE_ID
   ```

3. **Generera types:**
   ```bash
   npx supabase gen types typescript --linked > types/supabase-generated.ts
   ```

## Metod 3: Manuellt (Nuvarande lösning)

Vi har redan manuellt definierade types i `/types/supabase.ts`. Dessa fungerar bra men bör uppdateras när schema ändras.

## Verifiera Types

Efter att ha genererat types, kontrollera att de fungerar:

```typescript
import type { Database } from '@/types/supabase-generated'

// Använd types
const invoice: Database['public']['Tables']['invoices']['Row'] = {
  // ...
}
```

## Uppdatera Befintlig Kod

När types är genererade:

1. Uppdatera imports i komponenter:
   ```typescript
   // Före
   import type { Invoice } from '@/types/supabase'
   
   // Efter (om genererade types)
   import type { Database } from '@/types/supabase-generated'
   type Invoice = Database['public']['Tables']['invoices']['Row']
   ```

2. Eller behåll båda och uppdatera gradvis.

---

**Notera:** Project Reference ID är INTE samma som Project ID. Reference ID är en kort kod (20 tecken), medan Project ID är en UUID.

