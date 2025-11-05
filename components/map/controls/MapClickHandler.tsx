/**
 * MapClickHandler Component
 *
 * Handles map clicks for coordinate selection.
 * Only triggers when in selection mode.
 */

import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { Position } from '../../../types';

interface MapClickHandlerProps {
  selectionMode: boolean;
  onSelect: (coords: Position) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ selectionMode, onSelect }) => {
  useMapEvents({
    click: (e) => {
      if (selectionMode) {
        const { lat, lng } = e.latlng;
        onSelect([lat, lng]);
      }
    },
  });

  return null;
};

export default MapClickHandler;
