# Influence Card System Documentation

## Overview

Influence cards are a special card type that affects the campaign-level influence marker through dice roll mechanics. Unlike standard cards that provide tactical advantages, influence cards create strategic shifts in the overall campaign balance.

---

## Influence Card Properties

**Additional Fields** (types.ts:114-117):
```typescript
export interface Card {
  // ... standard fields (id, name, faction, cardType, cost, imagePath)

  // Influence-specific fields
  isInfluenceCard?: boolean;                    // Marks card as influence type
  influenceThresholds?: InfluenceThreshold[];   // Dice roll outcome table
}
```

**Threshold Definition** (types.ts:212-217):
```typescript
export interface InfluenceThreshold {
  minRoll: number;         // Minimum d20 roll (1-20)
  maxRoll: number;         // Maximum d20 roll (1-20)
  influenceEffect: number; // Change to influence marker (-10 to +10)
  description: string;     // Human-readable outcome (e.g., "Major Success (+2)")
}
```

---

## Influence vs. Standard Cards

| Property | Standard Card | Influence Card |
|----------|--------------|----------------|
| **Primary Purpose** | Tactical advantage (attach to units, area bonuses) | Strategic campaign impact |
| **Usage** | Can be attachable or area-specific | Always consumed on use |
| **Mechanics** | Passive bonuses or triggered effects | Dice roll with variable outcomes |
| **Recovery** | May return on detach | Never returns (one-time use) |
| **Visual Indicator** | Type icon (🔴🟢🟣🟡🔵) | 🎲 Dice icon |

---

## Creating Influence Cards

**Example Card Structure**:
```typescript
{
  id: "us-influence-diplomatic",
  name: "Diplomatic Outreach",
  faction: "USMC",
  cardType: "intelligence",  // Typically intelligence or communications
  cost: 25,
  imagePath: "/Cartas USMC/Diplomatic Outreach.jpg",

  // Influence fields
  isInfluenceCard: true,
  influenceThresholds: [
    {
      minRoll: 1,
      maxRoll: 5,
      influenceEffect: -2,
      description: "Diplomatic Incident (-2)"
    },
    {
      minRoll: 6,
      maxRoll: 10,
      influenceEffect: 0,
      description: "No Impact (0)"
    },
    {
      minRoll: 11,
      maxRoll: 15,
      influenceEffect: +1,
      description: "Positive Reception (+1)"
    },
    {
      minRoll: 16,
      maxRoll: 19,
      influenceEffect: +2,
      description: "Strategic Alliance (+2)"
    },
    {
      minRoll: 20,
      maxRoll: 20,
      influenceEffect: +3,
      description: "Critical Success (+3)"
    }
  ]
}
```

---

## Threshold Design Patterns

### Balanced Risk (equal positive/negative outcomes)
```typescript
influenceThresholds: [
  { minRoll: 1, maxRoll: 5, influenceEffect: -2, description: "Failure (-2)" },
  { minRoll: 6, maxRoll: 15, influenceEffect: 0, description: "Neutral (0)" },
  { minRoll: 16, maxRoll: 20, influenceEffect: +2, description: "Success (+2)" }
]
```

### High Risk/High Reward (big swings)
```typescript
influenceThresholds: [
  { minRoll: 1, maxRoll: 10, influenceEffect: -3, description: "Backfire (-3)" },
  { minRoll: 11, maxRoll: 20, influenceEffect: +3, description: "Victory (+3)" }
]
```

### Safe Play (minimal downside)
```typescript
influenceThresholds: [
  { minRoll: 1, maxRoll: 8, influenceEffect: 0, description: "No Effect (0)" },
  { minRoll: 9, maxRoll: 16, influenceEffect: +1, description: "Progress (+1)" },
  { minRoll: 17, maxRoll: 20, influenceEffect: +2, description: "Breakthrough (+2)" }
]
```

### Critical Focus (extremes matter)
```typescript
influenceThresholds: [
  { minRoll: 1, maxRoll: 1, influenceEffect: -5, description: "Critical Failure (-5)" },
  { minRoll: 2, maxRoll: 19, influenceEffect: +1, description: "Normal Success (+1)" },
  { minRoll: 20, maxRoll: 20, influenceEffect: +5, description: "Critical Success (+5)" }
]
```

---

## Influence Card Lifecycle

```
┌──────────────────┐
│ Purchase Card    │  ← Player buys influence card (50 CP budget)
│ CommandCenter    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Assign to Area   │  ← Card sent to operational area
│                  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Play Card        │  ← Player clicks "Tirar Dados" in DataEditor
│ DiceRollModal    │
└────────┬─────────┘
         │
         ├─> Select roll mode (manual/automatic)
         │
         ▼
┌──────────────────┐
│ Execute d20 Roll │  ← Generate random 1-20 result
│ + Animation      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Match Threshold  │  ← Find threshold matching roll
│                  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Apply Effect     │  ← Update influence marker
│ Update Marker    │  ← Clamp to -10/+10 range
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Remove Card      │  ← Card consumed (deleted from area)
│ PERMANENTLY      │  ← NO recovery or reuse
└──────────────────┘
```

---

## Playing Influence Cards

**From DataEditor CardsTab**:
1. Influence cards show 🎲 icon
2. Click "Tirar Dados" button
3. DiceRollModal opens with card details
4. Choose roll method:
   - **Manual**: Enter 1-20 value (for physical dice)
   - **Automatic**: System rolls and animates
5. View result and matching threshold
6. Click "Aplicar" to update influence
7. Card removed from area

**Validation**:
```typescript
const canPlayInfluenceCard = (card: Card): boolean => {
  // Must be marked as influence card
  if (!card.isInfluenceCard) return false;

  // Must have valid thresholds
  if (!card.influenceThresholds || card.influenceThresholds.length === 0) {
    return false;
  }

  // Thresholds must cover 1-20 range (recommended)
  const minCovered = Math.min(...card.influenceThresholds.map(t => t.minRoll));
  const maxCovered = Math.max(...card.influenceThresholds.map(t => t.maxRoll));

  if (minCovered > 1 || maxCovered < 20) {
    console.warn(`Card ${card.name} has incomplete threshold coverage`);
  }

  return true;
};
```

---

## Visual Indicators

### In Card Lists
```tsx
{card.isInfluenceCard && (
  <span className="text-yellow-400 text-xl ml-2" title="Carta de Influencia">
    🎲
  </span>
)}
```

### In CommandCenterModal Catalog
- Influence cards highlighted with special border
- Tooltip shows "Carta de Influencia - Tirada de dados requerida"
- Preview shows threshold table

### In DataEditor CardsTab
- "Tirar Dados" button (yellow/gold color)
- Threshold preview on hover
- Current influence value displayed

---

## Budget Considerations

**Cost Guidelines**:
- **Low-cost (5-15 CP)**: Simple effects (+1/-1), safe outcomes
- **Medium-cost (16-30 CP)**: Moderate effects (+2/-2), balanced risk
- **High-cost (31-50 CP)**: Major effects (+3/-3), high stakes

**Strategic Decisions**:
- Save budget for critical moments (late campaign)
- Balance influence cards with tactical cards
- Consider opponent's possible counters

---

## Threshold Validation

**Required Checks** (CardEditorModal):
```typescript
const validateThresholds = (thresholds: InfluenceThreshold[]): string[] => {
  const errors: string[] = [];

  // Check for gaps in coverage
  const sortedThresholds = [...thresholds].sort((a, b) => a.minRoll - b.minRoll);

  for (let i = 0; i < sortedThresholds.length - 1; i++) {
    const current = sortedThresholds[i];
    const next = sortedThresholds[i + 1];

    if (current.maxRoll + 1 < next.minRoll) {
      errors.push(`Gap between rolls ${current.maxRoll} and ${next.minRoll}`);
    }

    if (current.maxRoll >= next.minRoll) {
      errors.push(`Overlap between thresholds at roll ${next.minRoll}`);
    }
  }

  // Check valid effect range
  thresholds.forEach((t, idx) => {
    if (t.influenceEffect < -10 || t.influenceEffect > 10) {
      errors.push(`Threshold ${idx + 1}: Effect ${t.influenceEffect} out of range (-10 to +10)`);
    }
  });

  // Check roll range
  thresholds.forEach((t, idx) => {
    if (t.minRoll < 1 || t.minRoll > 20) {
      errors.push(`Threshold ${idx + 1}: minRoll ${t.minRoll} out of range (1-20)`);
    }
    if (t.maxRoll < 1 || t.maxRoll > 20) {
      errors.push(`Threshold ${idx + 1}: maxRoll ${t.maxRoll} out of range (1-20)`);
    }
    if (t.minRoll > t.maxRoll) {
      errors.push(`Threshold ${idx + 1}: minRoll ${t.minRoll} > maxRoll ${t.maxRoll}`);
    }
  });

  return errors;
};
```

---

## Database Storage

**Influence Card in Firestore** (game/current/cards):
```typescript
{
  id: "china-influence-media",
  name: "Propaganda Campaign",
  faction: "PLAN",
  cardType: "communications",
  cost: 20,
  imagePath: "/Cartas PLAN/Propaganda Campaign.jpg",
  isInfluenceCard: true,
  influenceThresholds: [
    {
      minRoll: 1,
      maxRoll: 8,
      influenceEffect: -1,
      description: "Media Blackout (-1)"
    },
    {
      minRoll: 9,
      maxRoll: 15,
      influenceEffect: -2,
      description: "Viral Campaign (-2)"
    },
    {
      minRoll: 16,
      maxRoll: 20,
      influenceEffect: -3,
      description: "Information Dominance (-3)"
    }
  ]
}
```

---

## Common Patterns

### Check if Influence Card
```typescript
const isInfluenceCard = (card: Card): boolean => {
  return card.isInfluenceCard === true &&
         Array.isArray(card.influenceThresholds) &&
         card.influenceThresholds.length > 0;
};
```

### Get Expected Value (statistical average)
```typescript
const getExpectedInfluence = (card: Card): number => {
  if (!card.influenceThresholds) return 0;

  let totalEffect = 0;
  let totalRolls = 0;

  card.influenceThresholds.forEach(threshold => {
    const rollCount = threshold.maxRoll - threshold.minRoll + 1;
    totalEffect += threshold.influenceEffect * rollCount;
    totalRolls += rollCount;
  });

  return totalEffect / totalRolls;
};

// Example: Card with thresholds [1-10: -1, 11-20: +1] has expected value of 0
```

### Format Threshold for Display
```typescript
const formatThreshold = (threshold: InfluenceThreshold): string => {
  const rollRange = threshold.minRoll === threshold.maxRoll
    ? `${threshold.minRoll}`
    : `${threshold.minRoll}-${threshold.maxRoll}`;

  const effect = threshold.influenceEffect >= 0
    ? `+${threshold.influenceEffect}`
    : `${threshold.influenceEffect}`;

  return `${rollRange}: ${threshold.description} (${effect})`;
};

// Example output: "16-19: Major Success (+2)"
```

### Find Matching Threshold
```typescript
const findThreshold = (
  roll: number,
  thresholds: InfluenceThreshold[]
): InfluenceThreshold | null => {
  return thresholds.find(
    t => roll >= t.minRoll && roll <= t.maxRoll
  ) || null;
};
```

### Calculate Probability Distribution
```typescript
const getProbabilities = (thresholds: InfluenceThreshold[]): Map<number, number> => {
  const probabilities = new Map<number, number>();

  thresholds.forEach(threshold => {
    const rollCount = threshold.maxRoll - threshold.minRoll + 1;
    const probability = rollCount / 20; // d20 = 20 total outcomes

    const existing = probabilities.get(threshold.influenceEffect) || 0;
    probabilities.set(threshold.influenceEffect, existing + probability);
  });

  return probabilities;
};

// Example output: Map { -2 => 0.25, 0 => 0.25, +1 => 0.25, +2 => 0.25 }
```

---

## Troubleshooting

### Issue: Influence Card Doesn't Show Dice Button
**Problem**: Card appears in area but no "Tirar Dados" option
**Cause**: Missing `isInfluenceCard: true` or empty `influenceThresholds` array
**Solution**: Edit card in CardEditorModal, ensure both fields set

### Issue: Dice Roll Returns No Effect
**Problem**: Roll completed but influence doesn't change
**Cause**: Roll value doesn't match any threshold range
**Solution**: Verify thresholds cover all 1-20 values without gaps

### Issue: Effect Applied Incorrectly
**Problem**: Influence changes by wrong amount
**Cause**: Multiple overlapping thresholds or wrong effect value
**Solution**: Validate thresholds have no overlaps, check effect signs (+/-)

### Issue: Card Not Consumed After Use
**Problem**: Card remains in area after playing
**Cause**: Card removal logic not triggered
**Solution**: Verify `onApplyInfluence` handler removes card from `assignedCards`

### Issue: Influence Marker Out of Range
**Problem**: Influence value exceeds -10/+10 limits
**Cause**: Effect not clamped after application
**Solution**: Use `Math.max(-10, Math.min(10, newValue))` to clamp

### Issue: Manual Roll Not Working
**Problem**: Can't input custom roll value
**Cause**: Manual mode disabled or input validation too strict
**Solution**: Check DiceRollModal allows manual mode, validate input is 1-20

---

## Design Guidelines

### Naming Conventions
- Use descriptive names: "Diplomatic Summit", "Media Blitz", "Intelligence Leak"
- Indicate scope: "Local Propaganda" vs "International Campaign"
- Match faction theme: USMC = alliances, PLAN = information warfare

### Threshold Distribution
- **Good**: Cover all 1-20 values exactly once
- **Acceptable**: Minor gaps for low-probability rolls
- **Bad**: Large gaps (5+ uncovered rolls), overlapping ranges

### Effect Magnitude
- **Conservative**: ±1 to ±2 (predictable, safe)
- **Moderate**: ±2 to ±3 (standard risk)
- **Aggressive**: ±3 to ±5 (high stakes)

### Card Types by Theme
- **Intelligence**: Information gathering, espionage (favor positive outcomes)
- **Communications**: Public relations, propaganda (balanced or China-favoring)
- **Attack**: Aggressive posturing, threats (risky, high reward)
- **Maneuver**: Political positioning (medium risk)

---

## Probability Analysis

### Expected Value Calculation
The expected value helps balance influence cards:

```typescript
// Example: Diplomatic Outreach card
const thresholds = [
  { minRoll: 1, maxRoll: 5, influenceEffect: -2 },   // 25% chance
  { minRoll: 6, maxRoll: 10, influenceEffect: 0 },   // 25% chance
  { minRoll: 11, maxRoll: 15, influenceEffect: +1 }, // 25% chance
  { minRoll: 16, maxRoll: 20, influenceEffect: +2 }  // 25% chance
];

// Expected value = (0.25 × -2) + (0.25 × 0) + (0.25 × +1) + (0.25 × +2)
//                = -0.5 + 0 + 0.25 + 0.5
//                = +0.25

// Interpretation: On average, this card provides +0.25 influence (slightly positive)
```

### Balancing Guidelines
- **Neutral cards**: Expected value near 0 (±0.25)
- **Faction-favoring**: Expected value +0.5 to +1.0 for faction
- **High-risk**: High variance but expected value near 0
- **Safe bets**: Low variance, positive expected value

---

## Integration with Campaign Systems

### Influence Marker Impact
- Range: -10 (China advantage) to +10 (US advantage)
- Each point = 10% command point bonus/penalty at week end
- Affects strategic resource allocation
- See [COMBAT_SYSTEM.md § Influence System](./COMBAT_SYSTEM.md#influence-system)

### Weekly Command Point Calculation
```typescript
// Example: Influence = +5 (US advantage)
const baseCP = 100; // From controlled bases
const usBonus = baseCP * 0.5;    // +50% = 150 CP
const chinaBonus = baseCP * -0.5; // -50% = 50 CP
```

### Timing Considerations
- Play influence cards at strategic moments
- Consider opponent's likely response
- Coordinate with major operations
- Save for end-of-week CP calculations

---

## Related Systems

**Influence Marker**:
- See [COMBAT_SYSTEM.md § Influence System](./COMBAT_SYSTEM.md#influence-system)
- Range: -10 (China) to +10 (US)
- Synced in Firestore: `game/current/influenceMarker`

**DiceRollModal**:
- See [COMBAT_SYSTEM.md § Dice Roll System](./COMBAT_SYSTEM.md#dice-roll-system)
- Manual and automatic roll modes
- Visual d20 animation

**InfluenceTrack Component**:
- See [COMBAT_SYSTEM.md § Visual Representation](./COMBAT_SYSTEM.md#visual-representation)
- Displays current influence value
- Color-coded track (red/yellow/blue)

---

## Related Documentation
- [Card System Overview](./CARD_SYSTEM.md) - Core card mechanics and budget
- [Card Attachment System](./CARD_ATTACHMENT.md) - Attaching cards to units
- [Transport Card System](./CARD_TRANSPORT.md) - Transport mechanics
- [Combat System](./COMBAT_SYSTEM.md) - Influence marker and command points
- [State Management](./STATE_MANAGEMENT.md) - State update patterns
- [Architecture](./ARCHITECTURE.md) - Overall system architecture
