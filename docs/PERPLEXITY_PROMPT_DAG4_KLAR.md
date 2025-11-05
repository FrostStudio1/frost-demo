# 🔍 Perplexity Pro Prompt - Dag 4 (KLAR ATT KOPIERA)

## 📋 Kopiera hela denna prompt till Perplexity Pro:

```
Du är research-assistent för Frost Solutions, ett byggföretags mjukvaruprojekt.

LÄGET JUST NU (Slutet av Dag 3):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT
- ✅ Offline-stöd & Sync är FULLT IMPLEMENTERAT
- ✅ Next.js 16 App Router med Supabase backend
- ✅ TypeScript och Tailwind CSS

DAG 4 MÅL: Visma/Fortnox Integration Research
- Research Fortnox API dokumentation
- Research Visma API dokumentation
- Research OAuth 2.0 flows för båda
- Research best practices för integrationer
- Research webhook implementation
- Research rate limiting och security
- Research export/import för specifika data-typer

DATA-TYPER SOM SKA EXPORTERAS/IMPORTERAS:
1. **Lönespec (Payroll/Payslip)** - Export från Frost → Fortnox/Visma
2. **Offert (Quotes/Estimates)** - Export från Frost → Fortnox/Visma
3. **Faktura (Invoices)** - Bidirectional sync (Frost ↔ Fortnox/Visma)
4. **Tidsrapport (Time Entries)** - Export från Frost → Fortnox/Visma (för löneunderlag)
5. **Kunder (Customers/Clients)** - Bidirectional sync (Frost ↔ Fortnox/Visma)
6. **Anställda (Employees)** - Export från Frost → Fortnox/Visma (för lönehantering)
7. **Projekt (Projects)** - Export från Frost → Fortnox/Visma (valfritt, för referens)

RESEARCH-UPPGIFTER FÖR DAG 4:

1. FORTNOX API:
   - Fullständig API dokumentation
   - OAuth 2.0 authentication flow
   - API endpoints för kunder (customers)
   - API endpoints för fakturor (invoices)
   - API endpoints för offerter/quotes (om de stödjer detta)
   - API endpoints för löneunderlag/payroll (om de stödjer detta)
   - API endpoints för tidsrapporter/time entries (om de stödjer detta)
   - API endpoints för anställda/employees (om de stödjer detta)
   - Rate limiting och quotas
   - Webhook support
   - Error handling patterns
   - Best practices och recommendations
   - Exempel på integrationer
   - SDK eller libraries (om några finns)

2. VISMA API:
   - Fullständig API dokumentation
   - OAuth 2.0 authentication flow
   - API endpoints för kunder (customers)
   - API endpoints för fakturor (invoices)
   - API endpoints för offerter/quotes (om de stödjer detta)
   - API endpoints för löneunderlag/payroll (om de stödjer detta)
   - API endpoints för tidsrapporter/time entries (om de stödjer detta)
   - API endpoints för anställda/employees (om de stödjer detta)
   - Rate limiting och quotas
   - Webhook support
   - Error handling patterns
   - Best practices och recommendations
   - Exempel på integrationer
   - SDK eller libraries (om några finns)

3. OAUTH 2.0 FLOWS:
   - Authorization Code flow för Fortnox
   - Authorization Code flow för Visma
   - Token refresh mechanisms
   - Token storage best practices
   - Security considerations
   - Error scenarios och hantering

4. SYNC STRATEGIES FÖR SPECIFIKA DATA-TYPER:
   - **Lönespec:** Export format (PDF, CSV, XML?), struktur, fältmappning
   - **Offert:** Export format, struktur, konvertering till faktura efter godkännande
   - **Faktura:** Bidirectional sync, struktur, fältmappning, status-hantering
   - **Tidsrapport:** Export format, struktur, aggregering per period, OB-typer
   - **Kunder:** Bidirectional sync, struktur, fältmappning, duplikat-hantering
   - **Anställda:** Export format, struktur, fältmappning (personnummer, lön, etc.)
   - **Projekt:** Export format, struktur, referens-länkning
   - Bidirectional sync patterns
   - Conflict resolution strategies
   - Batch operations
   - Incremental sync (delta updates)

5. WEBHOOK IMPLEMENTATION:
   - Webhook setup för Fortnox
   - Webhook setup för Visma
   - Signature verification
   - Security best practices
   - Error handling
   - Retry logic

6. BEST PRACTICES:
   - Rate limiting strategies
   - Error handling patterns
   - Retry logic med exponential backoff
   - Logging och monitoring
   - Testing strategies
   - Security considerations

UTLÄMNING:
Ge en komplett research-rapport med:
- API endpoints och exempel för ALLA data-typer
- OAuth flow steg-för-steg för båda systemen
- Code examples (TypeScript/JavaScript om möjligt)
- Best practices för varje data-typ
- Common pitfalls och lösningar
- Security recommendations
- Fältmappning mellan Frost och Fortnox/Visma för varje data-typ

VIKTIGT: 
- Researcha grundligt och systematisk
- Hitta officiell dokumentation för båda systemen
- Hitta exempel och tutorials
- Notera alla viktiga detaljer och begränsningar
- Fokusera på de 7 data-typerna vi ska synka
- Ge konkreta exempel och code snippets när möjligt

Börja med Fortnox API dokumentation, sedan Visma. Rapportera resultaten så snart som möjligt!
```

---

**Status:** ✅ KLAR ATT KOPIERA OCH ANVÄNDA NU!

