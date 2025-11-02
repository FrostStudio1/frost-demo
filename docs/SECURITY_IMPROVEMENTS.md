# 🔒 Säkerhetsförbättringar - Frost Bygg

## ✅ Redan implementerat

- ✅ Row Level Security (RLS) på alla tabeller
- ✅ Multi-tenant isolation med JWT claims
- ✅ Service role API routes för admin-funktioner
- ✅ Tenant validation på alla kritiska operations
- ✅ Input sanitization (delvis)

## 🎯 Rekommenderade förbättringar

### 1. **Rate Limiting** ⚠️ HÖG PRIORITET
**Problem:** Inga begränsningar på API-anrop, risk för DDoS eller brute force

**Lösning:**
```typescript
// app/api/middleware/rateLimit.ts
import { NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) }
  }
  
  record.count++
  return { allowed: true }
}
```

**Implementera i:**
- `/api/auth/*` routes (login attempts)
- `/api/employees/create` (spam prevention)
- `/api/feedback` (feedback spam)

---

### 2. **Input Validation med Zod** ⚠️ HÖG PRIORITET
**Problem:** Ingen strukturvalidering av inputs, risk för SQL injection (även om Supabase skyddar)

**Lösning:**
```typescript
// lib/validation.ts
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Namn krävs').max(200, 'Namn för långt'),
  email: z.string().email('Ogiltig email').optional(),
  org_number: z.string().regex(/^\d{6}-\d{4}$/, 'Ogiltigt org.nummer').optional(),
  address: z.string().max(500).optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Projektnamn krävs').max(200),
  client_id: z.string().uuid('Ogiltigt client ID'),
  budgeted_hours: z.number().min(0).optional(),
  base_rate_sek: z.number().min(0).optional(),
})
```

**Använd i:**
- Alla POST/PUT API routes
- Form submissions

---

### 3. **XSS Protection** ⚠️ MEDEL PRIORITET
**Problem:** User input kan innehålla skadlig kod

**Lösning:**
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
```

**Använd för:**
- Kommentarer/noter
- Projektnamn
- Kundnamn
- All user-generated content

---

### 4. **CSRF Protection** ⚠️ MEDEL PRIORITET
**Problem:** Risk för Cross-Site Request Forgery

**Lösning:**
```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken
}
```

**Implementera:**
- Lägg till CSRF token i formulär
- Validera i API routes

---

### 5. **Password Policy** ⚠️ MEDEL PRIORITET
**Problem:** Inga krav på lösenordsstyrka (om du har custom auth)

**Lösning:**
```typescript
// lib/passwordPolicy.ts
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) errors.push('Lösenordet måste vara minst 8 tecken')
  if (!/[A-Z]/.test(password)) errors.push('Lösenordet måste innehålla minst en stor bokstav')
  if (!/[a-z]/.test(password)) errors.push('Lösenordet måste innehålla minst en liten bokstav')
  if (!/[0-9]/.test(password)) errors.push('Lösenordet måste innehålla minst en siffra')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Lösenordet måste innehålla minst ett specialtecken')
  
  return { valid: errors.length === 0, errors }
}
```

---

### 6. **Session Management** ⚠️ MEDEL PRIORITET
**Problem:** Inga timeouts eller refresh policies

**Lösning:**
- Använd Supabase session refresh
- Implementera automatic logout vid inaktivitet
- Max session duration

---

### 7. **API Key Management** ⚠️ LÅG PRIORITET
**Problem:** Service role keys i environment variables (redan bra, men kan förbättras)

**Förbättringar:**
- Rotera keys regelbundet
- Använd secrets management (Vercel Secrets, AWS Secrets Manager)
- Audit logging för service role usage

---

### 8. **Audit Logging** ⚠️ MEDEL PRIORITET
**Problem:** Ingen loggning av kritiska actions

**Lösning:**
```sql
-- Skapa audit_log tabell
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID,
  action TEXT NOT NULL, -- 'create_project', 'delete_client', etc.
  resource_type TEXT, -- 'project', 'client', 'employee'
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Logga:**
- Alla delete operations
- Admin actions
- Tenant creation
- Role changes

---

### 9. **File Upload Security** ⚠️ MEDEL PRIORITET
**Om du lägger till filuppladdning:**

```typescript
// lib/fileValidation.ts
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Filen är för stor (max 10MB)' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Ogiltig filtyp' }
  }
  
  return { valid: true }
}
```

---

### 10. **Environment Variable Validation** ⚠️ MEDEL PRIORITET
**Problem:** Appen kan starta med saknade env vars

**Lösning:**
```typescript
// lib/env.ts
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
}
```

---

## 🚨 Kritiska säkerhetsproblem att fixa FÖRST

### 1. Rate Limiting (30 min)
- Lägg till på login routes
- Lägg till på feedback route

### 2. Input Validation (2-3 timmar)
- Installera Zod: `npm install zod`
- Skapa schemas för alla inputs
- Validera i API routes

### 3. XSS Protection (1 timme)
- Installera DOMPurify: `npm install isomorphic-dompurify`
- Sanitize all user input

---

## 📋 Prioritering

### Sprint 1 (Nu - innan deployment)
1. ✅ Rate limiting på auth routes
2. ✅ Input validation med Zod
3. ✅ XSS protection för user input

### Sprint 2 (Efter deployment)
1. CSRF protection
2. Audit logging
3. Session management förbättringar

### Sprint 3 (Framtida)
1. File upload security (om filuppladdning läggs till)
2. Advanced password policy
3. Security headers (CSP, HSTS)

---

## ✅ Checklista för production

- [ ] Rate limiting implementerat
- [ ] Input validation på alla API routes
- [ ] XSS protection för user input
- [ ] CSRF tokens i formulär
- [ ] Audit logging för kritiska actions
- [ ] Environment variables validerade
- [ ] Security headers konfigurerade
- [ ] Error messages exponerar inte känslig info
- [ ] Service role keys är säkra (inte i git)
- [ ] RLS policies testade och verifierade

---

**Rekommendation:** Implementera minst rate limiting och input validation innan deployment! 🚨

