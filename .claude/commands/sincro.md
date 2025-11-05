---
description: Sincroniza los archivos de data/ con los datos de Firestore
---

Ejecuta el script de sincronización completa desde Firestore para actualizar los archivos TypeScript en la carpeta data/ con los datos más recientes de la base de datos.

Este comando sincronizará:
- Cartas (cards.ts)
- Bases/Locations (locations.ts)
- Áreas Operacionales (operationalAreas.ts)
- Task Forces (taskForces.ts)
- Unidades (units.ts) - **Incluye el nuevo campo deploymentCost**
- Datos Operacionales (operationalData.ts)
- Historial de Compras (purchaseHistory.ts) - Contador de compras totales de cartas por facción

Ejecuta el siguiente comando con Bash:

```bash
npx tsx scripts/syncAllFromFirestore.ts
```

Después de ejecutar el script, analiza la salida y reporta:
1. Cuántos archivos se sincronizaron exitosamente
2. Si hubo algún error
3. Estadísticas resumidas (número de cartas, bases, etc.)

NO edites ningún archivo manualmente - solo ejecuta el script y reporta los resultados.
