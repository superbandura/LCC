// Generated unit data - DO NOT EDIT MANUALLY
// Este archivo contiene todas las unidades del juego
// Total: 96 unidades (USMC: 50, PLAN: 46)
// Última actualización: 2025-11-13T12:07:08.166Z
import { Unit } from '../types';

export const initialUnits: Unit[] = [
  {
    "name": "1 FOX",
    "supply": 8,
    "supplyUsed": 0,
    "id": "usmc-fox-1",
    "currentDamage": [
      false
    ],
    "type": "FARP PLATOON",
    "image": "/images/Unidades USMC/USMC Fox 1.png",
    "isDetected": false,
    "taskForceId": null,
    "damagePoints": 1,
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "faction": "us",
    "category": "supply",
    "deploymentCost": 2
  },
  {
    "deploymentCost": 2,
    "type": "ACV SECTION",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "attackPrimaryUsed": 0,
    "attackPrimary": 3,
    "taskForceId": "tf-1762553796220",
    "category": "ground",
    "currentDamage": [
      true,
      true
    ],
    "id": "usmc-bravo-1-1",
    "groundCombat": 5,
    "name": "1-1 BRAVO",
    "faction": "us",
    "isDetected": true,
    "image": "/images/Unidades USMC/USMC Bravo 1-1.png",
    "damagePoints": 2,
    "groundCombatUsed": 0
  },
  {
    "category": "artillery",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "id": "usmc-charlie-1-1",
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "type": "HIMARS SECTION",
    "faction": "us",
    "deploymentCost": 3,
    "attackSecondaryUsed": 0,
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "name": "1-1 CHARLIE",
    "attackSecondary": 4,
    "attackPrimary": 6,
    "image": "/images/Unidades USMC/USMC Charlie 1-1.png"
  },
  {
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Delta 1-1.png",
    "interception": 10,
    "taskForceId": "tf-1762553796220",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3,
    "interceptionUsed": 0,
    "damagePoints": 2,
    "isDetected": false,
    "name": "1-1 DELTA",
    "id": "usmc-delta-1-1",
    "type": "MRIC SECTION",
    "currentDamage": [
      false,
      false
    ],
    "category": "interception"
  },
  {
    "isDetected": false,
    "category": "interception",
    "name": "1-1 ECHO",
    "damagePoints": 2,
    "interception": 10,
    "id": "usmc-echo-1-1",
    "currentDamage": [
      false,
      false
    ],
    "interceptionUsed": 0,
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC Echo 1-1.png",
    "deploymentCost": 3,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "faction": "us",
    "type": "MRIC SECTION"
  },
  {
    "attackSecondaryUsed": 0,
    "attackPrimaryUsed": 0,
    "type": "HIMARS SECTION",
    "category": "artillery",
    "attackSecondary": 4,
    "damagePoints": 2,
    "isDetected": false,
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC Whiskey 1-1.png",
    "faction": "us",
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimary": 6,
    "name": "1-1 WHISKEY",
    "id": "usmc-whiskey-1-1",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets."
  },
  {
    "name": "1-2 BRAVO",
    "groundCombatUsed": 0,
    "damagePoints": 2,
    "type": "ACV SECTION",
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades USMC/USMC Bravo 2-1.png",
    "attackPrimary": 3,
    "category": "ground",
    "faction": "us",
    "taskForceId": "tf-1762553796220",
    "currentDamage": [
      false,
      false
    ],
    "id": "usmc-bravo-2-1",
    "groundCombat": 5,
    "deploymentCost": 2,
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "isDetected": false
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "type": "HIMARS SECTION",
    "image": "/images/Unidades USMC/USMC Charlie 2-1.png",
    "taskForceId": null,
    "attackSecondaryUsed": 0,
    "attackPrimary": 6,
    "id": "usmc-charlie-2-1",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "attackSecondary": 4,
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "deploymentCost": 3,
    "category": "artillery",
    "faction": "us",
    "damagePoints": 2,
    "name": "1-2 CHARLIE"
  },
  {
    "deploymentCost": 3,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "type": "MRIC SECTION",
    "category": "interception",
    "interceptionUsed": 0,
    "damagePoints": 2,
    "id": "usmc-delta-2-1",
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Delta 2-1.png",
    "interception": 10,
    "name": "1-2 DELTA",
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false
  },
  {
    "name": "1-2 ECHO",
    "category": "interception",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 3,
    "image": "/images/Unidades USMC/USMC Echo 2-1.png",
    "interception": 10,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "isDetected": false,
    "id": "usmc-echo-2-1",
    "interceptionUsed": 0,
    "faction": "us",
    "type": "MRIC SECTION",
    "damagePoints": 2,
    "taskForceId": null
  },
  {
    "attackPrimaryUsed": 0,
    "deploymentCost": 3,
    "image": "/images/Unidades USMC/USMC Whiskey 2-1.png",
    "type": "HIMARS SECTION",
    "damagePoints": 2,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "faction": "us",
    "id": "usmc-whiskey-2-1",
    "isDetected": false,
    "name": "1-2 WHISKEY",
    "attackPrimary": 6,
    "attackSecondary": 4,
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "category": "artillery",
    "attackSecondaryUsed": 0
  },
  {
    "attackPrimary": 1,
    "groundCombat": 5,
    "attackPrimaryUsed": 0,
    "groundCombatUsed": 0,
    "faction": "us",
    "type": "INFANTRY PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "deploymentCost": 1,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "name": "1ALPHA",
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Alpha 1.png",
    "isDetected": false,
    "id": "usmc-alpha-1",
    "category": "ground"
  },
  {
    "category": "ground",
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "deploymentCost": 1,
    "attackPrimary": 1,
    "type": "INFANTRY PLATOON",
    "taskForceId": null,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "groundCombat": 5,
    "name": "1VICTOR",
    "groundCombatUsed": 0,
    "image": "/images/Unidades USMC/USMC Victor 1.png",
    "faction": "us",
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "id": "usmc-victor-1"
  },
  {
    "type": "FARP PLATOON",
    "isDetected": false,
    "faction": "us",
    "supplyUsed": 0,
    "category": "supply",
    "currentDamage": [
      false
    ],
    "damagePoints": 1,
    "id": "usmc-fox-2",
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "deploymentCost": 2,
    "image": "/images/Unidades USMC/USMC Fox 2.png",
    "taskForceId": null,
    "name": "2 FOX",
    "supply": 8
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "category": "ground",
    "groundCombat": 5,
    "faction": "us",
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC Bravo 1-2.png",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "type": "ACV SECTION",
    "deploymentCost": 2,
    "attackPrimaryUsed": 0,
    "groundCombatUsed": 0,
    "attackPrimary": 3,
    "id": "usmc-bravo-1-2",
    "name": "2-1 BRAVO",
    "isDetected": false,
    "damagePoints": 2
  },
  {
    "name": "2-1 CHARLIE",
    "attackSecondary": 4,
    "category": "artillery",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "damagePoints": 2,
    "isDetected": false,
    "taskForceId": null,
    "type": "HIMARS SECTION",
    "attackSecondaryUsed": 0,
    "attackPrimaryUsed": 0,
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "id": "usmc-charlie-1-2",
    "attackPrimary": 6,
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Charlie 1-2.png"
  },
  {
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "image": "/images/Unidades USMC/USMC Delta 1-2.png",
    "type": "MRIC SECTION",
    "name": "2-1 DELTA",
    "interceptionUsed": 0,
    "id": "usmc-delta-1-2",
    "faction": "us",
    "interception": 10,
    "deploymentCost": 3,
    "taskForceId": null,
    "damagePoints": 2,
    "category": "interception"
  },
  {
    "type": "MRIC SECTION",
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Echo 1-2.png",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "interception": 10,
    "deploymentCost": 3,
    "category": "interception",
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "interceptionUsed": 0,
    "id": "usmc-echo-1-2",
    "damagePoints": 2,
    "name": "2-1 ECHO",
    "taskForceId": null
  },
  {
    "deploymentCost": 3,
    "category": "artillery",
    "isDetected": false,
    "name": "2-1 WHISKEY",
    "attackPrimary": 6,
    "faction": "us",
    "id": "usmc-whiskey-1-2",
    "type": "HIMARS SECTION",
    "taskForceId": null,
    "attackSecondaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Whiskey 1-2.png",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "attackSecondary": 4
  },
  {
    "damagePoints": 2,
    "deploymentCost": 2,
    "isDetected": false,
    "taskForceId": null,
    "groundCombat": 5,
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "type": "ACV SECTION",
    "name": "2-2 BRAVO",
    "attackPrimary": 3,
    "id": "usmc-bravo-2-2",
    "faction": "us",
    "category": "ground",
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades USMC/USMC Bravo 2-2.png",
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "attackPrimary": 6,
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "image": "/images/Unidades USMC/USMC Charlie 2-2.png",
    "name": "2-2 CHARLIE",
    "id": "usmc-charlie-2-2",
    "taskForceId": null,
    "deploymentCost": 3,
    "type": "HIMARS SECTION",
    "attackSecondaryUsed": 0,
    "damagePoints": 2,
    "category": "artillery",
    "faction": "us",
    "attackSecondary": 4,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets."
  },
  {
    "name": "2-2 DELTA",
    "image": "/images/Unidades USMC/USMC Delta 2-2.png",
    "faction": "us",
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "damagePoints": 2,
    "interception": 10,
    "category": "interception",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 3,
    "isDetected": false,
    "interceptionUsed": 0,
    "type": "MRIC SECTION",
    "taskForceId": null,
    "id": "usmc-delta-2-2"
  },
  {
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "faction": "us",
    "interceptionUsed": 0,
    "image": "/images/Unidades USMC/USMC Echo 2-2.png",
    "isDetected": false,
    "name": "2-2 ECHO",
    "interception": 10,
    "damagePoints": 2,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "id": "usmc-echo-2-2",
    "taskForceId": null,
    "category": "interception",
    "type": "MRIC SECTION"
  },
  {
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Whiskey 2-2.png",
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false
    ],
    "name": "2-2 WHISKEY",
    "id": "usmc-whiskey-2-2",
    "type": "HIMARS SECTION",
    "damagePoints": 2,
    "isDetected": false,
    "attackSecondary": 4,
    "attackPrimaryUsed": 0,
    "category": "artillery",
    "attackSecondaryUsed": 0,
    "attackPrimary": 6,
    "taskForceId": null
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "deploymentCost": 1,
    "category": "ground",
    "name": "2ALPHA",
    "damagePoints": 2,
    "type": "INFANTRY PLATOON",
    "groundCombat": 5,
    "image": "/images/Unidades USMC/USMC Alpha 2.png",
    "attackPrimary": 1,
    "groundCombatUsed": 0,
    "id": "usmc-alpha-2",
    "isDetected": false,
    "faction": "us",
    "taskForceId": null
  },
  {
    "type": "INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "taskForceId": null,
    "groundCombat": 5,
    "damagePoints": 2,
    "name": "2VICTOR",
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "deploymentCost": 1,
    "attackPrimary": 1,
    "image": "/images/Unidades USMC/USMC Victor 2.png",
    "faction": "us",
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "category": "ground",
    "id": "usmc-victor-2",
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "faction": "us",
    "damagePoints": 1,
    "isDetected": false,
    "id": "usmc-fox-3",
    "deploymentCost": 2,
    "type": "FARP PLATOON",
    "category": "supply",
    "name": "3 FOX",
    "image": "/images/Unidades USMC/USMC Fox 3.png",
    "description": "A Forward Arming and Refueling Point (FARP) platoon provides expeditionary airfields and refueling operations to both fixed and rotary wing aircraft. These units allow flexibility, persistence, and greater range for air operations.",
    "supply": 8,
    "supplyUsed": 0,
    "currentDamage": [
      false
    ],
    "taskForceId": null
  },
  {
    "name": "3-1 BRAVO",
    "attackPrimary": 3,
    "damagePoints": 2,
    "groundCombat": 5,
    "deploymentCost": 2,
    "isDetected": false,
    "type": "ACV SECTION",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "id": "usmc-bravo-1-3",
    "taskForceId": null,
    "attackPrimaryUsed": 0,
    "groundCombatUsed": 0,
    "faction": "us",
    "image": "/images/Unidades USMC/USMC Bravo 1-3.png",
    "currentDamage": [
      false,
      false
    ],
    "category": "ground"
  },
  {
    "image": "/images/Unidades USMC/USMC Charlie 1-3.png",
    "damagePoints": 2,
    "isDetected": false,
    "faction": "us",
    "name": "3-1 CHARLIE",
    "id": "usmc-charlie-1-3",
    "currentDamage": [
      false,
      false
    ],
    "attackSecondaryUsed": 0,
    "type": "HIMARS SECTION",
    "category": "artillery",
    "attackPrimary": 6,
    "deploymentCost": 3,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "attackPrimaryUsed": 0,
    "attackSecondary": 4,
    "taskForceId": "tf-1762553796220"
  },
  {
    "interceptionUsed": 0,
    "interception": 10,
    "type": "MRIC SECTION",
    "faction": "us",
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 3,
    "isDetected": false,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "image": "/images/Unidades USMC/USMC Delta 1-3.png",
    "category": "interception",
    "id": "usmc-delta-1-3",
    "taskForceId": null,
    "name": "3-1 DELTA",
    "damagePoints": 2
  },
  {
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "deploymentCost": 3,
    "damagePoints": 2,
    "taskForceId": null,
    "isDetected": false,
    "id": "usmc-echo-1-3",
    "name": "3-1 ECHO",
    "image": "/images/Unidades USMC/USMC Echo 1-3.png",
    "category": "interception",
    "interception": 10,
    "interceptionUsed": 0,
    "faction": "us",
    "currentDamage": [
      false,
      false
    ],
    "type": "MRIC SECTION"
  },
  {
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimary": 3,
    "deploymentCost": 2,
    "type": "ACV SECTION",
    "groundCombat": 5,
    "category": "ground",
    "damagePoints": 2,
    "faction": "us",
    "taskForceId": null,
    "name": "3-2 BRAVO",
    "groundCombatUsed": 0,
    "image": "/images/Unidades USMC/USMC Bravo 2-3.png",
    "description": "Armed with heavy weapons and loitering munitions, the Amphibious Combat Vehicle (ACV) section provides increased mobility and firepower for both ground and amphibious operations.",
    "id": "usmc-bravo-2-3",
    "isDetected": false
  },
  {
    "damagePoints": 2,
    "image": "/images/Unidades USMC/USMC Charlie 2-3.png",
    "id": "usmc-charlie-2-3",
    "isDetected": false,
    "description": "Armed with guided rockets and Naval Strike Missiles, the M142 High Mobility Artillery Rocket System (HIMARS) delivers precision long-range firepower against both ground and naval targets.",
    "name": "3-2 CHARLIE",
    "attackSecondaryUsed": 0,
    "attackPrimary": 6,
    "faction": "us",
    "attackSecondary": 4,
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 3,
    "category": "artillery",
    "type": "HIMARS SECTION",
    "taskForceId": null
  },
  {
    "interceptionUsed": 0,
    "faction": "us",
    "type": "MRIC SECTION",
    "damagePoints": 2,
    "isDetected": false,
    "name": "3-2 DELTA",
    "currentDamage": [
      false,
      false
    ],
    "category": "interception",
    "interception": 10,
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "image": "/images/Unidades USMC/USMC Delta 2-3.png",
    "id": "usmc-delta-2-3",
    "taskForceId": null,
    "deploymentCost": 3
  },
  {
    "description": "The Medium Range Intercept Capability (MRIC) section is an integrated air and missile defense (IAMD) unit, equipped with the Tamir interceptor missile and non-kinetic capabilities.",
    "interception": 10,
    "id": "usmc-echo-2-3",
    "type": "MRIC SECTION",
    "interceptionUsed": 0,
    "image": "/images/Unidades USMC/USMC Echo 2-3.png",
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "faction": "us",
    "category": "interception",
    "damagePoints": 2,
    "name": "3-2 ECHO",
    "deploymentCost": 3,
    "taskForceId": null
  },
  {
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "faction": "us",
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "groundCombatUsed": 0,
    "deploymentCost": 1,
    "name": "3ALPHA",
    "groundCombat": 5,
    "isDetected": false,
    "id": "usmc-alpha-3",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades USMC/USMC Alpha 3.png",
    "category": "ground",
    "type": "INFANTRY PLATOON",
    "attackPrimary": 1
  },
  {
    "groundCombat": 5,
    "image": "/images/Unidades USMC/USMC Victor 3.png",
    "category": "ground",
    "deploymentCost": 1,
    "attackPrimary": 1,
    "damagePoints": 2,
    "isDetected": false,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "taskForceId": null,
    "attackPrimaryUsed": 0,
    "id": "usmc-victor-3",
    "name": "3VICTOR",
    "currentDamage": [
      false,
      false
    ],
    "type": "INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "faction": "us"
  },
  {
    "faction": "us",
    "id": "usmc-alpha-4",
    "taskForceId": null,
    "attackPrimary": 1,
    "groundCombatUsed": 0,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "name": "4ALPHA",
    "type": "INFANTRY PLATOON",
    "category": "ground",
    "image": "/images/Unidades USMC/USMC Alpha 4.png",
    "isDetected": false,
    "attackPrimaryUsed": 0,
    "deploymentCost": 1,
    "groundCombat": 5,
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "name": "4VICTOR",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades USMC/USMC Victor 4.png",
    "id": "usmc-victor-4",
    "groundCombatUsed": 0,
    "attackPrimary": 1,
    "category": "ground",
    "faction": "us",
    "attackPrimaryUsed": 0,
    "deploymentCost": 1,
    "taskForceId": null,
    "isDetected": false,
    "damagePoints": 2,
    "description": "Transported by Joint Light Tactical Vehicles (JLTVs) and armed with loitering munitions, the infantry platoon provides essential offensive and defensive capabilities.",
    "type": "INFANTRY PLATOON",
    "groundCombat": 5
  },
  {
    "attackPrimary": 9,
    "taskForceId": null,
    "interceptionUsed": 0,
    "name": "DDG-56",
    "category": "naval",
    "image": "/images/Unidades USMC/USMC DDG 56.png",
    "attackPrimaryUsed": 0,
    "faction": "us",
    "id": "usmc-ddg-56",
    "type": "ARLEIGH BURKE CLASS DDG",
    "deploymentCost": 4,
    "interception": 10,
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "isDetected": false
  },
  {
    "damagePoints": 2,
    "taskForceId": null,
    "category": "naval",
    "currentDamage": [
      false,
      false
    ],
    "name": "DDG-85",
    "type": "ARLEIGH BURKE CLASS DDG",
    "faction": "us",
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "image": "/images/Unidades USMC/USMC DDG 85.png",
    "isDetected": false,
    "id": "usmc-ddg-85",
    "interception": 10,
    "deploymentCost": 4,
    "attackPrimary": 9,
    "attackPrimaryUsed": 0,
    "interceptionUsed": 0
  },
  {
    "interceptionUsed": 0,
    "deploymentCost": 4,
    "image": "/images/Unidades USMC/USMC DDG 90.png",
    "category": "naval",
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "id": "usmc-ddg-90",
    "type": "ARLEIGH BURKE CLASS DDG",
    "name": "DDG-90",
    "isDetected": false,
    "interception": 10,
    "faction": "us",
    "taskForceId": null,
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "attackPrimary": 9
  },
  {
    "category": "naval",
    "attackPrimaryUsed": 0,
    "faction": "us",
    "isDetected": false,
    "attackPrimary": 9,
    "damagePoints": 2,
    "interceptionUsed": 0,
    "type": "ARLEIGH BURKE CLASS DDG",
    "name": "DDG-93",
    "deploymentCost": 4,
    "description": "The Arleigh Burke is a class of guided-missile destroyer, armed with land-attack cruise missiles and layered anti-air defenses.",
    "id": "usmc-ddg-93",
    "image": "/images/Unidades USMC/USMC DDG 93.png",
    "taskForceId": null,
    "interception": 10,
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "damagePoints": 2,
    "attackPrimary": 15,
    "attackPrimaryUsed": 0,
    "interceptionUsed": 0,
    "name": "DDG(X) 101",
    "category": "naval",
    "taskForceId": null,
    "interception": 12,
    "isDetected": false,
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "deploymentCost": 5,
    "image": "/images/Unidades USMC/USMC DDGX 101.png",
    "currentDamage": [
      false,
      false
    ],
    "type": "DDG(X)",
    "id": "usmc-ddgx-101",
    "faction": "us"
  },
  {
    "category": "naval",
    "type": "DDG(X)",
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "interception": 12,
    "isDetected": false,
    "name": "DDG(X) 102",
    "deploymentCost": 5,
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "id": "usmc-ddgx-102",
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC DDGX 102.png",
    "interceptionUsed": 0,
    "faction": "us",
    "attackPrimary": 15
  },
  {
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "interceptionUsed": 0,
    "attackPrimary": 15,
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "faction": "us",
    "interception": 12,
    "image": "/images/Unidades USMC/USMC DDGX 103.png",
    "id": "usmc-ddgx-103",
    "deploymentCost": 5,
    "name": "DDG(X) 103",
    "isDetected": false,
    "category": "naval",
    "type": "DDG(X)",
    "damagePoints": 2
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "deploymentCost": 5,
    "interceptionUsed": 0,
    "category": "naval",
    "isDetected": false,
    "damagePoints": 2,
    "interception": 12,
    "attackPrimary": 15,
    "attackPrimaryUsed": 0,
    "faction": "us",
    "image": "/images/Unidades USMC/USMC DDGX 104.png",
    "type": "DDG(X)",
    "id": "usmc-ddgx-104",
    "description": "The DDG(X), also called the Next Generation Guided-Missile Destroyer, is a future program designed to replace the Ticonderoga cruisers. It will be armed with a variety of offensive and defensive capabilities, such as cruise missiles for land-attack and anti-ship operations.",
    "name": "DDG(X) 104"
  },
  {
    "type": "MARINE LITTORAL LOGISTICS COMPANY",
    "name": "GOLF",
    "currentDamage": [
      false,
      false,
      false
    ],
    "supplyUsed": 0,
    "isDetected": false,
    "deploymentCost": 3,
    "category": "supply",
    "id": "usmc-logistics-golf",
    "taskForceId": null,
    "faction": "us",
    "damagePoints": 3,
    "image": "/images/Unidades USMC/USMC Golf.png",
    "supply": 20,
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support."
  },
  {
    "category": "supply",
    "name": "KILO",
    "faction": "us",
    "damagePoints": 3,
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support.",
    "isDetected": false,
    "currentDamage": [
      false,
      false,
      false
    ],
    "taskForceId": null,
    "image": "/images/Unidades USMC/USMC Kilo.png",
    "type": "MARINE LITTORAL LOGISTICS COMPANY",
    "deploymentCost": 3,
    "supplyUsed": 0,
    "supply": 20,
    "id": "usmc-logistics-kilo"
  },
  {
    "taskForceId": null,
    "category": "supply",
    "name": "LIMA",
    "image": "/images/Unidades USMC/USMC Lima.png",
    "supply": 20,
    "type": "MARINE LITTORAL LOGISTICS COMPANY",
    "deploymentCost": 3,
    "currentDamage": [
      false,
      false,
      false
    ],
    "faction": "us",
    "description": "The Marine Littoral Logistics Company is a unit specializing in shore-based logistics and supply – including distribution, maintenance, and limited medical support.",
    "damagePoints": 3,
    "id": "usmc-logistics-lima",
    "isDetected": false,
    "supplyUsed": 0
  },
  {
    "isDetected": false,
    "id": "plan-alpha-1",
    "category": "ground",
    "groundCombat": 5,
    "damagePoints": 2,
    "name": "1 ALPHA",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "groundCombatUsed": 0,
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN Alpha 1.png",
    "type": "MECHANIZED INFANTRY PLATOON",
    "deploymentCost": 2
  },
  {
    "name": "1 BRAVO",
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "type": "MECHANIZED INFANTRY PLATOON",
    "isDetected": false,
    "groundCombat": 5,
    "category": "ground",
    "id": "plan-bravo-1",
    "faction": "china",
    "deploymentCost": 2,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "taskForceId": null,
    "damagePoints": 2,
    "image": "/images/Unidades PLAN/PLAN Bravo 1.png"
  },
  {
    "description": "Using 120mm mortars, these heavy weapons provide critical indirect fire capabilities.",
    "category": "ground",
    "damagePoints": 2,
    "type": "HEAVY WEAPONS MORTAR PLATOON",
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Charlie 1.png",
    "groundCombat": 5,
    "faction": "china",
    "isDetected": false,
    "id": "plan-charlie-1",
    "deploymentCost": 2,
    "name": "1 CHARLIE",
    "groundCombatUsed": 0
  },
  {
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN Delta 1.png",
    "groundCombat": 5,
    "isDetected": false,
    "type": "LIGHT TANK PLATOON",
    "currentDamage": [
      false,
      false,
      false
    ],
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "category": "ground",
    "damagePoints": 3,
    "name": "1 DELTA",
    "taskForceId": null,
    "id": "plan-delta-1"
  },
  {
    "category": "ground",
    "id": "plan-fox-1",
    "isDetected": false,
    "name": "1 FOX",
    "groundCombat": 5,
    "taskForceId": "tf_china_1762555461533_l2f0qmgiy",
    "groundCombatUsed": 0,
    "deploymentCost": 1,
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "damagePoints": 2,
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "image": "/images/Unidades PLAN/PLAN Fox 1.png"
  },
  {
    "type": "MECHANIZED INFANTRY PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "groundCombatUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Golf 1.png",
    "damagePoints": 2,
    "name": "1 GOLF",
    "id": "plan-golf-1",
    "deploymentCost": 2,
    "faction": "china",
    "groundCombat": 5,
    "category": "ground",
    "taskForceId": null,
    "isDetected": false
  },
  {
    "supplyUsed": 0,
    "category": "supply",
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "type": "LOGISTICS PLATOON",
    "supply": 7,
    "deploymentCost": 3,
    "name": "1 LIMA",
    "currentDamage": [
      false
    ],
    "faction": "china",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Lima 1.png",
    "damagePoints": 1,
    "id": "plan-lima-1",
    "isDetected": false
  },
  {
    "damagePoints": 3,
    "id": "plan-victor-1",
    "groundCombatUsed": 0,
    "isDetected": false,
    "category": "ground",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "type": "LIGHT TANK PLATOON",
    "groundCombat": 5,
    "deploymentCost": 2,
    "name": "1 VICTOR",
    "faction": "china",
    "currentDamage": [
      false,
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Victor 1.png",
    "taskForceId": null
  },
  {
    "isDetected": false,
    "type": "ARTILLERY SECTION SELF-PROPELLED HOWITZERS",
    "deploymentCost": 3,
    "description": "Equipped with the PLZ-07 122mm self-propelled howitzers, this artillery section provides the advantage of mobile, indirect firepower.",
    "id": "plan-echo-1-1",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Echo 1-1.png",
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "name": "1-1 ECHO",
    "attackPrimary": 8,
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "category": "artillery"
  },
  {
    "image": "/images/Unidades PLAN/PLAN Kilo 1-1.png",
    "name": "1-1 KILO",
    "damagePoints": 2,
    "isDetected": false,
    "description": "Although limited in their range, this integrated air and missile defense (IAMD) section protects their force from a wide variety of threats including unmanned aerial vehicles and helicopters.",
    "id": "plan-kilo-1-1",
    "interceptionUsed": 0,
    "interception": 5,
    "currentDamage": [
      false,
      false
    ],
    "type": "AIR DEFENSE PLATOON SECTION",
    "faction": "china",
    "category": "interception",
    "deploymentCost": 3,
    "taskForceId": null
  },
  {
    "name": "1-2 ECHO",
    "category": "artillery",
    "taskForceId": null,
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-echo-2-1",
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets.",
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "image": "/images/Unidades PLAN/PLAN Echo 2-1.png",
    "faction": "china",
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "deploymentCost": 3,
    "attackPrimary": 3
  },
  {
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "category": "interception",
    "isDetected": false,
    "interception": 5,
    "id": "plan-kilo-2-1",
    "interceptionUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Kilo 2-1.png",
    "description": "Although limited in their range, this integrated air and missile defense (IAMD) section protects their force from a wide variety of threats including unmanned aerial vehicles and helicopters.",
    "deploymentCost": 3,
    "name": "1-2 KILO",
    "faction": "china",
    "type": "AIR DEFENSE PLATOON SECTION"
  },
  {
    "isDetected": false,
    "id": "plan-alpha-2",
    "groundCombatUsed": 0,
    "groundCombat": 5,
    "category": "ground",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "type": "MECHANIZED INFANTRY PLATOON",
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN Alpha 2.png",
    "taskForceId": null,
    "currentDamage": [
      false,
      false
    ],
    "damagePoints": 2,
    "deploymentCost": 2,
    "name": "2 ALPHA"
  },
  {
    "damagePoints": 2,
    "taskForceId": null,
    "name": "2 BRAVO",
    "type": "MECHANIZED INFANTRY PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN Bravo 2.png",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "groundCombat": 5,
    "deploymentCost": 2,
    "id": "plan-bravo-2",
    "groundCombatUsed": 0,
    "faction": "china",
    "category": "ground"
  },
  {
    "type": "HEAVY WEAPONS ANTI-TANK PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "category": "ground",
    "description": "The heavy weapons platoon is specialized in the use of man-portable rockets for anti-tank (AT) operations – such as the HJ-12.",
    "image": "/images/Unidades PLAN/PLAN Charlie 2.png",
    "id": "plan-charlie-2",
    "taskForceId": null,
    "name": "2 CHARLIE",
    "groundCombat": 5,
    "groundCombatUsed": 0,
    "damagePoints": 2,
    "isDetected": false,
    "deploymentCost": 2
  },
  {
    "name": "2 DELTA",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Delta 2.png",
    "id": "plan-delta-2",
    "category": "ground",
    "isDetected": false,
    "groundCombat": 5,
    "deploymentCost": 2,
    "type": "LIGHT TANK PLATOON",
    "faction": "china",
    "groundCombatUsed": 0,
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "damagePoints": 3,
    "currentDamage": [
      false,
      false,
      false
    ]
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "groundCombat": 5,
    "image": "/images/Unidades PLAN/PLAN Fox 2.png",
    "groundCombatUsed": 0,
    "isDetected": false,
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "damagePoints": 2,
    "name": "2 FOX",
    "taskForceId": null,
    "deploymentCost": 1,
    "faction": "china",
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "category": "ground",
    "id": "plan-fox-2"
  },
  {
    "name": "2 GOLF",
    "id": "plan-golf-2",
    "type": "MECHANIZED INFANTRY PLATOON",
    "groundCombat": 5,
    "damagePoints": 2,
    "category": "ground",
    "deploymentCost": 2,
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "taskForceId": "tf_china_1762555461533_l2f0qmgiy",
    "image": "/images/Unidades PLAN/PLAN Golf 2.png",
    "groundCombatUsed": 0,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations."
  },
  {
    "faction": "china",
    "isDetected": false,
    "damagePoints": 1,
    "id": "plan-lima-2",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Lima 2.png",
    "currentDamage": [
      false
    ],
    "name": "2 LIMA",
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "type": "LOGISTICS PLATOON",
    "deploymentCost": 3,
    "supply": 7,
    "supplyUsed": 0,
    "category": "supply"
  },
  {
    "isDetected": false,
    "damagePoints": 3,
    "faction": "china",
    "deploymentCost": 2,
    "type": "LIGHT TANK PLATOON",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Victor 2.png",
    "category": "ground",
    "groundCombat": 5,
    "id": "plan-victor-2",
    "currentDamage": [
      false,
      false,
      false
    ],
    "name": "2 VICTOR",
    "groundCombatUsed": 0
  },
  {
    "attackPrimaryUsed": 0,
    "taskForceId": null,
    "faction": "china",
    "damagePoints": 2,
    "attackPrimary": 3,
    "isDetected": false,
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "name": "2-1 ECHO",
    "image": "/images/Unidades PLAN/PLAN Echo 1-2.png",
    "category": "artillery",
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets.",
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-echo-1-2",
    "deploymentCost": 3
  },
  {
    "deploymentCost": 3,
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "category": "artillery",
    "taskForceId": null,
    "id": "plan-echo-2-2",
    "currentDamage": [
      false,
      false
    ],
    "description": "The PHL-03 is a 12-tube 300 mm long-range Multiple Launch Rocket Launcher System (MLRS), potent against both ground and naval targets.",
    "name": "2-2 ECHO",
    "attackPrimary": 3,
    "faction": "china",
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN Echo 2-2.png"
  },
  {
    "id": "plan-echo-3-2",
    "deploymentCost": 3,
    "description": "The WS-3 is a precision 400mm Multiple Launch Rocket System (MLRS), capable of high mobility and firing speeds.",
    "image": "/images/Unidades PLAN/PLAN Echo 2-3.png",
    "damagePoints": 2,
    "type": "MULTIPLE LAUNCH ROCKET SYSTEM (MLRS)",
    "name": "2-3 ECHO",
    "taskForceId": null,
    "faction": "china",
    "attackPrimaryUsed": 0,
    "category": "artillery",
    "isDetected": false,
    "attackPrimary": 3,
    "currentDamage": [
      false,
      false
    ]
  },
  {
    "taskForceId": "tf_china_1762555461533_l2f0qmgiy",
    "faction": "china",
    "deploymentCost": 2,
    "isDetected": false,
    "image": "/images/Unidades PLAN/PLAN Alpha 3.png",
    "groundCombatUsed": 0,
    "category": "ground",
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-alpha-3",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "type": "MECHANIZED INFANTRY PLATOON",
    "damagePoints": 2,
    "name": "3 ALPHA",
    "groundCombat": 5
  },
  {
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN Bravo 3.png",
    "taskForceId": null,
    "category": "ground",
    "deploymentCost": 2,
    "isDetected": false,
    "name": "3 BRAVO",
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-bravo-3",
    "groundCombat": 5,
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "type": "MECHANIZED INFANTRY PLATOON",
    "damagePoints": 2
  },
  {
    "faction": "china",
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Charlie 3.png",
    "type": "HEAVY WEAPONS ANTI-TANK PLATOON",
    "damagePoints": 2,
    "name": "3 CHARLIE",
    "taskForceId": null,
    "category": "ground",
    "description": "The heavy weapons platoon is specialized in the use of man-portable rockets for anti-tank (AT) operations – such as the HJ-12.",
    "groundCombat": 5,
    "deploymentCost": 2,
    "isDetected": false,
    "id": "plan-charlie-3"
  },
  {
    "image": "/images/Unidades PLAN/PLAN Delta 3.png",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "deploymentCost": 2,
    "name": "3 DELTA",
    "groundCombat": 5,
    "damagePoints": 3,
    "faction": "china",
    "groundCombatUsed": 0,
    "id": "plan-delta-3",
    "category": "ground",
    "isDetected": false,
    "currentDamage": [
      false,
      false,
      false
    ],
    "type": "LIGHT TANK PLATOON",
    "taskForceId": null
  },
  {
    "faction": "china",
    "isDetected": false,
    "name": "3 FOX",
    "image": "/images/Unidades PLAN/PLAN Fox 3.png",
    "groundCombatUsed": 0,
    "id": "plan-fox-3",
    "deploymentCost": 1,
    "type": "AMPHIBIOUS RECONNAISSANCE PLATOON",
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "description": "The amphibious reconnaissance platoon conducts amphibious reconnaissance, surveillance, and limited-scale raids in support of the larger task force.",
    "category": "ground",
    "damagePoints": 2,
    "groundCombat": 5
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "category": "ground",
    "image": "/images/Unidades PLAN/PLAN Golf 3.png",
    "faction": "china",
    "description": "Transported by ZBD-05 Amphibious Fighting Vehicles (AFVs) and armed with small arms, the mechanized infantry platoon forms the backbone of ground assault operations.",
    "id": "plan-golf-3",
    "taskForceId": null,
    "damagePoints": 2,
    "type": "MECHANIZED INFANTRY PLATOON",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "name": "3 GOLF",
    "groundCombat": 5
  },
  {
    "supply": 7,
    "damagePoints": 1,
    "type": "LOGISTICS PLATOON",
    "currentDamage": [
      false
    ],
    "deploymentCost": 3,
    "id": "plan-lima-3",
    "taskForceId": null,
    "image": "/images/Unidades PLAN/PLAN Lima 3.png",
    "category": "supply",
    "description": "The logistics platoon provides munitions to frontline units but is limited in its capacity and capability.",
    "faction": "china",
    "isDetected": false,
    "supplyUsed": 0,
    "name": "3 LIMA"
  },
  {
    "image": "/images/Unidades PLAN/PLAN Victor 3.png",
    "id": "plan-victor-3",
    "faction": "china",
    "description": "Equipped with the Type 15 \"Black Panther\" light tanks, this unit excels in high mobility and is lethal in a wide variety of environments.",
    "category": "ground",
    "isDetected": false,
    "name": "3 VICTOR",
    "damagePoints": 3,
    "type": "LIGHT TANK PLATOON",
    "groundCombat": 5,
    "groundCombatUsed": 0,
    "currentDamage": [
      false,
      false,
      false
    ],
    "taskForceId": null,
    "deploymentCost": 2
  },
  {
    "type": "ARTILLERY SECTION SELF-PROPELLED HOWITZERS",
    "deploymentCost": 3,
    "description": "Equipped with the PLZ-07 122mm self-propelled howitzers, this artillery section provides the advantage of mobile, indirect firepower.",
    "attackPrimary": 8,
    "isDetected": false,
    "taskForceId": null,
    "name": "3-1 ECHO",
    "category": "artillery",
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN Echo 1-3.png",
    "id": "plan-echo-1-3",
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "faction": "china"
  },
  {
    "type": "MECHANIZED WEAPONS PLATOON",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "category": "ground",
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "isDetected": false,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": null,
    "name": "4 ALPHA",
    "image": "/images/Unidades PLAN/PLAN Alpha 4.png",
    "id": "plan-alpha-4",
    "damagePoints": 2,
    "groundCombat": 5,
    "faction": "china"
  },
  {
    "image": "/images/Unidades PLAN/PLAN Bravo 4.png",
    "type": "MECHANIZED WEAPONS PLATOON",
    "groundCombatUsed": 0,
    "deploymentCost": 2,
    "currentDamage": [
      false,
      false
    ],
    "isDetected": false,
    "taskForceId": null,
    "faction": "china",
    "id": "plan-bravo-4",
    "name": "4 BRAVO",
    "groundCombat": 5,
    "category": "ground",
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "damagePoints": 2
  },
  {
    "isDetected": false,
    "groundCombat": 5,
    "currentDamage": [
      false,
      false
    ],
    "deploymentCost": 2,
    "damagePoints": 2,
    "category": "ground",
    "type": "MECHANIZED WEAPONS PLATOON",
    "taskForceId": null,
    "name": "4 GOLF",
    "description": "With heavy machine guns, the mechanized weapons platoon provides short-range firepower.",
    "id": "plan-golf-4",
    "groundCombatUsed": 0,
    "image": "/images/Unidades PLAN/PLAN Golf 4.png",
    "faction": "china"
  },
  {
    "taskForceId": "tf-1762556013609",
    "damagePoints": 2,
    "deploymentCost": 4,
    "currentDamage": [
      false,
      false
    ],
    "category": "naval",
    "faction": "china",
    "attackPrimary": 7,
    "isDetected": false,
    "name": "T-52 172 DDG",
    "isPendingDeployment": false,
    "id": "plan-ddg-type52-172",
    "interception": 8,
    "type": "TYPE 052D",
    "image": "/images/Unidades PLAN/PLAN DDG T52 172.png",
    "interceptionUsed": 0,
    "attackPrimaryUsed": 0,
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities."
  },
  {
    "name": "T-52 173 DDG",
    "id": "plan-ddg-type52-173",
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities.",
    "damagePoints": 2,
    "image": "/images/Unidades PLAN/PLAN DDG T52 173.png",
    "faction": "china",
    "attackPrimaryUsed": 0,
    "isDetected": false,
    "deploymentCost": 4,
    "taskForceId": "tf-1762553799263",
    "type": "TYPE 052D",
    "category": "naval",
    "interceptionUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimary": 7,
    "interception": 8
  },
  {
    "deploymentCost": 4,
    "image": "/images/Unidades PLAN/PLAN DDG T52 174.png",
    "attackPrimary": 7,
    "currentDamage": [
      false,
      false
    ],
    "attackPrimaryUsed": 0,
    "faction": "china",
    "id": "plan-ddg-type52-174",
    "name": "T-52 174 DDG",
    "description": "The Type 052D Luyang III guided-missile destroyer can provide potent naval and land strike capabilities and anti-submarine capabilities.",
    "damagePoints": 2,
    "isDetected": false,
    "taskForceId": "tf-1762553799263",
    "interceptionUsed": 0,
    "interception": 8,
    "type": "TYPE 052D",
    "category": "naval"
  },
  {
    "isPendingDeployment": false,
    "interceptionUsed": 0,
    "interception": 6,
    "category": "naval",
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "taskForceId": "tf-1762556013609",
    "faction": "china",
    "image": "/images/Unidades PLAN/PLAN FFG T54 573.png",
    "attackPrimary": 3,
    "attackPrimaryUsed": 0,
    "type": "TYPE 054 FFG",
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "name": "T-54 573 FFG",
    "isDetected": false,
    "id": "plan-ffg-type54-573",
    "deploymentCost": 3
  },
  {
    "isDetected": false,
    "category": "naval",
    "taskForceId": null,
    "interceptionUsed": 0,
    "type": "TYPE 054 FFG",
    "interception": 6,
    "deploymentCost": 3,
    "image": "/images/Unidades PLAN/PLAN FFG T54 574.png",
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "name": "T-54 574 FFG",
    "id": "plan-ffg-type54-574",
    "attackPrimaryUsed": 0,
    "damagePoints": 2,
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "attackPrimary": 3
  },
  {
    "attackPrimaryUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "description": "The Type 054 Jiangkai II is a class of guided-missile frigate equipped with a variety of capabilities, including anti-ship cruise missiles, heavy mortars, and short-range anti-air defenses.",
    "taskForceId": "tf-1762556013609",
    "isPendingDeployment": false,
    "category": "naval",
    "deploymentCost": 3,
    "attackPrimary": 3,
    "interception": 6,
    "id": "plan-ffg-type54-575",
    "type": "TYPE 054 FFG",
    "image": "/images/Unidades PLAN/PLAN FFG T54 575.png",
    "interceptionUsed": 0,
    "damagePoints": 2,
    "faction": "china",
    "name": "T-54 575 FFG",
    "isDetected": false
  },
  {
    "id": "plan-ddg-type55-102",
    "isDetected": false,
    "name": "T-55 102 DDG",
    "deploymentCost": 5,
    "interception": 9,
    "attackPrimaryUsed": 0,
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "taskForceId": "tf-1762556013609",
    "type": "TYPE 055 DDG",
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN DDG T55 102.png",
    "category": "naval",
    "attackPrimary": 16,
    "isPendingDeployment": false,
    "attackSecondary": 6,
    "interceptionUsed": 0,
    "faction": "china"
  },
  {
    "category": "naval",
    "name": "T-55 103 DDG",
    "image": "/images/Unidades PLAN/PLAN DDG T55 103.png",
    "damagePoints": 2,
    "interceptionUsed": 0,
    "currentDamage": [
      false,
      false
    ],
    "type": "TYPE 055 DDG",
    "attackSecondary": 12,
    "interception": 9,
    "faction": "china",
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "attackPrimary": 16,
    "isDetected": false,
    "deploymentCost": 5,
    "attackPrimaryUsed": 0,
    "taskForceId": "tf-1762556013609",
    "isPendingDeployment": false,
    "id": "plan-ddg-type55-103"
  },
  {
    "category": "naval",
    "damagePoints": 2,
    "currentDamage": [
      false,
      false
    ],
    "image": "/images/Unidades PLAN/PLAN DDG T55 104.png",
    "id": "plan-ddg-type55-104",
    "deploymentCost": 5,
    "faction": "china",
    "taskForceId": "tf-1762553799263",
    "interceptionUsed": 0,
    "description": "Equivalent to a US cruiser-class ship, the Type 055 Renhai is a class of guided-missile destroyer, equipped with a variety of advanced anti-ship cruise missiles, land attack missiles, and ballistic missile defense, and anti-air defenses.",
    "attackPrimaryUsed": 0,
    "type": "TYPE 055 DDG",
    "attackSecondary": 6,
    "name": "T-55 104 DDG",
    "attackPrimary": 16,
    "isDetected": false,
    "interception": 9
  },
  {
    "image": "/images/Unidades PLAN/PLAN LHD 201.png",
    "attackPrimaryUsed": 0,
    "faction": "china",
    "name": "T-76 201 LHD",
    "deploymentCost": 5,
    "description": "The Type 076 LHD is a planned class of amphibious assault ship, equipped with deck space for helicopters and small autonomous unmanned aerial vehicles (UAVs).",
    "category": "naval",
    "type": "TYPE 076 LHD",
    "taskForceId": null,
    "damagePoints": 2,
    "attackPrimary": 10,
    "currentDamage": [
      false,
      false
    ],
    "id": "plan-lhd-201",
    "isDetected": false
  },
  {
    "currentDamage": [
      false,
      false
    ],
    "faction": "china",
    "description": "The Type 076 LHD is a planned class of amphibious assault ship, equipped with deck space for helicopters and small autonomous unmanned aerial vehicles (UAVs).",
    "image": "/images/Unidades PLAN/PLAN LHD 202.png",
    "isDetected": false,
    "category": "naval",
    "id": "plan-lhd-202",
    "deploymentCost": 5,
    "type": "TYPE 076 LHD",
    "name": "T-76 202 LHD",
    "taskForceId": null,
    "damagePoints": 2,
    "attackPrimaryUsed": 0,
    "attackPrimary": 10
  }
];
