# 📱 Testa Mobilversionen av Frost Bygg

## Hur man testar mobilversionen i webbläsaren

### Chrome/Edge (Rekommenderat)
1. Öppna appen i Chrome eller Edge
2. Tryck **F12** eller **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac) för att öppna Developer Tools
3. Tryck på **Toggle device toolbar** knappen (eller **Ctrl+Shift+M** / **Cmd+Shift+M**)
4. Välj en enhet från dropdown-menyn:
   - iPhone 12/13/14 Pro
   - Samsung Galaxy S20
   - iPad
   - Eller anpassa storleken manuellt

### Firefox
1. Öppna appen i Firefox
2. Tryck **F12** för att öppna Developer Tools
3. Tryck på **Responsive Design Mode** ikonen (eller **Ctrl+Shift+M**)
4. Välj en enhet från dropdown-menyn

### Safari (Mac)
1. Öppna Safari
2. Gå till **Develop** → **Enter Responsive Design Mode** (eller **Cmd+Option+R**)
3. Välj en enhet från dropdown-menyn

## Testa på riktig mobil

### Android
1. Kontrollera att telefonen och datorn är på samma Wi-Fi
2. Hitta din lokala IP-adress (t.ex. `192.168.1.100`)
3. Öppna `http://192.168.1.100:3000` i telefonens webbläsare

### iPhone/iPad
1. Kontrollera att enheten och datorn är på samma Wi-Fi
2. Hitta din lokala IP-adress (t.ex. `192.168.1.100`)
3. Öppna `http://192.168.1.100:3000` i Safari

## Breakpoints som används

- **sm**: 640px (mobiler i landscape)
- **md**: 768px (tabletter)
- **lg**: 1024px (desktop)

## Vad ska testas?

- [ ] Sidebar öppnas/stängs på mobil
- [ ] Alla formulär är användbara på mobil
- [ ] Tabeller scrollas horisontellt när det behövs
- [ ] Knappar är stora nog att trycka på
- [ ] Text är läsbar utan att zooma
- [ ] Bilder/layouts förstörs inte
- [ ] Hamburger-menyn fungerar
- [ ] Formulär-fält är lätt att fylla i

## Tips

- Testa både portrait och landscape
- Testa olika skärmstorlekar
- Använd touch-gester (swipe, tap)
- Kontrollera att inga element är för små
- Testa med olika webbläsare på mobil

