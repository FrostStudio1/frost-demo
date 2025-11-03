# 🎨 Frost Solutions - UI/UX Design System

## Design-filosofi: "Clean & Simple, Powerful Behind"

### Core Principles

1. **"Less is More"**
   - En funktion per skärm
   - Max 3-4 huvudsektioner per sida
   - Minimal kognitiv belastning

2. **"Invisible Automation"**
   - Allt händer automatiskt bakom kulisserna
   - Användaren ser bara resultatet
   - "Magic" utan att kännas magiskt

3. **"Smart Defaults"**
   - Systemet gissar rätt 90% av tiden
   - Användaren behöver bara bekräfta
   - "One-click" för vanligaste actions

4. **"Progressive Disclosure"**
   - Grundfunktioner syns direkt
   - Avancerade features döljs tills de behövs
   - "Show more" för power users

5. **"Feedback is Everything"**
   - Tydlig feedback på alla actions
   - Loading states överallt
   - Error states med lösningar

---

## 🎨 Visual Design

### Color Palette
```css
Primary: Blue (#2563EB) - Actions, links
Secondary: Green (#10B981) - Success, completed
Warning: Yellow (#F59E0B) - Alerts, pending
Error: Red (#EF4444) - Errors, critical
Neutral: Gray (#6B7280) - Text, borders
Background: White (#FFFFFF) / Gray-50 (#F9FAFB)
```

### Typography
```css
Heading 1: 2.5rem (40px) - Bold
Heading 2: 2rem (32px) - Bold
Heading 3: 1.5rem (24px) - Semibold
Body: 1rem (16px) - Regular
Small: 0.875rem (14px) - Regular
```

### Spacing
```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Components

#### Button Styles
```tsx
// Primary (main action)
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
  Skapa projekt
</button>

// Secondary (alternative)
<button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
  Avbryt
</button>

// Ghost (minimal)
<button className="text-blue-600 px-4 py-2 hover:bg-blue-50 rounded">
  Redigera
</button>
```

#### Card Styles
```tsx
// Default card
<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
  {/* Content */}
</div>

// Interactive card (hover effect)
<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
  {/* Content */}
</div>
```

#### Input Styles
```tsx
<input
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Sök..."
/>
```

---

## 📱 Screen Layouts

### Dashboard (Clean & Simple)
```
┌─────────────────────────────────────────────┐
│ Header: [Logo] [Notifications] [Profile]    │
├─────────────────────────────────────────────┤
│                                               │
│  [Snabbstatistik]                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  12  │ │  45  │ │   8  │ │   3  │       │
│  │Proj  │ │Timmar│ │Faktur│ │Alerts│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                               │
│  [Aktiva Projekt]                            │
│  ┌─────────────────────────────────────────┐ │
│  │ Projekt 1          [75%] [3 dagar]    │ │
│  │ Projekt 2          [45%] [7 dagar]    │ │
│  │ Projekt 3          [90%] [1 dag]      │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Snabbåtgärder]                              │
│  [Starta arbete] [Ny faktura] [Nytt projekt]│
│                                               │
└─────────────────────────────────────────────┘
```

### Projektlista (Simple List)
```
┌─────────────────────────────────────────────┐
│ [Sök...] [Filter ▼] [Sortera ▼] [+ Nytt]    │
├─────────────────────────────────────────────┤
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Projekt 1                                │ │
│  │ Kund: ABC Bygg      Status: Pågående    │ │
│  │ Budget: 100h / 75h   Deadline: 3 dagar│ │
│  │ [75%] ████████████░░░░                  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Projekt 2                                │ │
│  │ Kund: XYZ AB         Status: Planerad   │ │
│  │ Budget: 50h / 0h     Deadline: 14 dagar│ │
│  │ [0%] ░░░░░░░░░░░░░░░░                   │ │
│  └─────────────────────────────────────────┘ │
│                                               │
└─────────────────────────────────────────────┘
```

### Tidrapportering (One-Click)
```
┌─────────────────────────────────────────────┐
│ [Stämpelklocka]                              │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │                                           │ │
│  │        [Starta arbete]                   │ │
│  │                                           │ │
│  │  Eller: [Rapportera tid manuellt]         │ │
│  │                                           │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Aktiva pass]                                │
│  ┌─────────────────────────────────────────┐ │
│  │ Projekt: Takrenovering                   │ │
│  │ Startad: 08:00    Förflutet: 2h 30min  │ │
│  │ [Stoppa]                                │ │
│  └─────────────────────────────────────────┘ │
│                                               │
└─────────────────────────────────────────────┘
```

---

## 🔄 User Flows (Simple & Fast)

### Flow 1: Starta arbete (1 klick)
```
1. Användare: Klickar "Starta arbete"
   ↓
2. System: Auto-detekterar:
   - Projekt (baserat på tid/dag/location)
   - Arbetsplats (GPS)
   - OB-typ (baserat på tid)
   ↓
3. System: Visar bekräftelse:
   "Starta på Projekt X, Arbetsplats Y?"
   ↓
4. Användare: Klickar "Ja" (eller ändrar)
   ↓
5. System: Startar stämpling automatiskt
```

### Flow 2: Skapa faktura (2 klickar)
```
1. Användare: Klickar "Skapa faktura" på projekt
   ↓
2. System: AI analyserar:
   - Ofakturerade timmar
   - Materialkostnader
   - ÄTAs
   - Föreslår faktura-belopp
   ↓
3. System: Visar förhandsgranskning:
   "Faktura: 50,000 kr (45h + material)"
   ↓
4. Användare: Klickar "Skapa & skicka"
   ↓
5. System: Skapar faktura + skickar till kund
```

### Flow 3: Godkänn offert (Kund: 1 klick)
```
1. Kund: Får länk via email
   ↓
2. Kund: Öppnar länk (ingen inloggning)
   ↓
3. System: Visar offert
   ↓
4. Kund: Klickar "Godkänn"
   ↓
5. System: 
   - Signerar offert (BankID eller email)
   - Skapar projekt automatiskt
   - Skickar bekräftelse
```

---

## 🎯 Component Library

### 1. StatusBadge
```tsx
<StatusBadge status="active" /> // Grön
<StatusBadge status="pending" /> // Gul
<StatusBadge status="completed" /> // Blå
<StatusBadge status="archived" /> // Grå
```

### 2. ProgressBar
```tsx
<ProgressBar value={75} max={100} />
// Visar: [████████████░░░░] 75%
```

### 3. SmartInput
```tsx
<SmartInput
  type="project"
  suggestions={recentProjects}
  autoComplete={true}
/>
// Auto-förslår baserat på tid/dag/location
```

### 4. QuickActionButton
```tsx
<QuickActionButton
  icon="play"
  label="Starta arbete"
  onClick={handleStart}
  shortcut="S" // Keyboard shortcut
/>
```

### 5. EmptyState
```tsx
<EmptyState
  icon="📋"
  title="Inga projekt ännu"
  description="Skapa ditt första projekt för att komma igång"
  action={<button>Skapa projekt</button>}
/>
```

---

## 📐 Layout Patterns

### Pattern 1: Master-Detail
```
┌──────────┬─────────────────────────┐
│ Lista    │ Detaljer               │
│          │                         │
│ [Item 1] │ [Detail content]       │
│ [Item 2] │                         │
│ [Item 3] │                         │
└──────────┴─────────────────────────┘
```

### Pattern 2: Cards Grid
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Card 1  │ │ Card 2  │ │ Card 3  │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Card 4  │ │ Card 5  │ │ Card 6  │
└─────────┘ └─────────┘ └─────────┘
```

### Pattern 3: Single Column
```
┌─────────────────────────────┐
│ [Header]                    │
├─────────────────────────────┤
│ [Content Section 1]          │
│ [Content Section 2]          │
│ [Content Section 3]          │
│ [Content Section 4]          │
└─────────────────────────────┘
```

---

## 🎨 Animation & Transitions

### Principles
- **Subtle** - Animationer ska vara diskreta
- **Fast** - Max 300ms för transitions
- **Purposeful** - Varje animation har ett syfte

### Transitions
```css
/* Hover */
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

/* Loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Success */
@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

## 📱 Mobile-First Design

### Breakpoints
```css
sm: 640px   // Mobile
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large Desktop
```

### Mobile Patterns
- **Bottom Sheet** för actions
- **Swipe gestures** för quick actions
- **Sticky header** med search
- **Floating action button** för primär action

---

## 🎯 Accessibility

### WCAG 2.1 AA Compliance
- ✅ Kontrast-ratio minst 4.5:1
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus indicators

---

## 🚀 Implementation Checklist

### Phase 1: Design System
- [ ] Definiera color palette
- [ ] Skapa typography scale
- [ ] Bygg component library
- [ ] Skapa layout patterns
- [ ] Dokumentera animation guidelines

### Phase 2: Component Implementation
- [ ] StatusBadge
- [ ] ProgressBar
- [ ] SmartInput
- [ ] QuickActionButton
- [ ] EmptyState
- [ ] Card components
- [ ] Button variants

### Phase 3: Screen Implementation
- [ ] Dashboard redesign
- [ ] Projektlista redesign
- [ ] Tidrapportering redesign
- [ ] Fakturering redesign
- [ ] Settings redesign

---

**Nästa steg: Bygg design system och implementera clean UI! 🎨**

