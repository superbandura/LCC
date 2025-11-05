/**
 * DragController Component
 *
 * Controls map dragging and cursor style based on selection mode.
 * When in selection mode, disables dragging and shows crosshair cursor.
 */

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface DragControllerProps {
  selectionMode: boolean;
}

const DragController: React.FC<DragControllerProps> = ({ selectionMode }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    if (selectionMode) {
      // Disable dragging
      map.dragging.disable();
      // Change cursor to crosshair
      container.style.cursor = 'crosshair';
    } else {
      // Enable dragging
      map.dragging.enable();
      // Reset cursor
      container.style.cursor = '';
    }

    return () => {
      // Cleanup: restore defaults
      map.dragging.enable();
      container.style.cursor = '';
    };
  }, [selectionMode, map]);

  return null;
};

export default DragController;
