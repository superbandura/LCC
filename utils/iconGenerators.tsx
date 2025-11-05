/**
 * Icon Generators for Leaflet Map Markers
 *
 * This module contains functions that generate custom Leaflet divIcons
 * using ReactDOMServer to convert React components to HTML strings.
 *
 * All icons are 35x35px by default for consistency.
 */

import React from 'react';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { UsaFlagIcon, ChinaFlagIcon, InfoIcon, DestroyedIcon } from '../components/Icons';
import { Location, OperationalData } from '../types';
import RedTacticaIcon from '../img/RedTactica.png';
import PatrullaIcon from '../img/Patrulla.png';

/**
 * Generate icon for base/location markers
 *
 * @param country - Country affiliation ('EE. UU.' or other)
 * @param isDestroyed - Whether the base is destroyed
 * @returns Leaflet divIcon with flag and optional destroyed overlay
 */
export const getIcon = (country: Location['country'], isDestroyed: boolean = false): L.DivIcon => {
  const flagIcon = country === 'EE. UU.' ? <UsaFlagIcon /> : <ChinaFlagIcon />;
  const destroyedColor = country === 'EE. UU.' ? '#DC2626' : '#2563EB'; // Red for US, blue for China

  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        filter: isDestroyed ? 'grayscale(100%)' : 'none',
        opacity: isDestroyed ? 0.6 : 1,
        width: '100%',
        height: '100%'
      }}>
        {flagIcon}
      </div>
      {isDestroyed && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '35px',
          height: '35px',
          zIndex: 1000
        }}>
          <DestroyedIcon color={destroyedColor} />
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

/**
 * Generate operational status icon for operational areas
 *
 * Shows info icon, styled differently if area is destroyed
 *
 * @param data - Operational data for the area
 * @returns Leaflet divIcon with info indicator
 */
export const getOperationalStatusIcon = (data: OperationalData): L.DivIcon => {
  // Consider destroyed if either faction has both air patrol checkboxes marked
  const usPatrolsDestroyed = data.us.airPatrolsDamage.every(dmg => dmg === true);
  const planPatrolsDestroyed = data.plan.airPatrolsDamage.every(dmg => dmg === true);
  const isDestroyed = usPatrolsDestroyed || planPatrolsDestroyed;

  const iconHtml = ReactDOMServer.renderToString(<InfoIcon />);

  return L.divIcon({
    html: iconHtml,
    className: isDestroyed ? 'info-icon-marker-destroyed' : 'info-icon-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

/**
 * Generate operational status icon with card count badge
 *
 * Shows info icon with a cyan badge indicating the number of assigned cards
 * for the selected faction. Badge only appears when cardCount > 0.
 *
 * @param data - Operational data for the area
 * @param cardCount - Number of cards assigned to this area (filtered by faction)
 * @returns Leaflet divIcon with info indicator and card count badge
 */
export const getOperationalStatusIconWithCardBadge = (data: OperationalData, cardCount: number): L.DivIcon => {
  // Consider destroyed if either faction has both air patrol checkboxes marked
  const usPatrolsDestroyed = data.us.airPatrolsDamage.every(dmg => dmg === true);
  const planPatrolsDestroyed = data.plan.airPatrolsDamage.every(dmg => dmg === true);
  const isDestroyed = usPatrolsDestroyed || planPatrolsDestroyed;

  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <InfoIcon />
      {cardCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          backgroundColor: '#06B6D4', // Cyan-600
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {cardCount}
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: isDestroyed ? 'info-icon-marker-destroyed' : 'info-icon-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

/**
 * Generate air patrol status icon
 *
 * Icon color indicates status:
 * - Blue (US) / Red (China): Operational
 * - Gray: Destroyed or used
 *
 * @param data - Operational data for the area
 * @param faction - Player's faction ('us' or 'china')
 * @returns Leaflet divIcon with air patrol status
 */
export const getAirPatrolStatusIcon = (data: OperationalData, faction: 'us' | 'china'): L.DivIcon => {
  // Determine air patrol status for the player's faction
  const factionKey = faction === 'us' ? 'us' : 'plan';
  const isDestroyed = data[factionKey].airPatrolsDamage.every(dmg => dmg === true);
  const isUsed = data[factionKey].airPatrolsUsed;

  // Determine background color
  let bgColor = '#DC2626'; // Red for China by default
  let opacity = 1;

  if (isDestroyed || isUsed) {
    bgColor = '#9CA3AF'; // Gray when used or destroyed
    opacity = 0.5;
  } else if (faction === 'us') {
    bgColor = '#3B82F6'; // Blue for US
  }

  // Build the icon with conditional styling
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        opacity: opacity,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <img
          src={PatrullaIcon}
          alt="Air Patrol"
          style={{
            width: '70%',
            height: '70%',
            filter: 'brightness(0) invert(1)', // Make image white
          }}
        />
      </div>
      {isDestroyed && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          zIndex: 1000
        }}>
          <DestroyedIcon color="#DC2626" />
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'air-patrol-status-icon',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};

/**
 * Generate tactical network status icon
 *
 * Icon color indicates damage level:
 * - Green: 0-1 damage (operational)
 * - Yellow: 2-3 damage (warning)
 * - Red: 4+ damage (critical)
 *
 * @param data - Operational data for the area
 * @param faction - Player's faction ('us' or 'china')
 * @returns Leaflet divIcon with tactical network status
 */
export const getTacticalNetworkStatusIcon = (data: OperationalData, faction: 'us' | 'china'): L.DivIcon => {
  // Determine tactical network damage for the player's faction
  const factionKey = faction === 'us' ? 'us' : 'plan';
  const damageCount = data[factionKey].tacticalNetworkDamage.filter(dmg => dmg === true).length;

  // Determine background color based on damage level
  let bgColor = '#10B981'; // Green by default (operational)
  let statusText = 'Operational';

  if (damageCount >= 4) {
    bgColor = '#DC2626'; // Red for critical damage
    statusText = 'Critical';
  } else if (damageCount >= 2) {
    bgColor = '#FBBF24'; // Yellow for warning
    statusText = 'Damaged';
  }

  // Build the icon with conditional styling
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <img
          src={RedTacticaIcon}
          alt="Tactical Network"
          style={{
            width: '70%',
            height: '70%',
            filter: 'brightness(0) invert(1)', // Make image white
          }}
        />
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'tactical-network-status-icon',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};

/**
 * Generate pending deployments icon
 *
 * Shows an orange clock icon when there are pending deployments (cards, units, or task forces)
 * in the operational area
 *
 * @param pendingCount - Total count of pending items
 * @returns Leaflet divIcon with pending deployments indicator
 */
export const getPendingDeploymentsIcon = (pendingCount: number): L.DivIcon => {
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          textAlign: 'center',
          lineHeight: '1',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
        }}>
          ➡️
        </div>
      </div>
      {pendingCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          backgroundColor: '#DC2626', // Red-600
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {pendingCount}
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'pending-deployments-icon',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};
