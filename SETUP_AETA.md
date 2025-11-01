# ÄTA-system Setup

## Databas-struktur

För att ÄTA-systemet ska fungera behöver du skapa en tabell i Supabase.

### Steg 1: Skapa tabell i Supabase

1. Gå till Supabase Dashboard → SQL Editor
2. Kör följande SQL (se `supabase/migrations/create_aeta_requests.sql`):

```sql
-- Tabellen skapas automatiskt med rätt struktur och RLS policies
```

### Steg 2: Verifiera tabellen

Efter att ha kört migrationen, kontrollera att:
- Tabellen `aeta_requests` finns
- RLS (Row Level Security) är aktiverad
- Policies är skapade

## Funktioner

### För anställda
- **Skapa ÄTA-förfrågan**: Gå till `/aeta` och fyll i formuläret
- Förfrågningar sparas med status `pending`
- Väntar på admin-godkännande

### För admin
- **Godkänna/Avvisa förfrågningar**: Gå till `/admin/aeta`
- När en förfrågan godkänns skapas automatiskt en `time_entry`
- Avvisade förfrågningar kan innehålla admin-noteringar

## API Endpoints

- `GET /api/aeta?tenant_id=xxx&status=pending` - Hämta förfrågningar
- `POST /api/aeta` - Skapa ny förfrågan
- `PATCH /api/aeta/[id]` - Uppdatera status (godkänn/avvisa)

## Databas-schema

```typescript
interface AetaRequest {
  id: string
  tenant_id: string
  project_id: string
  employee_id?: string
  requested_by: string // auth user id
  description: string
  hours: number
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  approved_by?: string // auth user id
  reviewed_at?: string
  created_at: string
  updated_at: string
}
```

