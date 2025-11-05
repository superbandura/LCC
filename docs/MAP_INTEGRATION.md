# Map Integration Documentation

## Overview

LCC uses **Leaflet 1.9.4** with **react-leaflet v5** for interactive map functionality. The map displays operational areas, military bases, and tactical indicators across the Indo-Pacific region.

---

## Technology Stack

### Libraries
- **Leaflet**: 1.9.4 (core mapping library)
- **react-leaflet**: v5 (React wrapper)
- **Tile Provider**: OpenStreetMap
- **Icon Rendering**: ReactDOMServer for custom markers

### Installation
```json
// package.json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  }
}
```

### CSS Import (CRITICAL)

**DO NOT** use `@import` in CSS files (PostCSS issues).

**CORRECT** (in index.tsx):
```typescript
// Import Leaflet CSS directly in TypeScript
import 'leaflet/dist/leaflet.css';
```

---

## Map Configuration

### Default Settings

```typescript
// Map.tsx
const DEFAULT_CENTER: [number, number] = [20.0, 121.5]; // Indo-Pacific center
const DEFAULT_ZOOM = 5;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
```

### MapContainer Setup

```tsx
<MapContainer
  center={center || DEFAULT_CENTER}
  zoom={zoom || DEFAULT_ZOOM}
  className="w-full h-full"
  zoomControl={false}  // Custom zoom control
  attributionControl={true}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {/* Markers, rectangles, etc. */}
</MapContainer>
```

---

## Map Components

### 1. TileLayer

**Purpose**: Display map tiles from OpenStreetMap

```tsx
<TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  maxZoom={18}
  minZoom={3}
/>
```

**Alternative Providers** (optional):
- **Satellite**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **Terrain**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
- **Dark Mode**: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

### 2. Markers (Location Pins)

**Purpose**: Display military bases on map

```tsx
{filteredLocations.map((location) => (
  <Marker
    key={location.id}
    position={location.coords}
    icon={getIcon(location)}
    eventHandlers={{
      click: () => handleMarkerClick(location)
    }}
  >
    <Popup>
      <div className="text-sm">
        <h3 className="font-bold">{location.name}</h3>
        <p>{location.country}</p>
        {/* Damage display */}
      </div>
    </Popup>
  </Marker>
))}
```

### 3. Rectangles (Operational Areas)

**Purpose**: Display operational zones with bounds

```tsx
{operationalAreas.map((area) => (
  <Rectangle
    key={area.id}
    bounds={area.bounds}  // [[lat1, lng1], [lat2, lng2]]
    pathOptions={{
      color: area.color,
      fillColor: area.color,
      fillOpacity: area.fillOpacity || 0.2,
      weight: 2
    }}
    eventHandlers={{
      click: () => handleAreaClick(area)
    }}
  >
    <Popup
      maxWidth={500}
      minWidth={400}
    >
      <DataEditor
        selectedArea={area}
        /* ... props */
      />
    </Popup>
  </Rectangle>
))}
```

### 4. Popups

**Purpose**: Display interactive editors for areas/bases

**Configuration**:
```tsx
<Popup
  maxWidth={500}
  minWidth={400}
  maxHeight={600}
  autoPan={true}
  closeButton={true}
>
  {/* Content */}
</Popup>
```

**IMPORTANT**: Popups must be children of Marker or Rectangle components.

---

## Custom Controls

### MapInitializer

**Purpose**: Ensure map renders correctly on mount

```typescript
// components/map/controls/MapInitializer.tsx
const MapInitializer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // Force map to recalculate size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};
```

**Usage**:
```tsx
<MapContainer>
  <MapInitializer />
  {/* other components */}
</MapContainer>
```

### ScaleControl

**Purpose**: Display map scale in km/mi

```typescript
// components/map/controls/ScaleControl.tsx
const ScaleControl: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const scale = L.control.scale({
      position: 'bottomleft',
      imperial: false,
      metric: true
    });

    map.addControl(scale);

    return () => {
      map.removeControl(scale);
    };
  }, [map]);

  return null;
};
```

### ChangeView

**Purpose**: Programmatically change map center/zoom

```typescript
// components/map/controls/ChangeView.tsx
interface ChangeViewProps {
  center: [number, number];
  zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5
    });
  }, [center, zoom, map]);

  return null;
};
```

**Usage**:
```tsx
const [mapCenter, setMapCenter] = useState<[number, number]>([20, 121]);
const [mapZoom, setMapZoom] = useState(5);

<MapContainer>
  <ChangeView center={mapCenter} zoom={mapZoom} />
</MapContainer>
```

### DragController

**Purpose**: Enable/disable map dragging

```typescript
// components/map/controls/DragController.tsx
interface DragControllerProps {
  draggable: boolean;
}

const DragController: React.FC<DragControllerProps> = ({ draggable }) => {
  const map = useMap();

  useEffect(() => {
    if (draggable) {
      map.dragging.enable();
    } else {
      map.dragging.disable();
    }
  }, [draggable, map]);

  return null;
};
```

### MapClickHandler

**Purpose**: Handle clicks on empty map areas

```typescript
// components/map/controls/MapClickHandler.tsx
interface MapClickHandlerProps {
  onMapClick: (latlng: L.LatLng) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });

  return null;
};
```

---

## Custom Icons

### Icon Generation with ReactDOMServer

**Critical Pattern**: Convert React components to HTML strings for Leaflet divIcon

```typescript
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';

const createCustomIcon = (content: React.ReactElement) => {
  const htmlString = ReactDOMServer.renderToString(content);

  return L.divIcon({
    html: htmlString,
    className: '', // Important: empty to avoid default Leaflet styles
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};
```

### Base Marker Icons

**Implementation** (utils/iconGenerators.ts):

```typescript
export const getIcon = (location: Location): L.DivIcon => {
  const damageCount = location.currentDamage.filter(d => d).length;
  const isDestroyed = damageCount >= location.damagePoints;

  const iconContent = (
    <div className={`
      w-8 h-8 rounded-full flex items-center justify-center text-xl
      ${isDestroyed ? 'bg-red-600' : 'bg-blue-600'}
      border-2 border-white shadow-lg
    `}>
      {isDestroyed ? '💥' : '🏰'}
    </div>
  );

  return L.divIcon({
    html: ReactDOMServer.renderToString(iconContent),
    className: '',
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};
```

### Operational Status Icons

**Purpose**: Show tactical network status on area corners

```typescript
export const getOperationalStatusIcon = (
  area: OperationalArea,
  operationalData: OperationalData[]
): L.DivIcon | null => {
  const data = operationalData.find(d => d.id === area.id);
  if (!data?.tacticalNetwork) return null;

  const iconContent = (
    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
      📡
    </div>
  );

  return L.divIcon({
    html: ReactDOMServer.renderToString(iconContent),
    className: '',
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Positioning on rectangle
const bounds = area.bounds;
const bottomRight: [number, number] = bounds[1];

{operationalIcon && (
  <Marker position={bottomRight} icon={operationalIcon} />
)}
```

### Air Patrol Status Icons

**Three States**: Active (blue), Pending (yellow), Inactive (gray)

```typescript
export const getAirPatrolStatusIcon = (
  status: 'active' | 'pending' | 'inactive'
): L.DivIcon => {
  const colors = {
    active: 'bg-blue-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-500'
  };

  const iconContent = (
    <div className={`
      w-8 h-8 rounded-full ${colors[status]}
      flex items-center justify-center text-lg
      border-2 border-white shadow-lg
    `}>
      ✈️
    </div>
  );

  return L.divIcon({
    html: ReactDOMServer.renderToString(iconContent),
    className: '',
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};
```

---

## Coordinate System

### Latitude/Longitude Format

**Format**: `[latitude, longitude]`
- Latitude: -90 to 90 (North positive, South negative)
- Longitude: -180 to 180 (East positive, West negative)

**Example**:
```typescript
const philippineSeaCenter: [number, number] = [15.0, 135.0];
const guamBase: [number, number] = [13.4443, 144.7937];
```

### Bounds Format (Operational Areas)

**Format**: `[[lat1, lng1], [lat2, lng2]]`
- First point: Southwest corner
- Second point: Northeast corner

**Example**:
```typescript
const areaB ounds: [[number, number], [number, number]] = [
  [10.0, 130.0],  // Southwest corner
  [20.0, 140.0]   // Northeast corner
];
```

### Coordinate Validation

```typescript
const isValidCoordinate = (coords: [number, number]): boolean => {
  const [lat, lng] = coords;
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};
```

---

## Firestore Array Flattening

### The Problem

Firestore doesn't support nested arrays. Operational area bounds must be flattened.

**Nested Array** (TypeScript):
```typescript
bounds: [[10.0, 130.0], [20.0, 140.0]]
```

**Flattened Array** (Firestore):
```typescript
bounds: [10.0, 130.0, 20.0, 140.0]
```

### Conversion Functions

**In firestoreService.ts**:

```typescript
export const areaToFirestore = (area: OperationalArea) => {
  return {
    ...area,
    bounds: area.bounds.flat() // [[a,b],[c,d]] → [a,b,c,d]
  };
};

export const areaFromFirestore = (data: any): OperationalArea => {
  const bounds = data.bounds || [];
  return {
    ...data,
    bounds: [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]]
    ] // [a,b,c,d] → [[a,b],[c,d]]
  };
};
```

**CRITICAL**: Always use these functions when reading/writing areas.

---

## Event Handling

### Marker Click

```typescript
const handleMarkerClick = (location: Location) => {
  setSelectedLocation(location);
  // Open popup or detail modal
};

<Marker
  position={location.coords}
  eventHandlers={{ click: () => handleMarkerClick(location) }}
/>
```

### Area Click

```typescript
const handleAreaClick = (area: OperationalArea) => {
  setSelectedArea(area);
  // Popup opens automatically (built into Rectangle)
};

<Rectangle
  bounds={area.bounds}
  eventHandlers={{ click: () => handleAreaClick(area) }}
>
  <Popup>
    <DataEditor selectedArea={area} />
  </Popup>
</Rectangle>
```

### Map Click (Empty Area)

```typescript
const MapClickHandler: React.FC = () => {
  useMapEvents({
    click: (e) => {
      console.log('Clicked at:', e.latlng);
      // Clear selections or add marker
    }
  });
  return null;
};
```

---

## Styling

### Custom Leaflet Styles

**In index.html** `<style>` block:

```css
/* Fix default icon paths */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}

/* Popup styles */
.leaflet-popup-content-wrapper {
  background-color: #1f2937 !important;
  color: white !important;
  border-radius: 8px;
  padding: 0;
}

.leaflet-popup-content {
  margin: 0;
  max-height: 600px;
  overflow-y: auto;
}

/* Remove popup tip (arrow) */
.leaflet-popup-tip {
  display: none;
}
```

### Area Colors

**Common Colors**:
```typescript
const AREA_COLORS = {
  blue: '#3b82f6',    // US/Allied
  red: '#ef4444',     // Opposing
  green: '#10b981',   // Neutral
  yellow: '#f59e0b',  // Contested
  purple: '#a855f7'   // Special
};
```

### Fill Opacity

```typescript
// Transparent fill for operational areas
fillOpacity: 0.2  // 20% opacity (recommended)
```

---

## Performance Optimization

### 1. Memoize Filtered Locations

```typescript
const filteredLocations = useMemo(() => {
  return locations.filter(/* filters */);
}, [locations, filters]);
```

### 2. Conditional Rendering

```typescript
// Only render markers at appropriate zoom levels
const map = useMap();
const zoom = map.getZoom();

{zoom >= 6 && filteredLocations.map(location => (
  <Marker key={location.id} position={location.coords} />
))}
```

### 3. Clustering (Future)

For many markers, use **react-leaflet-cluster**:
```bash
npm install react-leaflet-cluster
```

---

## Common Issues & Solutions

### Issue: Map Not Rendering

**Problem**: Blank gray area
**Causes**:
1. Leaflet CSS not imported
2. Map container has no height
3. Invalid coordinates (NaN/undefined)

**Solutions**:
```typescript
// 1. Import CSS in index.tsx
import 'leaflet/dist/leaflet.css';

// 2. Set container height
<div className="w-full h-screen">
  <MapContainer />
</div>

// 3. Validate coordinates
if (!isValidCoordinate(location.coords)) {
  console.error('Invalid coords:', location.coords);
  return null;
}
```

### Issue: Default Marker Icons Broken

**Problem**: Blue placeholder instead of pin icon

**Solution** (in index.tsx):
```typescript
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
```

### Issue: Popup Doesn't Open

**Problem**: Click doesn't show popup

**Causes**:
1. Popup not child of Marker/Rectangle
2. Event handler overriding default behavior

**Solution**:
```tsx
// Popup must be CHILD of Marker
<Marker position={coords}>
  <Popup>Content</Popup>
</Marker>

// Don't prevent default
<Marker
  eventHandlers={{
    click: (e) => {
      // Don't call e.preventDefault()
      handleClick();
    }
  }}
/>
```

### Issue: Map Size Incorrect After Resize

**Problem**: Map doesn't fill container after resize

**Solution**:
```typescript
const map = useMap();

useEffect(() => {
  const handleResize = () => {
    map.invalidateSize();
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [map]);
```

---

## Geolocation

### User Location Tracking

```typescript
const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

const handleGeolocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);
      setMapZoom(10);
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Unable to get location');
    }
  );
};

// Display user marker
{userPosition && (
  <Marker position={userPosition} icon={customUserIcon}>
    <Popup>Your Location</Popup>
  </Marker>
)}
```

---

## Future Enhancements

### Planned Features
1. **Drawing Tools**: Create areas by drawing on map
2. **Distance Measurement**: Measure between points
3. **Layer Switching**: Toggle between map styles
4. **Heat Maps**: Show activity/damage intensity
5. **Animation**: Unit movement animations
6. **3D Terrain**: Topographic view
7. **Weather Overlay**: Real-time weather data
8. **Offline Maps**: Cached tiles for offline use

---

## Related Documentation
- [Architecture](./ARCHITECTURE.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Combat System](./COMBAT_SYSTEM.md)
- [Unit System](./UNIT_SYSTEM.md)
