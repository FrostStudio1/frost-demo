# 🚀 Frost Solutions - Nya Funktioner - Teknisk Specifikation

## Översikt
Detta dokument beskriver tekniska specifikationer för nya funktioner som ska stärka Frost Solutions position mot konkurrenter.

---

## A) BankID-signering för viktiga flöden

### Tabeller & Schema

**`signatures`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK → tenants.id)
- document_type (text: 'quote', 'ata', 'work_order', 'time_entry')
- document_id (uuid) -- FK till respektive tabell
- signer_role (text: 'customer', 'employee', 'admin')
- signer_user_id (uuid, nullable) -- FK till users om intern
- signer_email (text, nullable) -- För externa signatärer
- signature_method (text: 'bankid', 'email', 'manual')
- signature_hash (text) -- SHA-256 hash av dokumentet vid signering
- signed_at (timestamptz)
- ip_address (inet, nullable)
- user_agent (text, nullable)
- status (text: 'pending', 'signed', 'rejected', 'expired')
- expires_at (timestamptz, nullable)
- created_at (timestamptz)
```

**`signature_events`** (audit log)
```sql
- id (uuid, PK)
- signature_id (uuid, FK → signatures.id)
- event_type (text: 'sent', 'viewed', 'signed', 'rejected', 'expired')
- event_data (jsonb) -- Extra metadata
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/signatures/create`**
- Skapar signature-record med pending status
- Genererar signeringslänk/token
- Skickar email/BankID-prompt

**POST `/api/signatures/[id]/sign`**
- Validerar signatur
- Genererar hash av dokument
- Uppdaterar status till 'signed'
- Loggar event

**GET `/api/signatures/[id]/verify`**
- Verifierar signaturhash mot dokument
- Returnerar signeringsinfo

### Background Jobs
- Cron: Rensa expired signatures varje dag
- Webhook: BankID callback för signeringsstatus

### MVP Logik
- SHA-256 hash av dokument + tidsstämpel vid signering
- Signeringslänk med JWT-token (24h giltighet)
- Email-verifiering som fallback om BankID saknas

---

## B) E-faktura & betalningar

### Tabeller & Schema

**`invoices`** (utöka befintlig)
```sql
-- Lägg till:
- peppol_status (text: 'not_sent', 'sent', 'delivered', 'failed')
- peppol_message_id (text, nullable)
- payment_link_id (text, nullable) -- Stripe/Swish
- payment_status (text: 'unpaid', 'pending', 'paid', 'failed')
- payment_provider (text: 'swish', 'stripe', 'bankgiro', null)
- ocr_reference (text, nullable) -- Bankgiro OCR
- payment_received_at (timestamptz, nullable)
```

**`payment_webhooks`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- invoice_id (uuid, FK → invoices.id)
- provider (text: 'swish', 'stripe')
- webhook_data (jsonb)
- processed (boolean, default false)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/invoices/[id]/peppol`**
- Genererar PEPPOL XML (EN16931)
- Skickar till PEPPOL network
- Uppdaterar peppol_status

**POST `/api/invoices/[id]/payment-link`**
- Skapar Swish/Stripe payment link
- Returnerar betalningslänk

**POST `/api/payments/webhook`**
- Tar emot webhook från Swish/Stripe
- Uppdaterar invoice payment_status
- Skapar payment_webhooks record

**GET `/api/invoices/[id]/peppol-xml`**
- Returnerar PEPPOL XML för download

### Background Jobs
- Cron: Generera OCR-referenser för fakturor utan
- Queue: PEPPOL retry för failed sends

### MVP Logik
- PEPPOL XML generation via bibliotek (t.ex. `peppol-bis-invoice-3`)
- OCR-referens: 10-siffrigt nummer (KID)
- Payment link integration med Stripe API

---

## C) Löneunderlag & schema

### Tabeller & Schema

**`payroll_periods`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- period_start (date)
- period_end (date)
- status (text: 'draft', 'locked', 'exported')
- exported_at (timestamptz, nullable)
- created_at (timestamptz)
```

**`payroll_entries`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- payroll_period_id (uuid, FK → payroll_periods.id)
- employee_id (uuid, FK → employees.id)
- time_entry_ids (uuid[]) -- Array av time_entry IDs
- total_hours (numeric)
- regular_hours (numeric)
- ob_hours (jsonb) -- {night: 0, evening: 0, weekend: 0}
- total_amount (numeric)
- exported (boolean, default false)
- created_at (timestamptz)
```

**`schedules`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- employee_id (uuid, FK → employees.id)
- project_id (uuid, FK → projects.id, nullable)
- work_site_id (uuid, FK → work_sites.id, nullable)
- start_date (date)
- end_date (date, nullable)
- start_time (time)
- end_time (time)
- break_minutes (integer, default 30)
- status (text: 'scheduled', 'confirmed', 'completed', 'cancelled')
- auto_create_time_entry (boolean, default true)
- created_at (timestamptz)
```

**`absences`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- employee_id (uuid, FK → employees.id)
- start_date (date)
- end_date (date)
- absence_type (text: 'vacation', 'sick', 'other')
- approved (boolean, default false)
- approved_by (uuid, FK → employees.id, nullable)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/payroll/generate`**
- Skapar payroll_period
- Aggregerar time_entries till payroll_entries
- Beräknar OB-tillägg

**GET `/api/payroll/[periodId]/export`**
- Exporterar som CSV/JSON
- Markerar som exported

**POST `/api/schedules/create`**
- Skapar schema-post
- Om auto_create_time_entry: skapar time_entry vid datum

**GET `/api/schedules/employee/[employeeId]`**
- Hämtar scheman för anställd

**POST `/api/absences/create`**
- Skapar frånvaropost
- Kollar kollision med scheman

### Background Jobs
- Cron: Skapa time_entries från scheman varje dag (kl 00:01)
- Cron: Generera payroll_periods månadsvis

### MVP Logik
- Payroll export: CSV med kolumner (employee, hours, rate, amount, OB)
- Schema → time_entry: Auto-skapa vid start_date om status='confirmed'
- Frånvaro: Blockera schemaläggning under frånvaroperiod

---

## D) ÄTA 2.0 (ändringar/tillägg)

### Tabeller & Schema

**`rot_applications`** (utöka befintlig)
```sql
-- Lägg till:
- signature_id (uuid, FK → signatures.id, nullable)
- invoice_mode (text: 'separate', 'add_to_main', default 'separate')
- cost_frame (numeric, nullable) -- Kostnadsram
- photos (text[]) -- Array av bild-URLs
- status_timeline (jsonb) -- [{status, timestamp, user_id}]
- parent_invoice_id (uuid, FK → invoices.id, nullable)
```

**`ata_items`** (om inte finns)
```sql
- id (uuid, PK)
- rot_application_id (uuid, FK → rot_applications.id)
- tenant_id (uuid, FK)
- description (text)
- quantity (numeric)
- unit_price (numeric)
- total_price (numeric)
- sort_order (integer)
```

### API Endpoints

**POST `/api/rot/[id]/sign`**
- Kopplar signature till ÄTA
- Uppdaterar status

**POST `/api/rot/[id]/invoice-mode`**
- Sätter invoice_mode
- Om 'add_to_main': länkar till huvudfaktura

**POST `/api/rot/[id]/photos`**
- Uploadar bilder till storage
- Uppdaterar photos array

**GET `/api/rot/[id]/timeline`**
- Returnerar status_timeline

### Background Jobs
- Inga kritiska

### MVP Logik
- Invoice mode 'add_to_main': Lägg till ÄTA-belopp i huvudfakturas invoice_lines
- Timeline: Logga varje statusändring automatiskt
- Photos: Supabase Storage med tenant-isolerade buckets

---

## E) Material & inköp "light procurement"

### Tabeller & Schema

**`suppliers`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name (text)
- contact_email (text)
- contact_phone (text)
- address (text)
- active (boolean, default true)
- created_at (timestamptz)
```

**`supplier_price_lists`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- supplier_id (uuid, FK → suppliers.id)
- name (text) -- T.ex. "Vinter 2024"
- valid_from (date)
- valid_to (date, nullable)
- active (boolean, default true)
- created_at (timestamptz)
```

**`supplier_items`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- supplier_id (uuid, FK → suppliers.id)
- price_list_id (uuid, FK → supplier_price_lists.id, nullable)
- item_code (text) -- Leverantörens artikelnummer
- name (text)
- description (text, nullable)
- unit (text: 'st', 'm', 'm2', 'kg')
- base_price (numeric)
- discount_percent (numeric, default 0)
- valid_from (date)
- valid_to (date, nullable)
```

**`material_entries`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- project_id (uuid, FK → projects.id)
- rot_application_id (uuid, FK → rot_applications.id, nullable)
- supplier_id (uuid, FK → suppliers.id, nullable)
- receipt_image_url (text, nullable) -- OCR-processad kvitto
- cost_center (text, nullable) -- Kostnadsställe/kod
- total_amount (numeric)
- entry_date (date)
- description (text)
- ocr_processed (boolean, default false)
- created_at (timestamptz)
```

**`material_line_items`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- material_entry_id (uuid, FK → material_entries.id)
- supplier_item_id (uuid, FK → supplier_items.id, nullable)
- description (text)
- quantity (numeric)
- unit (text)
- unit_price (numeric)
- total_price (numeric)
- ocr_matched (boolean, default false) -- Om OCR matchade mot supplier_item
```

### API Endpoints

**POST `/api/suppliers/create`**
- Skapar leverantör

**POST `/api/suppliers/[id]/price-list`**
- Skapar prislista
- Bulk-upload items via CSV

**POST `/api/materials/create`**
- Skapar material_entry
- Om receipt_image_url: Trigger OCR

**POST `/api/materials/[id]/ocr`**
- Manuell OCR-trigger
- Matchar mot supplier_items

**GET `/api/materials/project/[projectId]`**
- Hämtar material per projekt

### Background Jobs
- Queue: OCR-processing för receipt_image_url
- Cron: Flagga utgångna price_lists

### MVP Logik
- OCR: Tesseract.js eller Google Vision API (billig)
- Matchning: Fuzzy match på description → supplier_items
- Cost center: Fritext eller dropdown från projektkoder

---

## F) Kvitto-OCR & dokument-AI

### Tabeller & Schema

**`ocr_jobs`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- document_type (text: 'receipt', 'invoice', 'other')
- file_url (text) -- Supabase Storage URL
- status (text: 'pending', 'processing', 'completed', 'failed')
- ocr_provider (text: 'tesseract', 'google_vision', 'azure')
- raw_ocr_data (jsonb, nullable)
- extracted_data (jsonb, nullable) -- Strukturerad data
- error_message (text, nullable)
- created_at (timestamptz)
- processed_at (timestamptz, nullable)
```

**`ocr_line_items`**
```sql
- id (uuid, PK)
- ocr_job_id (uuid, FK → ocr_jobs.id)
- line_number (integer)
- description (text)
- quantity (numeric, nullable)
- unit_price (numeric, nullable)
- total_price (numeric)
- matched_item_id (uuid, FK → supplier_items.id, nullable)
- confidence (numeric, nullable) -- OCR confidence score
```

### API Endpoints

**POST `/api/ocr/process`**
- Uploadar bild
- Skapar ocr_job
- Triggerar OCR-processing

**GET `/api/ocr/[jobId]/status`**
- Returnerar OCR-status och extracted_data

**POST `/api/ocr/[jobId]/match-items`**
- Auto-matchar ocr_line_items mot supplier_items
- Returnerar matches med confidence

### Background Jobs
- Queue: OCR-processing (tesseract.js eller API)
- Retry: Failed OCR-jobs (max 3 försök)

### MVP Logik
- OCR: Tesseract.js för lokalt (gratis) eller Google Vision API ($1.50 per 1000 bilder)
- Extract: Regex för att hitta pris, kvantitet, beskrivning
- Match: Levenshtein distance för fuzzy matching

---

## G) Geofencing & arbetspass-bevis

### Tabeller & Schema

**`work_sites`** (utöka befintlig)
```sql
-- Lägg till:
- geofence_type (text: 'radius', 'polygon', null)
- geofence_center_lat (numeric, nullable)
- geofence_center_lng (numeric, nullable)
- geofence_radius_meters (integer, nullable) -- Om radius
- geofence_polygon (jsonb, nullable) -- [{lat, lng}] om polygon
- auto_clock_enabled (boolean, default false)
- admin_alert_distance (integer, default 500) -- Meter
```

**`geofence_events`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- employee_id (uuid, FK → employees.id)
- work_site_id (uuid, FK → work_sites.id)
- project_id (uuid, FK → projects.id, nullable)
- event_type (text: 'entered', 'exited', 'nearby')
- latitude (numeric)
- longitude (numeric)
- accuracy (numeric, nullable) -- GPS accuracy i meter
- distance_from_center (numeric, nullable) -- Meter från center
- auto_clocked (boolean, default false)
- time_entry_id (uuid, FK → time_entries.id, nullable)
- created_at (timestamptz)
```

**`gps_tracks`** (för revisionsspårning)
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- employee_id (uuid, FK → employees.id)
- time_entry_id (uuid, FK → time_entries.id, nullable)
- latitude (numeric)
- longitude (numeric)
- accuracy (numeric)
- timestamp (timestamptz)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/geofence/check`**
- Tar emot lat/lng från klient
- Kontrollerar mot work_sites geofences
- Returnerar event_type + work_site
- Om auto_clock: Skapar time_entry

**POST `/api/gps/track`**
- Loggar GPS-position
- Används för kontinuerlig tracking

**GET `/api/work-sites/[id]/geofence`**
- Returnerar geofence-konfiguration

**PUT `/api/work-sites/[id]/geofence`**
- Uppdaterar geofence (admin only)

### Background Jobs
- Inga kritiska (real-time via API)

### MVP Logik
- Haversine formula för distance calculation
- Auto-clock: Om distance < radius → skapa time_entry
- GPS tracking: Logga var 30:e sekund när time_entry är aktiv
- Polygon check: Point-in-polygon algorithm

---

## H) Egenkontroller / KMA / checklista-motor

### Tabeller & Schema

**`checklist_templates`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name (text)
- category (text: 'safety', 'quality', 'compliance', 'custom')
- description (text, nullable)
- active (boolean, default true)
- created_at (timestamptz)
```

**`checklist_template_items`**
```sql
- id (uuid, PK)
- template_id (uuid, FK → checklist_templates.id)
- sort_order (integer)
- question (text)
- item_type (text: 'yes_no', 'text', 'photo', 'signature', 'number')
- required (boolean, default true)
- help_text (text, nullable)
```

**`checklists`** (instanser)
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- template_id (uuid, FK → checklist_templates.id)
- project_id (uuid, FK → projects.id, nullable)
- work_site_id (uuid, FK → work_sites.id, nullable)
- assigned_to (uuid, FK → employees.id)
- status (text: 'draft', 'in_progress', 'completed', 'approved')
- completed_at (timestamptz, nullable)
- approved_by (uuid, FK → employees.id, nullable)
- approved_at (timestamptz, nullable)
- created_at (timestamptz)
```

**`checklist_responses`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- checklist_id (uuid, FK → checklists.id)
- template_item_id (uuid, FK → checklist_template_items.id)
- response_value (text, nullable) -- För yes_no/text/number
- photo_url (text, nullable) -- För photo type
- signature_id (uuid, FK → signatures.id, nullable) -- För signature type
- response_date (timestamptz)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/checklists/templates/create`**
- Skapar template med items

**POST `/api/checklists/create`**
- Skapar checklist-instans från template

**POST `/api/checklists/[id]/response`**
- Svarar på checklist-item
- Uploadar foto om behövs

**POST `/api/checklists/[id]/complete`**
- Markerar checklist som completed
- Validerar att alla required items är besvarade

**POST `/api/checklists/[id]/approve`**
- Admin godkännande

**GET `/api/checklists/[id]/export-pdf`**
- Genererar PDF-export

### Background Jobs
- Inga kritiska

### MVP Logik
- PDF export: html2pdf eller puppeteer
- Foto: Supabase Storage med tenant-isolering
- Signering: Använder samma signature-system som punkt A

---

## I) Fotologg med auto-taggning

### Tabeller & Schema

**`photos`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- project_id (uuid, FK → projects.id, nullable)
- work_site_id (uuid, FK → work_sites.id, nullable)
- rot_application_id (uuid, FK → rot_applications.id, nullable)
- uploaded_by (uuid, FK → employees.id)
- file_url (text) -- Supabase Storage URL
- thumbnail_url (text, nullable)
- latitude (numeric, nullable)
- longitude (numeric, nullable)
- taken_at (timestamptz) -- EXIF datum eller upload-tid
- auto_tags (text[]) -- Array av auto-genererade taggar
- manual_tags (text[]) -- Array av manuella taggar
- category (text, nullable) -- 'electrical', 'plumbing', 'painting', etc.
- description (text, nullable)
- ai_category_confidence (numeric, nullable) -- 0-1
- created_at (timestamptz)
```

**`photo_tags`** (för sökning)
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- photo_id (uuid, FK → photos.id)
- tag_name (text)
- tag_type (text: 'auto', 'manual', 'category')
- confidence (numeric, nullable)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/photos/upload`**
- Uploadar bild
- Extraherar EXIF (datum, GPS)
- Triggerar auto-tagging

**POST `/api/photos/[id]/tag`**
- Lägger till/ta bort manuell tagg

**GET `/api/photos/project/[projectId]`**
- Hämtar foton per projekt med filter

**GET `/api/photos/[id]/export-report`**
- Genererar fotorapport (PDF med thumbnails)

**POST `/api/photos/batch-tag`**
- Bulk-taggning av flera foton

### Background Jobs
- Queue: Auto-tagging via AI (t.ex. Hugging Face image classification)
- Cron: Generera thumbnails för nya foton

### MVP Logik
- Auto-tagging: Hugging Face CLIP model (gratis) eller Google Vision API
- Kategorier: Predefinierade kategorier baserat på projekt-typ
- GPS-tagging: Från EXIF eller manuellt
- Export: PDF med grid av thumbnails + metadata

---

## J) Kundportal "light"

### Tabeller & Schema

**`public_links`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- resource_type (text: 'quote', 'invoice', 'ata', 'project')
- resource_id (uuid) -- FK till respektive tabell
- access_token (text, unique) -- JWT eller random string
- password_hash (text, nullable) -- Om lösenordsskyddad
- expires_at (timestamptz, nullable)
- max_views (integer, nullable)
- view_count (integer, default 0)
- active (boolean, default true)
- created_by (uuid, FK → employees.id)
- created_at (timestamptz)
```

**`public_link_events`**
```sql
- id (uuid, PK)
- public_link_id (uuid, FK → public_links.id)
- event_type (text: 'viewed', 'downloaded', 'signed', 'approved')
- ip_address (inet, nullable)
- user_agent (text, nullable)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/public-links/create`**
- Skapar public_link
- Genererar access_token
- Returnerar URL

**GET `/api/public/[token]`**
- Validerar token
- Returnerar resource (invoice/quote/ata)
- Loggar view-event

**POST `/api/public/[token]/sign`**
- Signering via public link
- Kopplar till signature-system

**POST `/api/public/[token]/approve`**
- Godkännande/avslag
- Loggar event

### Background Jobs
- Cron: Inaktivera expired links

### MVP Logik
- Access token: UUID v4 eller JWT med kort livstid
- Lösenord: bcrypt hash (valfritt)
- View tracking: Räknar views, blockerar om max_views nått
- Security: Rate limiting per IP

---

## K) Budget & larm

### Tabeller & Schema

**`project_budgets`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- project_id (uuid, FK → projects.id, unique)
- budget_hours (numeric)
- budget_material (numeric)
- budget_total (numeric) -- hours + material
- alert_thresholds (jsonb) -- [{percentage: 70, notify: true}, {percentage: 90, notify: true}]
- created_at (timestamptz)
- updated_at (timestamptz)
```

**`budget_alerts`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- project_id (uuid, FK → projects.id)
- budget_id (uuid, FK → project_budgets.id)
- alert_type (text: 'hours', 'material', 'total')
- threshold_percentage (numeric)
- current_percentage (numeric)
- status (text: 'active', 'acknowledged', 'resolved')
- acknowledged_by (uuid, FK → employees.id, nullable)
- acknowledged_at (timestamptz, nullable)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/projects/[id]/budget`**
- Sätter budget
- Beräknar initiala värden

**GET `/api/projects/[id]/budget-status`**
- Returnerar current vs budget
- Listar aktiva alerts

**POST `/api/budget-alerts/[id]/acknowledge`**
- Markerar alert som acknowledged

**POST `/api/budget-alerts/[id]/suggest-ata`**
- Föreslår skapa ÄTA (förslag)

### Background Jobs
- Cron: Kontrollera budget-status varje timme
- Skapa budget_alerts när threshold passerad
- Skicka notifikationer till admins

### MVP Logik
- Budget calculation: Sum time_entries + material_entries per projekt
- Alert: Skapas när current_percentage >= threshold
- Auto-resolve: Om budget uppdateras och current < threshold
- Suggestion: Auto-generera ÄTA-förslag vid 90%+ budget

---

## L) Fortnox/Visma integrationsplan

### Tabeller & Schema

**`integrations`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- provider (text: 'fortnox', 'visma')
- integration_type (text: 'customer', 'invoice', 'payroll')
- status (text: 'active', 'paused', 'error')
- api_key (text, encrypted) -- Kryptorad API-nyckel
- api_secret (text, encrypted, nullable)
- last_sync_at (timestamptz, nullable)
- error_count (integer, default 0)
- created_at (timestamptz)
```

**`integration_jobs`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- integration_id (uuid, FK → integrations.id)
- job_type (text: 'export_customer', 'export_invoice', 'export_payroll', 'sync')
- resource_type (text: 'client', 'invoice', 'payroll')
- resource_id (uuid) -- FK till respektive tabell
- status (text: 'pending', 'processing', 'completed', 'failed')
- retry_count (integer, default 0)
- error_message (text, nullable)
- provider_response (jsonb, nullable)
- created_at (timestamptz)
- processed_at (timestamptz, nullable)
```

**`integration_mappings`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- integration_id (uuid, FK → integrations.id)
- local_resource_type (text: 'client', 'invoice', 'employee')
- local_resource_id (uuid)
- provider_resource_id (text) -- Externa systemets ID
- provider_resource_type (text)
- synced_at (timestamptz)
```

### API Endpoints

**POST `/api/integrations/create`**
- Skapar integration
- Validerar API-credentials

**POST `/api/integrations/[id]/export`**
- Manual export (CSV/JSON)
- Skapar integration_job

**POST `/api/integrations/[id]/sync`**
- Triggerar sync
- Skapar integration_jobs för alla pending resources

**GET `/api/integrations/[id]/status`**
- Returnerar sync-status
- Listar failed jobs

**POST `/api/integrations/[id]/webhook`**
- Tar emot webhook från Fortnox/Visma
- Uppdaterar lokal data

### Background Jobs
- Queue: Process integration_jobs med retry (max 3)
- Cron: Auto-sync varje timme om aktiv
- Cron: Re-queue failed jobs (max 3 retries)

### MVP Logik
- Steg 1: CSV/JSON export (manuell download)
- Steg 2: API-integration med Fortnox/Visma REST API
- Steg 3: Webhook för uppdateringar
- Mappning: integration_mappings för att koppla lokala ↔ externa IDs
- Encryption: Kryptera API-nycklar i databas (t.ex. AES-256)

---

## M) Revision & spårbarhet

### Tabeller & Schema

**`audit_logs`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- table_name (text) -- 'projects', 'invoices', 'time_entries', etc.
- record_id (uuid) -- ID i den tabellen
- action (text: 'create', 'update', 'delete', 'view')
- user_id (uuid, nullable) -- FK till users
- employee_id (uuid, FK → employees.id, nullable)
- old_values (jsonb, nullable) -- Före ändring
- new_values (jsonb, nullable) -- Efter ändring
- changed_fields (text[]) -- Array av ändrade fält
- ip_address (inet, nullable)
- user_agent (text, nullable)
- created_at (timestamptz)
```

**`release_labels`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- label_name (text) -- T.ex. "OB-rules-2024", "ROT-rules-2025"
- description (text, nullable)
- rules_snapshot (jsonb) -- Snapshot av regler vid release
- effective_from (date)
- created_at (timestamptz)
```

### API Endpoints

**GET `/api/audit-logs/[table]/[recordId]`**
- Hämtar audit log för specifik record

**GET `/api/audit-logs/search`**
- Sök i audit logs (filter på table, user, date range)

**POST `/api/release-labels/create`**
- Skapar release label
- Tar snapshot av aktuella regler

**GET `/api/release-labels/[id]/rules`**
- Returnerar rules_snapshot för historisk referens

### Background Jobs
- Trigger: Auto-logga alla ändringar (PostgreSQL triggers eller app-level)
- Archive: Flytta gamla audit_logs till archive-tabell (efter 1 år)

### MVP Logik
- Audit logging: PostgreSQL triggers eller app-level hooks
- Snapshot: JSON-snapshot av OB-regler, ROT-regler vid release
- Search: Full-text search på table_name, action, user

---

## N) Multi-företag / Partnerläge

### Tabeller & Schema

**`partner_organizations`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK) -- Huvudorganisationen
- partner_tenant_id (uuid, FK → tenants.id) -- Partnerorganisationen
- partner_name (text)
- invitation_status (text: 'pending', 'accepted', 'rejected', 'revoked')
- invited_by (uuid, FK → employees.id)
- invited_at (timestamptz)
- accepted_at (timestamptz, nullable)
- access_level (text: 'read_only', 'time_entry', 'full') -- Vad partner kan göra
- created_at (timestamptz)
```

**`shared_projects`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK) -- Ägande organisation
- project_id (uuid, FK → projects.id)
- partner_organization_id (uuid, FK → partner_organizations.id)
- shared_at (timestamptz)
- permissions (jsonb) -- {view: true, create_time: true, view_invoices: false}
```

**`consolidated_invoices`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK) -- Huvudorganisationen
- main_invoice_id (uuid, FK → invoices.id)
- partner_invoice_ids (uuid[]) -- Array av partner-invoices
- consolidation_date (timestamptz)
- created_at (timestamptz)
```

### API Endpoints

**POST `/api/partners/invite`**
- Skapar partner_organization
- Skickar invitation

**POST `/api/partners/[id]/accept`**
- Accepterar invitation

**POST `/api/partners/[id]/share-project`**
- Delar projekt med partner
- Skapar shared_projects

**GET `/api/partners/[id]/projects`**
- Hämtar delade projekt (från partner-perspektiv)

**POST `/api/invoices/consolidate`**
- Konsoliderar flera invoices till en

### Background Jobs
- Email: Skicka invitation vid partner invite
- Notification: Notifiera partner när projekt delas

### MVP Logik
- RLS: Partner ser bara shared_projects där de är med
- Consolidation: Summera amounts från flera invoices
- Access control: Kontrollera permissions vid varje operation

---

## O) Rapporter

### Tabeller & Schema

**`report_templates`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name (text)
- report_type (text: 'period', 'project', 'customer', 'profitability')
- template_config (jsonb) -- Konfiguration för rapporten
- active (boolean, default true)
- created_at (timestamptz)
```

**`generated_reports`**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- template_id (uuid, FK → report_templates.id, nullable)
- report_type (text)
- period_start (date, nullable)
- period_end (date, nullable)
- project_id (uuid, FK → projects.id, nullable)
- format (text: 'pdf', 'csv', 'json')
- file_url (text) -- Supabase Storage URL
- generated_by (uuid, FK → employees.id)
- generated_at (timestamptz)
```

### API Endpoints

**POST `/api/reports/generate`**
- Genererar rapport
- Sparar som generated_report
- Returnerar download-URL

**GET `/api/reports/templates`**
- Listar tillgängliga templates

**GET `/api/reports/[id]/download`**
- Hämtar generated report

**GET `/api/reports/profitability/[projectId]`**
- Genererar projektlönsamhetsrapport
- Returnerar: intäkter - timmar - material - ÄTA

### Background Jobs
- Cron: Generera månadsrapporter automatiskt
- Queue: PDF-generation (puppeteer eller html2pdf)

### MVP Logik
- Periodrapport: Aggregera time_entries, invoices, material per period
- Projektlönsamhet: 
  - Intäkter: Sum invoices
  - Timmar: Sum time_entries * rate
  - Material: Sum material_entries
  - ÄTA: Sum rot_applications amounts
  - Resultat: Intäkter - (Timmar + Material + ÄTA)
- PDF: HTML template → PDF via puppeteer
- CSV: Direkt export från queries

---

## Security & RLS Policies

### Grundläggande RLS-mönster:

```sql
-- Exempel för invoices:
CREATE POLICY "invoices_tenant_isolation"
ON invoices FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- För employees:
CREATE POLICY "employees_tenant_isolation"
ON employees FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- För partners (delad data):
CREATE POLICY "shared_projects_partner_access"
ON shared_projects FOR SELECT
USING (
  tenant_id = current_setting('app.current_tenant_id')::uuid
  OR partner_tenant_id = current_setting('app.current_tenant_id')::uuid
);
```

### Signerings-resurser:

```sql
-- Kortlivade tokens för BankID-signering
CREATE TABLE signature_tokens (
  id uuid PRIMARY KEY,
  signature_id uuid REFERENCES signatures(id),
  token text UNIQUE,
  expires_at timestamptz,
  used boolean DEFAULT false
);

-- RLS för signature_tokens:
CREATE POLICY "signature_tokens_short_lived"
ON signature_tokens FOR SELECT
USING (expires_at > NOW() AND used = false);
```

---

## Kostnadsbedömning per funktion

| Funktion | Est. Komplexitet | Kostnad (Hosting/API) | Prioritet |
|----------|------------------|----------------------|-----------|
| A) BankID-signering | Hög | BankID API (~0 kr) | Hög |
| B) E-faktura | Medel | PEPPOL ($50/mån) | Hög |
| C) Löneunderlag | Låg | Gratis | Medel |
| D) ÄTA 2.0 | Medel | Gratis | Hög |
| E) Material | Medel | Gratis | Medel |
| F) OCR | Medel | Google Vision ($1.50/1000) | Låg |
| G) Geofencing | Medel | Gratis | Medel |
| H) Checklistor | Låg | Gratis | Medel |
| I) Foto-tagging | Medel | Hugging Face (gratis) | Låg |
| J) Kundportal | Låg | Gratis | Hög |
| K) Budget-larm | Låg | Gratis | Medel |
| L) Fortnox/Visma | Hög | API-avgift | Medel |
| M) Audit log | Medel | Gratis | Hög |
| N) Multi-företag | Hög | Gratis | Låg |
| O) Rapporter | Medel | Gratis | Medel |

---

## Rekommendationer för implementeringsordning

### Fase 1 (MVP Critical - 2-3 veckor):
1. **J) Kundportal** - Snabb win, ökar kundnöjdhet
2. **M) Audit log** - Viktigt för compliance
3. **D) ÄTA 2.0** - Förbättrar befintlig funktion
4. **K) Budget-larm** - Enkelt att implementera, hög värde

### Fase 2 (Differentiation - 4-6 veckor):
5. **A) BankID-signering** - Juridiskt värde
6. **B) E-faktura** - Förbättrar faktureringsflöde
7. **C) Löneunderlag** - Efterfrågat av kunder
8. **G) Geofencing** - Teknisk differentiering

### Fase 3 (Nice-to-have - 6+ veckor):
9. **E) Material** - Kompletterar projekt-hantering
10. **H) Checklistor** - Compliance-värde
11. **I) Foto-tagging** - UX-förbättring
12. **O) Rapporter** - Efterfrågat men inte kritiskt

### Fase 4 (Enterprise - senare):
13. **F) OCR** - Kostnadseffektivt när volym ökar
14. **L) Fortnox/Visma** - Beroende på kundefterfrågan
15. **N) Multi-företag** - Niche-behov

---

## Frågor för diskussion:

1. **Prioritering**: Vilka funktioner är mest värdefulla för era kunder just nu?
2. **BankID**: Har ni redan BankID-integration eller behöver ni skaffa?
3. **PEPPOL**: Är kunderna redan på PEPPOL eller är PDF-tillförsel okej initialt?
4. **Budget**: Vilken är er tidsram för att implementera dessa?
5. **Resurser**: Har ni tillgång till utvecklare eller ska jag implementera?
6. **Testning**: Behöver vi testa med riktiga kunder eller räcker det med staging?

---

Vill du att jag börjar implementera någon specifik funktion, eller vill du diskutera prioritering först?

