# Card System Documentation

## Overview

The Card System is a strategic resource management mechanic where players purchase cards with a limited budget and deploy them to operational areas or attach them to units for tactical advantages.

---

## Card Types

### Type Classification

Cards are categorized into **5 types**, each with a distinct color and strategic purpose:

| Type | Color | Icon | Purpose |
|------|-------|------|---------|
| **Attack** | 🔴 Red | `/red.png` | Offensive operations |
| **Maneuver** | 🟢 Green | `/green.png` | Movement and positioning |
| **Interception** | 🟣 Purple | `/purple.png` | Defensive operations |
| **Intelligence** | 🟡 Yellow | `/yellow.png` | Reconnaissance and info |
| **Communications** | 🔵 Blue | `/blue.png` | C4ISR and coordination |

### Type Definition

```typescript
// types.ts
export type CardType =
  | 'attack'
  | 'maneuver'
  | 'interception'
  | 'intelligence'
  | 'communications';

export interface Card {
  id: string;
  name: string;
  faction: 'USMC' | 'PLAN';
  cardType: CardType;
  cost: number;              // Point cost (1-50)
  imagePath: string;         // e.g., "/Cartas USMC/card1.jpg"

  // Attachment properties (optional)
  isAttachable?: boolean;    // Can be attached to units
  attachableCategory?: UnitCategory; // e.g., 'air', 'naval'
  hpBonus?: number;          // Additional HP when attached
  secondaryAmmoBonus?: number; // Extra secondary attack ammo
}
```

---

## Card Budget System

### Initial Budget
Each faction starts with **50 points** to purchase cards.

```typescript
const [cardBudget, setCardBudget] = useState<{ us: number; china: number }>({
  us: 50,
  china: 50
});
```

### Budget Rules
- ✅ Budget is **shared across the faction** (not per-player)
- ✅ Budget is **non-recoverable** (spent points never return)
- ❌ **No refunds** when cards are used or destroyed
- ❌ **Cannot purchase** if insufficient budget

### Cost Range
- **Cheap cards**: 1-10 points (common tactics)
- **Medium cards**: 11-25 points (specialized operations)
- **Expensive cards**: 26-50 points (strategic assets)

---

## Card Lifecycle

### 1. Purchase Phase (CommandCenterModal)

```
┌──────────────┐
│   Catalog    │  ← Browse all available cards (filtered by faction)
└──────┬───────┘
       │ Click card
       ▼
┌──────────────┐
│   Viewer     │  ← View card details (cost, type, image)
└──────┬───────┘
       │ "Comprar" button
       ▼
┌──────────────┐
│  Purchased   │  ← Card moved to purchased panel
│   Panel      │  ← Budget deducted
└──────────────┘
```

**Implementation** (CommandCenterModal.tsx):
```typescript
const handlePurchase = (card: Card) => {
  const faction = card.faction === 'USMC' ? 'us' : 'china';

  // Check budget
  if (cardBudget[faction] < card.cost) {
    alert('Presupuesto insuficiente');
    return;
  }

  // Deduct budget
  const newBudget = {
    ...cardBudget,
    [faction]: cardBudget[faction] - card.cost
  };
  updateCardBudget(newBudget);

  // Add to purchased
  setPurchasedCards([...purchasedCards, card]);
};
```

### 2. Assignment Phase

```
┌──────────────┐
│  Purchased   │
│    Card      │
└──────┬───────┘
       │ Click card
       │ Select operational area
       ▼
┌──────────────────┐
│ Operational Area │
│  (assignedCards) │  ← Card assigned to area
└──────────────────┘
```

**Implementation** (CommandCenterModal.tsx):
```typescript
const handleAssignCard = (card: Card, areaId: string) => {
  // Update operational area
  const updatedAreas = operationalAreas.map(area => {
    if (area.id === areaId) {
      return {
        ...area,
        assignedCards: [...(area.assignedCards || []), card.id]
      };
    }
    return area;
  });

  updateOperationalAreas(updatedAreas);

  // Remove from purchased
  setPurchasedCards(purchasedCards.filter(c => c.id !== card.id));
};
```

### 3. Deployment Phase (Map Popup)

Cards assigned to an operational area appear in the **"Cartas" tab** of the DataEditor popup.

**View Assigned Cards** (Map.tsx DataEditor):
```typescript
const areaCards = useMemo(() => {
  if (!selectedArea?.assignedCards) return [];
  return cards.filter(card =>
    selectedArea.assignedCards?.includes(card.id)
  );
}, [selectedArea, cards]);
```

**Hover Preview**: Large card image displays on hover for easy identification.

---

## Card Loss

### When Units Are Destroyed
When a unit with an attached card is destroyed:
- ❌ Card is **permanently lost** (removed from game)
- ❌ **No recovery** or return to purchased cards
- ❌ **No budget refund**

**Implementation**:
The card is simply not transferred anywhere when the unit is destroyed. The `attachedCard` field is lost with the unit.

---

## Visual Indicators

### Card Type Icons
**CRITICAL**: Type icons MUST be in `/public/` root directory:
- `/red.png` (attack)
- `/green.png` (maneuver)
- `/purple.png` (interception)
- `/yellow.png` (intelligence)
- `/blue.png` (communications)

**Vite Limitation**: Icons in subdirectories fail to load. Card images can be in subdirectories, but type icons cannot.

### Card Badge on Units
Units with attached cards display a **🃏 badge** in their UnitCard component:

```typescript
// UnitCard.tsx
{unit.attachedCard && (
  <span className="absolute top-1 right-1 text-xl" title="Tiene carta adjunta">
    🃏
  </span>
)}
```

### Hover Preview
In the DataEditor "Cartas" tab, hovering over a card displays a large preview:

```typescript
// Map.tsx DataEditor
<div
  className="relative"
  onMouseEnter={() => setHoveredCard(card)}
  onMouseLeave={() => setHoveredCard(null)}
>
  {/* Card item */}
</div>

{hoveredCard && (
  <div className="absolute right-0 top-0 pointer-events-none">
    <img
      src={hoveredCard.imagePath}
      alt={hoveredCard.name}
      className="w-48 h-auto border-4 border-yellow-400"
    />
  </div>
)}
```

---

## Database Schema

### Cards Collection
```typescript
// Stored in Firestore: game/current/cards
[
  {
    id: "card_usmc_001",
    name: "Close Air Support",
    faction: "USMC",
    cardType: "attack",
    cost: 15,
    imagePath: "/Cartas USMC/Close Air Support.jpg",
    isAttachable: true,
    attachableCategory: "air",
    hpBonus: 2,
    secondaryAmmoBonus: 1
  },
  // ... 197 total cards (103 USMC, 94 PLAN)
]
```

### Operational Areas (assignedCards)
```typescript
// Stored in Firestore: game/current/operationalAreas
[
  {
    id: "area_001",
    name: "Philippine Sea",
    assignedCards: ["card_usmc_001", "card_usmc_015"], // Card IDs
    // ... other properties
  }
]
```

### Units (attachedCard)
```typescript
// Stored in Firestore: game/current/units
[
  {
    id: "unit_001",
    name: "F-35B Lightning II",
    attachedCard: "card_usmc_001", // Single card ID
    damagePoints: 4,  // May include hpBonus
    attackSecondary: 3, // May include secondaryAmmoBonus
    // ... other properties
  }
]
```

---

## Card Management (Admin)

### Card Editor Modal
Admins can edit card properties inline in CardEditorModal:
- Name, faction, type, cost
- Image path
- Attachment properties (isAttachable, category, bonuses)

### Syncing Cards from Firestore
```bash
npx tsx syncCardsFromFirestore.ts
```
Downloads all cards from Firestore and updates `data/cards.ts`.

---

## Common Patterns

### 1. Get Cards by Faction
```typescript
const factionCards = useMemo(() => {
  return cards.filter(c => c.faction === selectedFaction);
}, [cards, selectedFaction]);
```

### 2. Get Cards by Type
```typescript
const attackCards = cards.filter(c => c.cardType === 'attack');
```

### 3. Get Attachable Cards Only
```typescript
const attachableCards = cards.filter(c => c.isAttachable === true);
```

### 4. Check if Card is Attached
```typescript
const isCardAttached = (cardId: string) => {
  return units.some(u => u.attachedCard === cardId);
};
```

### 5. Get Unit's Attached Card
```typescript
const getUnitCard = (unit: Unit) => {
  if (!unit.attachedCard) return null;
  return cards.find(c => c.id === unit.attachedCard);
};
```

---

## Troubleshooting

### Common Issues

#### 1. Type Icon Not Displaying
**Problem**: Card type icon shows broken image
**Cause**: Icon not in `/public/` root
**Solution**: Ensure icons are at `/red.png`, `/green.png`, etc.

#### 2. Card Not Attachable
**Problem**: "Adjuntar" button disabled
**Cause**: No compatible units or unit already has card
**Solution**: Check unit category matches card's `attachableCategory`

#### 3. Budget Not Updating
**Problem**: Budget stays same after purchase
**Cause**: Not calling `updateCardBudget()`
**Solution**: Ensure Firestore update is called

#### 4. Card Lost After Unit Destruction
**Problem**: Card disappeared
**Cause**: This is intended behavior
**Solution**: Strategic decision - don't attach expensive cards to vulnerable units

---

## Future Enhancements

### Planned Features
1. **Card Trading**: Transfer cards between areas
2. **Card Effects**: Active abilities (not just passive bonuses)
3. **Card Recycling**: Recover partial cost when detaching
4. **Card Stacking**: Multiple cards per unit (with limits)
5. **Card Counters**: Specific cards counter other cards

---

## Related Documentation
- [Card Attachment System](./CARD_ATTACHMENT.md) - Attaching cards to units for bonuses
- [Transport Card System](./CARD_TRANSPORT.md) - Transport mechanics and unit embarkation
- [Influence Card System](./CARD_INFLUENCE.md) - Influence cards and dice roll mechanics
- [Unit System](./UNIT_SYSTEM.md) - Unit management
- [Combat System](./COMBAT_SYSTEM.md) - Combat mechanics
- [Architecture](./ARCHITECTURE.md) - Overall system architecture
- [State Management](./STATE_MANAGEMENT.md) - State patterns
