# 🔄 Cache Fix - Module Resolution Error

## Problem

Turbopack cache kan visa felaktiga import paths även efter att filerna är fixade.

## Lösning

### Steg 1: Stoppa Dev Server
Stoppa den körande dev-servern (Ctrl+C i terminalen).

### Steg 2: Rensa Cache
```bash
# Windows PowerShell
cd frost-demo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Eller i CMD
cd frost-demo
rmdir /s /q .next
rmdir /s /q .turbo
rmdir /s /q node_modules\.cache
```

### Steg 3: Starta Om Dev Server
```bash
npm run dev
```

## Verifiering

Kontrollera att filen är korrekt:
```bash
# Windows PowerShell
Get-Content app\api\integrations\route.ts | Select-String "utils/supabase/admin"
```

Förväntat resultat:
```
import { createAdminClient } from '@/utils/supabase/admin';
```

**INTE:**
```
import { createAdminClient } from '@/app/utils/supabase/admin';
```

## Om Problemet Kvarstår

1. Kontrollera alla filer med:
```bash
# Sök efter felaktiga imports
grep -r "@/app/utils/supabase/admin" app/
```

2. Om några hittas, fixa dem till:
```typescript
import { createAdminClient } from '@/utils/supabase/admin';
```

3. Starta om dev-servern igen

