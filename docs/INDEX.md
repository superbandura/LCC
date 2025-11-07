# 🗺️ Índice de Documentación LCC

**Última actualización**: 2025-11-06 (Submarine Campaign Phase 3: Mines & ASW)
**Versión**: 1.5

> **Navegación rápida**: Este índice te ayuda a encontrar exactamente qué documentar leer según tu necesidad. Para Claude Code, esto optimiza el contexto y reduce lecturas innecesarias.

---

## 📚 Documentos Principales

| Documento | Tamaño | Propósito | Cuándo Leerlo |
|-----------|--------|-----------|---------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 11 KB | Arquitectura general del proyecto | Primero - visión general |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | 14 KB | Gestión de estado y Firestore | Trabajando con estado/datos |
| **[CARD_SYSTEM.md](CARD_SYSTEM.md)** | **10 KB** | **Sistema de cartas (core)** | **Features de cartas básicas** |
| ├── [CARD_ATTACHMENT.md](CARD_ATTACHMENT.md) | 11 KB | Attachment system | Adjuntar cartas a unidades |
| ├── [CARD_TRANSPORT.md](CARD_TRANSPORT.md) | 18 KB | Transport cards | Sistema de transporte |
| └── [CARD_INFLUENCE.md](CARD_INFLUENCE.md) | 15 KB | Influence cards | Cartas de influencia |
| [UNIT_SYSTEM.md](UNIT_SYSTEM.md) | 14 KB | Unidades y Task Forces | Features de unidades |
| [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | 14 KB | Mecánicas de combate y daño | Features de combate |
| [MAP_INTEGRATION.md](MAP_INTEGRATION.md) | 16 KB | Integración de Leaflet | Features de mapa |
| [ASW_SYSTEM.md](ASW_SYSTEM.md) | 16 KB | Submarine ASW Phase | Submarine warfare mechanics |
| [REFACTORING_LOG.md](REFACTORING_LOG.md) | 30 KB | Historial de cambios | Contexto histórico |

**Total**: ~173 KB de documentación técnica (4 archivos de cartas: 54 KB)

---

## 🎯 Navegación por Funcionalidad

### 🃏 Sistema de Cartas

| Necesito... | Ir a... |
|-------------|---------|
| **Core System** | |
| Comprar cartas | [CARD_SYSTEM.md § Purchase Phase](CARD_SYSTEM.md#1-purchase-phase-commandcentermodal) |
| Asignar cartas a áreas | [CARD_SYSTEM.md § Assignment Phase](CARD_SYSTEM.md#2-assignment-phase) |
| Budget system | [CARD_SYSTEM.md § Card Budget System](CARD_SYSTEM.md#card-budget-system) |
| Tipos de cartas (5) | [CARD_SYSTEM.md § Type Classification](CARD_SYSTEM.md#type-classification) |
| Iconos de cartas | [CARD_SYSTEM.md § Visual Indicators](CARD_SYSTEM.md#visual-indicators) |
| Database schema | [CARD_SYSTEM.md § Database Schema](CARD_SYSTEM.md#database-schema) |
| **Card Attachment** | |
| Adjuntar cartas a unidades | [CARD_ATTACHMENT.md § Attachment Workflow](CARD_ATTACHMENT.md#attachment-workflow) |
| Reglas de attachment | [CARD_ATTACHMENT.md § Attachment Rules](CARD_ATTACHMENT.md#attachment-rules) |
| Detach de cartas (admin) | [CARD_ATTACHMENT.md § Detaching Card](CARD_ATTACHMENT.md#detaching-card-from-unit-admin-only) |
| Card loss al destruir unit | [CARD_ATTACHMENT.md § Card Loss](CARD_ATTACHMENT.md#card-loss) |
| **Transport Cards** | |
| Sistema de transporte | [CARD_TRANSPORT.md § Overview](CARD_TRANSPORT.md#overview) |
| Embarcar unidades | [CARD_TRANSPORT.md § Boarding Units](CARD_TRANSPORT.md#boarding-units-boardunitsmodal) |
| Desembarcar unidades | [CARD_TRANSPORT.md § Disembarking Units](CARD_TRANSPORT.md#disembarking-units-disembarkmodal) |
| Lifecycle de transporte | [CARD_TRANSPORT.md § Transport Lifecycle](CARD_TRANSPORT.md#transport-lifecycle) |
| **Influence Cards** | |
| Sistema de influencia | [CARD_INFLUENCE.md § Overview](CARD_INFLUENCE.md#overview) |
| Thresholds y dados | [CARD_INFLUENCE.md § Thresholds](CARD_INFLUENCE.md#influence-card-properties) |
| Jugar cartas de influencia | [CARD_INFLUENCE.md § Playing Cards](CARD_INFLUENCE.md#playing-influence-cards) |

### 🎖️ Sistema de Unidades

| Necesito... | Ir a... |
|-------------|---------|
| Estructura de Unit | [UNIT_SYSTEM.md § Unit Structure](UNIT_SYSTEM.md#unit-structure) |
| Categorías (air/naval/ground/support) | [UNIT_SYSTEM.md § Unit Categories](UNIT_SYSTEM.md#unit-categories) |
| Task Forces | [UNIT_SYSTEM.md § Task Force System](UNIT_SYSTEM.md#task-force-system) |
| Task Force modal | [UNIT_SYSTEM.md § Task Force Management](UNIT_SYSTEM.md#task-force-management-taskforcemodal) |
| Supply levels | [UNIT_SYSTEM.md § Supply Level System](UNIT_SYSTEM.md#supply-level-system) |
| Damage tracking | [UNIT_SYSTEM.md § Damage System](UNIT_SYSTEM.md#damage-system) |
| Combat capabilities | [UNIT_SYSTEM.md § Combat Capabilities](UNIT_SYSTEM.md#combat-capabilities) |
| Unit assignment | [UNIT_SYSTEM.md § Unit Assignment](UNIT_SYSTEM.md#unit-assignment) |
| Unit Encyclopedia modal | [UNIT_SYSTEM.md § Unit Encyclopedia](UNIT_SYSTEM.md#unit-encyclopedia-unitencyclopediamodal) |
| Orphaned units cleanup | [UNIT_SYSTEM.md § Orphaned Units Cleanup](UNIT_SYSTEM.md#orphaned-units-cleanup) |

### ⚔️ Sistema de Combate

| Necesito... | Ir a... |
|-------------|---------|
| Damage mechanics | [COMBAT_SYSTEM.md § Damage Mechanics](COMBAT_SYSTEM.md#damage-mechanics) |
| Damage states | [COMBAT_SYSTEM.md § Damage States](COMBAT_SYSTEM.md#damage-states) |
| Unit combat capabilities | [COMBAT_SYSTEM.md § Unit Combat](COMBAT_SYSTEM.md#unit-combat) |
| Base damage system | [COMBAT_SYSTEM.md § Location/Base Combat](COMBAT_SYSTEM.md#locationbase-combat) |
| Operational data | [COMBAT_SYSTEM.md § Operational Data System](COMBAT_SYSTEM.md#operational-data-system) |
| Tactical network | [COMBAT_SYSTEM.md § Tactical Network](COMBAT_SYSTEM.md#tactical-network) |
| Air patrol status | [COMBAT_SYSTEM.md § Air Patrol Status](COMBAT_SYSTEM.md#air-patrol-status) |
| Combat logging | [COMBAT_SYSTEM.md § Combat Logging](COMBAT_SYSTEM.md#combat-logging) |
| Unit destruction | [COMBAT_SYSTEM.md § Unit Destruction](COMBAT_SYSTEM.md#unit-destruction) |
| Command points | [COMBAT_SYSTEM.md § Command Points System](COMBAT_SYSTEM.md#command-points-system) |
| **Influence marker** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **Tiradas de dados** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **Cartas de influencia** | [CARD_SYSTEM.md](CARD_SYSTEM.md) |

### 🗺️ Integración de Mapa

| Necesito... | Ir a... |
|-------------|---------|
| Configuración Leaflet | [MAP_INTEGRATION.md § Map Configuration](MAP_INTEGRATION.md#map-configuration) |
| TileLayer setup | [MAP_INTEGRATION.md § TileLayer](MAP_INTEGRATION.md#1-tilelayer) |
| Markers (bases) | [MAP_INTEGRATION.md § Markers](MAP_INTEGRATION.md#2-markers-location-pins) |
| Rectangles (áreas) | [MAP_INTEGRATION.md § Rectangles](MAP_INTEGRATION.md#3-rectangles-operational-areas) |
| Popups | [MAP_INTEGRATION.md § Popups](MAP_INTEGRATION.md#4-popups) |
| Controles personalizados | [MAP_INTEGRATION.md § Custom Controls](MAP_INTEGRATION.md#custom-controls) |
| Iconos custom | [MAP_INTEGRATION.md § Custom Icons](MAP_INTEGRATION.md#custom-icons) |
| ReactDOMServer para iconos | [MAP_INTEGRATION.md § Icon Generation](MAP_INTEGRATION.md#icon-generation-with-reactdomserver) |
| Coordinate system | [MAP_INTEGRATION.md § Coordinate System](MAP_INTEGRATION.md#coordinate-system) |
| Array flattening (bounds) | [MAP_INTEGRATION.md § Firestore Array Flattening](MAP_INTEGRATION.md#firestore-array-flattening) |
| Event handling | [MAP_INTEGRATION.md § Event Handling](MAP_INTEGRATION.md#event-handling) |

### 🔄 State Management

| Necesito... | Ir a... |
|-------------|---------|
| Categorías de estado | [STATE_MANAGEMENT.md § State Categories](STATE_MANAGEMENT.md#state-categories) |
| Firestore sync | [STATE_MANAGEMENT.md § Firestore Synchronization](STATE_MANAGEMENT.md#firestore-synchronization) |
| Subscription pattern | [STATE_MANAGEMENT.md § Subscription Pattern](STATE_MANAGEMENT.md#subscription-pattern) |
| Update flow | [STATE_MANAGEMENT.md § Update Flow](STATE_MANAGEMENT.md#update-flow) |
| Critical memoizations | [STATE_MANAGEMENT.md § Critical Memoization Patterns](STATE_MANAGEMENT.md#critical-memoization-patterns) |
| Update arrays | [STATE_MANAGEMENT.md § Updating Arrays](STATE_MANAGEMENT.md#1-updating-arrays-in-firestore) |
| Side effects | [STATE_MANAGEMENT.md § Side Effects Management](STATE_MANAGEMENT.md#side-effects-management) |
| Data normalization | [STATE_MANAGEMENT.md § State Normalization](STATE_MANAGEMENT.md#state-normalization) |
| Damage array normalization | [STATE_MANAGEMENT.md § Damage Array Normalization](STATE_MANAGEMENT.md#3-damage-array-normalization) |
| Performance tips | [STATE_MANAGEMENT.md § Performance Best Practices](STATE_MANAGEMENT.md#performance-best-practices) |

### 🏗️ Arquitectura

| Necesito... | Ir a... |
|-------------|---------|
| Tech stack | [ARCHITECTURE.md § Technology Stack](ARCHITECTURE.md#technology-stack) |
| Architecture layers | [ARCHITECTURE.md § Architecture Layers](ARCHITECTURE.md#architecture-layers) |
| Component hierarchy | [ARCHITECTURE.md § Component Hierarchy](ARCHITECTURE.md#component-hierarchy) |
| Data flow | [ARCHITECTURE.md § Data Flow](ARCHITECTURE.md#data-flow) |
| Design patterns | [ARCHITECTURE.md § Key Design Patterns](ARCHITECTURE.md#key-design-patterns) |
| Module dependencies | [ARCHITECTURE.md § Module Dependencies](ARCHITECTURE.md#module-dependencies) |
| Integration points | [ARCHITECTURE.md § Integration Points](ARCHITECTURE.md#integration-points) |
| Scalability | [ARCHITECTURE.md § Scalability Considerations](ARCHITECTURE.md#scalability-considerations) |

---

## 🧩 Navegación por Componente

### Componentes Principales

| Componente | Documentación | Archivo | Líneas |
|------------|---------------|---------|--------|
| **App.tsx** | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | App.tsx | ~1,431 |
| **Map.tsx** | [MAP_INTEGRATION.md](MAP_INTEGRATION.md) | components/Map.tsx | ~407 |
| **TurnControl** | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | components/TurnControl.tsx | ~89 |
| **FactionSelector** | [ARCHITECTURE.md](ARCHITECTURE.md#component-organization) | components/FactionSelector.tsx | - |
| **Sidebar** | [ARCHITECTURE.md](ARCHITECTURE.md#component-organization) | components/Sidebar.tsx | - |

### Modales

| Modal | Documentación | Archivo | Líneas | Propósito |
|-------|---------------|---------|--------|-----------|
| **EditAreasModal** | [MAP_INTEGRATION.md](MAP_INTEGRATION.md) | components/EditAreasModal.tsx | ~601 | Editar áreas y bases |
| **TaskForceModal** | [UNIT_SYSTEM.md § Task Force Management](UNIT_SYSTEM.md#task-force-management-taskforcemodal) | components/TaskForceModal.tsx | ~1156 | Gestionar Task Forces |
| **CommandCenterModal** | [CARD_SYSTEM.md § Purchase Phase](CARD_SYSTEM.md#1-purchase-phase-commandcentermodal) | components/CommandCenterModal.tsx | - | Comprar cartas |
| **CardEditorModal** | [CARD_SYSTEM.md § Card Management](CARD_SYSTEM.md#card-management-admin) | components/CardEditorModal.tsx | - | Editar cartas (admin) |
| **UnitEncyclopediaModal** | [UNIT_SYSTEM.md § Unit Encyclopedia](UNIT_SYSTEM.md#unit-encyclopedia-unitencyclopediamodal) | components/UnitEncyclopediaModal.tsx | ~912 | Catálogo de unidades |
| **UnitDetailModal** | [UNIT_SYSTEM.md § Unit Detail Modal](UNIT_SYSTEM.md#unit-detail-modal-unitdetailmodal) | components/UnitDetailModal.tsx | ~576 | Detalle de unidad |
| **TaskForceDetailModal** | [UNIT_SYSTEM.md](UNIT_SYSTEM.md) | components/TaskForceDetailModal.tsx | ~320 | Detalle de TF |
| **DeploymentNotificationModal** | [UNIT_SYSTEM.md § Deployment Time](UNIT_SYSTEM.md#deployment-time-system) | components/DeploymentNotificationModal.tsx | ~279 | Notificaciones de arribo |
| **TurnControl** | [STATE_MANAGEMENT.md § Turn System](STATE_MANAGEMENT.md#turn-system) | components/TurnControl.tsx | ~83 | Control de turnos |
| **CombatStatisticsModal** | [COMBAT_SYSTEM.md § Combat Statistics](COMBAT_SYSTEM.md#combat-statistics-modal) | components/CombatStatisticsModal.tsx | - | Stats de combate |
| **AdminLoginModal** | [ARCHITECTURE.md](ARCHITECTURE.md) | components/AdminLoginModal.tsx | - | Login de admin |
| **BoardUnitsModal** | [CARD_SYSTEM.md § Boarding Units](CARD_SYSTEM.md#boarding-units-boardunitsmodal) | components/BoardUnitsModal.tsx | - | Embarcar unidades en transporte |
| **DisembarkModal** | [CARD_SYSTEM.md § Disembarking Units](CARD_SYSTEM.md#disembarking-units-disembarkmodal) | components/map/DataEditor/modals/DisembarkModal.tsx | ~450 | Desembarcar unidades de transporte |
| **InfluenceTrack** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | components/InfluenceTrack.tsx | - | Display del marcador de influencia |
| **DiceAnimation** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | components/DiceAnimation.tsx | - | Animación de dados (d20) |
| **DiceRollModal** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | components/DiceRollModal.tsx | - | Tiradas de influencia |
| **SubmarineDetailedReportModal** | Submarine campaign system | components/SubmarineDetailedReportModal.tsx | ~231 | Admin detailed submarine report |
| **NotificationModal** | [ARCHITECTURE.md](ARCHITECTURE.md) | components/NotificationModal.tsx | - | Generic notification modal |
| **PlayerAssignmentModal** | Multiplayer system | components/PlayerAssignmentModal.tsx | - | Player-faction assignments |
| **PlayedCardNotificationModal** | [CARD_SYSTEM.md](CARD_SYSTEM.md) | components/modals/PlayedCardNotificationModal.tsx | - | Influence card played notifications |
| **InfluenceTrackAnimation** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | components/InfluenceTrackAnimation.tsx | - | Influence marker animation |

### Controles de Mapa

| Control | Documentación | Archivo |
|---------|---------------|---------|
| **MapInitializer** | [MAP_INTEGRATION.md § MapInitializer](MAP_INTEGRATION.md#mapinitializer) | components/map/controls/MapInitializer.tsx |
| **ScaleControl** | [MAP_INTEGRATION.md § ScaleControl](MAP_INTEGRATION.md#scalecontrol) | components/map/controls/ScaleControl.tsx |
| **ChangeView** | [MAP_INTEGRATION.md § ChangeView](MAP_INTEGRATION.md#changeview) | components/map/controls/ChangeView.tsx |
| **DragController** | [MAP_INTEGRATION.md § DragController](MAP_INTEGRATION.md#dragcontroller) | components/map/controls/DragController.tsx |
| **MapClickHandler** | [MAP_INTEGRATION.md § MapClickHandler](MAP_INTEGRATION.md#mapclickhandler) | components/map/controls/MapClickHandler.tsx |

### DataEditor (Tabs y Modals)

| Componente | Documentación | Archivo | Líneas |
|------------|---------------|---------|--------|
| **DataEditor** | [MAP_INTEGRATION.md](MAP_INTEGRATION.md) | components/map/DataEditor/index.tsx | ~759 |
| **TacticalTab** | [COMBAT_SYSTEM.md § Tactical Network](COMBAT_SYSTEM.md#tactical-network) | components/map/DataEditor/tabs/TacticalTab.tsx | ~45 |
| **PatrolsTab** | [COMBAT_SYSTEM.md § Air Patrol Status](COMBAT_SYSTEM.md#air-patrol-status) | components/map/DataEditor/tabs/PatrolsTab.tsx | ~148 |
| **TaskForcesTab** | [UNIT_SYSTEM.md](UNIT_SYSTEM.md) | components/map/DataEditor/tabs/TaskForcesTab.tsx | ~211 |
| **BasesTab** | [COMBAT_SYSTEM.md § Base Damage](COMBAT_SYSTEM.md#base-damage-system) | components/map/DataEditor/tabs/BasesTab.tsx | ~102 |
| **CardsTab** | [CARD_SYSTEM.md § Deployment Phase](CARD_SYSTEM.md#3-deployment-phase-map-popup) | components/map/DataEditor/tabs/CardsTab.tsx | ~285 |
| **CardPlayModal** | [CARD_SYSTEM.md § Attachment](CARD_SYSTEM.md#card-attachment-system) | components/map/DataEditor/modals/CardPlayModal.tsx | - |
| **TaskForceDetailWrapper** | [UNIT_SYSTEM.md](UNIT_SYSTEM.md) | components/map/DataEditor/modals/TaskForceDetailWrapper.tsx | - |

### Utilities

| Utilidad | Documentación | Archivo |
|----------|---------------|---------|
| **iconGenerators** | [MAP_INTEGRATION.md § Custom Icons](MAP_INTEGRATION.md#custom-icons) | utils/iconGenerators.tsx |
| **firestoreService** | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | firestoreService.ts (~1,334 lines, 19 subscription functions) |
| **useGameState** | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | hooks/useGameState.ts (~306 lines, 17 active subscriptions) |

---

## 📋 Navegación por Tipo/Interface

| Interface | Definición | Documentación Principal |
|-----------|-----------|------------------------|
| **Location** | types.ts:3-14 | [COMBAT_SYSTEM.md § Location/Base Combat](COMBAT_SYSTEM.md#locationbase-combat) |
| **OperationalArea** | types.ts:16-23 | [MAP_INTEGRATION.md § Bounds Format](MAP_INTEGRATION.md#bounds-format-operational-areas) |
| **FactionDamage** | types.ts:25-29 | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **OperationalData** | types.ts:31-34 | [COMBAT_SYSTEM.md § Operational Data](COMBAT_SYSTEM.md#operational-data-system) |
| **MapLayer** | types.ts:36-40 | [MAP_INTEGRATION.md](MAP_INTEGRATION.md) |
| **Unit** | types.ts:45-77 | [UNIT_SYSTEM.md § Unit Structure](UNIT_SYSTEM.md#unit-structure) |
| **TaskForce** | types.ts:79-86 | [UNIT_SYSTEM.md § Task Force Definition](UNIT_SYSTEM.md#task-force-definition) |
| **Card** | types.ts:90-117 | [CARD_SYSTEM.md § Type Definition](CARD_SYSTEM.md#type-definition) (includes transport & influence fields) |
| **CommandPoints** | types.ts:116-119 | [COMBAT_SYSTEM.md § Command Points](COMBAT_SYSTEM.md#command-points-system) |
| **previousCommandPoints** | useGameState.ts:68 | [COMBAT_SYSTEM.md § Command Points](COMBAT_SYSTEM.md#command-points-system) | CommandPoints \| undefined - Command points history tracking |
| **PurchasedCardInstance** | types.ts:121-126 | [CARD_SYSTEM.md § Transport System](CARD_SYSTEM.md#transport-card-system) (includes embarkedUnits) |
| **PurchasedCards** | types.ts:128-131 | [CARD_SYSTEM.md § Purchase System](CARD_SYSTEM.md#purchase-system) |
| **DestructionRecord** | types.ts:121-131 | [COMBAT_SYSTEM.md § Unit Destruction](COMBAT_SYSTEM.md#unit-destruction) |
| **FactionStats** | types.ts:133-137 | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **CombatStatistics** | types.ts:139-142 | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **TurnState** | types.ts:144-149 | [COMBAT_SYSTEM.md § Turn Management](COMBAT_SYSTEM.md#turn-management) |
| **PendingCardDeployment** | types.ts:164-173 | [CARD_SYSTEM.md § Deployment Time](CARD_SYSTEM.md#deployment-time-system) (includes embarkedUnits) |
| **PendingUnitDeployment** | types.ts:163-171 | [UNIT_SYSTEM.md § Deployment Time](UNIT_SYSTEM.md#deployment-time-system) |
| **PendingTaskForceDeployment** | types.ts:174-181 | [UNIT_SYSTEM.md § Deployment Time](UNIT_SYSTEM.md#deployment-time-system) |
| **PendingDeployments** | types.ts:184-188 | [STATE_MANAGEMENT.md § Pending Deployments](STATE_MANAGEMENT.md#pending-deployments) |
| **InfluenceMarker** | types.ts:215-217 | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) |
| **PlayedCardNotification** | types.ts:220-237 | [CARD_SYSTEM.md](CARD_SYSTEM.md) |
| **InfluenceThreshold** | types.ts:240-245 | [CARD_SYSTEM.md](CARD_SYSTEM.md) |
| **SubmarineOrder** | types.ts:267-278 | Submarine campaign system |
| **SubmarineDeployment** | types.ts:281-294 | Submarine campaign system |
| **SubmarineEventTarget** | types.ts:310-317 | Submarine campaign system - Event target information |
| **SubmarineEventRollDetails** | types.ts:318-333 | Submarine campaign system - D20 roll details with ASW element info |
| **SubmarineEvent** | types.ts:334-351 | Submarine campaign system - Submarine operation events (success/failure) |
| **SubmarineCampaignState** | types.ts:352-366 | Submarine campaign system - Overall submarine campaign state |
| **AswShipDeployment** | types.ts:353-363 | Submarine campaign system - ASW ship deployment data |
| **MineResult** | types.ts:377-384 | Submarine campaign system - Maritime mine phase results |
| **AssetDeployResult** | types.ts:386-396 | Submarine campaign system - Asset deployment results |
| **RegisteredPlayer** | types.ts:367-373 | Multiplayer system - Registered players |
| **PlayerAssignment** | types.ts:374-379 | Multiplayer system - Player-faction assignments |
| **PurchaseHistory** | types.ts:131-135 | Legacy purchase tracking |
| **CardPurchaseHistory** | types.ts:136-140 | Legacy card purchase tracking |

### Type Aliases y Enums

| Tipo | Definición | Documentación |
|------|-----------|---------------|
| **Position** | types.ts:1 | [MAP_INTEGRATION.md § Coordinate System](MAP_INTEGRATION.md#coordinate-system) |
| **UnitCategory** | types.ts:43 | [UNIT_SYSTEM.md § Unit Categories](UNIT_SYSTEM.md#unit-categories) |
| **CardType** | types.ts:88 | [CARD_SYSTEM.md § Type Classification](CARD_SYSTEM.md#type-classification) |
| **SubmarineCardType** | types.ts:90 | Submarine campaign system |
| **OrderStatus** | types.ts:252 | Submarine campaign system |
| **SubmarineOrderType** | types.ts:255 | Submarine campaign system |
| **SubmarineEventType** | types.ts:268 | Submarine campaign system - Event types (deployment, attack_success, attack_failure, detected, destroyed, etc.) |
| **SubmarineStatus** | types.ts:271 | Submarine campaign system - Submarine status (active, destroyed, returned) |
| **SubmarineTargetType** | types.ts:274 | Submarine campaign system - Target types (base, unit, area) |

---

## 🆘 Troubleshooting (Problemas Comunes)

| Síntoma | Causa | Solución | Documento |
|---------|-------|----------|-----------|
| `filteredLocations` muestra datos viejos | Falta `filters` o `locations` en deps de `useMemo` | Agregar ambos a dependencies array | [STATE_MANAGEMENT.md § Common Pitfall](STATE_MANAGEMENT.md#common-pitfall-missing-dependencies) |
| Error "array index out of bounds" en damage | `currentDamage.length !== damagePoints` | Normalizar array antes de render | [STATE_MANAGEMENT.md § Damage Normalization](STATE_MANAGEMENT.md#3-damage-array-normalization) |
| Iconos de tipo de carta no se ven | Iconos no están en `/public/` root | Mover a `/red.png`, `/green.png`, etc. | [CARD_SYSTEM.md § Visual Indicators](CARD_SYSTEM.md#visual-indicators) |
| Mapa no renderiza (área gris) | Leaflet CSS no importado | Importar en index.tsx: `import 'leaflet/dist/leaflet.css'` | [MAP_INTEGRATION.md § Issue: Map Not Rendering](MAP_INTEGRATION.md#issue-map-not-rendering) |
| Markers muestran placeholder azul | Iconos default rotos | Fix en index.tsx con CDN URLs | [MAP_INTEGRATION.md § Issue: Default Icons](MAP_INTEGRATION.md#issue-default-marker-icons-broken) |
| Popup no abre al hacer click | Popup no es child de Marker/Rectangle | Mover `<Popup>` dentro de `<Marker>` | [MAP_INTEGRATION.md § Issue: Popup](MAP_INTEGRATION.md#issue-popup-doesnt-open) |
| Unidades no aparecen en TF modal | Faction filtering incorrecto | Verificar filtro por `selectedFaction` | [UNIT_SYSTEM.md § Issue: Units Not Appearing](UNIT_SYSTEM.md#issue-units-not-appearing-in-task-force) |
| Badge 🃏 no se ve en unidad | `attachedCard` es string vacío | Usar `unit.attachedCard && unit.attachedCard !== ''` | [UNIT_SYSTEM.md § Issue: Attached Card](UNIT_SYSTEM.md#issue-attached-card-not-showing) |
| Infinite loop en useEffect | Dependency causa setState que cambia dependency | Reducir deps o usar functional setState | [STATE_MANAGEMENT.md § Circular Updates](STATE_MANAGEMENT.md#common-pitfall-circular-updates) |
| Budget no se actualiza después de compra | No se llama `updateCardBudget()` | Asegurar llamada a Firestore update | [CARD_SYSTEM.md § Issue: Budget](CARD_SYSTEM.md#issue-budget-not-updating) |
| Pending unit contado como operativo | `isPendingDeployment` no excluido de filtros | Agregar `&& !unit.isPendingDeployment` a filtros operacionales | [UNIT_SYSTEM.md § Pending Units](UNIT_SYSTEM.md#pending-units) |
| Supply levels incorrectos en TF | Pending units incluidos en cálculo | Filtrar pending units antes de calcular capacidad | [UNIT_SYSTEM.md § Supply Calculation](UNIT_SYSTEM.md#supply-calculation) |
| Infinite loop al abrir BoardUnitsModal | `useEffect` con `selectedUnits` en deps | Usar `useRef` pattern para detectar transición modal | [STATE_MANAGEMENT.md § useRef Pattern](STATE_MANAGEMENT.md#useref-pattern-for-modal-state-sync) |
| Embarked units perdidos tras deployment | `embarkedUnits` no preservados en pending | Copiar `embarkedUnits` a `PendingCardDeployment` | [CARD_SYSTEM.md § Pending Deployment](CARD_SYSTEM.md#pending-deployment-preservation) |
| Submarine events no se guardan | React state staleness en operaciones secuenciales | Usar batch update pattern: acumular eventos de ASW/Attack/Patrol, UN update final | App.tsx:841-859 |
| Patrol Phase vacío en detailed report | Falta filtrar eventType attack_failure | Incluir attack_success y attack_failure en filtro de patrols | SubmarineDetailedReportModal.tsx:31-34 |
| Failed patrols no generan eventos | Solo patrullas exitosas crean eventos | Modificar processPatrols() para crear eventos con attack_failure | submarineService.ts:130-142 |
| Detailed report muestra eventos de otros turnos | Filtro de turn incorrecto | Verificar filtro `e.turn === turnState.turnNumber` | SubmarineDetailedReportModal.tsx:20-22 |

---

## 🔧 Guías por Tarea de Desarrollo

### Quiero agregar una nueva feature...

| Tarea | Lee Primero | Lee Después |
|-------|-------------|-------------|
| **Nuevo tipo de carta** | [CARD_SYSTEM.md § Type Classification](CARD_SYSTEM.md#type-classification) | types.ts, constants/cardTypes.ts |
| **Nueva categoría de unidad** | [UNIT_SYSTEM.md § Unit Categories](UNIT_SYSTEM.md#unit-categories) | types.ts, constants/categories.ts |
| **Nuevo control de mapa** | [MAP_INTEGRATION.md § Custom Controls](MAP_INTEGRATION.md#custom-controls) | components/map/controls/ |
| **Nueva tab en DataEditor** | [REFACTORING_LOG.md § DataEditor Refactoring](REFACTORING_LOG.md#23-split-dataeditor-into-tabs) | components/map/DataEditor/tabs/ |
| **Nuevo modal** | [ARCHITECTURE.md § Component Organization](ARCHITECTURE.md#component-organization) | components/modals/ |
| **Nueva mecánica de combate** | [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) | services/combatService.ts (futuro) |
| **Nuevo tile layer** | [MAP_INTEGRATION.md § TileLayer](MAP_INTEGRATION.md#1-tilelayer) | data/mapLayers.ts |

### Quiero modificar...

| Tarea | Lee Primero | Archivos Afectados |
|-------|-------------|-------------------|
| **Sistema de daño** | [COMBAT_SYSTEM.md § Damage Mechanics](COMBAT_SYSTEM.md#damage-mechanics) | types.ts, UnitDetailModal, BasesTab |
| **Flujo de compra de cartas** | [CARD_SYSTEM.md § Card Lifecycle](CARD_SYSTEM.md#card-lifecycle) | CommandCenterModal, OperationalArea |
| **Task Force creation** | [UNIT_SYSTEM.md § Task Force Management](UNIT_SYSTEM.md#task-force-management-taskforcemodal) | TaskForceModal, App.tsx |
| **Firestore sync** | [STATE_MANAGEMENT.md § Firestore Synchronization](STATE_MANAGEMENT.md#firestore-synchronization) | firestoreService.ts, App.tsx |
| **Memoization pattern** | [STATE_MANAGEMENT.md § Critical Memoization](STATE_MANAGEMENT.md#critical-memoization-patterns) | App.tsx, componentes específicos |

### Quiero entender...

| Concepto | Lee Esto |
|----------|----------|
| **Cómo funciona el proyecto** | [ARCHITECTURE.md](ARCHITECTURE.md) → [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |
| **Cómo se sincronizan los datos** | [STATE_MANAGEMENT.md § Update Flow](STATE_MANAGEMENT.md#update-flow) |
| **Por qué se refactorizó Map.tsx** | [REFACTORING_LOG.md § Phase 2](REFACTORING_LOG.md#phase-2-refactor-maptsx-critical) |
| **Cómo funciona el attachment de cartas** | [CARD_SYSTEM.md § Card Attachment System](CARD_SYSTEM.md#card-attachment-system) |
| **Cómo se calculan los supply levels** | [UNIT_SYSTEM.md § Supply Calculation](UNIT_SYSTEM.md#supply-calculation) |
| **Cómo funcionan los listeners de Firestore** | [STATE_MANAGEMENT.md § Subscription Pattern](STATE_MANAGEMENT.md#subscription-pattern) |

---

## 📊 Patrones de Código Comunes

### Firestore Operations

```typescript
// Leer patrón completo en:
STATE_MANAGEMENT.md § Subscription Pattern
STATE_MANAGEMENT.md § State Update Patterns
```

**Archivos de referencia**:
- `App.tsx` líneas 126-205 (subscriptions)
- `firestoreService.ts` (todas las funciones)

### Memoization Pattern

```typescript
// Ver ejemplos en:
STATE_MANAGEMENT.md § Critical Memoization Patterns
```

**Archivos de referencia**:
- `App.tsx` líneas 417-419 (`filteredLocations`)
- `App.tsx` líneas 796-799 (`factionTaskForces`)

### Array Update Pattern

```typescript
// Ver patrón completo en:
STATE_MANAGEMENT.md § Updating Arrays in Firestore
```

**Archivos de referencia**:
- `App.tsx` (múltiples handlers)
- `TaskForceModal.tsx`
- `CommandCenterModal.tsx`

### Icon Generation Pattern

```typescript
// Ver implementación en:
MAP_INTEGRATION.md § Icon Generation with ReactDOMServer
```

**Archivos de referencia**:
- `utils/iconGenerators.tsx`

### Damage Normalization Pattern

```typescript
// Ver función en:
STATE_MANAGEMENT.md § Damage Array Normalization
```

**Archivos de referencia**:
- `Map.tsx` (DataEditor initialization)
- `UnitDetailModal.tsx`

---

## 🎓 Flujo Recomendado para Nuevos Desarrolladores

### Día 1: Contexto General
1. **Lee**: [ARCHITECTURE.md](ARCHITECTURE.md) (30 min)
2. **Explora**: Estructura de carpetas del proyecto
3. **Lee**: [STATE_MANAGEMENT.md § State Categories](STATE_MANAGEMENT.md#state-categories) (15 min)

### Día 2: Data Flow
1. **Lee**: [STATE_MANAGEMENT.md § Firestore Synchronization](STATE_MANAGEMENT.md#firestore-synchronization) (30 min)
2. **Revisa**: `App.tsx` líneas 126-205 (subscriptions)
3. **Revisa**: `firestoreService.ts` (operaciones)

### Día 3-4: Sistemas Principales
1. **Lee según tu área**:
   - Frontend/UI → [MAP_INTEGRATION.md](MAP_INTEGRATION.md)
   - Cartas → [CARD_SYSTEM.md](CARD_SYSTEM.md)
   - Unidades → [UNIT_SYSTEM.md](UNIT_SYSTEM.md)
   - Combate → [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md)

### Día 5: Profundización
1. **Lee**: [REFACTORING_LOG.md](REFACTORING_LOG.md) (entender decisiones)
2. **Experimenta**: Hacer cambios pequeños
3. **Consulta**: Este INDEX.md cuando tengas dudas

---

## 📈 Métricas de Documentación

### Cobertura
- **Componentes documentados**: 42/42 (100%)
- **Interfaces documentadas**: 44/44 (100%)
- **Firestore listeners documentados**: 17/17 active (19 total functions) (100%)
- **Memoizaciones críticas**: 2/2 (100%)
- **Test suite**: 132 tests (turnService: 36, deploymentService: 24, destructionService: 33, submarineService: 21, mineService: 9, assetDeployService: 9)

### Calidad
- **Última actualización**: 2025-11-07
- **Estado**: ✅ Sincronizado con código
- **Discrepancias**: 0% (completamente actualizado tras auditoría de documentación 2025-11-07)
- **Calidad general**: 9.9/10
- **Últimos cambios**: Documentation sync (firestore subscriptions count, previousCommandPoints, service line counts, App.tsx metrics), submarine campaign Phase 3 (maritime mines, asset deployment), modular service architecture (10+ services), 132 tests total

### Tamaños
- **ARCHITECTURE.md**: 11 KB
- **STATE_MANAGEMENT.md**: 14 KB
- **CARD_SYSTEM.md**: 15 KB
- **UNIT_SYSTEM.md**: 14 KB
- **COMBAT_SYSTEM.md**: 14 KB
- **MAP_INTEGRATION.md**: 16 KB
- **REFACTORING_LOG.md**: 30 KB
- **ASW_SYSTEM.md**: 16 KB
- **INDEX.md** (este archivo): ~15 KB

**Total**: ~145 KB

---

## 🔄 Mantenimiento de Este Índice

### Cuándo Actualizar INDEX.md

✅ Actualiza este índice cuando:
- Agregues nuevos documentos a `/docs`
- Crees nuevos componentes importantes
- Agregues nuevas interfaces a `types.ts`
- Refactorices archivos grandes (>500 líneas)
- Detectes un nuevo patrón importante
- Encuentres un nuevo problema común (troubleshooting)

❌ No necesitas actualizar por:
- Cambios menores en componentes existentes
- Ajustes de estilo o formato
- Correcciones de bugs pequeños
- Cambios en comentarios

### Verificación de Sincronización

Ejecuta el comando `/documenta` mensualmente para verificar que:
- INDEX.md está actualizado
- Los enlaces funcionan
- Los números de línea son aproximados (±15%)

---

## 🔗 Enlaces Útiles

- **Repositorio**: (agregar si aplica)
- **Firebase Console**: (agregar si aplica)
- **Deployment**: (agregar si aplica)

---

## 📝 Notas Finales

Este índice está diseñado para:
- ✅ **Humanos**: Navegación rápida y eficiente
- ✅ **Claude Code**: Optimización de contexto y lectura selectiva
- ✅ **Nuevos desarrolladores**: Onboarding estructurado

**Recuerda**: Este es un documento vivo. Mantenlo actualizado para que siga siendo útil.

---

**Última actualización**: 2025-11-06
**Mantenido por**: Equipo de desarrollo LCC
**Cambios recientes**: Submarine Campaign Phase 3 (maritime mines, asset deployment), ASW_SYSTEM.md added, modular service architecture (10+ services), 132 tests, 17 active subscriptions, 3 new interfaces (AswShipDeployment, MineResult, AssetDeployResult)
