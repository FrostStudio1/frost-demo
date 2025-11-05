# 🔐 Environment Variables Setup Guide

## Steg 1: Generera Encryption Key

Kör detta kommando i terminalen:

```bash
cd frost-demo
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Exempel output:**
```
93bOLcH2NdkyxTRY0foq8VahwWfcl2V5/hqzdLs9rL8=
```

**Kopiera denna sträng** - du behöver den i steg 3!

---

## Steg 2: Hämta Fortnox Credentials

1. Gå till: https://apps.fortnox.se/oauth-v1
2. Logga in med ditt Fortnox-konto
3. Skapa en ny OAuth Application:
   - **Application Name:** Frost Solutions
   - **Redirect URI:** `http://localhost:3000/api/integrations/fortnox/callback` (för dev)
   - **Scopes:** Välj alla som behövs (invoice, customer, salary, timereporting, offer)
4. Kopiera **Client ID** och **Client Secret**

---

## Steg 3: Hämta Visma Credentials

1. Gå till: https://developer.visma.com/
2. Logga in med ditt Visma-konto
3. Skapa en ny OAuth Application:
   - **Application Name:** Frost Solutions
   - **Redirect URI:** `http://localhost:3000/api/integrations/visma/callback` (för dev)
   - **Scopes:** Välj eAccounting och Payroll scopes
4. Kopiera **Client ID** och **Client Secret**

---

## Steg 4: Lägg till i .env.local

1. Öppna `frost-demo/.env.local` i din editor
2. Om filen inte finns, skapa den
3. Lägg till följande rader:

```env
# ============================================
# FORTNOX & VISMA INTEGRATION
# ============================================

# FORTNOX API Credentials
FORTNOX_CLIENT_ID=ditt_fortnox_client_id_här
FORTNOX_CLIENT_SECRET=ditt_fortnox_client_secret_här
FORTNOX_REDIRECT_URI=http://localhost:3000/api/integrations/fortnox/callback
FORTNOX_BASE_URL=https://api.fortnox.se/3

# VISMA API Credentials
VISMA_CLIENT_ID=ditt_visma_client_id_här
VISMA_CLIENT_SECRET=ditt_visma_client_secret_här
VISMA_REDIRECT_URI=http://localhost:3000/api/integrations/visma/callback
VISMA_EACCOUNTING_BASE_URL=https://eaccountingapi.vismaonline.com/v2
VISMA_PAYROLL_BASE_URL=https://payroll.visma.net/api/v1

# Encryption Key (genererad i steg 1)
ENCRYPTION_KEY_256_BASE64=93bOLcH2NdkyxTRY0foq8VahwWfcl2V5/hqzdLs9rL8=

# Webhook Tolerance (optional)
WEBHOOK_TOLERANCE_SECONDS=300
```

**VIKTIGT:** 
- Ersätt `ditt_fortnox_client_id_här` med ditt riktiga Fortnox Client ID
- Ersätt `ditt_fortnox_client_secret_här` med ditt riktiga Fortnox Client Secret
- Ersätt `ditt_visma_client_id_här` med ditt riktiga Visma Client ID
- Ersätt `ditt_visma_client_secret_här` med ditt riktiga Visma Client Secret
- Ersätt encryption key med den du genererade i steg 1

---

## Steg 5: För Production (Vercel/Deploy)

När du deployar till produktion:

1. Uppdatera `FORTNOX_REDIRECT_URI` till:
   ```
   https://din-domain.com/api/integrations/fortnox/callback
   ```

2. Uppdatera `VISMA_REDIRECT_URI` till:
   ```
   https://din-domain.com/api/integrations/visma/callback
   ```

3. Lägg till alla env-variabler i Vercel Dashboard:
   - Gå till: Project Settings → Environment Variables
   - Lägg till varje variabel från `.env.local`

4. **Uppdatera OAuth Applications:**
   - Fortnox: Lägg till production redirect URI i Fortnox portal
   - Visma: Lägg till production redirect URI i Visma portal

---

## Steg 6: Verifiera Setup

1. Starta om dev-servern:
   ```bash
   npm run dev
   ```

2. Kontrollera att inga fel visas i konsolen
3. Försök ansluta till Fortnox via UI (när det är implementerat)

---

## Troubleshooting

### "ENCRYPTION_KEY_256_BASE64 måste vara 32 bytes Base64"
- Kontrollera att encryption key är exakt 44 tecken (32 bytes Base64)
- Generera en ny key om den är fel

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Detta är en annan env-variabel som behövs för Supabase
- Lägg till den i `.env.local` om den saknas

### "Invalid redirect_uri"
- Kontrollera att redirect URI i `.env.local` matchar exakt med den i OAuth Application
- För localhost: `http://localhost:3000/api/integrations/fortnox/callback`
- För production: `https://din-domain.com/api/integrations/fortnox/callback`

---

## ✅ Checklista

- [ ] Encryption key genererad och lagt till
- [ ] Fortnox Client ID och Secret lagt till
- [ ] Visma Client ID och Secret lagt till
- [ ] Redirect URIs korrekt konfigurerade
- [ ] Dev-servern startar utan fel
- [ ] Production redirect URIs uppdaterade (när det är dags)

