# 🔧 Guide: Generera Supabase TypeScript Types

## ✅ Din Project Reference ID
**Din Reference ID:** `rwgqyozifwfgsxwyegoz`

## Metod 1: Via Supabase CLI (Rekommenderat)

### Steg 1: Logga in på Supabase CLI
```bash
npx supabase login
```
Detta öppnar en webbläsare där du loggar in med ditt Supabase-konto.

### Steg 2: Generera Types
```bash
npx supabase gen types typescript --project-id rwgqyozifwfgsxwyegoz > types/supabase-generated.ts
```

### Alternativ: Om CLI inte fungerar
Om du får "Access token not provided", kör först:
```bash
npx supabase login
```

## Metod 2: Via Supabase Dashboard (Manuellt)

1. **Gå till Supabase Dashboard:**
   - Logga in på https://supabase.com/dashboard
   - Välj ditt projekt

2. **Generera Types:**
   - Gå till **Settings** → **API**
   - Scrolla ner till **Generate types**
   - Välj **TypeScript**
   - Kopiera koden
   - Spara i `types/supabase-generated.ts`

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

