# 🧪 Testguide: Arbetsorder-system

## 📋 Vad är ett arbetsorder-system?

Ett **arbetsorder-system** (Work Order System) är ett system för att skapa, spåra och hantera arbetsuppgifter/ordrar i ett företag. Tänk på det som "todo-listor" men med:
- Statusflöde (ny → tilldelad → pågående → väntar på godkännande → godkänd → slutförd)
- Prioritering (kritisk, hög, medel, låg)
- Tilldelning till specifika anställda
- Foto-uppladdning för att dokumentera arbetet
- Koppling till projekt

## 🚀 Snabbstart

### 1. Starta utvecklingsservern

```bash
cd frost-demo
npm run dev
```

### 2. Navigera till arbetsordrar

Öppna webbläsaren och gå till: **http://localhost:3000/work-orders**

Du kan också klicka på "📋 Arbetsordrar" i sidomenyn.

---

## ✅ Test-scenarier

### Test 1: Skapa en arbetsorder

1. Klicka på **"Skapa Arbetsorder"**-knappen
2. Fyll i formuläret:
   - **Titel**: "Fixar takläckage i köket"
   - **Beskrivning**: "Taket läcker när det regnar, behöver kolla takpapp"
   - **Projekt**: Välj ett projekt (eller lämna tomt)
   - **Tilldelad till**: Välj en anställd (eller lämna tomt)
   - **Prioritet**: Välj "Hög"
   - **Planerat datum**: Välj ett datum
3. Klicka på **"Spara"**
4. ✅ Du bör se en toast-meddelande: "Arbetsorder skapad"
5. ✅ Den nya arbetsordern ska visas i listan med nummer format: "WO-2024-001"

### Test 2: Visa arbetsorder-detaljer

1. Klicka på en arbetsorder-kort i listan
2. ✅ Du bör se:
   - Titel och nummer
   - Status-badge (t.ex. "Ny")
   - Prioritet-indikator
   - Alla detaljer (projekt, tilldelad person, datum)
   - Beskrivning

### Test 3: Ändra status (Statusflöde)

**Som Admin/Manager:**
1. Öppna en arbetsorder
2. I sektionen **"Hantera Status"** ska du se knappar för giltiga statusövergångar
3. Testa flödet:
   - Klicka på **"Tilldelad"** (om status är "Ny")
   - Klicka på **"Pågående"** (om status är "Tilldelad")
   - Klicka på **"Väntar på godkännande"** (om status är "Pågående")
   - Klicka på **"Godkänd"** (om status är "Väntar på godkännande")
   - Klicka på **"Slutförd"** (om status är "Godkänd")

**Som Employee:**
- Du kan bara ändra status från "Tilldelad" → "Pågående" → "Väntar på godkännande"
- Du kan INTE godkänna ditt eget arbete

### Test 4: Ladda upp foton

1. Öppna en arbetsorder
2. Scrolla ner till sektionen **"Foton"**
3. **Metod 1 - Drag & Drop**:
   - Dra en bildfil från din dator och släpp i det streckade området
4. **Metod 2 - Klicka för att välja**:
   - Klicka i det streckade området
   - Välj en bildfil
5. ✅ Du bör se:
   - Toast-meddelande: "Foto uppladdat"
   - Bilden visas i galleriet (med thumbnail)
   - Du kan ta bort bilden genom att hovra och klicka på papperskorgen

**Tips**: Testa med bilder i format PNG, JPG, WEBP (max 50MB)

### Test 5: Redigera arbetsorder

**Som Admin:**
1. Öppna en arbetsorder
2. Klicka på **"Redigera"**-knappen (höger uppe)
3. Ändra t.ex.:
   - Titel
   - Prioritet
   - Tilldelad person
4. Klicka på **"Spara"**
5. ✅ Ändringarna ska sparas och visas direkt

### Test 6: Ta bort arbetsorder

**Som Admin:**
1. Öppna en arbetsorder
2. Klicka på **"Ta bort"**-knappen (röd knapp)
3. Bekräfta i popup-dialogen
4. ✅ Arbetsordern ska tas bort och du ska redirectas till listan

### Test 7: Filtrera arbetsordrar

1. På list-sidan ser du flikar:
   - **Alla** - visar alla arbetsordrar
   - **Nya** - visar bara status "new"
   - **Tilldelade** - visar bara status "assigned"
   - **Pågående** - visar bara status "in_progress"
   - **Väntar** - visar bara status "awaiting_approval"
2. Klicka på olika flikar
3. ✅ Listan ska filtreras efter status

### Test 8: Status-badges och prioritet-indikatorer

Kontrollera visuella element:
- **Status-badges**: Färgkodade badges med ikoner
  - Ny: Grå
  - Tilldelad: Blå
  - Pågående: Gul/Amber
  - Väntar: Lila
  - Godkänd: Grön
  - Slutförd: Mörkgrön
- **Prioritet-indikatorer**: Ikoner med färger
  - Kritisk: Röd ⚠️
  - Hög: Orange ⬆️
  - Medel: Gul ⭕
  - Låg: Blå ⬇️

---

## 🐛 Felsökning

### Problem: "Tenant ID saknas"
- **Lösning**: Se till att du är inloggad och har genomfört onboarding

### Problem: "Kunde inte skapa arbetsorder"
- **Lösning**: Kontrollera att SQL-migrationen är körd (`CREATE_WORK_ORDERS_SYSTEM.sql`)
- Kolla konsolen för detaljerade felmeddelanden

### Problem: Statusövergångar fungerar inte
- **Lösning**: Kontrollera din roll (admin/manager/employee)
- Vissa övergångar är inte tillåtna baserat på roll

### Problem: Foton laddas inte upp
- **Lösning**: 
  - Kontrollera att Supabase Storage bucket "work-order-photos" finns
  - Kontrollera filstorlek (max 50MB)
  - Kontrollera filformat (PNG, JPG, WEBP)

### Problem: "Arbetsorder hittades inte"
- **Lösning**: Kontrollera att arbetsordern tillhör din tenant (multi-tenant säkerhet)

---

## 📊 Databas-struktur

Om du vill kontrollera i Supabase:

```sql
-- Se alla arbetsordrar
SELECT * FROM work_orders ORDER BY created_at DESC;

-- Se status-historik
SELECT * FROM work_order_status_history ORDER BY changed_at DESC;

-- Se foton
SELECT * FROM work_order_photos ORDER BY uploaded_at DESC;
```

---

## 🎯 Förväntat beteende

### Rollbaserad åtkomst:
- **Admin**: Kan skapa, redigera, ta bort och ändra status fritt
- **Manager**: Kan skapa, redigera och ändra status (men inte ta bort)
- **Employee**: Kan bara ändra status från "Tilldelad" → "Pågående" → "Väntar på godkännande"

### Statusflöde:
```
new → assigned → in_progress → awaiting_approval → approved → completed
```

**Admin kan också "backa"** vissa statusar (t.ex. från "in_progress" tillbaka till "assigned")

### Arbetsorder-nummer:
Format: `WO-YYYY-NNN` (t.ex. WO-2024-001)
- Genereras automatiskt
- Unikt per tenant
- År + löpnummer

---

## ✅ Checklista för fullständig testning

- [ ] Skapa arbetsorder
- [ ] Visa arbetsorder-detaljer
- [ ] Redigera arbetsorder (som admin)
- [ ] Ta bort arbetsorder (som admin)
- [ ] Ändra status genom hela flödet
- [ ] Testa statusövergångar som employee (begränsade)
- [ ] Ladda upp foto
- [ ] Ta bort foto
- [ ] Filtrera efter status
- [ ] Testa med olika prioriteter
- [ ] Testa med och utan projekt
- [ ] Testa med och utan tilldelad person
- [ ] Testa på mobil (responsive design)

---

## 🎉 Klar!

Om alla tester passerar har du ett fungerande arbetsorder-system! 🚀

