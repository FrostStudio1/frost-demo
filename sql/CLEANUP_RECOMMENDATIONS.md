# SQL Files Cleanup Recommendations

## 📋 Kategorisering av SQL-filer

### ✅ BEHÅLL (Viktiga - kör vid behov)
- **SUPABASE_CREATE_WORK_SITES.sql** - Skapar work_sites tabell (körs vid setup)
- **SUPABASE_ADD_CLIENT_ARCHIVE.sql** - Lägger till archive-funktionalitet
- **SUPABASE_CLEANUP_INVALID_TIME_ENTRIES.sql** - Rensar ogiltiga time entries (körs vid behov)
- **SUPABASE_STORAGE_ATTACHMENTS_SETUP.sql** - Setup för file attachments

### 🔧 BEHÅLL (Fixes - kan behövas vid problem)
- **SUPABASE_FIX_TENANT_FK_FINAL.sql** - ✅ KORREKT - Använd denna för tenant FK-fix
- **SUPABASE_FIX_EMPLOYEE_TENANT_AUTO.sql** - ✅ KORREKT - Auto-fixar employee tenant IDs
- **SUPABASE_FIX_ORPHANED_PROJECTS_AUTO_COMPLETE.sql** - ✅ KORREKT - Fixar orphaned projects

### 🗑️ KAN TAS BORT (Dubbletter/Äldre versioner)
- ~~SUPABASE_FIX_TENANT_FK_IMMEDIATE.sql~~ - Äldre version, använd FINAL istället
- ~~SUPABASE_FIX_TENANT_FK_COMPLETE.sql~~ - Äldre version, använd FINAL istället
- ~~SUPABASE_FIX_TIME_ENTRIES_FK.sql~~ - Inkluderad i FINAL
- ~~SUPABASE_FIX_ORPHANED_PROJECTS.sql~~ - Äldre version
- ~~SUPABASE_FIX_ORPHANED_PROJECTS_AUTO.sql~~ - Äldre version, använd AUTO_COMPLETE istället
- ~~SUPABASE_FIX_ORPHANED_PROJECTS_COMPLETE.sql~~ - Äldre version, använd AUTO_COMPLETE istället
- ~~SUPABASE_FIX_EMPLOYEE_TENANT.sql~~ - Äldre version, använd AUTO istället
- ~~SUPABASE_FIX_EMPLOYEE_FOR_TENANT.sql~~ - Äldre version, använd AUTO istället

### 🔍 BEHÅLL (Diagnostik - användbara för debugging)
- **SUPABASE_DIAGNOSE_TENANT_ISOLATION.sql** - Diagnostiserar tenant-problem
- **SUPABASE_DIAGNOSE_PROJECT_TENANTS.sql** - Diagnostiserar projekt-tenant-problem
- **SUPABASE_DIAGNOSE_FIX_FK.sql** - Diagnostiserar FK-problem
- **SUPABASE_DIAGNOSE_FIX_EMPLOYEES_FK.sql** - Diagnostiserar employee FK-problem
- **SUPABASE_CHECK_EMPLOYEE_USAGE.sql** - Kollar employee-användning
- **SUPABASE_QUICK_TENANT_CHECK.sql** - Snabb tenant-check
- **SUPABASE_VERIFY_TENANT.sql** - Verifierar tenant

### 🧹 BEHÅLL (Cleanup - körs vid behov)
- **SUPABASE_CLEANUP_DUPLICATES.sql** - Rensar dubbletter
- **SUPABASE_MERGE_OR_DELETE_DUPLICATES.sql** - Mergar eller tar bort dubbletter
- **SUPABASE_FIX_DUPLICATE_EMPLOYEES.sql** - Fixar duplicate employees
- **REMOVE_DEMO_EMPLOYEE.sql** - Tar bort demo employee
- **SUPABASE_DELETE_BAD_EMPLOYEE.sql** - Tar bort ogiltiga employees

### ❓ UNKNOWN (Kolla vad de gör)
- **SUPABASE_ROT_SCHEMA.sql** - ROT-relaterat schema?
- **SUPABASE_ROT_ENCRYPTION.sql** - ROT encryption?
- **SUPABASE_FIX_AETA_RELATIONS.sql** - ÄTA-relationer?
- **SUPABASE_FIX_INVOICES_CUSTOMER_NAME.sql** - Invoice-fix?
- **SUPABASE_SCHEMA_FIX.sql** - Generell schema-fix?
- **SUPABASE_STORAGE_SETUP.sql** - Storage setup?
- **SUPABASE_ADD_BASE_RATE.sql** - Base rate kolumn?
- **SUPABASE_FIX_PROJECTS_FKEY.sql** - Projects FK?
- **SUPABASE_FIX_MISSING_USER.sql** - Missing user fix?

## 🎯 Rekommendation

### Minimal setup (behåll bara dessa):
1. Schema creation: `SUPABASE_CREATE_WORK_SITES.sql`
2. Feature additions: `SUPABASE_ADD_CLIENT_ARCHIVE.sql`, `SUPABASE_STORAGE_ATTACHMENTS_SETUP.sql`
3. Final fixes: `SUPABASE_FIX_TENANT_FK_FINAL.sql`, `SUPABASE_FIX_EMPLOYEE_TENANT_AUTO.sql`, `SUPABASE_FIX_ORPHANED_PROJECTS_AUTO_COMPLETE.sql`
4. Diagnostics: Alla `SUPABASE_DIAGNOSE_*.sql` och `SUPABASE_CHECK_*.sql`, `SUPABASE_VERIFY_*.sql`
5. Cleanup: `SUPABASE_CLEANUP_INVALID_TIME_ENTRIES.sql`, `SUPABASE_CLEANUP_DUPLICATES.sql`

### Kan tas bort (~8-10 filer):
- Alla äldre versioner av fixes (IMMEDIATE, COMPLETE osv. när FINAL finns)
- Dubbletter av samma fix

## 💡 Förslag

**Alternativ 1: Minimal cleanup**
- Ta bort alla äldre versioner (IMMEDIATE, COMPLETE när FINAL finns)
- Behåll alla diagnostik-scripts (kan vara användbara)

**Alternativ 2: Arkivera**
- Skapa en `sql/archive/` mapp
- Flytta äldre versioner dit
- Behåll endast de senaste/bästa versionerna i root

**Alternativ 3: Behåll allt**
- Om du är osäker, behåll allt
- SQL-filer tar inte mycket plats
- Bättre att ha för mycket än för lite

## 🎯 Mitt rekommendation: Alternativ 2 (Arkivera)

Skapa `sql/archive/` och flytta:
- Alla äldre versioner av fixes
- Filerna som är säkra att ta bort listade ovan

Detta ger dig:
- ✅ Ren struktur
- ✅ Tillgång till gamla fixes om de behövs
- ✅ Lättare att hitta rätt fil
- ✅ Ingen risk att ta bort något viktigt

