// Generated unit data - DO NOT EDIT MANUALLY
// Este archivo contiene todas las unidades del juego
// Total: 96 unidades (USMC: 50, PLAN: 46)
// Última actualización: 2025-11-05T08:00:32.089Z
import { Unit } from '../types';

export const initialUnits: Unit[] = [
  {
    "category": "supply",
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "taskForceId": null,
    "supply": 8,
    "supplyUsed": 0,
    "damagePoints": 1,
    "currentDamage": [
      false
    ],
    "name": "1 FOX",
    "type": "FARP PLATOON",
    "image": "/images/Unidades USMC/USMC Fox 1.png",
    "isDetected": false,
    "deploymentCost": 2,
    "faction": "us",
    "id": "usmc-fox-1"
  },
  {
    "category": "ground",
    "groundCombat": 5,
    "name": "1-1 BRAVO",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "groundCombatUsed": 0,
    "faction": "us",
    "deploymentCost": 2,
    "attackPrimary": 3,
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "type": "ACV SECTION",
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Bravo 1-1.png",
    "id": "usmc-bravo-1-1"
  },
  {
    "type": "HIMARS SECTION",
    "damagePoints": 2,
    "isDetected": false,
    "deploymentCost": 3,
    "attackPrimary": 6,
    "taskForceId": null,
    "category": "artillery",
    "id": "usmc-charlie-1-1",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "attackSecondary": 4,
    "name": "1-1 CHARLIE",
    "faction": "us",
    "attackSecondaryUsed": 0,
    "image": "/images/Unidades USMC/USMC Charlie 1-1.png"
  },
  {
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "type": "MRIC SECTION",
    "taskForceId": null,
    "category": "interception",
    "name": "1-1 DELTA",
    "damagePoints": 2,
    "interception": 10,
    "interceptionUsed": 0,
    "id": "usmc-delta-1-1",
    "image": "/images/Unidades USMC/USMC Delta 1-1.png",
    "faction": "us",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "isDetected": false
  },
  {
    "faction": "us",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3,
    "name": "1-1 ECHO",
    "category": "interception",
    "id": "usmc-echo-1-1",
    "image": "/images/Unidades USMC/USMC Echo 1-1.png",
    "isDetected": false,
    "interception": 10,
    "type": "MRIC SECTION",
    "interceptionUsed": 0,
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2
  },
  {
    "type": "HIMARS SECTION",
    "attackPrimaryUsed": 0,
    "category": "artillery",
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "id": "usmc-whiskey-1-1",
    "faction": "us",
    "attackPrimary": 6,
    "isDetected": false,
    "attackSecondaryUsed": 0,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "taskForceId": null,
    "name": "1-1 WHISKEY",
    "attackSecondary": 4,
    "image": "/images/Unidades USMC/USMC Whiskey 1-1.png",
    "damagePoints": 2
  },
  {
    "attackPrimary": 3,
    "isDetected": false,
    "image": "/images/Unidades USMC/USMC Bravo 2-1.png",
    "faction": "us",
    "id": "usmc-bravo-2-1",
    "attackPrimaryUsed": 0,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false
    ],
    "category": "ground",
    "damagePoints": 2,
    "type": "ACV SECTION",
    "groundCombatUsed": 0,
    "name": "1-2 BRAVO",
    "groundCombat": 5,
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations."
  },
  {
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "category": "artillery",
    "image": "/images/Unidades USMC/USMC Charlie 2-1.png",
    "attackPrimary": 6,
    "taskForceId": null,
    "attackSecondary": 4,
    "damagePoints": 2,
    "name": "1-2 CHARLIE",
    "id": "usmc-charlie-2-1",
    "deploymentCost": 3,
    "type": "HIMARS SECTION",
    "isDetected": false,
    "attackSecondaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "faction": "us",
    "attackPrimaryUsed": 0
  },
  {
    "id": "usmc-delta-2-1",
    "type": "MRIC SECTION",
    "category": "interception",
    "currentDamage": [
      false,
      false
    ],
    "name": "1-2 DELTA",
    "interceptionUsed": 0,
    "isDetected": false,
    "interception": 10,
    "image": "/images/Unidades USMC/USMC Delta 2-1.png",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "damagePoints": 2,
    "taskForceId": null,
    "faction": "us",
    "deploymentCost": 3
  },
  {
    "category": "interception",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "currentDamage": [
      false,
      false
    ],
    "name": "1-2 ECHO",
    "interception": 10,
    "deploymentCost": 3,
    "faction": "us",
    "damagePoints": 2,
    "interceptionUsed": 0,
    "image": "/images/Unidades USMC/USMC Echo 2-1.png",
    "id": "usmc-echo-2-1",
    "type": "MRIC SECTION",
    "isDetected": false,
    "taskForceId": null
  },
  {
    "attackPrimaryUsed": 0,
    "isDetected": false,
    "attackPrimary": 6,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "name": "1-2 WHISKEY",
    "faction": "us",
    "attackSecondary": 4,
    "category": "artillery",
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "id": "usmc-whiskey-2-1",
    "taskForceId": null,
    "damagePoints": 2,
    "attackSecondaryUsed": 0,
    "type": "HIMARS SECTION",
    "image": "/images/Unidades USMC/USMC Whiskey 2-1.png"
  },
  {
    "isDetected": false,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades USMC/USMC Alpha 1.png",
    "groundCombat": 5,
    "groundCombatUsed": 0,
    "faction": "us",
    "id": "usmc-alpha-1",
    "damagePoints": 2,
    "category": "ground",
    "currentDamage": [
      false,
      false
    ],
    "type": "INFANTRY PLATOON",
    "attackPrimary": 1,
    "taskForceId": null,
    "deploymentCost": 1,
    "name": "1ALPHA"
  },
  {
    "groundCombatUsed": 0,
    "image": "/images/Unidades USMC/USMC Victor 1.png",
    "category": "ground",
    "id": "usmc-victor-1",
    "groundCombat": 5,
    "type": "INFANTRY PLATOON",
    "attackPrimary": 1,
    "attackPrimaryUsed": 0,
    "name": "1VICTOR",
    "deploymentCost": 1,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "faction": "us",
    "taskForceId": null,
    "isDetected": false,
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "image": "/images/Unidades USMC/USMC Fox 2.png",
    "deploymentCost": 2,
    "isDetected": false,
    "supplyUsed": 0,
    "type": "FARP PLATOON",
    "currentDamage": [
      false
    ],
    "damagePoints": 1,
    "faction": "us",
    "category": "supply",
    "id": "usmc-fox-2",
    "name": "2 FOX",
    "taskForceId": null,
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "supply": 8
  },
  {
    "attackPrimary": 3,
    "taskForceId": null,
    "id": "usmc-bravo-1-2",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "groundCombatUsed": 0,
    "image": "/images/Unidades USMC/USMC Bravo 1-2.png",
    "currentDamage": [
      false,
      false
    ],
    "groundCombat": 5,
    "isDetected": false,
    "damagePoints": 2,
    "faction": "us",
    "deploymentCost": 2,
    "category": "ground",
    "attackPrimaryUsed": 0,
    "type": "ACV SECTION",
    "name": "2-1 BRAVO"
  },
  {
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "attackPrimary": 6,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "attackSecondary": 4,
    "name": "2-1 CHARLIE",
    "deploymentCost": 3,
    "image": "/images/Unidades USMC/USMC Charlie 1-2.png",
    "damagePoints": 2,
    "id": "usmc-charlie-1-2",
    "faction": "us",
    "type": "HIMARS SECTION",
    "category": "artillery",
    "attackSecondaryUsed": 0,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets."
  },
  {
    "type": "MRIC SECTION",
    "faction": "us",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3,
    "damagePoints": 2,
    "interception": 10,
    "category": "interception",
    "currentDamage": [
      false,
      false
    ],
    "name": "2-1 DELTA",
    "image": "/images/Unidades USMC/USMC Delta 1-2.png",
    "id": "usmc-delta-1-2",
    "taskForceId": null,
    "interceptionUsed": 0,
    "isDetected": false
  },
  {
    "taskForceId": null,
    "deploymentCost": 3,
    "faction": "us",
    "id": "usmc-echo-1-2",
    "category": "interception",
    "name": "2-1 ECHO",
    "image": "/images/Unidades USMC/USMC Echo 1-2.png",
    "isDetected": false,
    "interception": 10,
    "currentDamage": [
      false,
      false
    ],
    "interceptionUsed": 0,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "type": "MRIC SECTION",
    "damagePoints": 2
  },
  {
    "isDetected": false,
    "deploymentCost": 3,
    "faction": "us",
    "attackSecondary": 4,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "category": "artillery",
    "taskForceId": null,
    "attackSecondaryUsed": 0,
    "damagePoints": 2,
    "name": "2-1 WHISKEY",
    "id": "usmc-whiskey-1-2",
    "attackPrimaryUsed": 0,
    "attackPrimary": 6,
    "type": "HIMARS SECTION",
    "image": "/images/Unidades USMC/USMC Whiskey 1-2.png",
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "taskForceId": null,
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Bravo 2-2.png",
    "attackPrimary": 3,
    "deploymentCost": 2,
    "category": "ground",
    "isDetected": false,
    "groundCombat": 5,
    "name": "2-2 BRAVO",
    "type": "ACV SECTION",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "id": "usmc-bravo-2-2",
    "currentDamage": [
      false,
      false
    ],
    "groundCombatUsed": 0,
    "faction": "us"
  },
  {
    "damagePoints": 2,
    "deploymentCost": 3,
    "isDetected": false,
    "faction": "us",
    "attackPrimaryUsed": 0,
    "attackPrimary": 6,
    "attackSecondaryUsed": 0,
    "attackSecondary": 4,
    "category": "artillery",
    "currentDamage": [
      false,
      false
    ],
    "name": "2-2 CHARLIE",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC Charlie 2-2.png",
    "type": "HIMARS SECTION",
    "id": "usmc-charlie-2-2"
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "name": "2-2 DELTA",
    "faction": "us",
    "taskForceId": null,
    "id": "usmc-delta-2-2",
    "damagePoints": 2,
    "interception": 10,
    "type": "MRIC SECTION",
    "category": "interception",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "image": "/images/Unidades USMC/USMC Delta 2-2.png",
    "isDetected": false,
    "deploymentCost": 3,
    "interceptionUsed": 0
  },
  {
    "category": "interception",
    "id": "usmc-echo-2-2",
    "damagePoints": 2,
    "faction": "us",
    "interceptionUsed": 0,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "isDetected": false,
    "image": "/images/Unidades USMC/USMC Echo 2-2.png",
    "name": "2-2 ECHO",
    "deploymentCost": 3,
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "type": "MRIC SECTION",
    "interception": 10
  },
  {
    "attackPrimary": 6,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "attackSecondaryUsed": 0,
    "name": "2-2 WHISKEY",
    "taskForceId": null,
    "attackSecondary": 4,
    "isDetected": false,
    "faction": "us",
    "deploymentCost": 3,
    "attackPrimaryUsed": 0,
    "id": "usmc-whiskey-2-2",
    "image": "/images/Unidades USMC/USMC Whiskey 2-2.png",
    "type": "HIMARS SECTION",
    "category": "artillery"
  },
  {
    "image": "/images/Unidades USMC/USMC Alpha 2.png",
    "groundCombatUsed": 0,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "taskForceId": null,
    "faction": "us",
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "type": "INFANTRY PLATOON",
    "attackPrimary": 1,
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "groundCombat": 5,
    "deploymentCost": 1,
    "category": "ground",
    "id": "usmc-alpha-2",
    "name": "2ALPHA"
  },
  {
    "name": "2VICTOR",
    "groundCombat": 5,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades USMC/USMC Victor 2.png",
    "isDetected": false,
    "id": "usmc-victor-2",
    "taskForceId": null,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "type": "INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "category": "ground",
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "faction": "us",
    "attackPrimary": 1,
    "deploymentCost": 1
  },
  {
    "deploymentCost": 2,
    "id": "usmc-fox-3",
    "name": "3 FOX",
    "type": "FARP PLATOON",
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "taskForceId": null,
    "faction": "us",
    "currentDamage": [
      false
    ],
    "damagePoints": 1,
    "image": "/images/Unidades USMC/USMC Fox 3.png",
    "category": "supply",
    "isDetected": false,
    "supplyUsed": 0,
    "supply": 8
  },
  {
    "faction": "us",
    "groundCombat": 5,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimary": 3,
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "attackPrimaryUsed": 0,
    "id": "usmc-bravo-1-3",
    "type": "ACV SECTION",
    "category": "ground",
    "damagePoints": 2,
    "groundCombatUsed": 0,
    "image": "/images/Unidades USMC/USMC Bravo 1-3.png",
    "isDetected": false,
    "taskForceId": null,
    "name": "3-1 BRAVO"
  },
  {
    "faction": "us",
    "currentDamage": [
      false,
      false
    ],
    "attackPrimary": 6,
    "category": "artillery",
    "damagePoints": 2,
    "deploymentCost": 3,
    "id": "usmc-charlie-1-3",
    "attackSecondary": 4,
    "type": "HIMARS SECTION",
    "attackPrimaryUsed": 0,
    "name": "3-1 CHARLIE",
    "taskForceId": null,
    "attackSecondaryUsed": 0,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "isDetected": false,
    "image": "/images/Unidades USMC/USMC Charlie 1-3.png"
  },
  {
    "interception": 10,
    "taskForceId": null,
    "faction": "us",
    "interceptionUsed": 0,
    "category": "interception",
    "image": "/images/Unidades USMC/USMC Delta 1-3.png",
    "isDetected": false,
    "damagePoints": 2,
    "id": "usmc-delta-1-3",
    "name": "3-1 DELTA",
    "type": "MRIC SECTION",
    "currentDamage": [
      false,
      false
    ],
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3
  },
  {
    "taskForceId": null,
    "isDetected": false,
    "faction": "us",
    "interception": 10,
    "interceptionUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3,
    "category": "interception",
    "name": "3-1 ECHO",
    "type": "MRIC SECTION",
    "damagePoints": 2,
    "id": "usmc-echo-1-3",
    "image": "/images/Unidades USMC/USMC Echo 1-3.png"
  },
  {
    "taskForceId": null,
    "deploymentCost": 2,
    "name": "3-2 BRAVO",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades USMC/USMC Bravo 2-3.png",
    "damagePoints": 2,
    "groundCombatUsed": 0,
    "groundCombat": 5,
    "attackPrimary": 3,
    "attackPrimaryUsed": 0,
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "faction": "us",
    "isDetected": false,
    "type": "ACV SECTION",
    "id": "usmc-bravo-2-3",
    "category": "ground"
  },
  {
    "type": "HIMARS SECTION",
    "name": "3-2 CHARLIE",
    "image": "/images/Unidades USMC/USMC Charlie 2-3.png",
    "attackSecondary": 4,
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "id": "usmc-charlie-2-3",
    "attackPrimaryUsed": 0,
    "faction": "us",
    "taskForceId": null,
    "attackPrimary": 6,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "deploymentCost": 3,
    "attackSecondaryUsed": 0,
    "damagePoints": 2,
    "category": "artillery"
  },
  {
    "interceptionUsed": 0,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "category": "interception",
    "id": "usmc-delta-2-3",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades USMC/USMC Delta 2-3.png",
    "faction": "us",
    "type": "MRIC SECTION",
    "taskForceId": null,
    "name": "3-2 DELTA",
    "isDetected": false,
    "damagePoints": 2,
    "interception": 10,
    "deploymentCost": 3
  },
  {
    "interception": 10,
    "type": "MRIC SECTION",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "id": "usmc-echo-2-3",
    "name": "3-2 ECHO",
    "damagePoints": 2,
    "category": "interception",
    "interceptionUsed": 0,
    "taskForceId": null,
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Echo 2-3.png",
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "deploymentCost": 3
  },
  {
    "type": "INFANTRY PLATOON",
    "attackPrimary": 1,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "image": "/images/Unidades USMC/USMC Alpha 3.png",
    "id": "usmc-alpha-3",
    "isDetected": false,
    "damagePoints": 2,
    "groundCombat": 5,
    "deploymentCost": 1,
    "category": "ground",
    "name": "3ALPHA",
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "faction": "us",
    "groundCombatUsed": 0
  },
  {
    "category": "ground",
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "faction": "us",
    "name": "3VICTOR",
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Victor 3.png",
    "isDetected": false,
    "id": "usmc-victor-3",
    "groundCombatUsed": 0,
    "attackPrimary": 1,
    "deploymentCost": 1,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "currentDamage": [
      false,
      false
    ],
    "type": "INFANTRY PLATOON",
    "groundCombat": 5
  },
  {
    "attackPrimary": 1,
    "damagePoints": 2,
    "category": "ground",
    "faction": "us",
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "name": "4ALPHA",
    "type": "INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "deploymentCost": 1,
    "image": "/images/Unidades USMC/USMC Alpha 4.png",
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "groundCombat": 5,
    "attackPrimaryUsed": 0,
    "id": "usmc-alpha-4"
  },
  {
    "attackPrimaryUsed": 0,
    "groundCombat": 5,
    "groundCombatUsed": 0,
    "deploymentCost": 1,
    "currentDamage": [
      false,
      false
    ],
    "type": "INFANTRY PLATOON",
    "taskForceId": null,
    "name": "4VICTOR",
    "attackPrimary": 1,
    "category": "ground",
    "id": "usmc-victor-4",
    "isDetected": false,
    "faction": "us",
    "damagePoints": 2,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "image": "/images/Unidades USMC/USMC Victor 4.png"
  },
  {
    "interception": 10,
    "type": "ARLEIGH BURKE CLASS DDG",
    "attackPrimary": 9,
    "name": "DDG-56",
    "category": "naval",
    "deploymentCost": 4,
    "isDetected": false,
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "damagePoints": 2,
    "faction": "us",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "interceptionUsed": 0,
    "image": "/images/Unidades USMC/USMC DDG 56.png",
    "attackPrimaryUsed": 0,
    "id": "usmc-ddg-56"
  },
  {
    "image": "/images/Unidades USMC/USMC DDG 85.png",
    "id": "usmc-ddg-85",
    "deploymentCost": 4,
    "interceptionUsed": 0,
    "damagePoints": 2,
    "name": "DDG-85",
    "interception": 10,
    "isDetected": false,
    "type": "ARLEIGH BURKE CLASS DDG",
    "category": "naval",
    "attackPrimary": 9,
    "currentDamage": [
      false,
      false
    ],
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "faction": "us"
  },
  {
    "deploymentCost": 4,
    "interception": 10,
    "interceptionUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "category": "naval",
    "image": "/images/Unidades USMC/USMC DDG 90.png",
    "taskForceId": null,
    "faction": "us",
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "attackPrimaryUsed": 0,
    "attackPrimary": 9,
    "id": "usmc-ddg-90",
    "type": "ARLEIGH BURKE CLASS DDG",
    "damagePoints": 2,
    "isDetected": false,
    "name": "DDG-90"
  },
  {
    "image": "/images/Unidades USMC/USMC DDG 93.png",
    "deploymentCost": 4,
    "type": "ARLEIGH BURKE CLASS DDG",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "isDetected": false,
    "interceptionUsed": 0,
    "faction": "us",
    "damagePoints": 2,
    "category": "naval",
    "interception": 10,
    "id": "usmc-ddg-93",
    "name": "DDG-93",
    "attackPrimary": 9,
    "attackPrimaryUsed": 0
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "interception": 12,
    "attackPrimary": 15,
    "isDetected": false,
    "id": "usmc-ddgx-101",
    "type": "DDG(X)",
    "interceptionUsed": 0,
    "deploymentCost": 5,
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "image": "/images/Unidades USMC/USMC DDGX 101.png",
    "attackPrimaryUsed": 0,
    "faction": "us",
    "name": "DDG(X) 101",
    "damagePoints": 2,
    "category": "naval"
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "isDetected": false,
    "id": "usmc-ddgx-102",
    "faction": "us",
    "image": "/images/Unidades USMC/USMC DDGX 102.png",
    "attackPrimaryUsed": 0,
    "deploymentCost": 5,
    "type": "DDG(X)",
    "interception": 12,
    "attackPrimary": 15,
    "interceptionUsed": 0,
    "name": "DDG(X) 102",
    "category": "naval",
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "damagePoints": 2
  },
  {
    "name": "DDG(X) 103",
    "category": "naval",
    "interception": 12,
    "id": "usmc-ddgx-103",
    "damagePoints": 2,
    "faction": "us",
    "image": "/images/Unidades USMC/USMC DDGX 103.png",
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "isDetected": false,
    "attackPrimary": 15,
    "deploymentCost": 5,
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "interceptionUsed": 0,
    "type": "DDG(X)",
    "taskForceId": null
  },
  {
    "deploymentCost": 5,
    "isDetected": false,
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "id": "usmc-ddgx-104",
    "image": "/images/Unidades USMC/USMC DDGX 104.png",
    "currentDamage": [
      false,
      false
    ],
    "faction": "us",
    "interception": 12,
    "name": "DDG(X) 104",
    "attackPrimary": 15,
    "taskForceId": null,
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "type": "DDG(X)",
    "interceptionUsed": 0,
    "category": "naval"
  },
  {
    "deploymentCost": 3,
    "type": "MARINE LITTORAL LOGISTICS COMPANY",
    "name": "GOLF",
    "id": "usmc-logistics-golf",
    "image": "/images/Unidades USMC/USMC Golf.png",
    "currentDamage": [
      false,
      false,
      false
    ],
    "taskForceId": null,
    "supply": 20,
    "supplyUsed": 0,
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support.",
    "damagePoints": 3,
    "isDetected": false,
    "faction": "us",
    "category": "supply"
  },
  {
    "id": "usmc-logistics-kilo",
    "category": "supply",
    "type": "MARINE LITTORAL LOGISTICS COMPANY",
    "image": "/images/Unidades USMC/USMC Kilo.png",
    "name": "KILO",
    "supply": 20,
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support.",
    "faction": "us",
    "damagePoints": 3,
    "currentDamage": [
      false,
      false,
      false
    ],
    "deploymentCost": 3,
    "isDetected": false,
    "taskForceId": null,
    "supplyUsed": 0
  },
  {
    "currentDamage": [
      false,
      false,
      false
    ],
    "id": "usmc-logistics-lima",
    "isDetected": false,
    "taskForceId": null,
    "name": "LIMA",
    "deploymentCost": 3,
    "supplyUsed": 0,
    "supply": 20,
    "damagePoints": 3,
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support.",
    "image": "/images/Unidades USMC/USMC Lima.png",
    "faction": "us",
    "category": "supply",
    "type": "MARINE LITTORAL LOGISTICS COMPANY"
  },
  {
    "image": "/images/Unidades PLAN/PLAN Alpha 1.png",
    "faction": "china",
    "name": "1 ALPHA",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "taskForceId": null,
    "type": "MECHANIZED INFANTRY PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-alpha-1",
    "groundCombat": 5,
    "isDetected": false,
    "category": "ground",
    "deploymentCost": 2,
    "groundCombatUsed": 0,
    "damagePoints": 2
  },
  {
    "groundCombatUsed": 0,
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Bravo 1.png",
    "isDetected": false,
    "id": "plan-bravo-1",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "name": "1 BRAVO",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 2,
    "taskForceId": null,
    "groundCombat": 5,
    "type": "MECHANIZED INFANTRY PLATOON",
    "faction": "china",
    "damagePoints": 2
  },
  {
    "faction": "china",
    "category": "ground",
    "damagePoints": 2,
    "id": "plan-charlie-1",
    "type": "HEAVY WEAPONS MORTAR PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "description": "Using 120mm mortars, these heavy weapons provide critical indirect fire capabilities.",
    "image": "/images/Unidades PLAN/PLAN Charlie 1.png",
    "deploymentCost": 2,
    "groundCombat": 5,
    "isDetected": false,
    "name": "1 CHARLIE",
    "taskForceId": null,
    "groundCombatUsed": 0
  },
  {
    "faction": "china",
    "deploymentCost": 2,
    "isDetected": false,
    "taskForceId": null,
    "category": "ground",
    "name": "1 DELTA",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "currentDamage": [
      false,
      false,
      false
    ],
    "damagePoints": 3,
    "groundCombatUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Delta 1.png",
    "groundCombat": 5,
    "type": "LIGHT TANK PLATOON",
    "id": "plan-delta-1"
  },
  {
    "isDetected": false,
    "groundCombat": 5,
    "name": "1 FOX",
    "taskForceId": null,
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "category": "ground",
    "deploymentCost": 1,
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "faction": "china",
    "currentDamage": [
      false,
      false
    ],
    "groundCombatUsed": 0,
    "damagePoints": 2,
    "id": "plan-fox-1",
    "image": "/images/Unidades PLAN/PLAN Fox 1.png"
  },
  {
    "name": "1 GOLF",
    "id": "plan-golf-1",
    "faction": "china",
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Golf 1.png",
    "currentDamage": [
      false,
      false
    ],
    "groundCombatUsed": 0,
    "isDetected": false,
    "type": "MECHANIZED INFANTRY PLATOON",
    "groundCombat": 5,
    "deploymentCost": 2,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "taskForceId": null,
    "damagePoints": 2
  },
  {
    "category": "supply",
    "currentDamage": [
      false
    ],
    "name": "1 LIMA",
    "taskForceId": null,
    "damagePoints": 1,
    "supplyUsed": 0,
    "id": "plan-lima-1",
    "isDetected": false,
    "deploymentCost": 3,
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "image": "/images/Unidades PLAN/PLAN Lima 1.png",
    "faction": "china",
    "type": "LOGISTICS PLATOON",
    "supply": 7
  },
  {
    "deploymentCost": 2,
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Victor 1.png",
    "name": "1 VICTOR",
    "isDetected": false,
    "id": "plan-victor-1",
    "currentDamage": [
      false,
      false,
      false
    ],
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "taskForceId": null,
    "type": "LIGHT TANK PLATOON",
    "damagePoints": 3,
    "groundCombat": 5,
    "faction": "china",
    "groundCombatUsed": 0
  },
  {
    "type": "ARTILLERY SECTION SELF-PROPELLED HOWITZERS",
    "faction": "china",
    "deploymentCost": 3,
    "id": "plan-echo-1-1",
    "image": "/images/Unidades PLAN/PLAN Echo 1-1.png",
    "description": "Equipped with the PLZ-07 122mm self-propelled howitzers, this artillery section provides the advantage of mobile, indirect firepower.",
    "attackPrimaryUsed": 0,
    "attackPrimary": 8,
    "taskForceId": null,
    "isDetected": false,
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "category": "artillery",
    "name": "1-1 ECHO"
  },
  {
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN Kilo 1-1.png",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 3,
    "interception": 5,
    "category": "interception",
    "name": "1-1 KILO",
    "damagePoints": 2,
    "taskForceId": null,
    "id": "plan-kilo-1-1",
    "description": "Although limited in their range, this integrated air and missile defense (IAMD) section protects their force from a wide variety of threats including unmanned aerial vehicles and helicopters.",
    "type": "AIR DEFENSE PLATOON SECTION",
    "interceptionUsed": 0,
    "faction": "china"
  },
  {
    "id": "plan-echo-2-1",
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "category": "artillery",
    "image": "/images/Unidades PLAN/PLAN Echo 2-1.png",
    "attackPrimary": 3,
    "taskForceId": null,
    "name": "1-2 ECHO",
    "damagePoints": 2,
    "faction": "china",
    "deploymentCost": 3,
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets."
  },
  {
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "type": "AIR DEFENSE PLATOON SECTION",
    "id": "plan-kilo-2-1",
    "interceptionUsed": 0,
    "interception": 5,
    "image": "/images/Unidades PLAN/PLAN Kilo 2-1.png",
    "category": "interception",
    "name": "1-2 KILO",
    "isDetected": false,
    "faction": "china",
    "description": "Although limited in their range, this integrated air and missile defense (IAMD) section protects their force from a wide variety of threats including unmanned aerial vehicles and helicopters.",
    "deploymentCost": 3,
    "damagePoints": 2
  },
  {
    "category": "ground",
    "taskForceId": null,
    "groundCombatUsed": 0,
    "faction": "china",
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "name": "2 ALPHA",
    "groundCombat": 5,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "isDetected": false,
    "type": "MECHANIZED INFANTRY PLATOON",
    "id": "plan-alpha-2",
    "image": "/images/Unidades PLAN/PLAN Alpha 2.png",
    "deploymentCost": 2
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "groundCombat": 5,
    "id": "plan-bravo-2",
    "faction": "china",
    "damagePoints": 2,
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN Bravo 2.png",
    "taskForceId": null,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "type": "MECHANIZED INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "category": "ground",
    "name": "2 BRAVO"
  },
  {
    "taskForceId": null,
    "damagePoints": 2,
    "description": "The heavy weapons platoon is specialized in the use of man-portable rockets for anti-tank (AT) operations – such as the HJ-12.",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "groundCombat": 5,
    "faction": "china",
    "isDetected": false,
    "type": "HEAVY WEAPONS ANTI-TANK PLATOON",
    "id": "plan-charlie-2",
    "name": "2 CHARLIE",
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Charlie 2.png",
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "currentDamage": [
      false,
      false,
      false
    ],
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "isDetected": false,
    "type": "LIGHT TANK PLATOON",
    "category": "ground",
    "deploymentCost": 2,
    "groundCombatUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Delta 2.png",
    "faction": "china",
    "damagePoints": 3,
    "id": "plan-delta-2",
    "name": "2 DELTA",
    "taskForceId": null,
    "groundCombat": 5
  },
  {
    "isDetected": false,
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "name": "2 FOX",
    "taskForceId": null,
    "id": "plan-fox-2",
    "groundCombatUsed": 0,
    "faction": "china",
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Fox 2.png",
    "deploymentCost": 1,
    "category": "ground",
    "groundCombat": 5
  },
  {
    "id": "plan-golf-2",
    "image": "/images/Unidades PLAN/PLAN Golf 2.png",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "deploymentCost": 2,
    "category": "ground",
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "type": "MECHANIZED INFANTRY PLATOON",
    "groundCombat": 5,
    "name": "2 GOLF",
    "faction": "china",
    "damagePoints": 2,
    "taskForceId": null,
    "isDetected": false
  },
  {
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "isDetected": false,
    "damagePoints": 1,
    "supplyUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Lima 2.png",
    "supply": 7,
    "currentDamage": [
      false
    ],
    "name": "2 LIMA",
    "taskForceId": null,
    "type": "LOGISTICS PLATOON",
    "faction": "china",
    "category": "supply",
    "deploymentCost": 3,
    "id": "plan-lima-2"
  },
  {
    "id": "plan-victor-2",
    "type": "LIGHT TANK PLATOON",
    "image": "/images/Unidades PLAN/PLAN Victor 2.png",
    "damagePoints": 3,
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "category": "ground",
    "taskForceId": null,
    "groundCombatUsed": 0,
    "isDetected": false,
    "faction": "china",
    "name": "2 VICTOR",
    "groundCombat": 5,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false,
      false
    ]
  },
  {
    "image": "/images/Unidades PLAN/PLAN Echo 1-2.png",
    "deploymentCost": 3,
    "name": "2-1 ECHO",
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets.",
    "isDetected": false,
    "taskForceId": null,
    "category": "artillery",
    "faction": "china",
    "attackPrimary": 3,
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-echo-1-2",
    "attackPrimaryUsed": 0,
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)"
  },
  {
    "category": "artillery",
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "isDetected": false,
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets.",
    "attackPrimary": 3,
    "deploymentCost": 3,
    "name": "2-2 ECHO",
    "faction": "china",
    "damagePoints": 2,
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Echo 2-2.png",
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "id": "plan-echo-2-2"
  },
  {
    "description": "The WS-3 is a precision 400mm Multiple Launch Rocket System (MLRS), capable of high mobility and firing speeds.",
    "category": "artillery",
    "damagePoints": 2,
    "name": "2-3 ECHO",
    "currentDamage": [
      false,
      false
    ],
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "image": "/images/Unidades PLAN/PLAN Echo 2-3.png",
    "attackPrimary": 3,
    "deploymentCost": 3,
    "faction": "china",
    "isDetected": false,
    "taskForceId": null,
    "attackPrimaryUsed": 0,
    "id": "plan-echo-3-2"
  },
  {
    "groundCombatUsed": 0,
    "isDetected": false,
    "name": "3 ALPHA",
    "groundCombat": 5,
    "deploymentCost": 2,
    "id": "plan-alpha-3",
    "type": "MECHANIZED INFANTRY PLATOON",
    "category": "ground",
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN Alpha 3.png",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations."
  },
  {
    "faction": "china",
    "damagePoints": 2,
    "id": "plan-bravo-3",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "groundCombat": 5,
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "deploymentCost": 2,
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Bravo 3.png",
    "name": "3 BRAVO",
    "type": "MECHANIZED INFANTRY PLATOON",
    "taskForceId": null,
    "groundCombatUsed": 0
  },
  {
    "image": "/images/Unidades PLAN/PLAN Charlie 3.png",
    "groundCombatUsed": 0,
    "name": "3 CHARLIE",
    "description": "The heavy weapons platoon is specialized in the use of man-portable rockets for anti-tank (AT) operations – such as the HJ-12.",
    "groundCombat": 5,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "damagePoints": 2,
    "type": "HEAVY WEAPONS ANTI-TANK PLATOON",
    "isDetected": false,
    "id": "plan-charlie-3",
    "category": "ground",
    "faction": "china"
  },
  {
    "category": "ground",
    "groundCombatUsed": 0,
    "taskForceId": null,
    "currentDamage": [
      false,
      false,
      false
    ],
    "faction": "china",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "image": "/images/Unidades PLAN/PLAN Delta 3.png",
    "deploymentCost": 2,
    "isDetected": false,
    "name": "3 DELTA",
    "id": "plan-delta-3",
    "type": "LIGHT TANK PLATOON",
    "damagePoints": 3,
    "groundCombat": 5
  },
  {
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 1,
    "faction": "china",
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "damagePoints": 2,
    "groundCombatUsed": 0,
    "id": "plan-fox-3",
    "taskForceId": null,
    "isDetected": false,
    "groundCombat": 5,
    "name": "3 FOX",
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Fox 3.png"
  },
  {
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "type": "MECHANIZED INFANTRY PLATOON",
    "isDetected": false,
    "category": "ground",
    "taskForceId": null,
    "faction": "china",
    "name": "3 GOLF",
    "damagePoints": 2,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false
    ],
    "groundCombat": 5,
    "image": "/images/Unidades PLAN/PLAN Golf 3.png",
    "groundCombatUsed": 0,
    "id": "plan-golf-3"
  },
  {
    "name": "3 LIMA",
    "supplyUsed": 0,
    "currentDamage": [
      false
    ],
    "category": "supply",
    "deploymentCost": 3,
    "image": "/images/Unidades PLAN/PLAN Lima 3.png",
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "taskForceId": null,
    "damagePoints": 1,
    "faction": "china",
    "type": "LOGISTICS PLATOON",
    "supply": 7,
    "isDetected": false,
    "id": "plan-lima-3"
  },
  {
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "faction": "china",
    "currentDamage": [
      false,
      false,
      false
    ],
    "groundCombatUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Victor 3.png",
    "type": "LIGHT TANK PLATOON",
    "damagePoints": 3,
    "name": "3 VICTOR",
    "id": "plan-victor-3",
    "taskForceId": null,
    "category": "ground",
    "isDetected": false,
    "groundCombat": 5,
    "deploymentCost": 2
  },
  {
    "description": "Equipped with the PLZ-07 122mm self-propelled howitzers, this artillery section provides the advantage of mobile, indirect firepower.",
    "deploymentCost": 3,
    "isDetected": false,
    "damagePoints": 2,
    "id": "plan-echo-1-3",
    "attackPrimary": 8,
    "currentDamage": [
      false,
      false
    ],
    "type": "ARTILLERY SECTION SELF-PROPELLED HOWITZERS",
    "image": "/images/Unidades PLAN/PLAN Echo 1-3.png",
    "category": "artillery",
    "name": "3-1 ECHO",
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "faction": "china"
  },
  {
    "name": "4 ALPHA",
    "deploymentCost": 2,
    "image": "/images/Unidades PLAN/PLAN Alpha 4.png",
    "damagePoints": 2,
    "faction": "china",
    "type": "MECHANIZED WEAPONS PLATOON",
    "taskForceId": null,
    "isDetected": false,
    "id": "plan-alpha-4",
    "groundCombatUsed": 0,
    "category": "ground",
    "groundCombat": 5,
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "type": "MECHANIZED WEAPONS PLATOON",
    "category": "ground",
    "name": "4 BRAVO",
    "faction": "china",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Bravo 4.png",
    "id": "plan-bravo-4",
    "damagePoints": 2,
    "deploymentCost": 2,
    "taskForceId": null,
    "groundCombat": 5,
    "isDetected": false,
    "groundCombatUsed": 0
  },
  {
    "isDetected": false,
    "damagePoints": 2,
    "type": "MECHANIZED WEAPONS PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "groundCombat": 5,
    "category": "ground",
    "name": "4 GOLF",
    "deploymentCost": 2,
    "groundCombatUsed": 0,
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Golf 4.png",
    "id": "plan-golf-4",
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "faction": "china"
  },
  {
    "category": "naval",
    "deploymentCost": 4,
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities.",
    "attackPrimary": 7,
    "interceptionUsed": 0,
    "id": "plan-ddg-type52-172",
    "damagePoints": 2,
    "type": "TYPE 052D",
    "interception": 8,
    "faction": "china",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades PLAN/PLAN DDG T52 172.png",
    "name": "T-52 172 DDG"
  },
  {
    "attackPrimaryUsed": 0,
    "id": "plan-ddg-type52-173",
    "image": "/images/Unidades PLAN/PLAN DDG T52 173.png",
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities.",
    "isDetected": false,
    "category": "naval",
    "damagePoints": 2,
    "type": "TYPE 052D",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 4,
    "interception": 8,
    "attackPrimary": 7,
    "interceptionUsed": 0,
    "taskForceId": null,
    "name": "T-52 173 DDG",
    "faction": "china"
  },
  {
    "name": "T-52 174 DDG",
    "taskForceId": null,
    "id": "plan-ddg-type52-174",
    "faction": "china",
    "damagePoints": 2,
    "interception": 8,
    "attackPrimary": 7,
    "isDetected": false,
    "deploymentCost": 4,
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities.",
    "type": "TYPE 052D",
    "category": "naval",
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades PLAN/PLAN DDG T52 174.png",
    "interceptionUsed": 0
  },
  {
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-ffg-type54-573",
    "type": "TYPE 054 FFG",
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN FFG T54 573.png",
    "interception": 6,
    "attackPrimaryUsed": 0,
    "interceptionUsed": 0,
    "category": "naval",
    "deploymentCost": 3,
    "attackPrimary": 3,
    "name": "T-54 573 FFG",
    "faction": "china",
    "taskForceId": null,
    "damagePoints": 2
  },
  {
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "category": "naval",
    "type": "TYPE 054 FFG",
    "name": "T-54 574 FFG",
    "attackPrimary": 3,
    "taskForceId": null,
    "isDetected": false,
    "deploymentCost": 3,
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "interceptionUsed": 0,
    "interception": 6,
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades PLAN/PLAN FFG T54 574.png",
    "faction": "china",
    "id": "plan-ffg-type54-574"
  },
  {
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades PLAN/PLAN FFG T54 575.png",
    "currentDamage": [
      false,
      false
    ],
    "category": "naval",
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "faction": "china",
    "name": "T-54 575 FFG",
    "attackPrimary": 3,
    "type": "TYPE 054 FFG",
    "deploymentCost": 3,
    "isDetected": false,
    "id": "plan-ffg-type54-575",
    "interception": 6,
    "interceptionUsed": 0,
    "taskForceId": null,
    "damagePoints": 2
  },
  {
    "type": "TYPE 055 DDG",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "isDetected": false,
    "interceptionUsed": 0,
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "category": "naval",
    "image": "/images/Unidades PLAN/PLAN DDG T55 102.png",
    "interception": 9,
    "name": "T-55 102 DDG",
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "faction": "china",
    "deploymentCost": 5,
    "id": "plan-ddg-type55-102",
    "attackPrimary": 16
  },
  {
    "isDetected": false,
    "interception": 9,
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "attackSecondary": 6,
    "deploymentCost": 5,
    "damagePoints": 2,
    "name": "T-55 103 DDG",
    "image": "/images/Unidades PLAN/PLAN DDG T55 103.png",
    "interceptionUsed": 0,
    "id": "plan-ddg-type55-103",
    "type": "TYPE 055 DDG",
    "taskForceId": null,
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "category": "naval",
    "faction": "china",
    "attackPrimary": 16
  },
  {
    "interceptionUsed": 0,
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "id": "plan-ddg-type55-104",
    "isDetected": false,
    "deploymentCost": 5,
    "faction": "china",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "attackPrimary": 16,
    "type": "TYPE 055 DDG",
    "interception": 9,
    "image": "/images/Unidades PLAN/PLAN DDG T55 104.png",
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "category": "naval",
    "name": "T-55 104 DDG"
  },
  {
    "attackPrimary": 10,
    "isDetected": false,
    "deploymentCost": 5,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN LHD 201.png",
    "name": "T-76 201 LHD",
    "type": "TYPE 076 LHD",
    "damagePoints": 2,
    "faction": "china",
    "taskForceId": null,
    "id": "plan-lhd-201",
    "attackPrimaryUsed": 0,
    "category": "naval",
    "description": "The Type 076 LHD is a planned class of amphibious assault ship, equipped with deck space for helicopters and small autonomous unmanned aerial vehicles (UAVs)."
  },
  {
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "faction": "china",
    "isDetected": false,
    "damagePoints": 2,
    "category": "naval",
    "attackPrimary": 10,
    "deploymentCost": 5,
    "name": "T-76 202 LHD",
    "id": "plan-lhd-202",
    "type": "TYPE 076 LHD",
    "currentDamage": [
      false,
      false
    ],
    "description": "The Type 076 LHD is a planned class of amphibious assault ship, equipped with deck space for helicopters and small autonomous unmanned aerial vehicles (UAVs).",
    "image": "/images/Unidades PLAN/PLAN LHD 202.png"
  }
];
