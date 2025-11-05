/**
 * MapInitializer Component
 *
 * Forces the Leaflet map to recalculate its size on mount.
 * This fixes common rendering issues where the map doesn't fill its container.
 */

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapInitializer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // Force map to recalculate size on mount
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timeout);
  }, [map]);

  return null;
};

export default MapInitializer;
