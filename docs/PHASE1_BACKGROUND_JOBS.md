# Phase 1 Background Jobs - Specifikation

## Översikt
Detta dokument beskriver alla background jobs (cron, queue) för Phase 1-funktioner.

---

## Budget Alert Worker

### Cron Schedule
Körs varje 15:e minut: `*/15 * * * *`

### Job: `budget_alert_worker`

**Beskrivning:**
Kontrollerar alla aktiva projekt med budget och skapar alerts när trösklar passerats.

**Pseudokod:**
```typescript
async function budgetAlertWorker() {
  // 1. Hämta alla aktiva projekt med budget
  const budgets = await db.query(`
    SELECT pb.*, p.id as project_id, p.tenant_id
    FROM project_budgets pb
    JOIN projects p ON pb.project_id = p.id
    WHERE p.status = 'active'
  `);

  for (const budget of budgets) {
    // 2. Beräkna usage via get_budget_usage()
    const usage = await db.function('get_budget_usage', [budget.project_id]);

    // 3. Kontrollera varje threshold i alert_thresholds
    for (const threshold of budget.alert_thresholds) {
      if (!threshold.notify) continue;

      // Beräkna current percentage baserat på alert_type
      let currentPercentage = 0;
      if (threshold.type === 'hours') {
        currentPercentage = usage.hours_percentage;
      } else if (threshold.type === 'material') {
        currentPercentage = usage.material_percentage;
      } else {
        currentPercentage = usage.total_percentage;
      }

      // 4. Om current >= threshold och ingen aktiv alert finns, skapa alert
      if (currentPercentage >= threshold.percentage) {
        const existingAlert = await db.query(`
          SELECT id FROM budget_alerts
          WHERE project_id = $1
          AND alert_type = $2
          AND threshold_percentage = $3
          AND status = 'active'
        `, [budget.project_id, threshold.type, threshold.percentage]);

        if (!existingAlert) {
          await db.function('create_budget_alert', [
            budget.project_id,
            threshold.type,
            threshold.percentage,
            currentPercentage
          ]);

          // 5. Skicka notifikation till admins
          await sendNotificationToAdmins(budget.tenant_id, {
            type: 'budget_alert',
            project_id: budget.project_id,
            threshold: threshold.percentage,
            current: currentPercentage
          });
        }
      }
    }
  }
}
```

**Felhantering:**
- Retry: Max 3 försök med exponential backoff
- Logga fel till audit_logs
- Alert vid fel i 3+ projekt

**Edge Cases:**
- Projekt utan budget: Skippa
- Budget uppdaterad efter alert: Uppdatera alert eller markera som resolved
- Flera thresholds samtidigt: Skapa separata alerts

---

## PDF Invoice Worker

### Trigger
On-demand (anropas när faktura skapas/uppdateras)

### Job: `pdf_invoice_worker`

**Beskrivning:**
Genererar PDF för faktura när den skapas eller uppdateras.

**Pseudokod:**
```typescript
async function pdfInvoiceWorker(invoiceId: string) {
  try {
    // 1. Hämta faktura med alla data
    const invoice = await db.query(`
      SELECT i.*, p.name as project_name, c.name as client_name
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = $1
    `, [invoiceId]);

    // 2. Hämta invoice_lines
    const lines = await db.query(`
      SELECT * FROM invoice_lines
      WHERE invoice_id = $1
      ORDER BY sort_order ASC
    `, [invoiceId]);

    // 3. Generera PDF (via puppeteer eller html2pdf)
    const pdfBuffer = await generatePDF({
      invoice,
      lines,
      template: 'invoice'
    });

    // 4. Upload till Supabase Storage
    const fileUrl = await uploadToStorage(
      `invoices/${invoice.tenant_id}/${invoiceId}.pdf`,
      pdfBuffer
    );

    // 5. Uppdatera invoice med pdf_url (om kolumn finns)
    await db.query(`
      UPDATE invoices
      SET pdf_url = $1
      WHERE id = $2
    `, [fileUrl, invoiceId]);

    // 6. Logga audit event
    await db.function('append_audit_event', [
      invoice.tenant_id,
      'invoices',
      invoiceId,
      'export',
      null,
      null,
      null,
      { pdf_url: fileUrl },
      ['pdf_url'],
      null,
      null,
      { worker: 'pdf_invoice_worker' }
    ]);

  } catch (error) {
    // Retry logic
    if (retryCount < 3) {
      await scheduleRetry('pdf_invoice_worker', invoiceId, retryCount + 1);
    } else {
      // Log error
      await logError('pdf_invoice_worker', invoiceId, error);
    }
  }
}
```

**Felhantering:**
- Retry: Max 3 försök med exponential backoff (1min, 5min, 15min)
- Dead letter queue: Om alla retries misslyckas

**Edge Cases:**
- Stor faktura (>100 rader): Chunk processing
- Saknade data: Fallback till placeholder-värden
- Storage full: Alert till admin

---

## Share Link Cleanup Worker

### Cron Schedule
Körs dagligen kl 02:00: `0 2 * * *`

### Job: `share_link_cleanup`

**Beskrivning:**
Rensar expired eller inaktiva publika länkar.

**Pseudokod:**
```typescript
async function shareLinkCleanup() {
  // 1. Hitta expired länkar
  const expiredLinks = await db.query(`
    SELECT id, tenant_id, resource_type, resource_id
    FROM public_links
    WHERE active = true
    AND (
      expires_at < NOW()
      OR (max_views IS NOT NULL AND view_count >= max_views)
    )
  `);

  for (const link of expiredLinks) {
    // 2. Inaktivera länk
    await db.query(`
      UPDATE public_links
      SET active = false, updated_at = NOW()
      WHERE id = $1
    `, [link.id]);

    // 3. Logga audit event
    await db.function('append_audit_event', [
      link.tenant_id,
      'public_links',
      link.id,
      'update',
      null,
      null,
      { active: true },
      { active: false },
      ['active'],
      null,
      null,
      { reason: 'expired_or_max_views' }
    ]);
  }

  // 4. Rensa gamla events (>90 dagar)
  await db.query(`
    DELETE FROM public_link_events
    WHERE created_at < NOW() - INTERVAL '90 days'
  `);

  return {
    deactivated: expiredLinks.length,
    cleaned_events: result.rowCount
  };
}
```

**Felhantering:**
- Logga fel men fortsätt med nästa länk
- Alert om >100 länkar misslyckas

**Edge Cases:**
- Länk används samtidigt som cleanup: Skip (active check)
- Bulk cleanup: Batch processing (100 i taget)

---

## Queue System Setup

### Implementation
Använd Supabase Edge Functions + pg_cron eller extern queue (t.ex. BullMQ med Redis).

**Supabase Edge Function Example:**
```typescript
// supabase/functions/budget-alert-worker/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Budget alert worker logic
  await budgetAlertWorker(supabase)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**pg_cron Setup:**
```sql
-- Installera pg_cron extension (om tillgängligt)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schemalägg budget alert worker (var 15:e minut)
SELECT cron.schedule(
  'budget-alert-worker',
  '*/15 * * * *',
  $$
  SELECT budget_alert_worker();
  $$
);

-- Schemalägg share link cleanup (dagligen kl 02:00)
SELECT cron.schedule(
  'share-link-cleanup',
  '0 2 * * *',
  $$
  SELECT share_link_cleanup();
  $$
);
```

---

## Retry Logic

### Exponential Backoff
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}
```

---

## Monitoring & Alerts

### Metrics att spåra:
- Budget alert worker: Antal alerts skapade, fel per körning
- PDF worker: Antal PDFs genererade, genomsnittlig tid, fel-rate
- Cleanup worker: Antal länkar rensade, events rensade

### Alerts:
- Budget worker körs inte: Alert efter 30 min
- PDF worker fel-rate >10%: Alert till admin
- Cleanup worker misslyckas: Alert om >100 länkar

