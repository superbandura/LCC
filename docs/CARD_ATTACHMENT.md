# Card Attachment System Documentation

## Overview

The Card Attachment System allows players to attach special cards to individual units, providing tactical bonuses such as additional HP or secondary ammunition. This mechanic creates strategic decisions about which units to enhance and when.

---

## Attachment Rules

A card can be attached to a unit if:
1. ✅ Card has `isAttachable: true`
2. ✅ Unit category matches `attachableCategory`
3. ✅ Unit is **not destroyed** (currentDamage.every(d => !d))
4. ✅ Unit is **not occupied** (no existing attachedCard)
5. ✅ Card is in the same operational area as unit's task force

---

## Attachment Workflow

```
┌─────────────────┐
│ Area Popup      │
│ "Cartas" Tab    │
└────┬────────────┘
     │ Click attachable card
     ▼
┌──────────────────────┐
│ Compatible Units     │  ← Dropdown of eligible units
│ Dropdown             │
└────┬─────────────────┘
     │ Select unit
     │ "🔗 Adjuntar" button
     ▼
┌──────────────────────┐
│ Unit Updated         │
│ unit.attachedCard    │  ← Card ID stored
│ + HP Bonus applied   │
│ + Ammo Bonus applied │
└──────────────────────┘
```

---

## Finding Compatible Units

**Implementation** (Map.tsx:450-477):
```typescript
const getCompatibleUnitsForCard = (card: Card, areaId: string) => {
  if (!card.isAttachable || !card.attachableCategory) {
    return [];
  }

  // Find task forces in this area
  const taskForcesInArea = taskForces.filter(
    tf => tf.operationalAreaId === areaId && tf.faction === selectedFaction
  );

  // Find units in those task forces
  const compatibleUnits = units.filter(unit => {
    // Must be in task force in this area
    const inArea = taskForcesInArea.some(tf =>
      tf.units.includes(unit.id)
    );
    if (!inArea) return false;

    // Must match category
    if (unit.category !== card.attachableCategory) return false;

    // Must not be destroyed
    const destroyed = unit.currentDamage.every(d => d === true);
    if (destroyed) return false;

    // Must not already have a card
    if (unit.attachedCard) return false;

    return true;
  });

  return compatibleUnits;
};
```

---

## Attaching Card to Unit

**Implementation** (Map.tsx:376-437):
```typescript
const handleAttachCardToUnit = (cardId: string, unitId: string) => {
  const card = cards.find(c => c.id === cardId);
  const unit = units.find(u => u.id === unitId);

  if (!card || !unit) return;

  // Validate attachment rules
  if (!card.isAttachable) {
    alert('Esta carta no se puede adjuntar a unidades');
    return;
  }

  if (card.attachableCategory !== unit.category) {
    alert('Categoría incompatible');
    return;
  }

  // Apply HP bonus if present
  let updatedUnit = { ...unit, attachedCard: cardId };

  if (card.hpBonus && card.hpBonus > 0) {
    const newDamagePoints = unit.damagePoints + card.hpBonus;
    const newCurrentDamage = [
      ...unit.currentDamage,
      ...Array(card.hpBonus).fill(false)
    ];
    updatedUnit = {
      ...updatedUnit,
      damagePoints: newDamagePoints,
      currentDamage: newCurrentDamage
    };
  }

  // Apply ammo bonus if present
  if (card.secondaryAmmoBonus && unit.attackSecondary !== undefined) {
    updatedUnit = {
      ...updatedUnit,
      attackSecondary: (unit.attackSecondary || 0) + card.secondaryAmmoBonus
    };
  }

  // Update units array
  const updatedUnits = units.map(u =>
    u.id === unitId ? updatedUnit : u
  );

  updateUnits(updatedUnits);

  // Remove card from area
  const updatedAreas = operationalAreas.map(area => {
    if (area.id === selectedArea?.id) {
      return {
        ...area,
        assignedCards: area.assignedCards?.filter(id => id !== cardId) || []
      };
    }
    return area;
  });

  updateOperationalAreas(updatedAreas);
};
```

---

## Detaching Card from Unit (Admin Only)

**Rules**:
- Only admins can detach cards
- Cannot detach if removing HP bonus would destroy unit
- Card returns to operational area (NOT to purchased cards)

**Implementation** (UnitDetailModal.tsx):
```typescript
const handleDetachCard = () => {
  if (!unit.attachedCard) return;

  const card = cards.find(c => c.id === unit.attachedCard);
  if (!card) return;

  // Check if removing HP bonus would destroy unit
  if (card.hpBonus) {
    const currentDamageCount = unit.currentDamage.filter(d => d).length;
    const newMaxHP = unit.damagePoints - card.hpBonus;

    if (currentDamageCount >= newMaxHP) {
      alert('No se puede desadjuntar: la unidad sería destruida');
      return;
    }
  }

  // Remove bonuses and detach
  let updatedUnit = { ...unit, attachedCard: undefined };

  if (card.hpBonus) {
    updatedUnit.damagePoints -= card.hpBonus;
    updatedUnit.currentDamage = updatedUnit.currentDamage.slice(
      0,
      updatedUnit.damagePoints
    );
  }

  if (card.secondaryAmmoBonus && unit.attackSecondary !== undefined) {
    updatedUnit.attackSecondary = (unit.attackSecondary || 0) - card.secondaryAmmoBonus;
  }

  // Update units
  const updatedUnits = units.map(u =>
    u.id === unit.id ? updatedUnit : u
  );
  updateUnits(updatedUnits);

  // Return card to area
  const taskForce = taskForces.find(tf => tf.id === unit.taskForceId);
  if (taskForce) {
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === taskForce.operationalAreaId) {
        return {
          ...area,
          assignedCards: [...(area.assignedCards || []), card.id]
        };
      }
      return area;
    });
    updateOperationalAreas(updatedAreas);
  }
};
```

---

## Card Loss When Units Are Destroyed

### Permanent Loss
When a unit with an attached card is destroyed:
- ❌ Card is **permanently lost** (removed from game)
- ❌ **No recovery** or return to purchased cards
- ❌ **No budget refund**

### Implementation
The card is simply not transferred anywhere when the unit is destroyed. The `attachedCard` field is lost with the unit.

### Strategic Implications
- **Risk vs. Reward**: Attaching expensive cards to vulnerable units
- **Front-line caution**: Consider unit survivability before attachment
- **Backup units**: Keep unattached units as reserves
- **Card priorities**: Save high-value cards for critical missions

---

## Visual Indicators

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

### In Task Force Modal
- Badge appears on unit cards in the list
- Tooltip shows attached card name on hover
- Card details accessible via unit detail modal

### In Unit Encyclopedia
- 🃏 icon visible in unit grid view
- Click unit to see attached card details
- Admin panel shows detach option

---

## Database Schema

### Unit with Attached Card
```typescript
// Stored in Firestore: game/current/units
{
  id: "unit_001",
  name: "F-35B Lightning II",
  category: "air",
  faction: "USMC",
  damagePoints: 6,           // Base: 4 + hpBonus: 2
  currentDamage: [false, false, false, false, false, false],
  attackSecondary: 3,        // Base: 2 + secondaryAmmoBonus: 1
  attachedCard: "card_usmc_001",  // Card ID
  // ... other properties
}
```

### Card with Attachment Properties
```typescript
// Stored in Firestore: game/current/cards
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
}
```

---

## Common Patterns

### Check if Unit Has Card
```typescript
const hasCard = (unit: Unit): boolean => {
  return unit.attachedCard !== undefined && unit.attachedCard !== null;
};
```

### Get Unit's Attached Card
```typescript
const getUnitCard = (unit: Unit, cards: Card[]): Card | null => {
  if (!unit.attachedCard) return null;
  return cards.find(c => c.id === unit.attachedCard) || null;
};
```

### Calculate Original HP (Before Bonus)
```typescript
const getOriginalHP = (unit: Unit, card: Card): number => {
  if (!card.hpBonus) return unit.damagePoints;
  return unit.damagePoints - card.hpBonus;
};
```

### Check if Card is Attachable
```typescript
const isCardAttachable = (card: Card): boolean => {
  return card.isAttachable === true && !!card.attachableCategory;
};
```

### Get Units with Attached Cards
```typescript
const getUnitsWithCards = (units: Unit[]): Unit[] => {
  return units.filter(u => u.attachedCard);
};
```

---

## Troubleshooting

### Common Issues

#### 1. Card Not Appearing in Dropdown
**Problem**: No units shown when trying to attach card
**Cause**: No compatible units in the area or wrong category
**Solution**:
- Verify unit category matches `attachableCategory`
- Ensure units are in task forces in the same operational area
- Check units don't already have cards attached

#### 2. Can't Detach Card
**Problem**: Detach button disabled or shows error
**Cause**: Removing HP bonus would destroy unit
**Solution**:
- Heal unit before detaching (reduce currentDamage count)
- Formula: `currentDamageCount < (damagePoints - hpBonus)`

#### 3. Bonus Not Applied
**Problem**: Unit stats don't change after attachment
**Cause**: Card missing bonus fields or update not saved
**Solution**:
- Verify `hpBonus` and `secondaryAmmoBonus` in card data
- Check Firestore update was called
- Refresh page to re-sync state

#### 4. Card Lost on Unit Destruction
**Problem**: Card disappeared after unit destroyed
**Cause**: This is intended behavior
**Solution**: Strategic decision - don't attach valuable cards to vulnerable units

#### 5. Visual Badge Missing
**Problem**: 🃏 icon not showing on unit
**Cause**: UnitCard component not rendering badge
**Solution**:
- Verify `unit.attachedCard` is set correctly
- Check badge code in UnitCard.tsx
- Clear browser cache if icon appears broken

---

## Best Practices

### For Players

**Card Selection**:
- Attach to units with high survivability
- Consider unit role and mission
- Balance offensive vs. defensive bonuses

**Timing**:
- Attach before critical missions
- Save for high-value targets
- Don't attach if unit already damaged heavily

**Risk Management**:
- Avoid attaching expensive cards to front-line units
- Keep reserves unattached for flexibility
- Consider card cost vs. unit replaceability

### For Developers

**State Management**:
- Always update both unit and area states atomically
- Validate attachment rules before applying
- Use memoization for compatibility checks

**UI Feedback**:
- Show clear error messages for invalid attachments
- Display card bonuses in unit tooltips
- Highlight compatible units in dropdown

**Data Integrity**:
- Validate card exists before attaching
- Check unit exists and not destroyed
- Ensure category compatibility

---

## Related Documentation
- [Card System Overview](./CARD_SYSTEM.md) - Core card mechanics and budget
- [Transport Card System](./CARD_TRANSPORT.md) - Transport mechanics
- [Influence Card System](./CARD_INFLUENCE.md) - Influence mechanics
- [Unit System](./UNIT_SYSTEM.md) - Unit management and categories
- [Combat System](./COMBAT_SYSTEM.md) - Damage mechanics and destruction
- [State Management](./STATE_MANAGEMENT.md) - State update patterns
