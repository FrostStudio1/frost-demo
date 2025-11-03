# 🧪 Phase 1 Test Guide - Frost Solutions

## Översikt
Detta dokument beskriver vad som ändrats i Phase 1 och hur man testar alla nya funktioner.

---

## 📋 Vad är ändrat?

### 1. Nya databastabeller (SQL Migrations)
- ✅ `signatures` & `signature_events` - För BankID-signering (stub)
- ✅ `audit_logs` & `release_labels` - För revisionsspårning
- ✅ `public_links` & `public_link_events` - För kundportal
- ✅ `project_budgets` & `budget_alerts` - För budget-hantering
- ✅ `ata_items` - För ÄTA-radartiklar
- ✅ `tenant_feature_flags` - För feature flag-hantering

### 2. Nya API Endpoints

#### ÄTA 2.0
- `POST /api/ata/create` - Skapa ny ÄTA
- `POST /api/ata/[id]/approve` - Godkänn ÄTA
- `POST /api/ata/[id]/link-invoice` - Koppla ÄTA till faktura
- `POST /api/ata/[id]/photos` - Ladda upp bilder
- `GET /api/ata/[id]/timeline` - Visa status-tidslinje
- `GET /api/rot` - Hämta alla ÄTAs

#### Budget & Alerts
- `POST /api/projects/[id]/budget` - Sätt budget för projekt
- `GET /api/projects/[id]/budget` - Hämta budget
- `GET /api/projects/[id]/budget-usage` - Hämta budget-användning
- `GET /api/projects/[id]/budget-alerts` - Hämta aktiva larm
- `POST /api/budget-alerts/[id]/acknowledge` - Markera larm som sett
- `POST /api/budget-alerts/[id]/resolve` - Lös larm

#### Customer Portal
- `POST /api/public-links/create` - Skapa publik länk
- `GET /api/public/[token]` - Visa resurs via länk
- `POST /api/public/[token]/sign` - Signera via publik länk
- `POST /api/public-links/[id]/revoke` - Återkalla länk

#### Audit Log
- `GET /api/audit-logs/search` - Sök i audit logs
- `GET /api/audit-logs/[table]/[recordId]` - Hämta logs för specifik record

#### Background Jobs
- `GET /api/cron/budget-alerts` - Budget alert worker
- `GET /api/cron/share-link-cleanup` - Share link cleanup worker

### 3. Nya Frontend-komponenter
- ✅ `ATA2Card.tsx` - ÄTA-hantering i projektsidan
- ✅ `BudgetCard.tsx` - Budget-visning med progress bars
- ✅ `app/public/[token]/page.tsx` - Publik sida för kunder

### 4. Utökade funktioner
- ✅ `rot_applications` har nu: signature_id, invoice_mode, cost_frame, photos, status_timeline, parent_invoice_id
- ✅ Projektsidan visar nu ÄTA- och Budget-komponenter

---

## 🧪 Hur testar jag?

### Steg 1: Kör SQL Migrations

**Viktigt:** Kör migrations i rätt ordning!

```bash
# Via Supabase Dashboard SQL Editor:
# Kör filerna i denna ordning:
1. sql/PHASE1_MIGRATION_SIGNATURES_STUB.sql
2. sql/PHASE1_MIGRATION_M_AUDIT_LOG.sql
3. sql/PHASE1_MIGRATION_J_CUSTOMER_PORTAL.sql
4. sql/PHASE1_MIGRATION_D_ATA_2.0.sql
5. sql/PHASE1_MIGRATION_K_BUDGET_ALERTS.sql
6. sql/PHASE1_FEATURE_FLAGS.sql

# ELLER kör alla via:
sql/PHASE1_MIGRATION_ALL.sql
```

**Verifiera att tabellerna skapats:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'signatures', 
  'audit_logs', 
  'public_links', 
  'project_budgets', 
  'budget_alerts',
  'ata_items',
  'tenant_feature_flags'
);
```

---

### Steg 2: Testa ÄTA 2.0

#### 2.1 Skapa ÄTA via UI
1. Gå till ett projekt: `/projects/[id]`
2. Scrolla ner till "ÄTAs (Ändringar/Tillägg)"-sektionen
3. Klicka på "+ Ny ÄTA"
4. Fyll i:
   - Beskrivning: "Test ÄTA"
   - Kostnadsram: 50000
   - Faktureringsläge: "Separat faktura"
5. Klicka "Skapa ÄTA"

**Förväntat resultat:**
- ✅ ÄTA visas i listan
- ✅ Status-tidslinje visar "created"

#### 2.2 Testa via API
```bash
# Skapa ÄTA
curl -X POST http://localhost:3000/api/ata/create \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "project_id": "YOUR_PROJECT_ID",
    "description": "Test ÄTA",
    "cost_frame": 50000,
    "invoice_mode": "separate"
  }'

# Godkänn ÄTA
curl -X POST http://localhost:3000/api/ata/ATA_ID/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "comment": "Godkänt för test"
  }'

# Hämta timeline
curl http://localhost:3000/api/ata/ATA_ID/timeline \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

#### 2.3 Ladda upp bilder
```bash
curl -X POST http://localhost:3000/api/ata/ATA_ID/photos \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -F "photos=@/path/to/image.jpg"
```

**OBS:** Du behöver skapa Supabase Storage bucket `ata-photos` först:
```sql
-- Via Supabase Dashboard → Storage → Create bucket
-- Bucket name: ata-photos
-- Public: No (eller Yes om du vill)
```

---

### Steg 3: Testa Budget & Alerts

#### 3.1 Sätt budget via UI
1. Gå till projekt: `/projects/[id]`
2. Scrolla till "Budget & Larm"-sektionen
3. Klicka "Sätt Budget" eller "Uppdatera Budget"
4. Fyll i:
   - Budget Timmar: 100
   - Budget Material: 50000
5. Klicka "Spara Budget"

**Förväntat resultat:**
- ✅ Budget visas med progress bars
- ✅ Visar använda timmar/material vs budget

#### 3.2 Testa via API
```bash
# Sätt budget
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/budget \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "budget_hours": 100,
    "budget_material": 50000,
    "alert_thresholds": [
      {"percentage": 70, "notify": true},
      {"percentage": 90, "notify": true}
    ]
  }'

# Hämta budget usage
curl http://localhost:3000/api/projects/PROJECT_ID/budget-usage \
  -H "Cookie: YOUR_AUTH_COOKIE"

# Hämta alerts
curl http://localhost:3000/api/projects/PROJECT_ID/budget-alerts \
  -H "Cookie: YOUR_AUTH_COOKIE"

# Markera alert som sett
curl -X POST http://localhost:3000/api/budget-alerts/ALERT_ID/acknowledge \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

#### 3.3 Testa Budget Alert Worker
```bash
# Kör manuellt (behöver CRON_SECRET i .env.local)
curl http://localhost:3000/api/cron/budget-alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Eller lägg till i vercel.json för automatisk körning
```

---

### Steg 4: Testa Customer Portal

#### 4.1 Skapa publik länk via API
```bash
curl -X POST http://localhost:3000/api/public-links/create \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "resource_type": "invoice",
    "resource_id": "INVOICE_ID",
    "expires_at": "2025-12-31T23:59:59Z",
    "max_views": 10
  }'
```

**Förväntat resultat:**
- ✅ Får tillbaka `access_token` och `public_url`

#### 4.2 Öppna publik länk
1. Kopiera `public_url` från svaret
2. Öppna i inkognito-fönster (ingen inloggning)
3. Resursen ska visas

**Förväntat resultat:**
- ✅ Faktura/ÄTA/projekt visas utan autentisering
- ✅ Visningsräknare ökar

#### 4.3 Signera via publik länk
1. På publik sidan, fyll i:
   - Namn: "Test Kund"
   - Email: "test@example.com"
2. Klicka "Signera"

**Förväntat resultat:**
- ✅ Signering skapas i `signatures`-tabellen
- ✅ Status ändras till "signed"
- ✅ Signature hash genereras

#### 4.4 Testa lösenordsskyddad länk
```bash
curl -X POST http://localhost:3000/api/public-links/create \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "resource_type": "invoice",
    "resource_id": "INVOICE_ID",
    "password": "test123"
  }'
```

När du öppnar länken måste du ange lösenord.

---

### Steg 5: Testa Audit Log

#### 5.1 Sök i audit logs
```bash
curl "http://localhost:3000/api/audit-logs/search?table_name=invoices&limit=10" \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

#### 5.2 Hämta logs för specifik record
```bash
curl http://localhost:3000/api/audit-logs/invoices/INVOICE_ID \
  -H "Cookie: YOUR_AUTH_COOKIE"
```

**Förväntat resultat:**
- ✅ Se alla ändringar för fakturan
- ✅ Se vem som gjorde ändringen och när

---

### Steg 6: Testa Feature Flags

#### 6.1 Kontrollera feature flags
```sql
-- Via Supabase Dashboard SQL Editor
SELECT * FROM tenant_feature_flags WHERE tenant_id = 'YOUR_TENANT_ID';
```

#### 6.2 Uppdatera feature flags
```sql
UPDATE tenant_feature_flags
SET enable_budget_alerts = true,
    enable_ata_2_0 = true,
    enable_customer_portal = true
WHERE tenant_id = 'YOUR_TENANT_ID';
```

**Förväntat resultat:**
- ✅ Features kan aktiveras/inaktiveras per tenant
- ✅ API endpoints kontrollerar feature flags innan execution

---

### Steg 7: Testa Background Workers

#### 7.1 Budget Alert Worker
```bash
# Kör manuellt
curl http://localhost:3000/api/cron/budget-alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Förväntat resultat:**
- ✅ Kontrollerar alla projekt med budget
- ✅ Skapar alerts när thresholds passerats
- ✅ Returnerar antal alerts skapade

#### 7.2 Share Link Cleanup Worker
```bash
# Kör manuellt
curl http://localhost:3000/api/cron/share-link-cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Förväntat resultat:**
- ✅ Inaktiverar expired länkar
- ✅ Rensar gamla events (>90 dagar)
- ✅ Returnerar antal länkar rensade

#### 7.3 Konfigurera automatisk körning (Vercel)
Lägg till i `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/budget-alerts",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/share-link-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 🔍 Felsökning

### Problem: "relation does not exist"
**Lösning:** Kör SQL migrations i rätt ordning (se Steg 1)

### Problem: "Feature flag not enabled"
**Lösning:** 
```sql
-- Aktivera feature flag för din tenant
UPDATE tenant_feature_flags
SET enable_ata_2_0 = true
WHERE tenant_id = 'YOUR_TENANT_ID';
```

### Problem: "Admin access required"
**Lösning:** Kontrollera att din användare har `role = 'admin'` i `employees`-tabellen

### Problem: "Storage bucket not found"
**Lösning:** Skapa bucket `ata-photos` i Supabase Dashboard → Storage

### Problem: "CRON_SECRET not configured"
**Lösning:** Lägg till i `.env.local`:
```
CRON_SECRET=your-secret-key-here
```

---

## ✅ Checklist för komplett test

- [ ] SQL migrations körda utan fel
- [ ] Feature flags fungerar
- [ ] ÄTA kan skapas och godkännas
- [ ] Budget kan sättas och visas
- [ ] Budget alerts skapas när threshold passerats
- [ ] Publik länk kan skapas och öppnas
- [ ] Signering via publik länk fungerar
- [ ] Audit logs loggar ändringar
- [ ] Background workers körs utan fel
- [ ] Frontend-komponenter visas korrekt
- [ ] Alla API endpoints returnerar korrekt data

---

## 📝 Exempel Test Scenario

**Komplett flöde:**
1. Skapa projekt → ✅
2. Sätt budget på projektet → ✅
3. Rapportera timmar (över 70% av budget) → ✅
4. Kontrollera att budget alert skapas → ✅
5. Skapa ÄTA för projektet → ✅
6. Godkänn ÄTA → ✅
7. Skapa publik länk för ÄTA → ✅
8. Öppna länk i inkognito → ✅
9. Signera ÄTA via länk → ✅
10. Kontrollera audit log för alla ändringar → ✅

---

## 🚀 Nästa steg efter testning

1. **Fix bugs** som hittas under testning
2. **Konfigurera cron jobs** för produktion
3. **Sätt upp monitoring** för background workers
4. **Dokumentera** för användare
5. **Planera Fas 2** (BankID & PEPPOL integration)

---

**Lycka till med testningen! 🎉**

