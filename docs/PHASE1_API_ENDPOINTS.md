# Phase 1 API Endpoints - Specifikation

## Översikt
Detta dokument beskriver alla API-endpoints för Phase 1-funktioner: ÄTA 2.0, Budget & Alerts, Customer Portal, och Audit Log.

---

## D) ÄTA 2.0 Endpoints

### POST `/api/ata/create`
Skapar ny ÄTA (rot_application) med förbättrad funktionalitet.

**Request:**
```json
{
  "project_id": "uuid",
  "description": "string",
  "cost_frame": 50000.00,  // optional
  "invoice_mode": "separate" | "add_to_main",  // default: "separate"
  "items": [  // optional
    {
      "description": "string",
      "quantity": 1.0,
      "unit_price": 1000.00
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "description": "string",
  "cost_frame": 50000.00,
  "invoice_mode": "separate",
  "status_timeline": [
    {
      "status": "created",
      "timestamp": "2025-11-03T10:00:00Z",
      "user_id": "uuid",
      "comment": null
    }
  ],
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid input (missing project_id, invalid invoice_mode)
- `403`: Not admin or insufficient permissions
- `404`: Project not found

---

### POST `/api/ata/[id]/approve`
Godkänner ÄTA och uppdaterar status_timeline.

**Request:**
```json
{
  "comment": "string (optional)"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "approved",
  "status_timeline": [
    // ... previous entries
    {
      "status": "approved",
      "timestamp": "2025-11-03T10:30:00Z",
      "user_id": "uuid",
      "comment": "Godkänt av admin"
    }
  ]
}
```

**Errors:**
- `403`: Not admin
- `404`: ÄTA not found
- `409`: ÄTA already approved/rejected

---

### POST `/api/ata/[id]/link-invoice`
Kopplar ÄTA till faktura (om invoice_mode = "add_to_main").

**Request:**
```json
{
  "invoice_id": "uuid",
  "invoice_mode": "add_to_main"  // ändra mode om behövs
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "parent_invoice_id": "uuid",
  "invoice_mode": "add_to_main",
  "message": "ÄTA linked to invoice successfully"
}
```

**Errors:**
- `400`: Invalid invoice_mode or invoice not found
- `403`: Not admin
- `404`: ÄTA not found
- `409`: ÄTA already linked to another invoice

---

### POST `/api/ata/[id]/photos`
Lägger till bilder till ÄTA.

**Request:** (multipart/form-data)
```
photos: File[] (array of image files)
```

**Response (200):**
```json
{
  "id": "uuid",
  "photos": [
    "https://storage.supabase.co/.../photo1.jpg",
    "https://storage.supabase.co/.../photo2.jpg"
  ]
}
```

**Errors:**
- `400`: Invalid file type or size
- `403`: Not admin
- `404`: ÄTA not found

---

### GET `/api/ata/[id]/timeline`
Hämtar status_timeline för ÄTA.

**Response (200):**
```json
{
  "id": "uuid",
  "status_timeline": [
    {
      "status": "created",
      "timestamp": "2025-11-03T10:00:00Z",
      "user_id": "uuid",
      "comment": null
    },
    {
      "status": "approved",
      "timestamp": "2025-11-03T10:30:00Z",
      "user_id": "uuid",
      "comment": "Godkänt"
    }
  ]
}
```

---

## K) Budget & Alerts Endpoints

### POST `/api/projects/[id]/budget`
Sätter budget för projekt.

**Request:**
```json
{
  "budget_hours": 100.0,
  "budget_material": 50000.00,
  "alert_thresholds": [  // optional, default: [70, 90]
    {
      "percentage": 70,
      "notify": true
    },
    {
      "percentage": 90,
      "notify": true
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "budget_hours": 100.0,
  "budget_material": 50000.00,
  "budget_total": 86000.00,  // calculated: hours * rate + material
  "alert_thresholds": [
    {"percentage": 70, "notify": true},
    {"percentage": 90, "notify": true}
  ],
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid input (negative values, etc.)
- `403`: Not admin
- `404`: Project not found

---

### GET `/api/projects/[id]/budget-usage`
Hämtar budget usage för projekt.

**Response (200):**
```json
{
  "budget_hours": 100.0,
  "budget_material": 50000.00,
  "budget_total": 86000.00,
  "used_hours": 75.5,
  "used_material": 35000.00,
  "used_total": 62180.00,
  "hours_percentage": 75.5,
  "material_percentage": 70.0,
  "total_percentage": 72.3
}
```

**Errors:**
- `404`: Project or budget not found

---

### GET `/api/projects/[id]/budget-alerts`
Hämtar aktiva budget-alerts för projekt.

**Response (200):**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "alert_type": "hours",
      "threshold_percentage": 70.0,
      "current_percentage": 75.5,
      "status": "active",
      "created_at": "2025-11-03T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/budget-alerts/[id]/acknowledge`
Markerar alert som acknowledged.

**Request:**
```json
{
  "comment": "string (optional)"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "acknowledged",
  "acknowledged_at": "2025-11-03T10:30:00Z"
}
```

**Errors:**
- `404`: Alert not found
- `409`: Alert already acknowledged/resolved

---

### POST `/api/budget-alerts/[id]/resolve`
Markerar alert som resolved.

**Request:**
```json
{
  "comment": "string (optional)"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "resolved",
  "resolved_at": "2025-11-03T10:30:00Z"
}
```

---

## J) Customer Portal Endpoints

### POST `/api/public-links/create`
Skapar publik länk för delning av offert/ÄTA/faktura.

**Request:**
```json
{
  "resource_type": "invoice" | "ata" | "quote" | "project" | "rot_application",
  "resource_id": "uuid",
  "password": "string (optional)",
  "expires_at": "2025-12-31T23:59:59Z (optional)",
  "max_views": 10  // optional, null = unlimited
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "access_token": "abc123...",
  "public_url": "https://app.frostsolutions.se/public/abc123...",
  "expires_at": "2025-12-31T23:59:59Z",
  "max_views": 10,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid resource_type or resource_id
- `403`: Not admin or insufficient permissions
- `404`: Resource not found

---

### GET `/api/public/[token]`
Hämtar resurs via publik token (ingen auth krävs).

**Query params:**
- `password`: string (optional, om länken är lösenordsskyddad)

**Response (200):**
```json
{
  "resource_type": "invoice",
  "resource": {
    // Invoice/ÄTA/Quote data
    "id": "uuid",
    "amount": 50000.00,
    // ... other fields
  },
  "link_info": {
    "expires_at": "2025-12-31T23:59:59Z",
    "view_count": 3,
    "max_views": 10
  }
}
```

**Errors:**
- `400`: Invalid or expired token
- `401`: Password required or incorrect
- `403`: Max views exceeded
- `404`: Link or resource not found

---

### POST `/api/public/[token]/sign`
Signerar resurs via publik länk.

**Request:**
```json
{
  "signer_name": "string",
  "signer_email": "string",
  "signature_method": "email" | "bankid"  // bankid stub för nu
}
```

**Response (200):**
```json
{
  "signature_id": "uuid",
  "status": "signed",
  "signed_at": "2025-11-03T10:30:00Z"
}
```

**Errors:**
- `400`: Invalid token or already signed
- `401`: Password required
- `404`: Link not found

---

### POST `/api/public-links/[id]/revoke`
Återkallar publik länk.

**Response (200):**
```json
{
  "id": "uuid",
  "active": false,
  "revoked_at": "2025-11-03T10:30:00Z"
}
```

**Errors:**
- `403`: Not admin
- `404`: Link not found

---

## M) Audit Log Endpoints

### GET `/api/audit-logs/search`
Söker i audit logs.

**Query params:**
- `table_name`: string (optional)
- `record_id`: uuid (optional)
- `action`: string (optional, create/update/delete/view)
- `employee_id`: uuid (optional)
- `start_date`: ISO date (optional)
- `end_date`: ISO date (optional)
- `limit`: number (default: 50, max: 200)
- `offset`: number (default: 0)

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "table_name": "invoices",
      "record_id": "uuid",
      "action": "update",
      "employee_id": "uuid",
      "changed_fields": ["amount", "status"],
      "old_values": {"amount": 50000},
      "new_values": {"amount": 55000, "status": "paid"},
      "created_at": "2025-11-03T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Errors:**
- `400`: Invalid query parameters
- `403`: Not admin (för vissa queries)

---

### GET `/api/audit-logs/[table]/[recordId]`
Hämtar audit log för specifik record.

**Response (200):**
```json
{
  "table_name": "invoices",
  "record_id": "uuid",
  "logs": [
    // Array av audit_logs för denna record
  ]
}
```

---

### POST `/api/release-labels/create`
Skapar release label (snapshot av regler).

**Request:**
```json
{
  "label_name": "OB-rules-2024",
  "description": "OB-regler från 2024",
  "rules_snapshot": {
    "ob_night": {"rate": 1.5, "start_time": "22:00", "end_time": "06:00"},
    "ob_evening": {"rate": 1.25, "start_time": "18:00", "end_time": "22:00"},
    "ob_weekend": {"rate": 1.5}
  },
  "effective_from": "2024-01-01"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "label_name": "OB-rules-2024",
  "rules_snapshot": {...},
  "effective_from": "2024-01-01",
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid input
- `403`: Not admin
- `409`: Label name already exists for tenant

---

## Felhantering

Alla endpoints returnerar standardiserade felmeddelanden:

```json
{
  "error": "Error code",
  "message": "Human-readable error message",
  "details": {}  // optional, extra context
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (resource already exists/changed)
- `500`: Internal Server Error

---

## Autentisering

Alla endpoints (utom `/api/public/[token]`) kräver:
- Valid JWT token i `Authorization: Bearer <token>` header
- User måste vara kopplad till en tenant via employees-tabellen

Service role används för:
- Background jobs
- System-generated audit logs
- Budget alert generation

