# 📘 Guide: Använda Genererade Supabase Types

**Status:** ✅ Types genererade! Filen `types/supabase-generated.ts` finns nu.

---

## ✅ Verifiering

Din fil innehåller nu:
- `Database` type med alla tabeller
- `Row`, `Insert`, `Update` types för varje tabell
- Relationships mellan tabeller

---

## 🚀 Hur Man Använder Genererade Types

### Steg 1: Importera Database Type

```typescript
import type { Database } from '@/types/supabase-generated'
```

### Steg 2: Använd Types i Komponenter

#### Exempel 1: Invoice Type
```typescript
// Före (manuell type)
import type { Invoice } from '@/types/supabase'

// Efter (genererad type)
import type { Database } from '@/types/supabase-generated'
type Invoice = Database['public']['Tables']['invoices']['Row']
```

#### Exempel 2: Typad Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Nu är queries type-safe!
const { data } = await supabase
  .from('invoices')
  .select('*')
  // TypeScript vet nu exakt vilka kolumner som finns!
```

#### Exempel 3: Insert Type
```typescript
import type { Database } from '@/types/supabase-generated'

type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']

const newInvoice: InvoiceInsert = {
  tenant_id: '...',
  amount: 1000,
  customer_name: 'Acme Corp',
  // TypeScript varnar om saknade required fields!
}
```

#### Exempel 4: Update Type
```typescript
import type { Database } from '@/types/supabase-generated'

type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

const update: InvoiceUpdate = {
  amount: 2000,
  status: 'paid',
  // TypeScript vet vilka fält som kan uppdateras!
}
```

---

## 🔄 Migrera Befintlig Kod

### Strategi 1: Gradvis Migration (Rekommenderat)

1. **Behåll båda types-filerna:**
   - `types/supabase.ts` - Manuella types (fortsätt använda)
   - `types/supabase-generated.ts` - Genererade types (ny kod)

2. **Uppdatera ny kod att använda genererade types:**
   ```typescript
   // I nya komponenter
   import type { Database } from '@/types/supabase-generated'
   type Invoice = Database['public']['Tables']['invoices']['Row']
   ```

3. **Migrera gradvis:**
   - Uppdatera en komponent i taget
   - Testa efter varje ändring

### Strategi 2: Full Migration

1. **Uppdatera alla imports:**
   ```typescript
   // Sök efter alla:
   import type { Invoice } from '@/types/supabase'
   
   // Ersätt med:
   import type { Database } from '@/types/supabase-generated'
   type Invoice = Database['public']['Tables']['invoices']['Row']
   ```

2. **Uppdatera Supabase client:**
   ```typescript
   // app/utils/supabase/supabaseClient.ts
   import type { Database } from '@/types/supabase-generated'
   
   export const supabase = createClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

---

## 💡 Fördelar med Genererade Types

### 1. Automatisk Type Safety
```typescript
// TypeScript varnar om fel kolumnnamn!
const { data } = await supabase
  .from('invoices')
  .select('invalid_column') // ❌ Error: Column doesn't exist
```

### 2. IntelliSense Support
```typescript
const invoice: Database['public']['Tables']['invoices']['Row'] = {
  // IDE visar alla tillgängliga properties!
  // amount, customer_name, tenant_id, etc.
}
```

### 3. Schema Sync
- När du ändrar databas-schema, regenerera types
- TypeScript varnar om breaking changes

---

## 🔄 Regenerera Types

När du ändrar databas-schemat:

```bash
# 1. Logga in (om behövs)
npx supabase login

# 2. Regenerera types
npx supabase gen types typescript --project-id rwgqyozifwfgsxwyegoz > types/supabase-generated.ts
```

**Rekommendation:** Kör detta regelbundet eller efter schema-ändringar.

---

## 📝 Exempel: Uppdatera useInvoices Hook

**Före:**
```typescript
import type { Invoice } from '@/types/supabase'

export function useInvoices() {
  // ...
  return (data || []).map((inv: any) => ({
    ...inv,
    // ...
  })) as Invoice[]
}
```

**Efter:**
```typescript
import type { Database } from '@/types/supabase-generated'

type Invoice = Database['public']['Tables']['invoices']['Row']

export function useInvoices() {
  // ...
  return (data || []).map((inv: any) => ({
    ...inv,
    // ...
  })) as Invoice[]
}
```

---

## ⚠️ Noteringar

1. **Behåll manuella types:** Du kan behålla `types/supabase.ts` för backward compatibility
2. **Relationships:** Genererade types inkluderar relationships, men de behöver inte användas
3. **Optional Fields:** Genererade types markerar nullable kolumner korrekt (`| null`)

---

## 🎯 Nästa Steg

1. ✅ Types är genererade
2. 🔄 Uppdatera Supabase client att använda Database type
3. 🔄 Migrera hooks att använda genererade types
4. 🔄 Migrera komponenter gradvis

---

**Frågor?** Se `docs/CODE_EXPLANATION.md` för mer info!

