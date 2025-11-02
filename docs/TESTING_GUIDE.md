# 🧪 Testguide för Frost Bygg SaaS

## 🚀 Snabbstart - Testa i denna ordning

### 1️⃣ Grundläggande (5 min)
```
1. Logga in → Dashboard
2. Kontrollera console (F12) - inga errors?
3. Klicka runt i menyn - alla länkar fungerar?
```

### 2️⃣ ROT-avdrag (15 min) ⭐ NY FUNKTION
```
1. Gå till /rot/new
2. Skapa en ROT-ansökan:
   - Välj projekt/kund
   - Personnummer: 199001011234
   - Fastighetsbeteckning: Villa 123
   - Arbetstyp: Renovering
   - Arbetskostnad: 50000
   - Materialkostnad: 20000
   - Totalt: 70000
3. Klicka "Skapa ansökan"
4. Gå till /rot - se listan
5. Klicka på ansökan
6. Testa "Skicka till Skatteverket":
   - Modal öppnas? ✅
   - Länken fungerar? ✅ (ska gå till skatteverket.se/rotochrut)
   - Status ändras till "submitted"? ✅
7. Testa "Uppdatera status" - fungerar?
8. Testa "Skapa faktura med ROT-avdrag" (när approved)
```

### 3️⃣ Anställda & Löner (10 min)
```
1. Gå till /employees/new
2. Skapa anställd:
   - Namn: Test Anställd
   - Grundlön: 360 kr/tim
3. Gå till /reports/new
4. Rapportera tid:
   - Välj projekt
   - Välj anställd
   - Arbetstyp: OB Kväll
   - Timmar: 8
   - Kontrollera att amount_total = 360 × 8 × 1.5 = 4320 ✅
5. Gå till /payroll/employeeID/[id]
6. Välj månad
7. Kontrollera beräkningar:
   - OB-timmar × 1.5x? ✅
   - Skatt 30%? ✅
   - Netto korrekt? ✅
```

### 4️⃣ Projekt & Fakturor (10 min)
```
1. Gå till /clients/new
2. Skapa kund (Företag eller Privat)
3. Gå till /projects/new
4. Skapa projekt med kund-val (obligatoriskt)
5. Gå till /projects/[id]
6. Klicka "Skapa faktura"
7. Kontrollera att kunddata pre-fylls ✅
8. Skapa fakturan
```

## 🐛 Vanliga problem att leta efter

### Console Errors
Öppna **F12 → Console** och leta efter:
- ❌ `Error fetching...` - RLS eller kolumn saknas?
- ❌ `column X does not exist` - Kör SQL-fix script
- ❌ `No tenant found` - Kör onboarding igen
- ❌ `401 Unauthorized` - Logga in igen

### UI-problem
- ❌ Menyn klickas inte på mobil → z-index problem?
- ❌ Dark mode fungerar inte → localStorage problem?
- ❌ Formulär submit fungerar inte → Kontrollera API routes

### Data-problem
- ❌ Timmar syns inte i dashboard → Kontrollera `is_billed = false`
- ❌ Projekt kopplas inte till kund → Kontrollera `client_id`
- ❌ ROT-ansökan länkar inte till faktura → Kontrollera `invoice_id`

## ✅ Checklista - Klart när alla fungerar

### ROT-avdrag
- [ ] Kan skapa ROT-ansökan
- [ ] Kan skicka till Skatteverket (länk fungerar)
- [ ] Status uppdateras
- [ ] Kan skapa faktura med ROT-avdrag
- [ ] GDPR export fungerar (vid closed status)

### Löner
- [ ] Kan skapa anställd med grundlön
- [ ] Tidsrapporter beräknar OB-tillägg korrekt (1.5x, 2.0x)
- [ ] Lönespec visar korrekt beräkning
- [ ] PDF-ladda ner fungerar

### Projekt & Fakturor
- [ ] Kan skapa projekt med kund (obligatoriskt)
- [ ] Kan skapa faktura från projekt
- [ ] Kan skapa faktura från ROT-ansökan
- [ ] Fakturor sparas korrekt

### Övrigt
- [ ] Alla länkar i Sidebar fungerar
- [ ] Dark mode fungerar överallt
- [ ] Mobil-responsiv (testa på telefon)
- [ ] Inga console errors

## 🎯 Nästa steg efter testning

1. **Fix alla buggar** som hittas
2. **Testa igen** efter fixarna
3. **Kör linter** (`npm run lint`)
4. **Testa på mobil** (Chrome DevTools)
5. **Förbered för deployment** 🚀

## 📞 Om något inte fungerar

1. **Kolla console** (F12) - kopiera error-meddelandet
2. **Kolla Supabase** - finns tabellen/kolumnen?
3. **Kolla SQL** - kör schema-fix scripts igen
4. **Logga ut/in** - kan vara session-problem

---

**Lycka till med testningen! 🎉**

