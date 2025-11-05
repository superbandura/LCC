import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TaskForce, OperationalArea, Unit, UnitCategory, CommandPoints, TurnState, PendingDeployments, Card, PurchasedCards } from '../types';
import { CloseIcon } from './Icons';
import UnitCard from './UnitCard';
import UnitEncyclopediaModal from './UnitEncyclopediaModal';
import UnitDetailModal from './UnitDetailModal';
import { UNIT_CATEGORIES } from '../constants';

interface TaskForceModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskForces: TaskForce[];
  onSave: (updatedTaskForces: TaskForce[]) => void;
  operationalAreas: OperationalArea[];
  selectedFaction: 'us' | 'china';
  units: Unit[];
  onUnitsUpdate: (updatedUnits: Unit[]) => void;
  isAdmin: boolean;
  commandPoints: CommandPoints;
  onCommandPointsUpdate: (updatedPoints: CommandPoints) => void;
  turnState: TurnState;
  pendingDeployments: PendingDeployments;
  onPendingDeploymentsUpdate: (deployments: PendingDeployments) => void;
  calculateActivationTiming: (turnState: TurnState, deploymentTime: number) => { activatesAtTurn: number; activatesAtDay: number };
  cards: Card[]; // Cards for displaying attached cards in UnitDetailModal
  purchasedCards: PurchasedCards;
  onPurchasedCardsUpdate: (updatedCards: PurchasedCards) => void;
}

const TaskForceModal: React.FC<TaskForceModalProps> = ({
  isOpen,
  onClose,
  taskForces,
  onSave,
  operationalAreas,
  selectedFaction,
  units,
  onUnitsUpdate,
  isAdmin,
  commandPoints,
  onCommandPointsUpdate,
  turnState,
  pendingDeployments,
  onPendingDeploymentsUpdate,
  calculateActivationTiming,
  cards,
  purchasedCards,
  onPurchasedCardsUpdate
}) => {
  const [editedTaskForces, setEditedTaskForces] = useState<TaskForce[]>([]);
  const [editedUnits, setEditedUnits] = useState<Unit[]>([]);
  const [selectedTaskForceId, setSelectedTaskForceId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTaskForce, setNewTaskForce] = useState<Partial<TaskForce>>({
    name: '',
    faction: selectedFaction,
    operationalAreaId: '',
  });

  // State for Command Points flash animation
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevCommandPoints, setPrevCommandPoints] = useState(commandPoints);

  // Track selected units from both panels
  const [selectedAvailableUnits, setSelectedAvailableUnits] = useState<Set<string>>(new Set());
  const [selectedAssignedUnits, setSelectedAssignedUnits] = useState<Set<string>>(new Set());

  // Track units to be assigned to the new Task Force being created
  const [newTaskForceUnits, setNewTaskForceUnits] = useState<Set<string>>(new Set());

  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory | 'all'>('all');

  // State for encyclopedia modal
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);

  // State for unit detail modal
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<Unit | null>(null);

  // Track previous isOpen state to detect when modal opens
  const prevIsOpenRef = useRef(false);

  const selectedTaskForce = editedTaskForces.find(tf => tf.id === selectedTaskForceId) || null;

  // Initialize state ONLY when modal opens (isOpen changes from false to true)
  useEffect(() => {
    // Only initialize if modal is opening (was closed, now open)
    if (isOpen && !prevIsOpenRef.current) {
      // Filter only task forces for the current faction
      const currentFactionTFs = taskForces.filter(tf => tf.faction === selectedFaction);
      setEditedTaskForces(JSON.parse(JSON.stringify(currentFactionTFs)));
      setEditedUnits(JSON.parse(JSON.stringify(units)));
      setIsCreatingNew(false);
      setSelectedTaskForceId(null);
      setSelectedAvailableUnits(new Set());
      setSelectedAssignedUnits(new Set());
      setNewTaskForceUnits(new Set());
      setNewTaskForce({
        name: '',
        faction: selectedFaction,
        operationalAreaId: '',
      });
    }
    // Update ref to track current state
    prevIsOpenRef.current = isOpen;
  }, [isOpen, taskForces, units, selectedFaction]);

  // Update editedUnits when units prop changes (to reflect embarked units immediately)
  useEffect(() => {
    if (isOpen) {
      setEditedUnits(JSON.parse(JSON.stringify(units)));
    }
  }, [units, isOpen]);

  // Detect Command Points decrease and trigger flash animation
  useEffect(() => {
    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
    const previousPoints = selectedFaction === 'us' ? prevCommandPoints.us : prevCommandPoints.china;

    // Check if Command Points decreased
    if (currentPoints < previousPoints) {
      setIsFlashing(true);
      // Remove flash after animation completes
      const timer = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(timer);
    }

    // Update previous Command Points
    setPrevCommandPoints(commandPoints);
  }, [commandPoints, selectedFaction, prevCommandPoints]);

  // Get units for current faction
  const factionUnits = useMemo(() => {
    const factionKey = selectedFaction === 'us' ? 'us' : 'china';
    return editedUnits.filter(u => u.faction === factionKey);
  }, [editedUnits, selectedFaction]);

  // Get available units (not assigned to any task force or the new task force being created)
  const availableUnits = useMemo(() => {
    const filtered = factionUnits.filter(u => {
      // Exclude units already assigned to existing task forces
      if (u.taskForceId) return false;
      // Exclude units selected for the new task force
      if (isCreatingNew && newTaskForceUnits.has(u.id)) return false;
      // Filter by category
      if (selectedCategory !== 'all' && u.category !== selectedCategory) return false;
      return true;
    });

    // Ordenar unidades por formación (agrupa ALPHA, BRAVO, etc.)
    return filtered.sort((a, b) => {
      // Extraer la formación (parte alfabética) del nombre
      const getFormation = (name: string): string => {
        // Buscar palabras en mayúsculas (ALPHA, BRAVO, CHARLIE, etc.)
        const match = name.match(/[A-Z]+(?=[^A-Z]*$)/);
        return match ? match[0] : name;
      };

      // Extraer el número de la unidad
      const getUnitNumber = (name: string): number => {
        // Buscar el primer número en el nombre
        const match = name.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const formationA = getFormation(a.name);
      const formationB = getFormation(b.name);
      const numberA = getUnitNumber(a.name);
      const numberB = getUnitNumber(b.name);

      // Primero ordenar por formación alfabéticamente
      if (formationA !== formationB) {
        return formationA.localeCompare(formationB);
      }

      // Si están en la misma formación, ordenar por número
      return numberA - numberB;
    });
  }, [factionUnits, isCreatingNew, newTaskForceUnits, selectedCategory]);

  // Count embarked units
  const embarkedUnitsCount = useMemo(() => {
    return factionUnits.filter(u => u.taskForceId?.startsWith('EMBARKED_')).length;
  }, [factionUnits]);

  // Get assigned units for selected task force or new task force
  const assignedUnits = useMemo(() => {
    let filtered: Unit[];

    if (isCreatingNew) {
      // Show units selected for the new task force
      filtered = factionUnits.filter(u => newTaskForceUnits.has(u.id));
    } else if (!selectedTaskForce) {
      return [];
    } else {
      filtered = factionUnits.filter(u => u.taskForceId === selectedTaskForce.id);
    }

    // Ordenar unidades por formación (agrupa ALPHA, BRAVO, etc.)
    return filtered.sort((a, b) => {
      // Extraer la formación (parte alfabética) del nombre
      const getFormation = (name: string): string => {
        // Buscar palabras en mayúsculas (ALPHA, BRAVO, CHARLIE, etc.)
        const match = name.match(/[A-Z]+(?=[^A-Z]*$)/);
        return match ? match[0] : name;
      };

      // Extraer el número de la unidad
      const getUnitNumber = (name: string): number => {
        // Buscar el primer número en el nombre
        const match = name.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const formationA = getFormation(a.name);
      const formationB = getFormation(b.name);
      const numberA = getUnitNumber(a.name);
      const numberB = getUnitNumber(b.name);

      // Primero ordenar por formación alfabéticamente
      if (formationA !== formationB) {
        return formationA.localeCompare(formationB);
      }

      // Si están en la misma formación, ordenar por número
      return numberA - numberB;
    });
  }, [factionUnits, selectedTaskForce, isCreatingNew, newTaskForceUnits]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    // Validaciones silenciosas (no alerts)
    if (!newTaskForce.name || !newTaskForce.operationalAreaId) {
      return;
    }

    // Validar puntos de mando disponibles
    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
    if (currentPoints < 2) {
      return;
    }

    const newTF: TaskForce = {
      id: `tf-${Date.now()}`,
      name: newTaskForce.name,
      faction: selectedFaction,
      operationalAreaId: newTaskForce.operationalAreaId,
      isDeployed: false, // Creada pero no desplegada
    };

    // Descontar 2 PM y guardar inmediatamente en Firestore
    const updatedPoints = { ...commandPoints };
    if (selectedFaction === 'us') {
      updatedPoints.us -= 2;
    } else {
      updatedPoints.china -= 2;
    }
    onCommandPointsUpdate(updatedPoints);

    // Asignar unidades seleccionadas a la nueva task force
    const updatedUnits = editedUnits.map(u =>
      newTaskForceUnits.has(u.id) ? { ...u, taskForceId: newTF.id } : u
    );
    setEditedUnits(updatedUnits);
    onUnitsUpdate(updatedUnits); // Guardar unidades inmediatamente

    // Añadir la nueva TF y guardar inmediatamente
    const otherFactionTFs = taskForces.filter(tf => tf.faction !== selectedFaction);
    const updated = [...editedTaskForces, newTF];
    const mergedTaskForces = [...otherFactionTFs, ...updated];

    onSave(mergedTaskForces);
    setEditedTaskForces(updated);
    setSelectedTaskForceId(newTF.id);
    setIsCreatingNew(false);
    setNewTaskForceUnits(new Set());
    setNewTaskForce({
      name: '',
      faction: selectedFaction,
      operationalAreaId: '',
    });
  };

  const handleDelete = (id: string) => {
    const tfToDelete = editedTaskForces.find(tf => tf.id === id);
    if (!tfToDelete) return;

    // Validar puntos de mando disponibles
    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
    if (currentPoints < 1) {
      return;
    }

    // Descontar 1 PM y guardar inmediatamente
    const updatedPoints = { ...commandPoints };
    if (selectedFaction === 'us') {
      updatedPoints.us -= 1;
    } else {
      updatedPoints.china -= 1;
    }
    onCommandPointsUpdate(updatedPoints);

    // Unassign all units from this task force
    const updatedUnits = editedUnits.map(u =>
      u.taskForceId === id ? { ...u, taskForceId: null } : u
    );
    setEditedUnits(updatedUnits);
    onUnitsUpdate(updatedUnits); // Guardar unidades inmediatamente

    // Remove task force y guardar inmediatamente
    const updated = editedTaskForces.filter(tf => tf.id !== id);
    const otherFactionTFs = taskForces.filter(tf => tf.faction !== selectedFaction);
    const mergedTaskForces = [...otherFactionTFs, ...updated];

    onSave(mergedTaskForces);
    setEditedTaskForces(updated);

    if (selectedTaskForceId === id) {
      setSelectedTaskForceId(null);
    }
  };

  const handleUpdateTaskForce = (id: string, field: keyof TaskForce, value: any) => {
    const updated = editedTaskForces.map(tf =>
      tf.id === id ? { ...tf, [field]: value } : tf
    );
    setEditedTaskForces(updated);

    // Guardar inmediatamente
    const otherFactionTFs = taskForces.filter(tf => tf.faction !== selectedFaction);
    const mergedTaskForces = [...otherFactionTFs, ...updated];
    onSave(mergedTaskForces);
  };

  // Toggle selection for available units
  const toggleAvailableUnit = (unitId: string) => {
    const newSelection = new Set(selectedAvailableUnits);
    if (newSelection.has(unitId)) {
      newSelection.delete(unitId);
    } else {
      newSelection.add(unitId);
    }
    setSelectedAvailableUnits(newSelection);
  };

  // Toggle selection for assigned units - prevent selection of destroyed units
  const toggleAssignedUnit = (unitId: string) => {
    // Check if unit is destroyed
    const unit = editedUnits.find(u => u.id === unitId);
    if (unit) {
      const damageCount = unit.currentDamage.filter(d => d).length;
      const isDestroyed = damageCount === unit.damagePoints;

      // Don't allow selecting destroyed units for removal
      if (isDestroyed) {
        return;
      }
    }

    const newSelection = new Set(selectedAssignedUnits);
    if (newSelection.has(unitId)) {
      newSelection.delete(unitId);
    } else {
      newSelection.add(unitId);
    }
    setSelectedAssignedUnits(newSelection);
  };

  // Remove unit from new task force being created or from non-deployed task force
  const handleRemoveUnitFromNew = (unitId: string) => {
    // Find the unit
    const unit = editedUnits.find(u => u.id === unitId);
    if (!unit) return;

    // Remove from newTaskForceUnits set if creating new
    if (isCreatingNew) {
      const updatedNewTFUnits = new Set(newTaskForceUnits);
      updatedNewTFUnits.delete(unitId);
      setNewTaskForceUnits(updatedNewTFUnits);
    }

    // Handle attached card if exists
    let updatedUnits = [...editedUnits];
    let updatedPurchasedCards = { ...purchasedCards };

    if (unit.attachedCard) {
      const attachedCard = cards.find(c => c.id === unit.attachedCard);

      if (attachedCard) {
        // Revert HP bonus
        let newDamagePoints = unit.damagePoints;
        let newCurrentDamage = [...unit.currentDamage];

        if (attachedCard.hpBonus) {
          newDamagePoints -= attachedCard.hpBonus;
          // Truncate damage array to new size
          newCurrentDamage = newCurrentDamage.slice(0, newDamagePoints);

          // Check if unit would be destroyed after removing bonus
          const damageCount = newCurrentDamage.filter(d => d).length;
          if (damageCount >= newDamagePoints) {
            // Cannot remove card - unit would be destroyed
            return;
          }
        }

        // Revert secondary ammo bonus
        let newSecondaryAmmo = unit.attackSecondary;
        let newSecondaryUsed = unit.attackSecondaryUsed;

        if (attachedCard.secondaryAmmoBonus && unit.attackSecondary !== undefined) {
          newSecondaryAmmo = unit.attackSecondary - attachedCard.secondaryAmmoBonus;
          // Adjust used ammo if it exceeds new limit
          if (unit.attackSecondaryUsed !== undefined && unit.attackSecondaryUsed > newSecondaryAmmo) {
            newSecondaryUsed = newSecondaryAmmo;
          }
        }

        // Update unit: remove card and revert bonuses
        updatedUnits = updatedUnits.map(u =>
          u.id === unitId
            ? {
                ...u,
                attachedCard: undefined,
                taskForceId: undefined,
                damagePoints: newDamagePoints,
                currentDamage: newCurrentDamage,
                attackSecondary: newSecondaryAmmo,
                attackSecondaryUsed: newSecondaryUsed
              }
            : u
        );

        // Add card back to purchased cards as a new instance
        const factionKey = selectedFaction === 'us' ? 'us' : 'china';
        const newInstance = {
          instanceId: `${unit.attachedCard}_${Date.now()}`,
          cardId: unit.attachedCard,
          purchasedAt: Date.now(),
        };
        updatedPurchasedCards[factionKey] = [...purchasedCards[factionKey], newInstance];
      } else {
        // Card not found in catalog - just remove reference
        updatedUnits = updatedUnits.map(u =>
          u.id === unitId ? { ...u, attachedCard: undefined, taskForceId: undefined } : u
        );
      }
    } else {
      // No attached card - just clear taskForceId
      updatedUnits = updatedUnits.map(u =>
        u.id === unitId ? { ...u, taskForceId: undefined } : u
      );
    }

    // Update state and Firestore
    setEditedUnits(updatedUnits);
    onUnitsUpdate(updatedUnits);

    if (unit.attachedCard) {
      onPurchasedCardsUpdate(updatedPurchasedCards);
    }
  };

  // Add selected units to current task force or new task force
  const handleAddUnits = () => {
    // Validaciones silenciosas (no alerts)
    if (selectedAvailableUnits.size === 0) {
      return;
    }

    if (isCreatingNew) {
      // Add units to the new task force being created
      const updatedNewTFUnits = new Set(newTaskForceUnits);
      selectedAvailableUnits.forEach(id => updatedNewTFUnits.add(id));
      setNewTaskForceUnits(updatedNewTFUnits);
      setSelectedAvailableUnits(new Set());
    } else {
      // Add units to existing task force
      if (!selectedTaskForce) {
        return;
      }

      // Si la TF está desplegada, cobrar el coste de despliegue de las nuevas unidades
      const isDeployed = selectedTaskForce.isDeployed ?? true;

      if (isDeployed) {
        // Obtener las unidades seleccionadas
        const unitsToAdd = editedUnits.filter(u => selectedAvailableUnits.has(u.id));

        // Calcular coste total de despliegue de las nuevas unidades
        const deploymentCost = unitsToAdd.reduce((total, unit) => {
          return total + (unit.deploymentCost ?? 0);
        }, 0);

        // Validar puntos disponibles
        const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
        if (currentPoints < deploymentCost) {
          return;
        }

        // Descontar puntos de mando si hay coste
        if (deploymentCost > 0) {
          const updatedPoints = { ...commandPoints };
          if (selectedFaction === 'us') {
            updatedPoints.us -= deploymentCost;
          } else {
            updatedPoints.china -= deploymentCost;
          }
          onCommandPointsUpdate(updatedPoints);
        }

        // Handle deployment time for reinforcements
        const deploymentTime = 2; // Fixed 2 days for reinforcements

        if (turnState.isPlanningPhase) {
          // Immediate assignment in planning phase
          const updatedUnits = editedUnits.map(u =>
            selectedAvailableUnits.has(u.id) ? { ...u, taskForceId: selectedTaskForce.id } : u
          );
          setEditedUnits(updatedUnits);
          onUnitsUpdate(updatedUnits);
        } else {
          // Add as pending reinforcements (2 days delay)
          const timing = calculateActivationTiming(turnState, deploymentTime);

          // Assign units to TF but mark as pending
          const updatedUnits = editedUnits.map(u =>
            selectedAvailableUnits.has(u.id)
              ? { ...u, taskForceId: selectedTaskForce.id, isPendingDeployment: true, deploymentTime }
              : u
          );
          setEditedUnits(updatedUnits);
          onUnitsUpdate(updatedUnits);

          // Create pending unit deployments
          const newPendingUnits: import('../types').PendingUnitDeployment[] = unitsToAdd.map(unit => ({
            unitId: unit.id,
            taskForceId: selectedTaskForce.id,
            faction: selectedFaction,
            deployedAtTurn: turnState.turnNumber,
            deployedAtDay: turnState.dayOfWeek,
            activatesAtTurn: timing.activatesAtTurn,
            activatesAtDay: timing.activatesAtDay,
          }));

          const updatedPending = {
            ...pendingDeployments,
            units: [...pendingDeployments.units, ...newPendingUnits],
          };
          onPendingDeploymentsUpdate(updatedPending);

          console.log(`${unitsToAdd.length} reinforcement(s) scheduled for ${selectedTaskForce.name}. ETA: Turn ${timing.activatesAtTurn}, Day ${timing.activatesAtDay}`);
        }
      } else {
        // TF not deployed yet, immediate assignment without cost
        const updatedUnits = editedUnits.map(u =>
          selectedAvailableUnits.has(u.id) ? { ...u, taskForceId: selectedTaskForce.id } : u
        );
        setEditedUnits(updatedUnits);
        onUnitsUpdate(updatedUnits);
      }

      setSelectedAvailableUnits(new Set());
    }
  };

  // Remove selected units from current task force or new task force
  const handleRemoveUnits = () => {
    // Validaciones silenciosas (no alerts)
    if (selectedAssignedUnits.size === 0) {
      return;
    }

    if (isCreatingNew) {
      // Remove units from the new task force being created (sin coste)
      const updatedNewTFUnits = new Set(newTaskForceUnits);
      selectedAssignedUnits.forEach(id => updatedNewTFUnits.delete(id));
      setNewTaskForceUnits(updatedNewTFUnits);
      setSelectedAssignedUnits(new Set());
    } else if (selectedTaskForce) {
      const isDeployed = selectedTaskForce.isDeployed ?? true; // Por defecto true para TF antiguas

      // Si la TF está desplegada, cobrar 1 PM por remover unidades
      if (isDeployed) {
        // Validar puntos de mando disponibles
        const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
        if (currentPoints < 1) {
          return;
        }

        // Descontar 1 PM y guardar inmediatamente
        const updatedPoints = { ...commandPoints };
        if (selectedFaction === 'us') {
          updatedPoints.us -= 1;
        } else {
          updatedPoints.china -= 1;
        }
        onCommandPointsUpdate(updatedPoints);
      }

      // Remove units from existing task force
      const updatedUnits = editedUnits.map(u =>
        selectedAssignedUnits.has(u.id) ? { ...u, taskForceId: null } : u
      );
      setEditedUnits(updatedUnits);
      onUnitsUpdate(updatedUnits); // Guardar inmediatamente
      setSelectedAssignedUnits(new Set());
    }
  };

  // Deploy a task force to an operational area
  const handleDeploy = () => {
    if (!selectedTaskForce) return;

    // Validaciones silenciosas (no alerts)
    if (!selectedTaskForce.operationalAreaId) {
      return;
    }

    // Obtener unidades asignadas a esta TF
    const tfUnits = editedUnits.filter(u => u.taskForceId === selectedTaskForce.id);

    // Calcular coste total de despliegue
    const deploymentCost = tfUnits.reduce((total, unit) => {
      return total + (unit.deploymentCost ?? 0);
    }, 0);

    // Validar puntos disponibles
    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
    if (currentPoints < deploymentCost) {
      return;
    }

    // Descontar puntos de mando y guardar inmediatamente
    const updatedPoints = { ...commandPoints };
    if (selectedFaction === 'us') {
      updatedPoints.us -= deploymentCost;
    } else {
      updatedPoints.china -= deploymentCost;
    }
    onCommandPointsUpdate(updatedPoints);

    const deploymentTime = 2; // Fixed deployment time for Task Forces

    if (turnState.isPlanningPhase) {
      // Immediate deployment in planning phase
      const updated = editedTaskForces.map(tf =>
        tf.id === selectedTaskForce.id ? { ...tf, isDeployed: true } : tf
      );

      const otherFactionTFs = taskForces.filter(tf => tf.faction !== selectedFaction);
      const mergedTaskForces = [...otherFactionTFs, ...updated];

      onSave(mergedTaskForces);
      setEditedTaskForces(updated);
    } else {
      // Add to pending deployments
      const timing = calculateActivationTiming(turnState, deploymentTime);

      // Mark TF as deployed but pending
      const updated = editedTaskForces.map(tf =>
        tf.id === selectedTaskForce.id
          ? { ...tf, isDeployed: true, isPendingDeployment: true }
          : tf
      );

      const otherFactionTFs = taskForces.filter(tf => tf.faction !== selectedFaction);
      const mergedTaskForces = [...otherFactionTFs, ...updated];

      onSave(mergedTaskForces);
      setEditedTaskForces(updated);

      // Add to pending deployments
      const newPendingTF: import('../types').PendingTaskForceDeployment = {
        taskForceId: selectedTaskForce.id,
        faction: selectedFaction,
        deployedAtTurn: turnState.turnNumber,
        deployedAtDay: turnState.dayOfWeek,
        activatesAtTurn: timing.activatesAtTurn,
        activatesAtDay: timing.activatesAtDay,
      };

      // Also mark units as pending
      const updatedUnits = editedUnits.map(u => {
        if (u.taskForceId === selectedTaskForce.id) {
          return { ...u, isPendingDeployment: true };
        }
        return u;
      });
      onUnitsUpdate(updatedUnits);
      setEditedUnits(updatedUnits);

      // Create pending unit deployments
      const newPendingUnits: import('../types').PendingUnitDeployment[] = tfUnits.map(unit => ({
        unitId: unit.id,
        taskForceId: selectedTaskForce.id,
        faction: selectedFaction,
        deployedAtTurn: turnState.turnNumber,
        deployedAtDay: turnState.dayOfWeek,
        activatesAtTurn: timing.activatesAtTurn,
        activatesAtDay: timing.activatesAtDay,
      }));

      const updatedPending = {
        ...pendingDeployments,
        taskForces: [...pendingDeployments.taskForces, newPendingTF],
        units: [...pendingDeployments.units, ...newPendingUnits],
      };
      onPendingDeploymentsUpdate(updatedPending);

      console.log(`Task Force ${selectedTaskForce.name} scheduled for deployment. ETA: Turn ${timing.activatesAtTurn}, Day ${timing.activatesAtDay}`);
    }
  };

  // Handle info icon click - open unit detail modal
  const handleInfoClick = (unitId: string) => {
    const unit = editedUnits.find(u => u.id === unitId);
    if (unit) {
      setSelectedUnitForDetail(unit);
    }
  };

  // Handle save from unit detail modal
  const handleUnitDetailSave = (updatedUnit: Unit) => {
    const updatedUnits = editedUnits.map(u =>
      u.id === updatedUnit.id ? updatedUnit : u
    );
    setEditedUnits(updatedUnits);
    onUnitsUpdate(updatedUnits); // Guardar inmediatamente
  };

  const getFactionName = (faction: 'us' | 'china') => {
    return faction === 'us' ? 'UNITED STATES' : 'CHINA';
  };

  const getAreaName = (areaId: string) => {
    const area = operationalAreas.find(a => a.id === areaId);
    return area ? area.name : 'Area not found';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-green-900 shrink-0 bg-black/40">
          <div>
            <h2 className="text-2xl font-mono font-bold text-green-400 uppercase tracking-wider">TASK FORCE COMMAND</h2>
            <p className="text-xs font-mono text-gray-400 mt-2 tracking-wide">
              FACTION: <span className="font-semibold text-green-400">{getFactionName(selectedFaction)}</span>
              <span className="text-gray-600 ml-4">| COMMAND POINTS: <span className={`font-bold text-lg px-2 py-1 rounded transition-all duration-300 ${isFlashing ? 'text-red-500 bg-red-900/50 scale-110 shadow-lg shadow-red-500/50' : 'text-green-400'}`}>{selectedFaction === 'us' ? commandPoints.us : commandPoints.china}</span></span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEncyclopediaOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-mono text-xs uppercase tracking-wide transition-colors flex items-center gap-2"
              title="View Unit Roster"
            >
              <span className="text-lg">📚</span>
              <span>ROSTER</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-green-400 transition-colors"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content - 3 Column Layout */}
        <div className="flex-1 overflow-hidden p-6 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            {/* Left Column - Available Units (33%) */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-0">
              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded flex flex-col h-full min-h-0">
                <h3 className="text-sm font-mono font-semibold text-green-400 uppercase tracking-wide mb-3 shrink-0 border-b border-green-900 pb-2">
                  AVAILABLE UNITS
                </h3>
                <p className="text-xs font-mono text-gray-400 mb-1 shrink-0">
                  {availableUnits.length} units unassigned
                </p>
                {embarkedUnitsCount > 0 && (
                  <p className="text-xs font-mono text-yellow-400 mb-2 shrink-0">
                    ({embarkedUnitsCount} {embarkedUnitsCount === 1 ? 'embarked unit' : 'embarked units'})
                  </p>
                )}

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 justify-center mb-3 shrink-0">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`rounded transition-all border-4 inline-block ${
                      selectedCategory === 'all'
                        ? 'border-green-500 scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title="All"
                  >
                    <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center">
                      <span className="text-xl text-white">∞</span>
                    </div>
                  </button>
                  {UNIT_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`rounded-lg transition-all border-4 inline-block ${
                        selectedCategory === cat.value
                          ? 'scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={selectedCategory === cat.value ? {
                        borderColor: cat.color === 'bg-green-700' ? '#15803d' :
                                     cat.color === 'bg-blue-700' ? '#1d4ed8' :
                                     cat.color === 'bg-red-700' ? '#b91c1c' :
                                     cat.color === 'bg-purple-700' ? '#7e22ce' :
                                     cat.color === 'bg-yellow-700' ? '#a16207' : 'transparent'
                      } : undefined}
                      title={cat.label}
                    >
                      <img src={cat.iconPath} alt={cat.label} className="w-8 h-8 rounded block" />
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto mb-3 border border-gray-800 rounded p-2 bg-black/40" style={{height: '450px'}}>
                  {availableUnits.length === 0 ? (
                    <div className="text-gray-500 font-mono text-center py-12 text-xs uppercase tracking-wide">
                      No units available.
                      <br />
                      All assigned.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableUnits.map(unit => (
                        <UnitCard
                          key={unit.id}
                          unit={unit}
                          compact={true}
                          isSelected={selectedAvailableUnits.has(unit.id)}
                          onClick={() => toggleAvailableUnit(unit.id)}
                          onInfoClick={handleInfoClick}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Add button */}
                <button
                  onClick={handleAddUnits}
                  disabled={selectedAvailableUnits.size === 0 || (!isCreatingNew && !selectedTaskForce)}
                  className={`
                    w-full py-2 rounded font-mono font-medium transition-colors text-xs uppercase tracking-wide flex items-center justify-center gap-2 shrink-0
                    ${selectedAvailableUnits.size === 0 || (!isCreatingNew && !selectedTaskForce)
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800'
                      : 'bg-green-600 hover:bg-green-700 text-white border border-green-500'}
                  `}
                  title={!isCreatingNew && !selectedTaskForce ? 'Select a Task Force first' : 'Assign selected units'}
                >
                  <span>ASSIGN</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs">
                    ({selectedAvailableUnits.size})
                    {!isCreatingNew && selectedTaskForce && (selectedTaskForce.isDeployed ?? true) && selectedAvailableUnits.size > 0 && (
                      <> -{editedUnits.filter(u => selectedAvailableUnits.has(u.id)).reduce((total, unit) => total + (unit.deploymentCost ?? 0), 0)} CP</>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Center Column - Task Force Form + Assigned Units (42%) */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-0">
              {isCreatingNew ? (
                <div className="bg-gray-900/50 border border-gray-800 p-4 rounded flex flex-col h-full">
                  <h3 className="text-sm font-mono font-semibold text-green-400 uppercase tracking-wide mb-4 border-b border-green-900 pb-2">CREATE NEW TASK FORCE</h3>

                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="block text-xs font-mono font-medium text-gray-300 mb-2 uppercase tracking-wide">
                        DESIGNATION *
                      </label>
                      <input
                        type="text"
                        value={newTaskForce.name}
                        onChange={(e) => setNewTaskForce({ ...newTaskForce, name: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-white font-mono text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. Task Force Alpha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-medium text-gray-300 mb-2 uppercase tracking-wide">
                        OPERATIONAL AREA *
                      </label>
                      <select
                        value={newTaskForce.operationalAreaId || ''}
                        onChange={(e) => setNewTaskForce({ ...newTaskForce, operationalAreaId: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-white font-mono text-sm focus:outline-none focus:border-green-500"
                      >
                        <option value="">Select area</option>
                        {operationalAreas.map(area => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleCreateNew}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono font-medium transition-colors text-xs uppercase tracking-wide border border-green-500"
                      >
                        CREATE (-2 CP)
                      </button>
                      <button
                        onClick={() => {
                          setIsCreatingNew(false);
                          setNewTaskForceUnits(new Set());
                          setSelectedAvailableUnits(new Set());
                          setSelectedAssignedUnits(new Set());
                        }}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-mono font-medium transition-colors text-xs uppercase tracking-wide border border-gray-800"
                      >
                        CANCEL
                      </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded">
                      <h4 className="text-xs font-mono font-semibold text-blue-300 mb-2 uppercase tracking-wide">DEPLOYMENT PROTOCOL</h4>
                      <ol className="text-xs font-mono text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Create TF with designation + area (cost: 2 CP)</li>
                        <li>Assign units from left panel</li>
                        <li>Press "DEPLOY" button (cost: sum of units)</li>
                      </ol>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded">
                      <p className="text-xs font-mono text-yellow-300 uppercase tracking-wide">
                        ⚠️ Command Points are non-recoverable
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedTaskForce ? (
                <div className="bg-gray-900/50 border border-gray-800 p-4 rounded flex flex-col h-full">
                  {(() => {
                    const isDeployed = selectedTaskForce.isDeployed ?? true;
                    const tfUnits = editedUnits.filter(u => u.taskForceId === selectedTaskForce.id);
                    const deploymentCost = tfUnits.reduce((total, unit) => total + (unit.deploymentCost ?? 0), 0);

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-3 shrink-0 border-b border-green-900 pb-2">
                          <h3 className="text-sm font-mono font-semibold text-green-400 uppercase tracking-wide">
                            {isDeployed ? 'TASK FORCE DEPLOYED' : 'CONFIGURE TASK FORCE'}
                          </h3>
                          {!isDeployed && (
                            <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-600 rounded text-yellow-300 text-xs font-mono font-semibold uppercase">
                              ⏸️ STAGING
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 mb-3 shrink-0">
                          <div>
                            <label className="block text-xs font-mono font-medium text-gray-300 mb-2 uppercase tracking-wide">
                              DESIGNATION *
                            </label>
                            <input
                              type="text"
                              value={selectedTaskForce.name}
                              onChange={(e) => handleUpdateTaskForce(selectedTaskForce.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-white font-mono text-sm focus:outline-none focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-medium text-gray-300 mb-2 uppercase tracking-wide">
                              OPERATIONAL AREA *
                            </label>
                            <select
                              value={selectedTaskForce.operationalAreaId || ''}
                              onChange={(e) => handleUpdateTaskForce(selectedTaskForce.id, 'operationalAreaId', e.target.value)}
                              className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-white font-mono text-sm focus:outline-none focus:border-green-500"
                              disabled={isDeployed}
                            >
                              <option value="">Select area</option>
                              {operationalAreas.map(area => (
                                <option key={area.id} value={area.id}>
                                  {area.name}
                                </option>
                              ))}
                            </select>
                            {isDeployed && (
                              <p className="text-xs font-mono text-gray-500 mt-1">
                                Area cannot be changed once deployed
                              </p>
                            )}
                          </div>

                          {!isDeployed && tfUnits.length > 0 && (
                            <div className="p-3 bg-blue-900/20 border border-blue-600/50 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-mono font-medium text-blue-300 uppercase tracking-wide">Deployment Cost</p>
                                  <p className="text-xs font-mono text-gray-400 mt-1">{tfUnits.length} unit(s)</p>
                                </div>
                                <p className="text-2xl font-mono font-bold text-yellow-400">
                                  {deploymentCost} CP
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Assigned Units */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex justify-between items-center mb-2 shrink-0">
                            <label className="block text-xs font-mono font-medium text-gray-300 uppercase tracking-wide">
                              ASSIGNED UNITS ({assignedUnits.length})
                            </label>
                          </div>

                          <div className="flex-1 overflow-y-auto mb-3 p-3 border-2 border-dashed border-gray-800 rounded bg-black/40 min-h-0">
                            {assignedUnits.length === 0 ? (
                              <div className="text-gray-500 font-mono text-center py-12 text-xs uppercase tracking-wide">
                                No units assigned.
                                <br />
                                Select units from left panel
                                <br />
                                and use "ASSIGN" button
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {assignedUnits.map(unit => (
                                  <UnitCard
                                    key={unit.id}
                                    unit={unit}
                                    compact={true}
                                    isSelected={selectedAssignedUnits.has(unit.id)}
                                    onClick={() => toggleAssignedUnit(unit.id)}
                                    onInfoClick={handleInfoClick}
                                    onRemove={(isCreatingNew || !isDeployed) ? () => handleRemoveUnitFromNew(unit.id) : undefined}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Deploy or Remove button */}
                          {!isDeployed ? (
                            <button
                              onClick={handleDeploy}
                              disabled={!selectedTaskForce.operationalAreaId || tfUnits.length === 0}
                              className={`
                                w-full py-2 rounded font-mono font-medium transition-colors text-xs uppercase tracking-wide flex items-center justify-center gap-2 shrink-0
                                ${!selectedTaskForce.operationalAreaId || tfUnits.length === 0
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500'}
                              `}
                              title={!selectedTaskForce.operationalAreaId ? 'Select an operational area' : tfUnits.length === 0 ? 'Add at least one unit' : 'Deploy Task Force'}
                            >
                              <span>🚀</span>
                              <span>DEPLOY</span>
                              {deploymentCost > 0 && <span className="text-xs">(-{deploymentCost} CP)</span>}
                            </button>
                          ) : (
                            <button
                              onClick={handleRemoveUnits}
                              disabled={selectedAssignedUnits.size === 0}
                              className={`
                                w-full py-2 rounded font-mono font-medium transition-colors text-xs uppercase tracking-wide flex items-center justify-center gap-2 shrink-0
                                ${selectedAssignedUnits.size === 0
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800'
                                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-500'}
                              `}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span>REMOVE (-1 CP)</span>
                              <span className="text-xs">({selectedAssignedUnits.size})</span>
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded flex items-center justify-center h-full">
                  <p className="text-gray-500 font-mono text-center text-xs uppercase tracking-wide">
                    Select a Task Force to edit
                    <br />or create a new one from right panel
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Task Forces List (25%) */}
            <div className="lg:col-span-3 flex flex-col h-full min-h-0">
              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 shrink-0 border-b border-green-900 pb-3">
                  <h3 className="text-sm font-mono font-semibold text-green-400 uppercase tracking-wide">TASK FORCES</h3>
                  <button
                    onClick={() => {
                      setIsCreatingNew(true);
                      setSelectedTaskForceId(null);
                      setSelectedAvailableUnits(new Set());
                      setSelectedAssignedUnits(new Set());
                      setNewTaskForceUnits(new Set());
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-mono text-xs font-medium uppercase tracking-wide transition-colors border border-green-500"
                  >
                    + NEW
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {editedTaskForces.length === 0 ? (
                    <div className="text-gray-500 font-mono text-center py-12 text-xs uppercase tracking-wide">
                      No Task Forces.
                      <br />
                      Create a new one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editedTaskForces.map(tf => {
                        // Calculate operational vs destroyed units
                        const tfUnits = factionUnits.filter(u => u.taskForceId === tf.id);
                        const operationalCount = tfUnits.filter(u => {
                          const damageCount = u.currentDamage.filter(d => d).length;
                          return damageCount < u.damagePoints;
                        }).length;
                        const destroyedCount = tfUnits.filter(u => {
                          const damageCount = u.currentDamage.filter(d => d).length;
                          return damageCount === u.damagePoints;
                        }).length;

                        // Calculate category counts (only operational units)
                        const operationalUnits = tfUnits.filter(u => {
                          const damageCount = u.currentDamage.filter(d => d).length;
                          return damageCount < u.damagePoints;
                        });
                        const categoryCounts = {
                          ground: operationalUnits.filter(u => u.category === 'ground').length,
                          naval: operationalUnits.filter(u => u.category === 'naval').length,
                          artillery: operationalUnits.filter(u => u.category === 'artillery').length,
                          interception: operationalUnits.filter(u => u.category === 'interception').length,
                          supply: operationalUnits.filter(u => u.category === 'supply').length,
                        };

                        return (
                          <div
                            key={tf.id}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                              selectedTaskForceId === tf.id
                                ? 'bg-green-900/30 border-green-500 ring-2 ring-green-500'
                                : 'bg-black/40 border-gray-800 hover:border-gray-700'
                            }`}
                            onClick={() => {
                              setSelectedTaskForceId(tf.id);
                              setIsCreatingNew(false);
                              setSelectedAvailableUnits(new Set());
                              setSelectedAssignedUnits(new Set());
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-mono font-semibold text-white text-xs truncate uppercase">{tf.name}</h4>
                                  {(tf.isDeployed ?? true) ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-green-900/50 border border-green-600 text-green-300">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-yellow-900/50 border border-yellow-600 text-yellow-300">
                                      ⏸️
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-mono text-gray-500 truncate">
                                  {tf.operationalAreaId ? getAreaName(tf.operationalAreaId) : 'No area assigned'}
                                </p>
                                <div className="flex flex-col gap-1 mt-2">
                                  {/* Row 1: Status + Ground/Naval */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-green-900 text-green-300">
                                      ⚡ {operationalCount}
                                    </span>
                                    {destroyedCount > 0 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-red-900 text-red-300">
                                        💀 {destroyedCount}
                                      </span>
                                    )}
                                    {categoryCounts.ground > 0 && (
                                      <span className="text-xs font-mono text-green-400">🟢 {categoryCounts.ground}</span>
                                    )}
                                    {categoryCounts.naval > 0 && (
                                      <span className="text-xs font-mono text-blue-400">⚓ {categoryCounts.naval}</span>
                                    )}
                                  </div>
                                  {/* Row 2: Artillery/Interception/Supply */}
                                  {(categoryCounts.artillery > 0 || categoryCounts.interception > 0 || categoryCounts.supply > 0) && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {categoryCounts.artillery > 0 && (
                                        <span className="text-xs font-mono text-red-400">🔴 {categoryCounts.artillery}</span>
                                      )}
                                      {categoryCounts.interception > 0 && (
                                        <span className="text-xs font-mono text-purple-400">🟣 {categoryCounts.interception}</span>
                                      )}
                                      {categoryCounts.supply > 0 && (
                                        <span className="text-xs font-mono text-blue-400">🔵 {categoryCounts.supply}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(tf.id);
                                }}
                                className="text-red-400 hover:text-red-300 font-mono text-sm shrink-0"
                                title="Delete Task Force"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-green-900 shrink-0 bg-black/40">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-mono font-medium uppercase tracking-wide text-xs transition-colors border border-gray-800"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Unit Encyclopedia Modal */}
      <UnitEncyclopediaModal
        isOpen={isEncyclopediaOpen}
        onClose={() => setIsEncyclopediaOpen(false)}
        units={editedUnits}
        onUnitsUpdate={(updated) => {
          setEditedUnits(updated);
          onUnitsUpdate(updated); // Guardar inmediatamente en Firestore
        }}
        isAdmin={isAdmin}
        selectedFaction={selectedFaction}
      />

      {/* Unit Detail Modal */}
      {selectedUnitForDetail && (
        <UnitDetailModal
          unit={selectedUnitForDetail}
          onClose={() => setSelectedUnitForDetail(null)}
          onSave={handleUnitDetailSave}
          isAdmin={isAdmin}
          cards={cards}
        />
      )}
    </div>
  );
};

export default TaskForceModal;
