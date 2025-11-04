# 🧪 Testguide: Offline-stöd & Sync System

## 🎯 Snabbtest (5 minuter)

### 1. Testa Offline-stöd
1. **Öppna DevTools** → Application → Service Workers
2. **Checka "Offline"** checkbox
3. **Uppdatera sidan** → Ska ladda från cache
4. **Skapa/redigera arbetsorder** → Ska sparas lokalt
5. **Uncheck "Offline"** → Ska synka automatiskt

### 2. Testa Sync
1. **Skapa arbetsorder offline**
2. **Gå online igen** → Se toast: "Synkar ändringar..."
3. **Vänta 2-3 sekunder** → Toast: "Alla ändringar synkade!"
4. **Uppdatera sidan** → Arbetsordern ska finnas kvar

### 3. Testa Konflikter
1. **Öppna samma arbetsorder i två flikar**
2. **Redigera i båda offline**
3. **Gå online i båda** → Last-write-wins ska gälla
4. **Kontrollera** → Nyare version vinner

---

## 📋 Komplett Testchecklista

### Service Worker
- [ ] Service Worker registrerad (DevTools → Application → Service Workers)
- [ ] Offline mode fungerar (checka "Offline" i DevTools)
- [ ] Cache-strategier fungerar (Network First för API, Cache First för assets)
- [ ] Offline fallback page visas när offline

### IndexedDB
- [ ] IndexedDB skapad (DevTools → Application → IndexedDB → frost-offline-db)
- [ ] work_orders store finns
- [ ] syncQueue store finns
- [ ] Data sparas lokalt när offline

### Sync Engine
- [ ] Offline-ändringar läggs i syncQueue
- [ ] Sync triggas när online igen
- [ ] Sync-progress visas i UI
- [ ] Conflicts hanteras med LWW

### UI Components
- [ ] OnlineStatusIndicator visar korrekt status
- [ ] SyncProgress visar progress när synkar
- [ ] OfflineBanner visas när offline
- [ ] Toast notifications fungerar

### React Query
- [ ] Cache persisteras till IndexedDB
- [ ] Offline-first fungerar (data finns även offline)
- [ ] Optimistic updates fungerar
- [ ] Rollback vid fel fungerar

---

## 🐛 Vanliga Problem & Lösningar

### Problem: Service Worker registreras inte
**Lösning:**
- Kontrollera att `/sw.js` finns i `public/`
- Kontrollera console för errors
- Kontrollera att HTTPS/localhost används

### Problem: Sync fungerar inte
**Lösning:**
- Kontrollera syncQueue i IndexedDB (DevTools)
- Kontrollera network tab för API-anrop
- Kontrollera console för errors
- Kontrollera att tenantId är korrekt

### Problem: Data synkas inte
**Lösning:**
- Kontrollera syncQueue items (DevTools → IndexedDB)
- Kontrollera API endpoint logs
- Kontrollera conflicts (kan pausa sync)

---

## 🚀 Snabbstart

```bash
# 1. Starta servern
npm run dev

# 2. Öppna DevTools
# 3. Application → Service Workers → Check "Offline"
# 4. Testa!
```

---

**Status:** ✅ Testguide klar
**Nästa:** Testa när Gemini är klar med frontend!

