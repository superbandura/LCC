/**
 * ScaleControl Component
 *
 * Adds a scale indicator to the map showing distance in kilometers.
 * Features clickable style cycling through 3 different visual styles.
 */

import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ScaleControl: React.FC = () => {
  const map = useMap();
  const [styleIndex, setStyleIndex] = useState(0); // 0: default, 1: alt-style-1, 2: alt-style-2

  useEffect(() => {
    // Create scale control
    const scale = L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false,
      maxWidth: 200,
    });

    scale.addTo(map);

    // Add click handler to cycle through styles
    const scaleElement = scale.getContainer();
    if (scaleElement) {
      const handleClick = () => {
        setStyleIndex(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
      };
      scaleElement.addEventListener('click', handleClick);

      // Cleanup
      return () => {
        scaleElement.removeEventListener('click', handleClick);
        scale.remove();
      };
    }

    return () => {
      scale.remove();
    };
  }, [map]);

  // Update class when style changes
  useEffect(() => {
    const scaleElements = document.querySelectorAll('.leaflet-control-scale-line');
    scaleElements.forEach(element => {
      // Remove all style classes
      element.classList.remove('alt-style-1', 'alt-style-2');

      // Add appropriate class based on current style index
      if (styleIndex === 1) {
        element.classList.add('alt-style-1');
      } else if (styleIndex === 2) {
        element.classList.add('alt-style-2');
      }
      // styleIndex === 0 means default style (no additional class)
    });
  }, [styleIndex]);

  return null;
};

export default ScaleControl;
