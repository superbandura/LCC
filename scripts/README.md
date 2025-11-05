# Scripts Directory

This directory contains utility scripts for the LCC project.

---

## Active Scripts

### Data Synchronization

#### ⭐ `syncAllFromFirestore.ts` (RECOMENDADO)
**Purpose**: Download ALL data from Firestore and update ALL files in `data/` folder

**Usage**:
```bash
npx tsx scripts/syncAllFromFirestore.ts
# or use the slash command:
/sincro
```

**What it syncs**:
1. Cards → `data/cards.ts`
2. Locations (bases) → `data/locations.ts`
3. Operational Areas → `data/operationalAreas.ts`
4. Task Forces → `data/taskForces.ts`
5. Operational Data → `data/operationalData.ts`

**When to use**:
- After adding card conditions or creating new bases
- After making any changes in the application that modify Firestore data
- To create a complete local backup
- Before deploying to ensure all data/ files are up-to-date

**Output example**:
```
🚀 Iniciando sincronización completa desde Firestore...
📥 1/5 - Sincronizando cartas...
   ✅ data/cards.ts actualizado (197 cartas: 103 USMC, 94 PLAN)
...
🎉 ¡Sincronización completa exitosa!
```

---

#### `syncCardsFromFirestore.ts`
**Purpose**: Download all cards from Firestore and update `data/cards.ts`

**Usage**:
```bash
npx tsx scripts/syncCardsFromFirestore.ts
```

**When to use**:
- After bulk card edits in CardEditorModal
- To create a local backup of card data
- Before deploying to ensure data/ is up-to-date

---

#### `syncUnitsFromFirestore.ts`
**Purpose**: Download all units from Firestore and update `data/unitsData.ts`

**Usage**:
```bash
npm run sync-units
# or
npx tsx scripts/syncUnitsFromFirestore.ts
```

**When to use**:
- After bulk unit edits in UnitEncyclopediaModal
- To create a local backup of unit data
- Before deploying to ensure data/ is up-to-date

---

#### `syncLocationsFromFirestore.ts`
**Purpose**: Download all locations (bases) from Firestore and update `data/locations.ts`

**Usage**:
```bash
npx tsx scripts/syncLocationsFromFirestore.ts
```

**When to use**:
- After editing bases in EditAreasModal
- To create a local backup of location data

---

### Content Processing

#### `translateDescriptions.ts`
**Purpose**: Translate unit/card descriptions (likely uses translation API)

**Usage**:
```bash
npx tsx scripts/translateDescriptions.ts
```

**When to use**:
- After adding new units/cards with English descriptions
- To generate Spanish translations

---

#### `detectCardTypes.ts`
**Purpose**: Automatically detect card types based on card names/descriptions

**Usage**:
```bash
npx tsx scripts/detectCardTypes.ts
```

**When to use**:
- After importing cards without type classification
- To auto-assign card types based on heuristics

---

#### `extractCardCosts.ts`
**Purpose**: Extract cost information from card images or metadata

**Usage**:
```bash
npx tsx scripts/extractCardCosts.ts
```

**When to use**:
- After importing cards without cost values
- To parse cost from card image filenames or OCR

---

#### `extractAllCardCosts.ts`
**Purpose**: Batch version of extractCardCosts.ts for all cards

**Usage**:
```bash
npx tsx scripts/extractAllCardCosts.ts
```

**When to use**:
- Initial card import
- Bulk cost extraction

---

### Database Updates

#### `addCardTypes.ts`
**Purpose**: Add cardType field to all cards in Firestore

**Usage**:
```bash
npx tsx scripts/addCardTypes.ts
```

**When to use**:
- One-time migration to add cardType field
- After running detectCardTypes.ts

---

#### `updateAppForCards.ts`
**Purpose**: Update App.tsx with card-related functionality (migration script)

**Usage**:
```bash
npx tsx scripts/updateAppForCards.ts
```

**When to use**:
- One-time migration
- Adds card budget, purchased cards state, etc.

---

#### `updateOperationalAreas.ts`
**Purpose**: Update operational areas structure in Firestore

**Usage**:
```bash
npx tsx scripts/updateOperationalAreas.ts
```

**When to use**:
- One-time migration
- Adds assignedCards field to operational areas

---

### Documentation

#### `update_claude_md.cjs`
**Purpose**: Update CLAUDE.md with latest project information

**Usage**:
```bash
node scripts/update_claude_md.cjs
```

**When to use**:
- After major architecture changes
- To regenerate CLAUDE.md from code analysis

---

## Archived Scripts

Located in `scripts/archive/`. These are legacy migration scripts kept for reference but no longer needed.

### `add_area_cards.cjs`
**Original Purpose**: Add assignedCards field to operational areas
**Status**: OBSOLETE (migration complete)

### `add_base_state.cjs`
**Original Purpose**: Add state field to bases
**Status**: OBSOLETE (migration complete)

### `add_changeview.cjs`
**Original Purpose**: Add ChangeView control to Map.tsx
**Status**: OBSOLETE (feature implemented)

### `add_functions.cjs`
**Original Purpose**: Add helper functions to components
**Status**: OBSOLETE (functions added)

### `add_states.cjs`
**Original Purpose**: Add state management to App.tsx
**Status**: OBSOLETE (states added)

### `fix_air_patrol.cjs`
**Original Purpose**: Hot-fix for air patrol indicator bug
**Status**: OBSOLETE (bug fixed)

### `restore.cjs`
**Original Purpose**: Restore code from backup
**Status**: OBSOLETE (Git is better for this)

### `restore_dataeditor.cjs`
**Original Purpose**: Restore DataEditor component from backup
**Status**: OBSOLETE (Git is better for this)

### `update_air_patrol.cjs`
**Original Purpose**: Update air patrol system
**Status**: OBSOLETE (migration complete)

---

## Creating New Scripts

### Script Template

```typescript
// scripts/myScript.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  try {
    console.log('Starting script...');

    // Your logic here

    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main();
```

### Running TypeScript Scripts

```bash
# Direct execution with tsx
npx tsx scripts/myScript.ts

# Or add to package.json
"scripts": {
  "my-script": "tsx scripts/myScript.ts"
}

# Then run with npm
npm run my-script
```

---

## Best Practices

1. **Always backup before running migration scripts**
   ```bash
   firebase firestore:export backup/
   ```

2. **Test scripts on development data first**
   - Use a separate Firebase project for testing
   - Or clone production data to a test collection

3. **Log operations for debugging**
   ```typescript
   console.log(`Processing ${items.length} items...`);
   items.forEach((item, index) => {
     console.log(`[${index + 1}/${items.length}] ${item.name}`);
   });
   ```

4. **Handle errors gracefully**
   ```typescript
   try {
     await updateDoc(docRef, data);
   } catch (error) {
     console.error(`Failed to update ${docId}:`, error);
     // Continue or exit based on severity
   }
   ```

5. **Add dry-run mode for destructive operations**
   ```typescript
   const DRY_RUN = process.env.DRY_RUN === 'true';

   if (DRY_RUN) {
     console.log('Would update:', data);
   } else {
     await updateDoc(docRef, data);
   }
   ```

---

## Related Documentation
- [Architecture](../docs/ARCHITECTURE.md)
- [Refactoring Log](../docs/REFACTORING_LOG.md)
