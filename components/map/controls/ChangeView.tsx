/**
 * ChangeView Component
 *
 * Programmatically changes the map's center position and zoom level.
 * Includes coordinate validation and smooth animation.
 */

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Position } from '../../../types';

interface ChangeViewProps {
  center: Position;
  zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size to fix rendering issues
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  useEffect(() => {
    // Validate coordinates before flying to them
    if (center && Array.isArray(center) && center.length === 2 &&
        typeof center[0] === 'number' && typeof center[1] === 'number' &&
        !isNaN(center[0]) && !isNaN(center[1]) &&
        isFinite(center[0]) && isFinite(center[1]) &&
        typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom)) {
      try {
        map.setView(center, zoom, {
          animate: true,
          duration: 1
        });
      } catch (error) {
        // Silently handle map view errors
      }
    }
  }, [center, zoom, map]);

  return null;
};

export default ChangeView;
