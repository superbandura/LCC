import fs from 'fs';

const appTsPath = './App.tsx';
const backupPath = './App.tsx.backup2';

// Backup current file
fs.copyFileSync(appTsPath, backupPath);

let content = fs.readFileSync(appTsPath, 'utf8');

// 1. Add card imports to data imports
content = content.replace(
  `import { units as initialUnits } from './data/units';`,
  `import { units as initialUnits } from './data/units';
import { initialCards, initialCommandPoints } from './data/cards';`
);

// 2. Add card subscriptions to firestore imports
content = content.replace(
  `  subscribeToUnits,
  updateOperationalAreas,`,
  `  subscribeToUnits,
  subscribeToCards,
  subscribeToCardBudget,
  updateOperationalAreas,`
);

content = content.replace(
  `  updateUnits,
  initializeGameData`,
  `  updateUnits,
  updateCardBudget,
  initializeGameData`
);

// 3. Add state variables
content = content.replace(
  `  const [isTaskForceModalOpen, setIsTaskForceModalOpen] = useState(false);`,
  `  const [isTaskForceModalOpen, setIsTaskForceModalOpen] = useState(false);
  const [isCommandCenterModalOpen, setIsCommandCenterModalOpen] = useState(false);`
);

content = content.replace(
  `  const [units, setUnits] = useState<Unit[]>(initialUnits);`,
  `  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [cardBudget, setCardBudget] = useState<CardBudget>(initialCommandPoints);`
);

// 4. Update initializeGameData call
content = content.replace(
  `initializeGameData(initialOperationalAreas, initialOperationalData, initialLocations, initialTaskForces, initialUnits);`,
  `initializeGameData(initialOperationalAreas, initialOperationalData, initialLocations, initialTaskForces, initialUnits, initialCards, initialCommandPoints);`
);

// 5. Add card subscriptions in useEffect
content = content.replace(
  `    // Subscribe to units changes
    const unsubscribeUnits = subscribeToUnits((units) => {
      setUnits(units);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAreas();
      unsubscribeData();
      unsubscribeLocations();
      unsubscribeTaskForces();
      unsubscribeUnits();
    };`,
  `    // Subscribe to units changes
    const unsubscribeUnits = subscribeToUnits((units) => {
      setUnits(units);
    });

    // Subscribe to cards changes
    const unsubscribeCards = subscribeToCards((cards) => {
      setCards(cards);
    });

    // Subscribe to card budget changes
    const unsubscribeCardBudget = subscribeToCardBudget((budget) => {
      setCardBudget(budget);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAreas();
      unsubscribeData();
      unsubscribeLocations();
      unsubscribeTaskForces();
      unsubscribeUnits();
      unsubscribeCards();
      unsubscribeCardBudget();
    };`
);

// 6. Add handler functions before factionTaskForces
content = content.replace(
  `  // Filter task forces by selected faction
  const factionTaskForces = useMemo(() => {`,
  `  const handleCardPurchase = (cardId: string, areaId: string) => {
    // Update operational areas to include the card
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === areaId) {
        const currentCards = area.assignedCards || [];
        return {
          ...area,
          assignedCards: [...currentCards, cardId],
        };
      }
      return area;
    });
    updateOperationalAreas(updatedAreas);
  };

  const handleCardBudgetUpdate = (budget: CardBudget) => {
    updateCardBudget(budget);
  };

  // Filter task forces by selected faction
  const factionTaskForces = useMemo(() => {`
);

// 7. Add CommandCenter button before TF button
content = content.replace(
  `          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-3">
            <button
              onClick={() => setIsTaskForceModalOpen(true)}
              className="flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              aria-label="Gestionar Task Forces"
            >
              <span className="text-lg font-bold">TF</span>
            </button>`,
  `          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-3">
            <button
              onClick={() => setIsCommandCenterModalOpen(true)}
              className="flex items-center justify-center w-14 h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
              aria-label="Centro de Mando"
            >
              <span className="text-lg font-bold">CC</span>
            </button>
            <button
              onClick={() => setIsTaskForceModalOpen(true)}
              className="flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              aria-label="Gestionar Task Forces"
            >
              <span className="text-lg font-bold">TF</span>
            </button>`
);

// 8. Add CommandCenterModal component before closing div
content = content.replace(
  `      {selectedFaction && (
        <TaskForceModal
          isOpen={isTaskForceModalOpen}
          onClose={() => setIsTaskForceModalOpen(false)}
          taskForces={factionTaskForces}
          onSave={handleTaskForcesUpdate}
          operationalAreas={operationalAreas}
          selectedFaction={selectedFaction}
          units={units}
          onUnitsUpdate={handleUnitsUpdate}
        />
      )}
    </div>`,
  `      {selectedFaction && (
        <TaskForceModal
          isOpen={isTaskForceModalOpen}
          onClose={() => setIsTaskForceModalOpen(false)}
          taskForces={factionTaskForces}
          onSave={handleTaskForcesUpdate}
          operationalAreas={operationalAreas}
          selectedFaction={selectedFaction}
          units={units}
          onUnitsUpdate={handleUnitsUpdate}
        />
      )}

      {selectedFaction && (
        <CommandCenterModal
          isOpen={isCommandCenterModalOpen}
          onClose={() => setIsCommandCenterModalOpen(false)}
          cards={cards}
          cardBudget={cardBudget}
          operationalAreas={operationalAreas}
          selectedFaction={selectedFaction}
          onPurchaseCard={handleCardPurchase}
          onUpdateBudget={handleCardBudgetUpdate}
        />
      )}
    </div>`
);

// Write updated content
fs.writeFileSync(appTsPath, content, 'utf8');

console.log('✅ App.tsx has been updated successfully!');
console.log(`📦 Backup saved at ${backupPath}`);
