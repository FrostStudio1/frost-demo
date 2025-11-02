# 🐛 Bugfix Checklist - ROT & Övriga Features

## ✅ SQL Fixar
- ✅ Triggers: Lagt till `DROP TRIGGER IF EXISTS` för att undvika "already exists" errors
- ✅ Policies: Lagt till `DROP POLICY IF EXISTS` för att undvika "already exists" errors
- ✅ Index: Alla använder `IF NOT EXISTS` (säkert)

## 🧪 Testa dessa funktioner

### ROT-avdrag
1. ✅ Skapa ny ROT-ansökan (`/rot/new`)
   - [ ] Välj projekt/kund
   - [ ] Fyll i personnummer (validering)
   - [ ] Fyll i fastighetsbeteckning
   - [ ] Välj arbetstyp
   - [ ] Ange kostnader
   - [ ] Skapa ansökan

2. ✅ Skicka till Skatteverket (`/rot/[id]`)
   - [ ] Klicka "Skicka till Skatteverket"
   - [ ] Kontrollera att BankID-modal öppnas
   - [ ] Kontrollera att länken fungerar (inte 404)
   - [ ] Kontrollera att status ändras till "submitted"
   - [ ] Kontrollera att ärendenummer genereras

3. ✅ Statusuppdatering
   - [ ] Klicka "Uppdatera status"
   - [ ] Kontrollera att status uppdateras
   - [ ] Kontrollera att status history visas

4. ✅ Skapa faktura med ROT-avdrag
   - [ ] Vid godkänd ansökan, klicka "Skicka faktura med ROT-avdrag"
   - [ ] Kontrollera att fakturabelopp är korrekt (totalkostnad - ROT-avdrag)
   - [ ] Kontrollera att fakturan skapas
   - [ ] Kontrollera att ROT-ansökan länkar till fakturan

5. ✅ Överklagande
   - [ ] Vid avslag, klicka "Överklaga"
   - [ ] Fyll i orsak
   - [ ] Skicka överklagande
   - [ ] Kontrollera att status ändras till "appealed"

6. ✅ GDPR-funktioner
   - [ ] Exportera ROT-data (vid status 'closed')
   - [ ] Kontrollera att JSON-fil laddas ner
   - [ ] Kontrollera att all data finns i exporten

### Anställda & Lönespec
1. ✅ Lägg till anställd (`/employees/new`)
   - [ ] Fyll i namn
   - [ ] Fyll i grundlön (t.ex. 360 kr/tim)
   - [ ] Skapa anställd
   - [ ] Kontrollera att anställd syns i listan

2. ✅ Skapa tidsrapport (`/reports/new`)
   - [ ] Välj arbetstyp (vanlig, OB Kväll, OB Natt, OB Helg)
   - [ ] Rapportera timmar
   - [ ] Kontrollera att amount_total beräknas korrekt:
     - Vanlig tid: grundlön × timmar
     - OB Kväll/Natt: grundlön × timmar × 1.5
     - OB Helg: grundlön × timmar × 2.0

3. ✅ Visa lönespec (`/payroll/employeeID/[id]`)
   - [ ] Välj månad
   - [ ] Kontrollera att timmar visas korrekt
   - [ ] Kontrollera att beräkningar stämmer:
     - Vanliga timmar: rätt belopp
     - OB-timmar: rätt tillägg (150% eller 200%)
     - Bruttolön: korrekt summa
     - Skatt (30%): korrekt
     - Netto: korrekt

### Övriga funktioner
1. ✅ Projektsida
   - [ ] Skapa projekt med kund-val
   - [ ] Kontrollera att projekt kopplas till kund
   - [ ] Kontrollera att inga errors om org_number

2. ✅ Fakturor
   - [ ] Skapa faktura från projekt
   - [ ] Skapa faktura från ROT-ansökan
   - [ ] Kontrollera att fakturor sparas korrekt

3. ✅ Navigation
   - [ ] Alla länkar i Sidebar fungerar
   - [ ] ROT-avdrag finns i menyn
   - [ ] Dark mode fungerar överallt

## 🔍 Kända issues att leta efter

1. **Kolumner saknas i databas:**
   - `base_rate_sek` i employees
   - `status` i projects
   - `org_number` i clients
   - `amount` i invoices
   - `invoice_id` i rot_applications

2. **RLS-errors:**
   - Om queries misslyckas, kan det vara RLS som blockerar
   - Lösning: Verifiera att användaren har employee-post med rätt tenant_id

3. **Tenant resolution:**
   - Om "Ingen tenant vald" visas, kontrollera JWT claims
   - Lösning: Kör onboarding igen eller sätt tenant manuellt

## 📝 När alla buggar är fixade

1. ✅ Testa alla funktioner en gång till
2. ✅ Kör linter och fixa alla TypeScript errors
3. ✅ Testa på mobil (responsive)
4. ✅ Testa dark mode
5. ✅ Verifiera att inga console errors
6. ✅ Förbered för deployment

