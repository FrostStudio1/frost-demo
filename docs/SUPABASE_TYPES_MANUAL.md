# 📝 Manuell Guide: Generera Supabase Types

**Project Reference ID:** `rwgqyozifwfgsxwyegoz`

## Metod 1: Via Supabase Dashboard (Enklast)

1. **Gå till:** https://supabase.com/dashboard/project/rwgqyozifwfgsxwyegoz
2. **Klicka på:** Settings (⚙️) → API
3. **Scrolla ner till:** "Generate types"
4. **Välj:** TypeScript
5. **Kopiera:** Alla typer
6. **Spara i:** `types/supabase-generated.ts`

## Metod 2: Via Supabase CLI

```bash
# 1. Logga in
npx supabase login

# 2. Generera types
npx supabase gen types typescript --project-id rwgqyozifwfgsxwyegoz > types/supabase-generated.ts
```

## Metod 3: Via API (Programmatiskt)

Skapa en fil `scripts/generate-types.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Hämta schema och generera types
// (Detta kräver mer kod - rekommenderar Metod 1 eller 2)
```

## Efter Generering

När types är genererade, uppdatera imports:

```typescript
// Före
import type { Invoice } from '@/types/supabase'

// Efter (om genererade types finns)
import type { Database } from '@/types/supabase-generated'
type Invoice = Database['public']['Tables']['invoices']['Row']
```

Eller behåll båda och uppdatera gradvis.

