# 🔧 Uppdatera Fortnox Credentials

## Snabbguide

1. **Öppna `.env.local` filen** i projektets root-mapp

2. **Hitta dessa rader:**
```env
FORTNOX_CLIENT_ID=ditt_fortnox_client_id_här
FORTNOX_CLIENT_SECRET=ditt_fortnox_client_secret_här
```

3. **Ersätt med dina riktiga värden:**
```env
FORTNOX_CLIENT_ID=UFg21BcGXfMs
FORTNOX_CLIENT_SECRET=ditt_fortnox_client_secret_här
```

4. **Lägg till ditt Fortnox Client Secret** (hämta från https://apps.fortnox.se/oauth-v1)

5. **Starta om dev-servern:**
   - Stoppa servern (Ctrl+C)
   - Starta igen: `npm run dev`

## Dina nuvarande värden

- **Fortnox Client ID:** `UFg21BcGXfMs` ✅
- **Fortnox Client Secret:** ❓ (behöver du lägga till)

## Vart hittar jag Client Secret?

1. Gå till: https://apps.fortnox.se/oauth-v1
2. Logga in med ditt Fortnox-konto
3. Hitta din OAuth Application
4. Kopiera **Client Secret**

## Testa efter uppdatering

1. Gå till `/settings/integrations`
2. Klicka på "Anslut till Fortnox"
3. Du bör nu komma till Fortnox's auktoriseringssida istället för ett felmeddelande

