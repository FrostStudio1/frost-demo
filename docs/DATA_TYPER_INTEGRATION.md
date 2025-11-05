# 📊 Data-typer för Visma/Fortnox Integration

## 📋 Översikt

Detta dokument beskriver alla data-typer som ska exporteras/importeras mellan Frost Solutions och Visma/Fortnox.

---

## 🔄 Data-typer för Sync

### 1. **Lönespec (Payroll/Payslip)** 💰
**Riktning:** Export (Frost → Fortnox/Visma)  
**Syfte:** Skicka löneunderlag till ekonomisystem för lönehantering

**Data inkluderar:**
- Anställd information (namn, personnummer, email)
- Period (månad/vecka)
- Timmar per OB-typ (vanlig, kväll, natt, helg)
- Grundlön per timme
- Bruttolön
- Skatt
- Netto
- Totalt antal timmar

**Format:** PDF, CSV, eller XML (beroende på vad Fortnox/Visma stödjer)

**Frekvens:** Månadsvis (efter löneperiod)

---

### 2. **Offert (Quotes/Estimates)** 📝
**Riktning:** Export (Frost → Fortnox/Visma)  
**Syfte:** Skicka offerter till ekonomisystem för kundhantering

**Data inkluderar:**
- Offertnummer
- Datum
- Kund information
- Projekt information
- Offerterader (tjenster, material, etc.)
- Totalt belopp
- Giltighetstid
- Status

**Format:** JSON eller XML (beroende på API)

**Frekvens:** Vid skapande/uppdatering av offert

**Konvertering:** När offert godkänns → konvertera till faktura

---

### 3. **Faktura (Invoices)** 📄
**Riktning:** Bidirectional (Frost ↔ Fortnox/Visma)  
**Syfte:** Synkronisera fakturor mellan system

**Data inkluderar:**
- Fakturanummer
- Datum
- Förfallodatum
- Kund information
- Fakturarader (tjenster, material, etc.)
- Totalt belopp
- Moms
- Status (draft, sent, paid, etc.)
- Betalningsstatus

**Format:** JSON eller XML (beroende på API)

**Frekvens:** Realtid vid skapande/uppdatering

**Conflict resolution:** Last-write-wins eller manual merge

---

### 4. **Tidsrapport (Time Entries)** ⏱️
**Riktning:** Export (Frost → Fortnox/Visma)  
**Syfte:** Skicka tidsrapporter för löneunderlag och fakturering

**Data inkluderar:**
- Anställd ID
- Projekt ID
- Datum
- Timmar (total)
- OB-typ (vanlig, kväll, natt, helg)
- Beskrivning
- Status (approved, pending)

**Format:** JSON eller CSV (beroende på API)

**Frekvens:** Dagligen eller per period

**Aggregering:** Kan aggregeras per månad/vecka för löneunderlag

---

### 5. **Kunder (Customers/Clients)** 👥
**Riktning:** Bidirectional (Frost ↔ Fortnox/Visma)  
**Syfte:** Synkronisera kundinformation mellan system

**Data inkluderar:**
- Kundnummer
- Organisationsnummer
- Namn
- Adress
- Telefon
- Email
- Kontaktperson
- Momsregistreringsnummer
- Betalningsvillkor

**Format:** JSON (via API)

**Frekvens:** Realtid vid skapande/uppdatering

**Duplikat-hantering:** Matcha på organisationsnummer eller email

---

### 6. **Anställda (Employees)** 👷
**Riktning:** Export (Frost → Fortnox/Visma)  
**Syfte:** Skicka anställd-information för lönehantering

**Data inkluderar:**
- Anställd ID
- Namn
- Personnummer
- Email
- Telefon
- Adress
- Grundlön per timme
- Anställningsdatum
- Roll/position

**Format:** JSON eller CSV (beroende på API)

**Frekvens:** Vid skapande/uppdatering av anställd

---

### 7. **Projekt (Projects)** 🏗️
**Riktning:** Export (Frost → Fortnox/Visma) - Valfritt  
**Syfte:** Referens för fakturering och projektplanering

**Data inkluderar:**
- Projektnummer
- Projektnamn
- Kund ID (länk till kund)
- Startdatum
- Slutdatum
- Status
- Budget
- Beskrivning

**Format:** JSON (via API)

**Frekvens:** Vid skapande/uppdatering (valfritt)

---

## 📊 Sync-strategi per typ

| Data-typ | Riktning | Frekvens | Format | Prioritet |
|----------|----------|----------|--------|-----------|
| Lönespec | Export | Månadsvis | PDF/CSV/XML | Hög |
| Offert | Export | Realtid | JSON/XML | Medel |
| Faktura | Bidirectional | Realtid | JSON/XML | Hög |
| Tidsrapport | Export | Dagligen/Period | JSON/CSV | Hög |
| Kunder | Bidirectional | Realtid | JSON | Hög |
| Anställda | Export | Vid ändring | JSON/CSV | Medel |
| Projekt | Export | Vid ändring | JSON | Låg |

---

## 🔐 Security & Privacy

**Personuppgifter:**
- Personnummer (anställda) - kryptera i transit och storage
- Email adresser - kryptera i transit
- Adresser - kryptera i transit

**Sekretess:**
- Alla data ska krypteras i transit (HTTPS/TLS)
- API-nycklar ska krypteras i databas
- Logs ska inte innehålla känsliga data

---

## ✅ Implementation Checklist

### Fortnox
- [ ] Lönespec export
- [ ] Offert export
- [ ] Faktura bidirectional sync
- [ ] Tidsrapport export
- [ ] Kunder bidirectional sync
- [ ] Anställda export
- [ ] Projekt export (valfritt)

### Visma
- [ ] Lönespec export
- [ ] Offert export
- [ ] Faktura bidirectional sync
- [ ] Tidsrapport export
- [ ] Kunder bidirectional sync
- [ ] Anställda export
- [ ] Projekt export (valfritt)

---

**Status:** ✅ Klar för implementation
**Nästa steg:** Research API endpoints för alla data-typer

