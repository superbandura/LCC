# Sistema de Campaña Submarina

## 1. Overview

La Campaña Submarina es un sistema independiente que permite a los jugadores desplegar cartas submarinas (`sub: true`) en operaciones especiales fuera del sistema de Task Forces convencional. Los submarinos operan de manera autónoma con órdenes específicas que se resuelven por turnos.

**Características principales:**
- Despliegue desde CommandCenter al comprar cartas submarinas
- Asignación automática de nombre real de submarino
- Sistema de órdenes: Patrullar/Reconocimiento y Atacar Objetivo
- Resolución por turnos con registro de eventos
- Historial de logros y cambios de estado

---

## 2. Cartas Submarinas Clasificadas

### 2.1 USMC (13 cartas)

| ID | Nombre | Tipo | Costo | Adjuntable | Categoría |
|---|---|---|---|---|---|
| `us-020` | Maritime Mines | attack | 3 | ❌ | - |
| `us-023` | Mine Clearing Unmanned | maneuver | 3 | ✅ | naval |
| `us-032` | Naval Swarm | attack | 2 | ✅ | naval |
| `us-036` | Unmanned Underwater ISR | intelligence | 1 | ✅ | naval |
| `us-049` | P-8A Surveillance | intelligence | 3 | ❌ | - |
| `us-065` | Helo ASW | intelligence | 1 | ✅ | naval |
| `us-068` | Unmanned Boats | maneuver | 2 | ✅ | ground |
| `us-069` | Virginia-Class Sub | maneuver | 5 | ❌ | - |
| `us-070` | Ohio-Class Sub | maneuver | 5 | ❌ | - |
| `us-086` | UUV Defense | maneuver | 3 | ✅ | naval |
| `us-090` | UUV Attack Unmanned | attack | 4 | ✅ | naval |
| `us-096` | Seaplanes | maneuver | 3 | ❌ | - |
| `us-102` | *(Sin identificar)* | *(pendiente)* | *(?)* | *(?)* | *(?)* |

**Nota sobre cartas sin `sub: true`:**
- `us-021` - Submarine Strike (attack, costo 5) - Contiene "Submarine" en nombre pero sin flag

### 2.2 PLAN (11 cartas)

| ID | Nombre | Tipo | Costo | Adjuntable | Categoría |
|---|---|---|---|---|---|
| `china-003` | Maritime Militia | intelligence | 1 | ❌ | - |
| `china-032` | Naval Swarm | attack | 2 | ✅ | naval |
| `china-043` | Maritime Mines | attack | 3 | ❌ | - |
| `china-049` | Mine Clearing Unmanned | maneuver | 3 | ✅ | naval |
| `china-052` | Unmanned Underwater ISR | intelligence | 1 | ✅ | naval |
| `china-056` | Patrol Boats | maneuver | 3 | ✅ | ground |
| `china-069` | SUI-Class Sub | maneuver | 5 | ❌ | - |
| `china-070` | Shang II-Class Sub | maneuver | 5 | ❌ | - |
| `china-071` | Y-8Q Surveillance | intelligence | 3 | ❌ | - |
| `china-084` | Helo ASW | intelligence | 1 | ✅ | naval |
| `china-090` | Seaplanes | maneuver | 3 | ❌ | - |

**Nota sobre cartas sin `sub: true`:**
- `china-062` - Submarine Insertion (maneuver, costo 4) - Contiene "Submarine" en nombre pero sin flag

---

## 3. Nombres Reales de Submarinos

### 3.1 USMC - Submarinos Nucleares (20 nombres)

**Virginia-class (SSN-774):**
1. USS Virginia (SSN-774)
2. USS Texas (SSN-775)
3. USS Hawaii (SSN-776)
4. USS North Carolina (SSN-777)
5. USS New Hampshire (SSN-778)
6. USS New Mexico (SSN-779)
7. USS Missouri (SSN-780)
8. USS California (SSN-781)
9. USS Mississippi (SSN-782)
10. USS Minnesota (SSN-783)
11. USS North Dakota (SSN-784)
12. USS John Warner (SSN-785)
13. USS Illinois (SSN-786)
14. USS Washington (SSN-787)
15. USS Colorado (SSN-788)

**Ohio-class (SSGN-726):**
16. USS Ohio (SSGN-726)
17. USS Michigan (SSGN-727)
18. USS Florida (SSGN-728)
19. USS Georgia (SSGN-729)

**Seawolf-class:**
20. USS Seawolf (SSN-21)

### 3.2 PLAN - Submarinos (20 nombres)

**Type 093 Shang-class (SSN):**
1. 长征3号 (Changzheng-3)
2. 长征4号 (Changzheng-4)
3. 长征5号 (Changzheng-5)
4. 长征6号 (Changzheng-6)
5. 长征7号 (Changzheng-7)
6. 长征8号 (Changzheng-8)

**Type 094 Jin-class (SSBN):**
7. 长征9号 (Changzheng-9)
8. 长征10号 (Changzheng-10)
9. 长征11号 (Changzheng-11)
10. 长征12号 (Changzheng-12)
11. 长征13号 (Changzheng-13)
12. 长征14号 (Changzheng-14)

**Type 039A Yuan-class (SSK):**
13. 长城330号 (Changcheng-330)
14. 长城331号 (Changcheng-331)
15. 长城332号 (Changcheng-332)
16. 长城333号 (Changcheng-333)

**Type 041 (próxima generación):**
17. 潜龙1号 (Qianlong-1)
18. 潜龙2号 (Qianlong-2)
19. 潜龙3号 (Qianlong-3)
20. 潜龙4号 (Qianlong-4)

---

## 4. Sistema de Despliegue

### 4.1 Flujo de Despliegue

```
1. Usuario compra carta submarina en CommandCenter
   ↓
2. Carta tiene propiedad `sub: true`
   ↓
3. Aparece botón "Desplegar en Campaña Submarina"
   ↓
4. Al hacer clic:
   - Se asigna nombre aleatorio de la lista correspondiente (USMC/PLAN)
   - Se crea objeto SubmarineDeployment
   - Se elimina carta de "purchased cards"
   - Se añade submarino a estado global `deployedSubmarines`
   - Se registra evento "Despliegue" en `submarineEvents`
   - Se sincroniza con Firestore
   ↓
5. Submarino aparece en pestaña "Campaña Submarina" del CombatStatisticsModal
```

### 4.2 Lógica de Asignación de Nombres

```typescript
// Pseudocódigo
function assignRandomSubmarineName(faction: 'us' | 'china', usedNames: string[]): string {
  const availableNames = SUBMARINE_NAMES[faction].filter(name => !usedNames.includes(name));

  if (availableNames.length === 0) {
    // Si no quedan nombres, reutilizar con sufijo numérico
    return `${SUBMARINE_NAMES[faction][0]} II`;
  }

  const randomIndex = Math.floor(Math.random() * availableNames.length);
  return availableNames[randomIndex];
}
```

**Reglas:**
- Nombres únicos por submarino activo
- Si se agotan los 20 nombres, reutilizar con sufijo " II", " III", etc.
- Nombres persisten aunque el submarino sea destruido (no se reutilizan inmediatamente)

---

## 5. Sistema de Órdenes

### 5.1 Tipos de Órdenes

| Orden | Código | Descripción | Resolución |
|---|---|---|---|
| **Patrullar/Reconocimiento** | `patrol` | Submarino patrulla zona, puede detectar movimientos enemigos | Por turno: tirada de dado (1d6), éxito con 4+ |
| **Atacar Objetivo** | `attack` | Ataque directo a objetivo específico (base, unidad naval, instalación) | Por turno: modal de selección de target + tirada de ataque |

### 5.2 Estado de Órdenes

```typescript
type OrderStatus = 'pending' | 'executing' | 'completed' | 'failed';

interface SubmarineOrder {
  orderId: string;
  submarineId: string;
  orderType: 'patrol' | 'attack';
  status: OrderStatus;
  targetId?: string; // Para ataques
  targetType?: 'base' | 'unit' | 'area'; // Para ataques
  assignedTurn: number; // Turno en que se asignó
  resolvedTurn?: number; // Turno en que se resolvió
  result?: 'success' | 'failure' | 'detected'; // Resultado
}
```

### 5.3 Resolución por Turnos

**Flujo:**
1. Jugador asigna orden a submarino desde dropdown
2. Orden queda en estado `pending`
3. Jugador hace clic en botón **"Ejecutar Turno Submarino"**
4. Sistema resuelve todas las órdenes pendientes:
   - **Patrullar**: Tirada 1d6 automática (éxito 4+, genera evento)
   - **Atacar**: Abre modal para confirmar target → tirada de ataque → aplica daño si éxito
5. Órdenes pasan a estado `completed` o `failed`
6. Se generan eventos en el registro
7. Contador de turno incrementa

---

## 6. Registro de Eventos

### 6.1 Tipos de Eventos

| Tipo | Código | Descripción |
|---|---|---|
| **Despliegue** | `deployment` | Submarino desplegado en campaña |
| **Ataque Exitoso** | `attack_success` | Ataque causó daño al objetivo |
| **Ataque Fallido** | `attack_failure` | Ataque no alcanzó objetivo |
| **Detección Enemiga** | `detected` | Submarino detectado por el enemigo |
| **Destrucción** | `destroyed` | Submarino fue destruido |
| **Retorno a Base** | `return` | Submarino regresa de misión |

### 6.2 Estructura de Eventos

```typescript
interface SubmarineEvent {
  eventId: string;
  submarineId: string;
  submarineName: string;
  faction: 'us' | 'china';
  cardId: string; // ID de carta original
  cardName: string; // Nombre de carta (ej: "Virginia-Class Sub")
  eventType: 'deployment' | 'attack_success' | 'attack_failure' | 'detected' | 'destroyed' | 'return';
  timestamp: number; // Date.now()
  turn: number; // Turno de la campaña
  targetInfo?: {
    targetId: string;
    targetName: string;
    targetType: 'base' | 'unit' | 'area';
    damageDealt?: number;
  };
  description: string; // Texto descriptivo para mostrar en UI
}
```

### 6.3 Ejemplos de Descripciones

```typescript
// Despliegue
"USS Virginia desplegado en Campaña Submarina"

// Ataque exitoso
"USS Ohio atacó Base de Kagoshima - 2 puntos de daño infligidos"

// Ataque fallido
"长征3号 falló ataque contra Task Force Alpha - Objetivo evadió"

// Detección
"USS Texas detectado por patrulla enemiga durante misión de reconocimiento"

// Destrucción
"长城330号 destruido por fuego enemigo en Zona Delta"
```

---

## 7. Estructura de Datos

### 7.1 Interfaces TypeScript

```typescript
// types.ts

export interface SubmarineDeployment {
  id: string; // UUID generado
  cardId: string; // ID de carta original (ej: "us-069")
  cardName: string; // Nombre de carta (ej: "Virginia-Class Sub")
  cardType: CardType; // Tipo de carta original
  submarineName: string; // Nombre asignado aleatoriamente (ej: "USS Virginia")
  faction: 'us' | 'china';
  deployedAt: number; // Timestamp de despliegue
  currentOrder?: SubmarineOrder; // Orden actual
  status: 'active' | 'destroyed' | 'returned'; // Estado del submarino
  missionsCompleted: number; // Contador de misiones exitosas
  totalKills: number; // Objetivos destruidos
}

export interface SubmarineOrder {
  orderId: string;
  submarineId: string;
  orderType: 'patrol' | 'attack';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  targetId?: string;
  targetType?: 'base' | 'unit' | 'area';
  assignedTurn: number;
  resolvedTurn?: number;
  result?: 'success' | 'failure' | 'detected';
}

export interface SubmarineEvent {
  eventId: string;
  submarineId: string;
  submarineName: string;
  faction: 'us' | 'china';
  cardId: string;
  cardName: string;
  eventType: 'deployment' | 'attack_success' | 'attack_failure' | 'detected' | 'destroyed' | 'return';
  timestamp: number;
  turn: number;
  targetInfo?: {
    targetId: string;
    targetName: string;
    targetType: 'base' | 'unit' | 'area';
    damageDealt?: number;
  };
  description: string;
}

export interface SubmarineCampaignState {
  deployedSubmarines: SubmarineDeployment[];
  events: SubmarineEvent[];
  currentTurn: number;
  usedSubmarineNames: {
    us: string[];
    china: string[];
  };
}
```

### 7.2 Nombres de Submarinos

```typescript
// constants/submarineNames.ts

export const SUBMARINE_NAMES = {
  us: [
    'USS Virginia (SSN-774)',
    'USS Texas (SSN-775)',
    'USS Hawaii (SSN-776)',
    'USS North Carolina (SSN-777)',
    'USS New Hampshire (SSN-778)',
    'USS New Mexico (SSN-779)',
    'USS Missouri (SSN-780)',
    'USS California (SSN-781)',
    'USS Mississippi (SSN-782)',
    'USS Minnesota (SSN-783)',
    'USS North Dakota (SSN-784)',
    'USS John Warner (SSN-785)',
    'USS Illinois (SSN-786)',
    'USS Washington (SSN-787)',
    'USS Colorado (SSN-788)',
    'USS Ohio (SSGN-726)',
    'USS Michigan (SSGN-727)',
    'USS Florida (SSGN-728)',
    'USS Georgia (SSGN-729)',
    'USS Seawolf (SSN-21)'
  ],
  china: [
    '长征3号 (Changzheng-3)',
    '长征4号 (Changzheng-4)',
    '长征5号 (Changzheng-5)',
    '长征6号 (Changzheng-6)',
    '长征7号 (Changzheng-7)',
    '长征8号 (Changzheng-8)',
    '长征9号 (Changzheng-9)',
    '长征10号 (Changzheng-10)',
    '长征11号 (Changzheng-11)',
    '长征12号 (Changzheng-12)',
    '长征13号 (Changzheng-13)',
    '长征14号 (Changzheng-14)',
    '长城330号 (Changcheng-330)',
    '长城331号 (Changcheng-331)',
    '长城332号 (Changcheng-332)',
    '长城333号 (Changcheng-333)',
    '潜龙1号 (Qianlong-1)',
    '潜龙2号 (Qianlong-2)',
    '潜龙3号 (Qianlong-3)',
    '潜龙4号 (Qianlong-4)'
  ]
};
```

---

## 8. Layout UI - Pestaña Campaña Submarina

### 8.1 Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMPAÑA SUBMARINA                                    [X]       │
├──────────────────────────┬──────────────────────────────────────┤
│  SUBMARINOS DESPLEGADOS  │  REGISTRO DE EVENTOS                 │
│  (Columna Izquierda)     │  (Columna Derecha)                   │
│                          │                                      │
│  [USMC - 3 activos]      │  📜 Historial de Operaciones         │
│  ┌────────────────────┐  │  ─────────────────────────────────   │
│  │ 🇺🇸 USS Virginia   │  │  [Turno 5] 🎯 USS Ohio atacó...     │
│  │ Virginia-Class Sub │  │  [Turno 5] ⚠️ 长征3号 detectado...   │
│  │ Orden: [▼ Atacar ] │  │  [Turno 4] 📍 USS Texas desplegado  │
│  │ Misiones: 2 | ⚔️: 1 │  │  [Turno 3] 💥 长城330号 destruido  │
│  └────────────────────┘  │  [Turno 3] 🎯 USS Virginia atacó... │
│                          │  [Turno 2] 📍 长征3号 desplegado...   │
│  ┌────────────────────┐  │  [Turno 1] 📍 USS Ohio desplegado   │
│  │ 🇺🇸 USS Ohio       │  │                                      │
│  │ Ohio-Class Sub     │  │  ─────────────────────────────────   │
│  │ Orden: [▼ Patrulla]│  │  📊 Estadísticas Globales           │
│  │ Misiones: 1 | ⚔️: 0 │  │  USMC: 3 activos | 5 misiones      │
│  └────────────────────┘  │  PLAN: 2 activos | 3 misiones       │
│                          │                                      │
│  [PLAN - 2 activos]      │                                      │
│  ┌────────────────────┐  │                                      │
│  │ 🇨🇳 长征3号         │  │                                      │
│  │ Shang II-Class Sub │  │                                      │
│  │ Orden: [▼ Atacar ] │  │                                      │
│  │ Misiones: 1 | ⚔️: 0 │  │                                      │
│  └────────────────────┘  │                                      │
│                          │                                      │
│  [🔄 Ejecutar Turno]     │  [🔍 Filtrar por facción: Todos ▼]  │
└──────────────────────────┴──────────────────────────────────────┘
```

### 8.2 Componentes UI

**Columna Izquierda - Submarinos Desplegados:**
- Header con contador por facción
- Cards de submarino con:
  - Icono de bandera (🇺🇸 / 🇨🇳)
  - Nombre de submarino (asignado aleatoriamente)
  - Tipo de carta original
  - Dropdown de órdenes (`<select>` con opciones: "Patrullar", "Atacar Objetivo")
  - Estadísticas: misiones completadas, objetivos eliminados
- Botón "Ejecutar Turno" (resuelve todas las órdenes pendientes)

**Columna Derecha - Registro de Eventos:**
- Header con título "Historial de Operaciones"
- Lista cronológica inversa (más reciente arriba)
- Cada evento muestra:
  - Número de turno `[Turno X]`
  - Icono según tipo de evento
  - Descripción del evento
- Footer con estadísticas agregadas por facción
- Filtro opcional por facción

### 8.3 Iconos de Eventos

| Evento | Icono | Color |
|---|---|---|
| Despliegue | 📍 | Azul |
| Ataque Exitoso | 🎯 | Verde |
| Ataque Fallido | ❌ | Rojo |
| Detección | ⚠️ | Amarillo |
| Destrucción | 💥 | Rojo oscuro |
| Patrulla Exitosa | 👁️ | Azul claro |

---

## 9. Flujo de Usuario

### 9.1 Desplegar Submarino

```
1. Usuario abre CommandCenterModal
2. Va a pestaña "Catalog" y compra carta submarina (ej: "Virginia-Class Sub", 5 pts)
3. Carta aparece en panel "Purchased Cards"
4. Usuario ve botón "⚓ Desplegar en Campaña Submarina"
5. Usuario hace clic
6. Sistema asigna nombre aleatorio (ej: "USS Virginia")
7. Aparece confirmación: "USS Virginia desplegado en Campaña Submarina"
8. Carta desaparece de "Purchased Cards"
9. Submarino aparece en CombatStatisticsModal > Campaña Submarina
```

### 9.2 Asignar Orden

```
1. Usuario abre CombatStatisticsModal
2. Va a pestaña "Campaña Submarina"
3. Ve lista de submarinos activos en columna izquierda
4. Hace clic en dropdown de orden junto al submarino
5. Selecciona "Patrullar" o "Atacar Objetivo"
6. Si selecciona "Atacar":
   - Aparece segundo dropdown con objetivos disponibles (bases, task forces)
   - Usuario selecciona objetivo
7. Orden queda en estado "pending" (indicador visual)
8. Usuario repite proceso con otros submarinos si desea
```

### 9.3 Ejecutar Turno

```
1. Usuario hace clic en botón "🔄 Ejecutar Turno Submarino"
2. Sistema muestra modal de confirmación con lista de órdenes pendientes
3. Usuario confirma
4. Sistema procesa cada orden:
   - Patrullar: Tirada 1d6 automática, genera evento si éxito (4+)
   - Atacar: Tirada de ataque (1d6 + modificadores), aplica daño si éxito
5. Se generan eventos en tiempo real (animaciones opcionales)
6. Registro se actualiza con nuevos eventos
7. Contador de turno incrementa
8. Órdenes completadas se limpian, submarinos quedan sin orden
9. Usuario puede asignar nuevas órdenes
```

### 9.4 Consultar Historial

```
1. Usuario abre CombatStatisticsModal > Campaña Submarina
2. Columna derecha muestra todos los eventos
3. Usuario puede:
   - Hacer scroll para ver eventos antiguos
   - Filtrar por facción (dropdown "Todos / USMC / PLAN")
   - Ver estadísticas agregadas en footer
4. Cada evento muestra contexto completo (turno, submarino, objetivo, resultado)
```

---

## 10. Implementación por Fases

### Fase 1: Infraestructura (PRÓXIMA)
- [ ] Añadir interfaces a `types.ts`
- [ ] Crear `constants/submarineNames.ts`
- [ ] Añadir estado en `App.tsx`: `deployedSubmarines`, `submarineEvents`, `currentTurn`
- [ ] Añadir listeners Firestore para sincronización
- [ ] Crear funciones helper en `firestoreService.ts`

### Fase 2: Despliegue (PRÓXIMA)
- [ ] Modificar `CommandCenterModal.tsx`:
  - Detectar cartas con `sub: true`
  - Añadir botón "Desplegar en Campaña Submarina"
  - Implementar función `handleDeploySubmarine()`
  - Asignar nombre aleatorio
  - Crear evento de despliegue
  - Actualizar Firestore

### Fase 3: UI Campaña Submarina (PRÓXIMA)
- [ ] Modificar `CombatStatisticsModal.tsx`:
  - Reemplazar placeholder en pestaña "Campaña Submarina"
  - Implementar layout de dos columnas
  - Columna izquierda: lista de submarinos con dropdowns de órdenes
  - Columna derecha: registro de eventos con filtros
  - Botón "Ejecutar Turno"

### Fase 4: Sistema de Órdenes (FUTURA)
- [ ] Implementar dropdown de órdenes
- [ ] Crear lógica de asignación de orden
- [ ] Implementar modal de selección de objetivo (para ataques)
- [ ] Crear función `handleAssignOrder()`

### Fase 5: Resolución de Turnos (FUTURA)
- [ ] Implementar botón "Ejecutar Turno"
- [ ] Crear función `handleExecuteTurn()` que procesa todas las órdenes
- [ ] Implementar lógica de tiradas de dado
- [ ] Aplicar daño a objetivos (para ataques)
- [ ] Generar eventos según resultados
- [ ] Actualizar estadísticas de submarinos

### Fase 6: Pulido y Testing (FUTURA)
- [ ] Animaciones para eventos en tiempo real
- [ ] Sonidos opcionales (submarino desplegado, ataque, detección)
- [ ] Testing multiplayer (sincronización Firestore)
- [ ] Validaciones y edge cases
- [ ] Documentación de usuario

---

## 11. Notas de Diseño

### 11.1 Decisiones Clave

1. **Submarinos como cartas independientes**: No son unidades, operan fuera del sistema de Task Forces
2. **Nombres reales**: Aumenta inmersión y autenticidad
3. **Resolución por turnos**: Evita spam de órdenes, permite planificación estratégica
4. **Sistema de registro**: Mantiene historial completo para análisis post-partida
5. **Sin recuperación de cartas**: Una vez desplegado, submarino permanece hasta destrucción o retorno

### 11.2 Consideraciones Futuras

- **Mecánica de retorno a base**: ¿Los submarinos pueden retornar para recuperar carta?
- **Límite de submarinos activos**: ¿Máximo 5 por facción?
- **Detección enemiga**: ¿Afecta efectividad en turnos posteriores?
- **Mejoras de submarinos**: ¿Cartas adjuntables específicas para subs?
- **Zonas submarinas especiales**: ¿Áreas operacionales con bonificadores para subs?

### 11.3 Integración con Sistemas Existentes

- **Command Points**: Ya implementado, solo validar que `sub` cards gasten presupuesto
- **Firestore Sync**: Usar patrón existente de `onSnapshot`
- **Modal System**: Integrar con CombatStatisticsModal existente
- **Event System**: Compatible con sistema de logs de combate actual

---

## 12. Referencias

- **Archivo de tipos**: `F:\LCC\types.ts`
- **Modal de estadísticas**: `F:\LCC\components\CombatStatisticsModal.tsx`
- **CommandCenter**: `F:\LCC\components\CommandCenterModal.tsx`
- **Servicio Firestore**: `F:\LCC\firestoreService.ts`
- **Datos de cartas**: `F:\LCC\data\cards.ts`

---

**Última actualización**: 2025-11-02
**Versión**: 1.0.0
**Estado**: Diseño completo - Pendiente de implementación
