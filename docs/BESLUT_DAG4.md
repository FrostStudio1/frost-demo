# 🎯 Slutgiltiga Beslut - Dag 4: Visma/Fortnox Integration

**Datum:** 2025-11-05  
**Baserat på:** Perplexity Pro Research  
**Status:** ✅ BESLUTAT - Klar för implementation

---

## 📊 Strategi och Prioriteringar

### Primär Integration: **Fortnox**
**Användning:**
- ✅ Fakturor (bidirectional sync)
- ✅ Lönespec/Payroll (export)
- ✅ Tidsrapporter (export)
- ✅ Kunder (bidirectional sync)
- ✅ Offert (export)
- ✅ Anställda (export)
- ✅ Projekt (export, valfritt)

**Anledning:**
- Komplett payroll-modul
- Bra API-dokumentation
- Webhook-stöd
- Etablerat system i Sverige

---

### Sekundär Integration: **Visma eAccounting + Payroll**
**Användning:**
- ✅ Fakturor (backup/bidirectional)
- ✅ Kunder (backup/bidirectional)
- ✅ Tidsrapporter → Payroll (via Visma Payroll API)
- ✅ Anställda (export)

**Anledning:**
- Backup för fakturor
- Visma Payroll API är bättre för löneunderlag
- Fler alternativ = bättre redundans

---

## 🔐 Tekniska Beslut

### 1. OAuth 2.0 Flow
**✅ Beslut:** Authorization Code Flow för båda systemen

**Fortnox:**
- Base URL: `https://api.fortnox.se/3`
- OAuth URL: `https://apps.fortnox.se/oauth-v1`
- Scopes: `invoice,customer,salary,timereporting,offer,project`

**Visma:**
- eAccounting API: `https://api.vismaservices.com/eaccounting`
- Payroll API: `https://api.vismaservices.com/payroll`
- OAuth URL: `https://integration.visma.net/API/resources/oauth`
- Scopes: `financialstasks`

---

### 2. Rate Limiting
**✅ Beslut:** 
- Fortnox: 300 req/min (25 req/5s) - implementera Bottleneck
- Visma: Liknande struktur - implementera rate limiting
- Exponential backoff med jitter (1s, 2s, 4s, 8s, 16s, max 60s)

---

### 3. Token Storage
**✅ Beslut:** 
- Kryptera tokens i databas (AES-256)
- Lagra i `integration_tokens` tabell
- Auto-refresh när tokens går ut
- Separate tokens för Fortnox och Visma

---

### 4. Webhook Implementation
**✅ Beslut:**
- Fortnox: Webhooks via portal (inte via API)
- Visma: Webhooks via API subscription
- HMAC-SHA256 signature verification
- Timing-safe comparison för security

---

### 5. Sync Strategy
**✅ Beslut:**

**Export (Frost → Fortnox/Visma):**
- Manual export on demand
- Incremental sync (endast ändrade records)
- Batch operations för effektivitet

**Import (Fortnox/Visma → Frost):**
- Webhook-triggered sync (realtid)
- Scheduled batch sync (varje timme)
- Last-write-wins conflict resolution

---

### 6. Data-typer och Mappning

| Data-typ | Fortnox | Visma | Sync Direction |
|----------|---------|-------|----------------|
| Faktura | ✅ | ✅ eAccounting | Bidirectional |
| Lönespec | ✅ Payroll | ✅ Payroll | Export |
| Offert | ✅ | ❌ | Export |
| Tidsrapport | ✅ | ✅ Payroll | Export |
| Kunder | ✅ | ✅ eAccounting | Bidirectional |
| Anställda | ✅ | ✅ Payroll | Export |
| Projekt | ✅ | ❌ | Export (valfritt) |

---

### 7. Error Handling
**✅ Beslut:**
- Exponential backoff retry (5-8 försök)
- Jitter för att undvika thundering herd
- Logging till `sync_logs` tabell
- Monitoring via Sentry/console
- Graceful degradation (fortsätt om en integration misslyckas)

---

### 8. Security
**✅ Beslut:**
- ✅ HTTPS only
- ✅ Token encryption (AES-256)
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Timing-safe comparison
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Strong secrets (32+ characters)
- ✅ IP whitelisting (om möjligt)

---

## 📋 Database Schema

### `integrations` Tabell
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL CHECK (provider IN ('fortnox', 'visma_eaccounting', 'visma_payroll')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connected', 'error', 'paused')),
  oauth_client_id TEXT NOT NULL,
  oauth_client_secret_encrypted TEXT NOT NULL, -- Encrypted
  access_token_encrypted TEXT, -- Encrypted
  refresh_token_encrypted TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  webhook_secret_encrypted TEXT, -- Encrypted
  last_sync_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  settings JSONB DEFAULT '{}', -- { dataTypes: ['invoice', 'customer'], syncDirection: 'bidirectional' }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider, status);
```

### `integration_jobs` Tabell
```sql
CREATE TABLE integration_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  integration_id UUID NOT NULL REFERENCES integrations(id),
  job_type TEXT NOT NULL CHECK (job_type IN ('export', 'import', 'webhook')),
  data_type TEXT NOT NULL CHECK (data_type IN ('invoice', 'offer', 'payroll', 'time_entry', 'customer', 'employee', 'project')),
  resource_type TEXT NOT NULL, -- 'invoice', 'customer', etc.
  resource_id UUID, -- Frost resource ID
  external_id TEXT, -- Fortnox/Visma ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB, -- Request payload
  response JSONB, -- Response from API
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_integration_jobs_tenant ON integration_jobs(tenant_id);
CREATE INDEX idx_integration_jobs_status ON integration_jobs(status, created_at);
CREATE INDEX idx_integration_jobs_integration ON integration_jobs(integration_id, status);
```

### `integration_mappings` Tabell
```sql
CREATE TABLE integration_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  integration_id UUID NOT NULL REFERENCES integrations(id),
  local_resource_type TEXT NOT NULL, -- 'invoice', 'customer', etc.
  local_resource_id UUID NOT NULL, -- Frost ID
  external_resource_id TEXT NOT NULL, -- Fortnox/Visma ID
  external_resource_type TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_direction TEXT CHECK (last_sync_direction IN ('export', 'import')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, integration_id, local_resource_type, local_resource_id)
);

CREATE INDEX idx_integration_mappings_tenant ON integration_mappings(tenant_id);
CREATE INDEX idx_integration_mappings_external ON integration_mappings(integration_id, external_resource_id);
CREATE INDEX idx_integration_mappings_local ON integration_mappings(local_resource_type, local_resource_id);
```

### `sync_logs` Tabell
```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  integration_id UUID REFERENCES integrations(id),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('export', 'import', 'webhook', 'scheduled')),
  data_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  record_count INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_tenant ON sync_logs(tenant_id, created_at DESC);
CREATE INDEX idx_sync_logs_status ON sync_logs(status, created_at DESC);
```

---

## 🚀 Implementation Prioritering

### Phase 1: Fortnox OAuth & Basic Export (Högsta prioritet)
1. OAuth flow implementation
2. Token storage (encrypted)
3. Invoice export
4. Customer sync (bidirectional)

### Phase 2: Fortnox Full Export
5. Lönespec export
6. Tidsrapport export
7. Offert export
8. Employee export

### Phase 3: Visma Integration
9. Visma eAccounting OAuth
10. Visma Payroll OAuth
11. Invoice/customer sync
12. Time entry export

### Phase 4: Webhooks & Import
13. Fortnox webhook handler
14. Visma webhook handler
15. Import sync
16. Conflict resolution

### Phase 5: UI & Polish
17. Settings UI
18. Sync status display
19. Manual sync buttons
20. Error handling UI

---

## ✅ Checklista

- [x] OAuth 2.0 flow beslutat
- [x] Rate limiting strategi beslutat
- [x] Token encryption beslutat
- [x] Webhook security beslutat
- [x] Sync strategy beslutat
- [x] Database schema designad
- [x] Error handling strategi beslutat
- [x] Security checklist klar

**Status:** ✅ ALLA BESLUT TÅGNA - KLAR FÖR IMPLEMENTATION

---

**Nästa steg:** GPT-5 implementerar backend enligt optimerad prompt

