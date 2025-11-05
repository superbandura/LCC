---
description: Revisa y actualiza la documentación del proyecto comparándola con el código actual
---

Este comando analiza la documentación en docs/ y la compara con el estado actual del código para detectar discrepancias y sugerir actualizaciones necesarias.

## Análisis a Realizar

### 1. Verificación de Estructura de Componentes
- Lee todos los archivos .tsx en components/ (incluyendo subdirectorios modals/, map/, ui/)
- Compara la lista de componentes con los mencionados en `docs/ARCHITECTURE.md`
- Identifica componentes nuevos no documentados o componentes eliminados aún documentados
- Verifica que los números de líneas sean aproximadamente correctos (tolerancia ±15%)

### 2. Validación de Tipos y Modelos (types.ts)
Compara las definiciones de interfaces en `types.ts` con las descripciones en:
- `docs/UNIT_SYSTEM.md` → interfaces Unit, TaskForce
- `docs/CARD_SYSTEM.md` → interface Card (core), CardType
- `docs/CARD_TRANSPORT.md` → transport-specific Card fields (isTransport, transportCapacity, etc.)
- `docs/CARD_INFLUENCE.md` → influence-specific Card fields (influenceThresholds, etc.)
- `docs/CARD_ATTACHMENT.md` → attachment-specific Card fields (isAttachable, hpBonus, etc.)
- `docs/COMBAT_SYSTEM.md` → interface OperationalData
- `docs/MAP_INTEGRATION.md` → interfaces Location, OperationalArea

**IMPORTANTE**: El sistema de cartas ahora está dividido en 4 archivos de documentación.

Detecta:
- Campos nuevos no documentados
- Campos documentados pero eliminados del código
- Cambios en tipos de datos

### 3. Revisión de State Management (App.tsx)
Verifica que `docs/STATE_MANAGEMENT.md` y `docs/ARCHITECTURE.md` reflejen correctamente:
- Los listeners `onSnapshot` de Firestore (debe haber **14**, todos encapsulados en useGameState hook)
- Las memoizaciones críticas: `filteredLocations`, `factionTaskForces`
- Los useEffect de cleanup (orphaned units, destroyed units)
- Los useState hooks principales (debe haber ~11 en App.tsx, con 14 estados de Firestore en useGameState y 7 estados de modal en useModal)
- Las 18 funciones memoizadas con useCallback
- Líneas de código en App.tsx (actual: ~1,266 líneas, si varía >±15% del documentado, sugerir actualización)

### 4. Comprobación de Integraciones de Mapa
En `docs/MAP_INTEGRATION.md` verifica:
- Versiones de Leaflet y react-leaflet en `package.json`
- Que los controles de mapa listados existan en `components/map/controls/`
- Estructura de DataEditor: 5 tabs (TacticalTab, PatrolsTab, ForcesTab, CommandPointsTab, CardsTab) y 2 modals

### 5. Análisis de Cambios Recientes
- Identifica archivos .tsx modificados recientemente (últimas 2 semanas)
- Compara con las fechas mencionadas en `docs/REFACTORING_LOG.md` (última actualización: 2025-11-02)
- Identifica archivos modificados desde 2025-11-02 (última entrada en REFACTORING_LOG.md)
- Sugiere si es necesario actualizar el log de refactoring con cambios recientes

### 6. Verificación de Servicios (services/)
Verifica que los servicios de lógica de negocio estén documentados:
- `services/turnService.ts` (~181 líneas, 36 tests) - Gestión de turnos y fechas
- `services/deploymentService.ts` (~369 líneas, 24 tests) - Timing de despliegues
- `services/destructionService.ts` (~244 líneas, 33 tests) - Tracking de destrucción
- `services/submarineService.ts` (~602 líneas, 14 tests) - Campaña de submarinos
- **Total**: ~1,396 líneas, 107 tests

Comprueba:
- Que ARCHITECTURE.md mencione la capa de servicios (sección "Service Layer") con line counts actualizados
- Que cada servicio tenga su archivo de test correspondiente (.test.ts)
- Que los 4 servicios estén correctamente documentados con sus líneas de código
- Que los tests pasen (107 tests documentados en REFACTORING_LOG.md)
- Que CLAUDE.md tenga los line counts correctos en la sección "Services Layer"

### 7. Verificación de Custom Hooks (hooks/)
Verifica que los custom hooks estén documentados y existan:
- `hooks/useGameState.ts` (~238 líneas) - Centraliza **14** suscripciones de Firestore
- `hooks/useModal.ts` (~148 líneas) - Gestiona 7 estados de modales
- `hooks/useFactionFilter.ts` (~111 líneas) - Filtrado genérico por facción
- `hooks/useDeploymentNotifications.ts` (~198 líneas) - Sistema de notificaciones de arribo
- **Total**: ~695 líneas en 4 hooks

Comprueba:
- Que los 4 archivos .ts existan en hooks/
- Que ARCHITECTURE.md documente estos hooks en la sección "Custom Hooks" con line counts
- Que STATE_MANAGEMENT.md mencione useGameState como patrón recomendado
- Que los hooks estén correctamente utilizados en App.tsx
- Que CLAUDE.md mencione los 4 hooks en la sección "Custom Hooks"

### 8. Verificación de Tests
Verifica que existan tests para los servicios:
- `services/turnService.test.ts`
- `services/deploymentService.test.ts`
- `services/destructionService.test.ts`
- `services/submarineService.test.ts`

Comprueba:
- Que los 4 archivos .test.ts existan
- Que la cobertura de tests esté documentada en REFACTORING_LOG.md (107 tests passing)
- Que los archivos .test.ts NO estén listados como componentes principales

### 9. Verificación de firestoreService.ts y Utilidades
Confirma que `firestoreService.ts` (~956 líneas) contenga las **14** funciones de suscripción:
- subscribeToOperationalAreas, subscribeToOperationalData
- subscribeToLocations, subscribeToTaskForces, subscribeToUnits
- subscribeToCards, subscribeToCommandPoints, subscribeToPurchasedCards
- subscribeToDestructionLog, subscribeToTurnState, subscribeToPendingDeployments
- subscribeToInfluenceMarker, subscribeToSubmarineCampaign
- **subscribeToPlayedCardNotificationsQueue** (14ª suscripción, añadida 2025-11-04)

Verifica que STATE_MANAGEMENT.md documente:
- El patrón de useGameState hook que encapsula estas 14 suscripciones
- Las funciones de actualización correspondientes (updateXXX)

Además verifica:
- Que `utils/iconGenerators.ts` esté mencionado en MAP_INTEGRATION.md
- Que los constants/ estén documentados en ARCHITECTURE.md
- Que firestoreService.ts tenga line count documentado (~956 líneas)

### 10. Verificación del Índice de Navegación (INDEX.md)
- Confirma que `docs/INDEX.md` existe y está actualizado
- Verifica que los enlaces a secciones específicas funcionen (formato correcto)
- Comprueba que la tabla de troubleshooting incluya problemas comunes reales
- Valida que la lista de componentes esté completa (37 componentes)
- Verifica que las 21 interfaces estén listadas
- Confirma que el conteo de listeners sea correcto (13 listeners)
- Confirma que los conteos de líneas sean aproximados (tolerancia ±15%)
- Sugiere agregar nuevos problemas a troubleshooting si se detectan patrones

## Formato de Reporte

Presenta un reporte estructurado con estas secciones:

```
📊 ANÁLISIS DE DOCUMENTACIÓN COMPLETO
════════════════════════════════════════

✅ COMPONENTES DOCUMENTADOS: X/Y (Z%)
⚠️ Componentes Sin Documentar:
  - components/path/NewComponent.tsx (XXX líneas)
  - components/path/AnotherNew.tsx (XXX líneas)

📝 DISCREPANCIAS DETECTADAS:
  1. [Archivo]: Documentado X líneas, actual Y líneas (±Z%)
  2. [types.ts]: Campo nuevo "Interface.field" no documentado en [DOC].md
  3. [DOC.md]: Menciona X elementos, pero código tiene Y

🔄 ARCHIVOS MODIFICADOS RECIENTEMENTE:
  - [Archivo] (modificado hace X días) - afecta [DOC].md
  - [Archivo] (modificado hace X días) - afecta [DOC].md

📌 TIPOS Y MODELOS:
  ✅ Campos documentados correctamente: X
  ⚠️ Campos sin documentar: Y
  - Interface.newField (tipo: string) - falta en [DOC].md sección [SECTION]

🗺️ INTEGRACIONES:
  ✅ Versiones de Leaflet coinciden
  ⚠️ Control nuevo no documentado: [ControlName]

📈 ESTADO DE LA DOCUMENTACIÓN:
  - INDEX.md: [Estado] (verificar enlaces y cobertura)
  - ARCHITECTURE.md: [Estado]
  - STATE_MANAGEMENT.md: [Estado]
  - CARD_SYSTEM.md: [Estado]
  - UNIT_SYSTEM.md: [Estado]
  - COMBAT_SYSTEM.md: [Estado]
  - MAP_INTEGRATION.md: [Estado]
  - REFACTORING_LOG.md: [Estado]

💡 RECOMENDACIONES:
  1. Actualizar [DOC].md línea X: [cambio específico]
  2. Agregar documentación de [campo] en [DOC].md sección "[SECTION]"
  3. Actualizar conteo de [elemento] en [DOC].md
  4. Considerar agregar entrada en REFACTORING_LOG.md para cambios desde 2025-11-02
  5. Verificar que servicios y hooks estén documentados en ARCHITECTURE.md
  6. Confirmar que los tests (.test.ts) tengan cobertura adecuada
```

## Instrucciones de Ejecución

1. **Lee INDEX.md primero** para entender la estructura de documentación actual
2. **Usa Glob** para listar todos los componentes TypeScript, servicios (services/*.ts), y hooks (hooks/*.ts)
3. **Usa Read** para leer los archivos de documentación y código clave (types.ts, App.tsx, package.json, INDEX.md)
4. **Usa Grep** para buscar patrones específicos (onSnapshot, useMemo, useCallback, interface definitions)
5. **Compara** las listas y números encontrados con lo documentado
6. **Verifica servicios y tests** estén presentes y documentados
7. **Verifica hooks** estén correctamente implementados y documentados
8. **Verifica INDEX.md** esté sincronizado con el código actual (componentes, interfaces, listeners, troubleshooting)
9. **Presenta** el reporte estructurado con recomendaciones específicas

## Restricciones Importantes

- ✅ SÍ analiza y compara archivos
- ✅ SÍ usa herramientas de lectura (Read, Glob, Grep)
- ✅ SÍ presenta recomendaciones específicas
- ❌ NO edites archivos de documentación automáticamente
- ❌ NO ejecutes comandos que modifiquen el sistema
- ❌ NO hagas cambios sin confirmación del usuario

El usuario decidirá qué cambios aplicar después de revisar el reporte.
