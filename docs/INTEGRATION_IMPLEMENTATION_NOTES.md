# Integration Implementation Notes

## ✅ Implementerat

Alla filer från GPT-5 är implementerade och fixade:

1. **SQL Migration** (`sql/CREATE_INTEGRATIONS_TABLES.sql`)
   - Alla tabeller skapade i `app` schema
   - RLS policies implementerade
   - Indexes och triggers på plats

2. **Encryption** (`app/lib/encryption.ts`)
   - AES-256-GCM encryption implementerad
   - Stöd för JSON encryption/decryption
   - Backward compatibility för personnummer-funktioner

3. **Token Storage** (`app/lib/integrations/token-storage.ts`)
   - Krypterad lagring av tokens
   - Auto-refresh support
   - Expiration checking

4. **OAuth Flows**
   - Fortnox OAuth (`app/lib/integrations/fortnox/oauth.ts`)
   - Visma OAuth (`app/lib/integrations/visma/oauth.ts`)

5. **API Clients**
   - Fortnox Client med Bottleneck rate limiting
   - Retry strategy integrerad

6. **Sync Logic**
   - Export functions (`app/lib/integrations/sync/export.ts`)
   - Import functions (`app/lib/integrations/sync/import.ts`)
   - Field mappers (`app/lib/integrations/sync/mappers.ts`)

7. **API Endpoints**
   - `/api/integrations/fortnox/connect` - Start OAuth flow
   - `/api/integrations/fortnox/callback` - OAuth callback
   - `/api/integrations/[id]/sync` - Queue sync job
   - `/api/integrations/[id]/status` - Get integration status
   - `/api/integrations/[id]/export` - Manual export
   - `/api/webhooks/fortnox` - Webhook handler
   - `/api/cron/sync-integrations` - Background job processor

## ⚠️ Viktiga Noteringar

### Schema Access
Supabase använder `search_path` för att hitta tabeller. SQL-filen sätter `search_path = public, app` så att Supabase automatiskt hittar tabeller i både `public` och `app` schema.

Om du får fel om att tabeller inte hittas:
1. Kör SQL-filen i Supabase SQL Editor
2. Kontrollera att `search_path` är satt korrekt
3. Alternativt: Använd schema-qualifierade table names (t.ex. `app.integrations`)

### Environment Variables
Lägg till i `.env.local`:

```env
FORTNOX_CLIENT_ID=...
FORTNOX_CLIENT_SECRET=...
FORTNOX_REDIRECT_URI=https://app.yourdomain.com/api/integrations/fortnox/callback
FORTNOX_BASE_URL=https://api.fortnox.se/3

VISMA_CLIENT_ID=...
VISMA_CLIENT_SECRET=...
VISMA_REDIRECT_URI=https://app.yourdomain.com/api/integrations/visma/callback
VISMA_EACCOUNTING_BASE_URL=https://eaccountingapi.vismaonline.com/v2
VISMA_PAYROLL_BASE_URL=https://payroll.visma.net/api/v1

ENCRYPTION_KEY_256_BASE64=...   # 32 byte key, Base64 encoded
```

### Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Schema
Tabeller skapas i `app` schema:
- `app.integrations` - OAuth configs och tokens
- `app.integration_jobs` - Sync job queue
- `app.integration_mappings` - ID mappings
- `app.sync_logs` - Audit trail

### Next Steps
1. ✅ Kör SQL migration i Supabase
2. ✅ Lägg till env variables
3. ⏳ Skapa UI för integration settings (Gemini's job)
4. ⏳ Testa OAuth flow
5. ⏳ Testa export/import
6. ⏳ Sätt upp cron job (Vercel cron eller liknande)

## 🔧 Fixar Gjorda

1. **Import paths**: Fixade alla `@/app/lib/...` till korrekta paths
2. **Schema access**: Använder Supabase search_path istället för schema prefix
3. **Table names**: `customers` → `clients` (rätt tabellnamn)
4. **Invoice lines**: Använder `invoice_lines` med korrekt kolumnstruktur
5. **Error handling**: Lagt till `extractErrorMessage` överallt
6. **Bottleneck**: Installerat och integrerat

## 📝 TODO

- [ ] Visma eAccounting client (implementerad, behöver testas)
- [ ] Visma Payroll client (implementerad, behöver testas)
- [ ] Mer field mappings för alla data-typer (lönespec, offert, tidsrapport, anställda, projekt)
- [ ] UI för integration settings (Gemini's job - behöver uppdateras för Visma också)
- [ ] Testa med sandbox API:er
- [ ] Sätt upp cron job

