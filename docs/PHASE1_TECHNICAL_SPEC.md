# Phase 1 Teknisk Specifikation - Edge Cases & Rollback Plan

## Översikt
Detta dokument beskriver edge cases, rollback-planer och migrationsstrategi för Phase 1.

---

## Edge Cases

### J) Customer Portal

**Edge Case 1: Token collision**
- **Problem**: Access token redan används
- **Lösning**: Generera nytt token med retry (max 3 försök)
- **Implementation**: `UNIQUE` constraint på `access_token` + retry-logik

**Edge Case 2: Expired link används samtidigt som cleanup**
- **Problem**: Race condition mellan cleanup och view
- **Lösning**: `SELECT FOR UPDATE` lock vid view-check
- **Implementation**: Row-level locking i API endpoint

**Edge Case 3: Max views nås mitt i en session**
- **Problem**: Användare ser resursen men länken inaktiveras
- **Lösning**: Inkrementera view_count först, sedan checka max_views
- **Implementation**: Atomic increment via trigger

**Edge Case 4: Lösenordsskyddad länk med fel lösenord**
- **Problem**: Brute force attack
- **Lösning**: Rate limiting per IP (max 5 försök per 15 min)
- **Implementation**: Redis eller in-memory cache med IP-key

---

### M) Audit Log

**Edge Case 1: Mass-uppdatering av fakturor**
- **Problem**: Tusentals audit logs skapas samtidigt
- **Lösning**: Batch insert med `INSERT INTO ... SELECT`
- **Implementation**: Bulk audit logging-funktion

**Edge Case 2: Audit log tabell blir för stor**
- **Problem**: Performance degradation
- **Lösning**: Archive gamla logs (>1 år) till archive-tabell
- **Implementation**: Cron job som flyttar gamla logs månadsvis

**Edge Case 3: Audit log skapas för system-events**
- **Problem**: user_id är NULL
- **Lösning**: Använd `system` som user_id eller logga i metadata
- **Implementation**: `user_id` nullable + `metadata.system = true`

**Edge Case 4: Trigger-baserad audit log misslyckas**
- **Problem**: Transaction rollback om audit log failar
- **Lösning**: Separate transaction för audit log (async)
- **Implementation**: Queue-based audit logging

---

### D) ÄTA 2.0

**Edge Case 1: ÄTA länkar till faktura som redan är betald**
- **Problem**: Kan inte lägga till ÄTA till betald faktura
- **Lösning**: Validera faktura-status innan linking
- **Implementation**: Check `invoices.status != 'paid'` i API

**Edge Case 2: Flera ÄTA länkar till samma faktura**
- **Problem**: Dubblering av belopp
- **Lösning**: Summera alla ÄTA-belopp när faktura skapas
- **Implementation**: Aggregate query när faktura genereras

**Edge Case 3: Signature_id refererar till borttagen signature**
- **Problem**: Foreign key constraint violation
- **Lösning**: `ON DELETE SET NULL` istället för `CASCADE`
- **Implementation**: Uppdatera foreign key constraint

**Edge Case 4: Status_timeline blir för stor**
- **Problem**: JSONB array växer obegränsat
- **Lösning**: Begränsa till senaste 50 entries eller archive
- **Implementation**: Trim array vid varje update (keep last 50)

**Edge Case 5: Invoice_mode ändras efter linking**
- **Problem**: Inkonsekvent data
- **Lösning**: Blockera ändring av invoice_mode om parent_invoice_id finns
- **Implementation**: Check constraint eller API-validering

---

### K) Budget & Alerts

**Edge Case 1: Budget sätts till 0**
- **Problem**: Division by zero i get_budget_usage()
- **Lösning**: Returnera 0% om budget är 0
- **Implementation**: `CASE WHEN budget > 0 THEN ... ELSE 0 END`

**Edge Case 2: Flera alerts för samma threshold**
- **Problem**: Duplicerade alerts
- **Lösning**: `UNIQUE` constraint på (project_id, alert_type, threshold_percentage, status='active')
- **Implementation**: Partial unique index

**Edge Case 3: Budget uppdateras efter alert skapats**
- **Problem**: Alert visar fel percentage
- **Lösning**: Uppdatera eller markera alert som resolved när budget ändras
- **Implementation**: Trigger på project_budgets som uppdaterar alerts

**Edge Case 4: Time entries eller material entries raderas**
- **Problem**: Budget usage blir fel
- **Lösning**: Recalculate budget usage vid varje alert-check
- **Implementation**: get_budget_usage() beräknar alltid från scratch

**Edge Case 5: Projekt arkiveras med aktiva alerts**
- **Problem**: Alerts fortsätter att skapas
- **Lösning**: Filter på projekt-status i budget alert worker
- **Implementation**: `WHERE p.status = 'active'` i worker query

---

## Rollback Plan

### Migration Rollback

#### Steg 1: Backup
```sql
-- Skapa backup av alla tabeller innan migration
CREATE TABLE public_links_backup AS SELECT * FROM public_links;
CREATE TABLE audit_logs_backup AS SELECT * FROM audit_logs;
CREATE TABLE project_budgets_backup AS SELECT * FROM project_budgets;
-- etc.
```

#### Steg 2: Rollback Script

**Rollback för Customer Portal:**
```sql
-- sql/PHASE1_ROLLBACK_J_CUSTOMER_PORTAL.sql
-- 1. Inaktivera länkar
UPDATE public_links SET active = false;

-- 2. Ta bort foreign key constraints
ALTER TABLE rot_applications DROP CONSTRAINT IF EXISTS rot_applications_signature_id_fkey;

-- 3. Ta bort triggers
DROP TRIGGER IF EXISTS trigger_increment_public_link_views ON public_link_events;
DROP FUNCTION IF EXISTS increment_public_link_views();

-- 4. Ta bort tabeller (OM INGEN DATA SKA BEVARAS)
-- DROP TABLE IF EXISTS public_link_events CASCADE;
-- DROP TABLE IF EXISTS public_links CASCADE;

-- 5. Restore från backup (om behövs)
-- INSERT INTO public_links SELECT * FROM public_links_backup;
```

**Rollback för Audit Log:**
```sql
-- sql/PHASE1_ROLLBACK_M_AUDIT_LOG.sql
-- 1. Ta bort funktioner
DROP FUNCTION IF EXISTS append_audit_event(...) CASCADE;

-- 2. Ta bort triggers (om några skapats)
-- DROP TRIGGER IF EXISTS audit_invoices_changes ON invoices;

-- 3. Ta bort tabeller (OM INGEN DATA SKA BEVARAS)
-- DROP TABLE IF EXISTS release_labels CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
```

**Rollback för ÄTA 2.0:**
```sql
-- sql/PHASE1_ROLLBACK_D_ATA_2.0.sql
-- 1. Ta bort kolumner från rot_applications
ALTER TABLE rot_applications DROP COLUMN IF EXISTS signature_id;
ALTER TABLE rot_applications DROP COLUMN IF EXISTS invoice_mode;
ALTER TABLE rot_applications DROP COLUMN IF EXISTS cost_frame;
ALTER TABLE rot_applications DROP COLUMN IF EXISTS photos;
ALTER TABLE rot_applications DROP COLUMN IF EXISTS status_timeline;
ALTER TABLE rot_applications DROP COLUMN IF EXISTS parent_invoice_id;

-- 2. Ta bort ata_items tabell
DROP TABLE IF EXISTS ata_items CASCADE;

-- 3. Ta bort funktioner
DROP FUNCTION IF EXISTS update_ata_status_timeline(...) CASCADE;
```

**Rollback för Budget & Alerts:**
```sql
-- sql/PHASE1_ROLLBACK_K_BUDGET_ALERTS.sql
-- 1. Inaktivera alerts
UPDATE budget_alerts SET status = 'resolved';

-- 2. Ta bort tabeller
DROP TABLE IF EXISTS budget_alerts CASCADE;
DROP TABLE IF EXISTS project_budgets CASCADE;

-- 3. Ta bort funktioner
DROP FUNCTION IF EXISTS get_budget_usage(...) CASCADE;
DROP FUNCTION IF EXISTS create_budget_alert(...) CASCADE;
```

#### Steg 3: Feature Flags Rollback
```sql
-- Inaktivera alla Phase 1 feature flags
UPDATE tenant_feature_flags
SET 
  enable_customer_portal = false,
  enable_budget_alerts = false,
  enable_ata_2_0 = false,
  enable_audit_log = false;
```

---

### Data Migration Strategy

#### Dry Run
```sql
-- Testa migrationer på staging först
-- 1. Skapa test-tenant
-- 2. Kör migrationer
-- 3. Verifiera data
-- 4. Testa API endpoints
-- 5. Rollback och kör igen om behövs
```

#### Gradual Rollout
1. **Vecka 1**: Deploy till staging, testa med pilot-kunder
2. **Vecka 2**: Aktivera för 1-2 produktions-tenants via feature flags
3. **Vecka 3**: Aktivera för alla tenants om inga problem
4. **Rollback**: Om problem, inaktivera feature flags per tenant

---

## Performance Considerations

### Index Optimization
- **public_links**: Index på `access_token` för snabb lookup
- **audit_logs**: Composite index på `(tenant_id, table_name, record_id, created_at DESC)` för vanliga queries
- **budget_alerts**: Partial index på `status = 'active'` för snabb filtering

### Query Optimization
- **get_budget_usage()**: Använd materialized view eller cache om performance blir problem
- **Audit log search**: Full-text search index på `table_name` och `action`
- **Public link lookup**: Bara query på `access_token` (indexed)

### Monitoring
- **Slow queries**: Logga queries >500ms
- **Table sizes**: Monitora audit_logs och public_link_events storlek
- **Alert frequency**: Varning om >100 alerts skapas per timme

---

## Security Considerations

### RLS Policies
- Alla tabeller har tenant-isolation via RLS
- Service role används endast för background jobs
- Public links: Ingen auth krävs, men validering via token

### Data Exposure
- **Public links**: Kortlivade tokens (default 7 dagar)
- **Audit logs**: Bara synliga för samma tenant
- **Budget alerts**: Bara synliga för tenant-medlemmar

### Rate Limiting
- Public link views: Max 1000 per IP per dag
- Audit log search: Max 200 results per query
- Budget alert creation: Max 10 alerts per projekt per timme

---

## Testing Checklist

### Pre-Deployment
- [ ] Alla SQL-migrationer körs utan fel
- [ ] RLS policies fungerar korrekt
- [ ] Index skapas korrekt
- [ ] Triggers fungerar
- [ ] Feature flags fungerar

### Post-Deployment
- [ ] API endpoints returnerar korrekt data
- [ ] Background jobs körs enligt schema
- [ ] Public links fungerar utan auth
- [ ] Budget alerts skapas korrekt
- [ ] Audit logs loggas korrekt
- [ ] ÄTA 2.0 funktioner fungerar

### Edge Case Testing
- [ ] Token collision hanteras
- [ ] Expired links blockeras
- [ ] Budget 0 hanteras
- [ ] Mass-uppdateringar fungerar
- [ ] Rollback fungerar

---

## Migration Order

**Kör migrations i denna ordning:**

1. `PHASE1_MIGRATION_SIGNATURES_STUB.sql` (måste köras först)
2. `PHASE1_MIGRATION_M_AUDIT_LOG.sql`
3. `PHASE1_MIGRATION_J_CUSTOMER_PORTAL.sql`
4. `PHASE1_MIGRATION_D_ATA_2.0.sql` (kräver signatures)
5. `PHASE1_MIGRATION_K_BUDGET_ALERTS.sql`
6. `PHASE1_FEATURE_FLAGS.sql`

**Eller kör alla via:**
```bash
psql -f sql/PHASE1_MIGRATION_ALL.sql
```

---

## Support & Troubleshooting

### Vanliga Problem

**Problem**: `relation "signatures" does not exist`
- **Lösning**: Kör `PHASE1_MIGRATION_SIGNATURES_STUB.sql` först

**Problem**: RLS policy blockerar queries
- **Lösning**: Kontrollera att user är kopplad till tenant via employees-tabellen

**Problem**: Background jobs körs inte
- **Lösning**: Kontrollera pg_cron extension eller Edge Functions setup

**Problem**: Feature flags fungerar inte
- **Lösning**: Kontrollera att `tenant_feature_flags` har rader för alla tenants

---

## Dokumentation för Fas 2

När Fas 2 implementeras:
1. Uppdatera `BankIDSignatureProvider` med riktig implementation
2. Uppdatera `PEPPOLInvoiceExporter` med riktig implementation
3. Aktivera via feature flags per tenant
4. Testa med pilot-kunder
5. Gradual rollout

