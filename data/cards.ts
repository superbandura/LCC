// Generated card data - DO NOT EDIT MANUALLY
// Este archivo contiene toda la información de las cartas del juego
// Total: 197 cartas (USMC: 103, PLAN: 94)
// Última actualización: 2025-11-05T08:00:32.086Z
import { Card } from '../types';

export const initialCards: Card[] = [
  {
    "cost": 0,
    "name": "Tactical Network",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 01 Tactical Network.jpg",
    "id": "us-001",
    "maxPurchases": 0,
    "cardType": "intelligence"
  },
  {
    "cost": 4,
    "name": "Combat Air Patrols",
    "maxPurchases": 4,
    "deploymentTime": 2,
    "cardType": "interception",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 02 Combat Air Patrols.jpg",
    "id": "us-002"
  },
  {
    "faction": "us",
    "requiredBaseId": "kadena-ab",
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 03 Deep Strike.jpg",
    "deploymentTime": 2,
    "requiresBaseCondition": true,
    "cost": 3,
    "maxPurchases": 2,
    "id": "us-003",
    "requiredBaseMaxDamage": 4,
    "name": "Deep Strike"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 04 Unmanned Helo.jpg",
    "deploymentTime": 2,
    "id": "us-004",
    "cardType": "attack",
    "maxPurchases": 2,
    "faction": "us",
    "name": "Unmanned Helo",
    "cost": 2
  },
  {
    "id": "us-005",
    "faction": "us",
    "attachableCategory": "interception",
    "secondaryAmmoBonus": 4,
    "cardType": "interception",
    "cost": 5,
    "deploymentTime": 3,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 05 THAAD.jpg",
    "isAttachable": true,
    "name": "THAAD",
    "hpBonus": 1
  },
  {
    "id": "us-006",
    "faction": "us",
    "cardType": "attack",
    "isAttachable": true,
    "secondaryAmmoBonus": 4,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 06 Maritime Strike Tomahawk.jpg",
    "deploymentTime": 2,
    "hpBonus": 2,
    "attachableCategory": "ground",
    "name": "Maritime Strike Tomahawk",
    "cost": 2
  },
  {
    "name": "Space Satellites",
    "cost": 5,
    "imagePath": "/images/Cartas USMC/LCC USMC 07 Space Satellites.jpg",
    "maxPurchases": 1,
    "cardType": "intelligence",
    "infinite": true,
    "deploymentTime": 1,
    "id": "us-007",
    "faction": "us"
  },
  {
    "name": "B-1B Lancer",
    "cardType": "attack",
    "deploymentTime": 3,
    "cost": 4,
    "requiredBaseId": "kadena-ab",
    "faction": "us",
    "requiredBaseMaxDamage": 3,
    "requiresBaseCondition": true,
    "id": "us-008",
    "imagePath": "/images/Cartas USMC/LCC USMC 08 B-1B Lancer.jpg",
    "maxPurchases": 2
  },
  {
    "deploymentTime": 1,
    "faction": "us",
    "maxPurchases": 3,
    "id": "us-009",
    "name": "Electro-Magnetic Spectrum Jamming",
    "imagePath": "/images/Cartas USMC/LCC USMC 09 Electro-Magnetic Spectrum Jamming.jpg",
    "cost": 2,
    "cardType": "communications"
  },
  {
    "id": "us-010",
    "maxPurchases": 3,
    "faction": "us",
    "cardType": "communications",
    "name": "Electro-Magnetic Spectrum Defense",
    "deploymentTime": 1,
    "cost": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 10 Electro-Magnetic Spectrum Defense.jpg"
  },
  {
    "name": "Attack on C2",
    "cost": 3,
    "id": "us-011",
    "maxPurchases": 2,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 11 Attack on C2.jpg",
    "cardType": "communications"
  },
  {
    "maxPurchases": 4,
    "id": "us-012",
    "name": "Tactical Cyber Defenses",
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 12 Tactical Cyber Defenses.jpg",
    "cost": 3,
    "faction": "us"
  },
  {
    "faction": "us",
    "name": "Defensive Cyber",
    "id": "us-013",
    "cost": 5,
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 13 Defensive Cyber.jpg",
    "maxPurchases": 4
  },
  {
    "id": "us-014",
    "maxPurchases": 4,
    "faction": "us",
    "cardType": "communications",
    "cost": 5,
    "name": "Offensive Cyber",
    "imagePath": "/images/Cartas USMC/LCC USMC 14 Offensive Cyber.jpg"
  },
  {
    "faction": "us",
    "maxPurchases": 2,
    "name": "Military Deception",
    "deploymentTime": 2,
    "id": "us-015",
    "imagePath": "/images/Cartas USMC/LCC USMC 15 Military Deception (x2).jpg",
    "cost": 2,
    "cardType": "communications"
  },
  {
    "cardType": "maneuver",
    "faction": "us",
    "id": "us-016",
    "attachableCategory": "supply",
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 16 Logistics Unmanned.jpg",
    "deploymentTime": 2,
    "name": "Logistics Unmanned",
    "isAttachable": true,
    "maxPurchases": 4
  },
  {
    "requiredBaseMaxDamage": 2,
    "name": "B-2 Bomber",
    "requiredBaseId": "kadena-ab",
    "cardType": "attack",
    "id": "us-017",
    "requiresBaseCondition": true,
    "maxPurchases": 2,
    "deploymentTime": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 17 B-2 Bomber.jpg",
    "faction": "us",
    "cost": 4
  },
  {
    "requiredBaseId": "kadena-ab",
    "maxPurchases": 2,
    "requiredBaseMaxDamage": 3,
    "deploymentTime": 4,
    "id": "us-018",
    "faction": "us",
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 18 B-52 Stratofortress.jpg",
    "cost": 4,
    "cardType": "attack",
    "name": "B-52 Stratofortress"
  },
  {
    "faction": "us",
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 19 Network Resiliency.jpg",
    "id": "us-019",
    "maxPurchases": 2,
    "name": "Network Resiliency",
    "cardType": "intelligence"
  },
  {
    "cost": 3,
    "sub": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 20 Maritime Mines (x2).jpg",
    "deploymentTime": 3,
    "name": "Maritime Mines",
    "cardType": "attack",
    "maxPurchases": 4,
    "faction": "us",
    "id": "us-020",
    "submarineType": "asset"
  },
  {
    "maxPurchases": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 21 Submarine Strike.jpg",
    "id": "us-021",
    "faction": "us",
    "name": "Submarine Strike",
    "cardType": "attack",
    "cost": 5
  },
  {
    "name": "Vertical Insertion",
    "deploymentTime": 2,
    "transportCapacity": 2,
    "maxPurchases": 2,
    "isTransport": true,
    "requiredBaseId": "futenma-as",
    "requiresBaseCondition": true,
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON"
    ],
    "id": "us-022",
    "requiredBaseMaxDamage": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 22 Vertical Insertion.jpg",
    "cardType": "maneuver",
    "faction": "us",
    "cost": 2
  },
  {
    "maxPurchases": 4,
    "id": "us-023",
    "name": "Mine Clearing Unmanned",
    "submarineType": "asset",
    "deploymentTime": 2,
    "faction": "us",
    "attachableCategory": "naval",
    "cardType": "maneuver",
    "sub": true,
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 23 Mine Clearing Unmanned.jpg",
    "cost": 3
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 24 Host Nation Logistics.jpg",
    "cost": 4,
    "maxPurchases": 3,
    "id": "us-024",
    "deploymentTime": 2,
    "cardType": "maneuver",
    "faction": "us",
    "name": "Host Nation Logistics"
  },
  {
    "name": "Behind Enemy Lines",
    "maxPurchases": 0,
    "cardType": "intelligence",
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 25 Behind Enemy Lines.jpg",
    "id": "us-025",
    "faction": "us"
  },
  {
    "faction": "us",
    "name": "Ground Sensors",
    "imagePath": "/images/Cartas USMC/LCC USMC 26 Ground Sensors.jpg",
    "id": "us-026",
    "cost": 2,
    "cardType": "intelligence",
    "infinite": true,
    "maxPurchases": 4
  },
  {
    "cardType": "attack",
    "id": "us-027",
    "maxPurchases": 4,
    "deploymentTime": 2,
    "faction": "us",
    "infinite": true,
    "name": "Stealth Helo",
    "cost": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 27 Stealth Helo.jpg"
  },
  {
    "maxPurchases": 4,
    "id": "us-028",
    "cardType": "communications",
    "cost": 3,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 28 GPS Spoofing.jpg",
    "name": "GPS Spoofing"
  },
  {
    "faction": "us",
    "attachableCategory": "artillery",
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 29 Precision Strike missile (x2).jpg",
    "maxPurchases": 4,
    "id": "us-029",
    "deploymentTime": 2,
    "isAttachable": true,
    "name": "Precision Strike missile",
    "cost": 1
  },
  {
    "id": "us-030",
    "isAttachable": true,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 30 G ATOR Radar.jpg",
    "attachableCategory": "interception",
    "faction": "us",
    "maxPurchases": 4,
    "cardType": "interception",
    "name": "G ATOR Radar",
    "cost": 1
  },
  {
    "cost": 1,
    "faction": "us",
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 31 Open Source Intel.jpg",
    "name": "Open Source Intel",
    "id": "us-031",
    "maxPurchases": 0
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 32 Naval Swarm.jpg",
    "cardType": "attack",
    "submarineType": "asset",
    "secondaryAmmoBonus": 2,
    "id": "us-032",
    "cost": 2,
    "deploymentTime": 2,
    "isAttachable": true,
    "name": "Naval Swarm",
    "maxPurchases": 2,
    "attachableCategory": "naval",
    "sub": true,
    "faction": "us"
  },
  {
    "isAttachable": true,
    "faction": "us",
    "attachableCategory": "naval",
    "name": "Aegis Ballistic Defense",
    "maxPurchases": 4,
    "secondaryAmmoBonus": 4,
    "cost": 0,
    "imagePath": "/images/Cartas USMC/LCC USMC 33 Aegis Ballistic Defense (x2).jpg",
    "cardType": "interception",
    "id": "us-033"
  },
  {
    "faction": "us",
    "name": "Blindspot",
    "imagePath": "/images/Cartas USMC/LCC USMC 34 Blindspot.jpg",
    "maxPurchases": 4,
    "id": "us-034",
    "cardType": "communications",
    "cost": 4
  },
  {
    "cost": 1,
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 35 Quadcopter Drone.jpg",
    "attachableCategory": "ground",
    "name": "Quadcopter Drone",
    "id": "us-035",
    "maxPurchases": 0,
    "faction": "us",
    "cardType": "intelligence"
  },
  {
    "name": "Unmanned Underwater ISR",
    "maxPurchases": 4,
    "id": "us-036",
    "attachableCategory": "naval",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 36 Unmanned Underwater ISR.jpg",
    "cardType": "intelligence",
    "isAttachable": true,
    "submarineType": "asset",
    "faction": "us",
    "sub": true,
    "cost": 1
  },
  {
    "isAttachable": true,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 37 Scatterable Landmines.jpg",
    "attachableCategory": "artillery",
    "maxPurchases": 0,
    "id": "us-037",
    "name": "Scatterable Landmines",
    "cost": 2,
    "cardType": "attack"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 38 Cut The Link.jpg",
    "faction": "us",
    "cost": 4,
    "id": "us-038",
    "name": "Cut The Link",
    "cardType": "communications",
    "maxPurchases": 4
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 39 Unmanned Ground Vehicles (UGVS).jpg",
    "attachableCategory": "ground",
    "deploymentTime": 2,
    "isAttachable": true,
    "faction": "us",
    "maxPurchases": 4,
    "id": "us-039",
    "cardType": "maneuver",
    "hpBonus": 2,
    "name": "Unmanned Ground Vehicles (UGVS)",
    "cost": 1
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 40 Coordinated Deception.jpg",
    "id": "us-040",
    "name": "Coordinated Deception",
    "cost": 1,
    "maxPurchases": 0,
    "faction": "us",
    "cardType": "communications"
  },
  {
    "faction": "us",
    "attachableCategory": "ground",
    "imagePath": "/images/Cartas USMC/LCC USMC 41 Anti-Tank Missile.jpg",
    "cost": 1,
    "deploymentTime": 1,
    "isAttachable": true,
    "cardType": "maneuver",
    "maxPurchases": 4,
    "id": "us-041",
    "name": "Anti-Tank Missile"
  },
  {
    "requiredBaseMaxDamage": 4,
    "cardType": "maneuver",
    "maxPurchases": 2,
    "faction": "us",
    "cost": 4,
    "isTransport": true,
    "deploymentTime": 3,
    "transportCapacity": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 42 Light Amphibious Warship (LAW).jpg",
    "requiredBaseId": "sembawang-singapore",
    "id": "us-042",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION"
    ],
    "requiresBaseCondition": true,
    "name": "Light Amphibious Warship (LAW)"
  },
  {
    "id": "us-043",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 43 Raider Sabotage.jpg",
    "cost": 2,
    "name": "Raider Sabotage",
    "cardType": "maneuver",
    "maxPurchases": 0
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 44 Joint Fires.jpg",
    "faction": "us",
    "cardType": "attack",
    "name": "Joint Fires",
    "id": "us-044",
    "maxPurchases": 2,
    "cost": 3
  },
  {
    "faction": "us",
    "cardType": "communications",
    "cost": 3,
    "id": "us-045",
    "imagePath": "/images/Cartas USMC/LCC USMC 45 Signal Intelligence.jpg",
    "maxPurchases": 0,
    "name": "Signal Intelligence"
  },
  {
    "maxPurchases": 4,
    "cost": 1,
    "cardType": "communications",
    "name": "Naval Deception",
    "id": "us-046",
    "imagePath": "/images/Cartas USMC/LCC USMC 46 Naval Deception (x2).jpg",
    "faction": "us",
    "deploymentTime": 1
  },
  {
    "id": "us-047",
    "deploymentTime": 2,
    "name": "Riverine Squadron",
    "cost": 2,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas USMC/LCC USMC 47 Riverine Squadron.jpg",
    "maxPurchases": 4,
    "faction": "us"
  },
  {
    "name": "F-22 Escorts",
    "infinite": true,
    "requiredBaseId": "kadena-ab",
    "cardType": "interception",
    "cost": 3,
    "deploymentTime": 3,
    "faction": "us",
    "requiredBaseMaxDamage": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 48 F-22 Escorts.jpg",
    "requiresBaseCondition": true,
    "id": "us-048",
    "maxPurchases": 2
  },
  {
    "id": "us-049",
    "maxPurchases": 2,
    "deploymentTime": 3,
    "name": "P-8A Surveillance",
    "cardType": "intelligence",
    "faction": "us",
    "requiredBaseMaxDamage": 2,
    "submarineType": "asw",
    "cost": 3,
    "sub": true,
    "requiresBaseCondition": true,
    "requiredBaseId": "futenma-as",
    "infinite": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 49 P-8A Surveillance (x2).jpg"
  },
  {
    "isAttachable": true,
    "faction": "us",
    "attachableCategory": "ground",
    "deploymentTime": 1,
    "imagePath": "/images/Cartas USMC/LCC USMC 50 V-BAT.jpg",
    "name": "V-BAT",
    "maxPurchases": 4,
    "id": "us-050",
    "cardType": "intelligence",
    "cost": 1
  },
  {
    "cardType": "attack",
    "maxPurchases": 4,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 51 Torpedo Attack.jpg",
    "id": "us-051",
    "name": "Torpedo Attack",
    "cost": 4
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 52 Close Air Support.jpg",
    "id": "us-052",
    "deploymentTime": 2,
    "name": "Close Air Support",
    "faction": "us",
    "cardType": "attack",
    "maxPurchases": 4,
    "cost": 2
  },
  {
    "attachableCategory": "ground",
    "faction": "us",
    "name": "Combat Engineers",
    "id": "us-053",
    "deploymentTime": 1,
    "isAttachable": true,
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 53 Combat Engineers.jpg",
    "maxPurchases": 4,
    "cardType": "maneuver"
  },
  {
    "cost": 3,
    "maxPurchases": 4,
    "cardType": "communications",
    "id": "us-054",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 54 Tactival Cyber Attack (x2).jpg",
    "name": "Tactival Cyber Attack"
  },
  {
    "name": "Anglico",
    "cost": 4,
    "id": "us-055",
    "imagePath": "/images/Cartas USMC/LCC USMC 55 Anglico.jpg",
    "hpBonus": 1,
    "attachableCategory": "ground",
    "faction": "us",
    "isAttachable": true,
    "cardType": "attack",
    "maxPurchases": 2
  },
  {
    "influenceThresholds": [
      {
        "maxRoll": 3,
        "description": "Decisive Success",
        "influenceEffect": 3,
        "minRoll": 1
      },
      {
        "influenceEffect": 2,
        "description": "Minor Success",
        "minRoll": 4,
        "maxRoll": 9
      },
      {
        "description": "No Effect",
        "minRoll": 10,
        "influenceEffect": 0,
        "maxRoll": 12
      },
      {
        "minRoll": 13,
        "description": "Failure",
        "maxRoll": 16,
        "influenceEffect": -1
      },
      {
        "maxRoll": 20,
        "influenceEffect": -4,
        "description": "Major Failure",
        "minRoll": 17
      }
    ],
    "isInfluenceCard": true,
    "faction": "us",
    "name": "Influence Operations",
    "cost": 5,
    "deploymentTime": 2,
    "maxPurchases": 2,
    "cardType": "communications",
    "id": "us-056",
    "imagePath": "/images/Cartas USMC/LCC USMC 56 Influence Operations.jpg"
  },
  {
    "cardType": "communications",
    "influenceThresholds": [
      {
        "minRoll": 1,
        "maxRoll": 3,
        "influenceEffect": 3,
        "description": "Decisive Success"
      },
      {
        "minRoll": 4,
        "description": "Minor Success",
        "maxRoll": 12,
        "influenceEffect": 2
      },
      {
        "influenceEffect": 0,
        "minRoll": 13,
        "description": "No Effect",
        "maxRoll": 17
      },
      {
        "description": "Failure",
        "maxRoll": 20,
        "minRoll": 18,
        "influenceEffect": -1
      }
    ],
    "deploymentTime": 2,
    "id": "us-057",
    "name": "Humanitarian Operations",
    "cost": 4,
    "faction": "us",
    "isInfluenceCard": true,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 57 Humanitarian Operations.jpg"
  },
  {
    "isInfluenceCard": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 58 Combat Camera.jpg",
    "deploymentTime": 2,
    "id": "us-058",
    "cost": 3,
    "name": "Combat Camera",
    "maxPurchases": 2,
    "influenceThresholds": [
      {
        "minRoll": 1,
        "influenceEffect": 4,
        "maxRoll": 4,
        "description": "Decisive Success"
      },
      {
        "description": "Minor Success",
        "maxRoll": 14,
        "minRoll": 5,
        "influenceEffect": 2
      },
      {
        "maxRoll": 17,
        "influenceEffect": 0,
        "description": "No Effect",
        "minRoll": 15
      },
      {
        "maxRoll": 19,
        "influenceEffect": -1,
        "minRoll": 18,
        "description": "Failure"
      },
      {
        "minRoll": 20,
        "influenceEffect": -4,
        "description": "Major Failure",
        "maxRoll": 20
      }
    ],
    "cardType": "communications",
    "faction": "us"
  },
  {
    "maxPurchases": 2,
    "requiresBaseCondition": true,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 59 U-2 Recon.jpg",
    "cost": 4,
    "deploymentTime": 3,
    "id": "us-059",
    "requiredBaseMaxDamage": 3,
    "cardType": "intelligence",
    "name": "U-2 Recon",
    "requiredBaseId": "kadena-ab"
  },
  {
    "deploymentTime": 2,
    "maxPurchases": 4,
    "faction": "us",
    "name": "SEAL Insertion",
    "imagePath": "/images/Cartas USMC/LCC USMC 60 SEAL Insertion.jpg",
    "cost": 4,
    "id": "us-060",
    "cardType": "maneuver"
  },
  {
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 61 MARSOC HALO.jpg",
    "faction": "us",
    "name": "MARSOC HALO",
    "cost": 3,
    "requiredBaseId": "futenma-as",
    "cardType": "maneuver",
    "requiredBaseMaxDamage": 3,
    "id": "us-061",
    "deploymentTime": 2,
    "maxPurchases": 4
  },
  {
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 62 False Death Notifications.jpg",
    "id": "us-062",
    "name": "False Death Notifications",
    "faction": "us",
    "cost": 4,
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "minRoll": 1,
        "maxRoll": 6,
        "influenceEffect": 3
      },
      {
        "maxRoll": 12,
        "minRoll": 7,
        "influenceEffect": 2,
        "description": "Minor Success"
      },
      {
        "minRoll": 13,
        "maxRoll": 15,
        "influenceEffect": 0,
        "description": "No Effect"
      },
      {
        "influenceEffect": -1,
        "description": "Failure",
        "maxRoll": 18,
        "minRoll": 16
      },
      {
        "maxRoll": 20,
        "description": "Major Failure",
        "influenceEffect": -4,
        "minRoll": 19
      }
    ],
    "isInfluenceCard": true,
    "maxPurchases": 2
  },
  {
    "faction": "us",
    "name": "Attacking AI",
    "id": "us-063",
    "cost": 4,
    "cardType": "communications",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 63 Attacking AI.jpg"
  },
  {
    "deploymentTime": 2,
    "cardType": "attack",
    "cost": 5,
    "maxPurchases": 2,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 64 Hypersonic Glide Vehicle.jpg",
    "name": "Hypersonic Glide Vehicle",
    "id": "us-064"
  },
  {
    "sub": true,
    "faction": "us",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 65 Helo ASW.jpg",
    "cost": 1,
    "submarineType": "asw",
    "id": "us-065",
    "name": "Helo ASW",
    "attachableCategory": "naval",
    "isAttachable": true,
    "cardType": "intelligence",
    "deploymentTime": 2
  },
  {
    "infinite": true,
    "faction": "us",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 66 Valkyrie Unmanned.jpg",
    "cardType": "attack",
    "cost": 2,
    "name": "Valkyrie Unmanned",
    "id": "us-066"
  },
  {
    "name": "MUX Unmanned",
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 67 MUX Unmanned (x2).jpg",
    "maxPurchases": 2,
    "id": "us-067",
    "faction": "us",
    "infinite": true,
    "cardType": "intelligence"
  },
  {
    "isAttachable": true,
    "faction": "us",
    "submarineType": "asset",
    "imagePath": "/images/Cartas USMC/LCC USMC 68 Unmanned Boats.jpg",
    "id": "us-068",
    "cardType": "maneuver",
    "sub": true,
    "cost": 2,
    "maxPurchases": 2,
    "attachableCategory": "ground",
    "name": "Unmanned Boats"
  },
  {
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 69 Virginia-Class Sub (x2).jpg",
    "maxPurchases": 4,
    "cardType": "maneuver",
    "cost": 5,
    "id": "us-069",
    "sub": true,
    "submarineType": "submarine",
    "name": "Virginia-Class Sub"
  },
  {
    "maxPurchases": 4,
    "submarineType": "submarine",
    "imagePath": "/images/Cartas USMC/LCC USMC 70 Ohio-Class Sub.jpg",
    "id": "us-070",
    "faction": "us",
    "sub": true,
    "cost": 5,
    "cardType": "maneuver",
    "name": "Ohio-Class Sub"
  },
  {
    "id": "us-071",
    "cardType": "communications",
    "name": "Unmanned Hacking",
    "imagePath": "/images/Cartas USMC/LCC USMC 71 Unmanned Hacking.jpg",
    "cost": 3,
    "maxPurchases": 2,
    "faction": "us"
  },
  {
    "transportCapacity": 4,
    "cardType": "maneuver",
    "maxPurchases": 2,
    "faction": "us",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "id": "us-072",
    "cost": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 72 Littoral Movement.jpg",
    "isTransport": true,
    "name": "Littoral Movement"
  },
  {
    "maxPurchases": 2,
    "cardType": "maneuver",
    "requiredBaseMaxDamage": 4,
    "cost": 4,
    "id": "us-073",
    "name": "Expeditionary Logistics",
    "requiresBaseCondition": true,
    "requiredBaseId": "sembawang-singapore",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 73 Expeditionary Logistics.jpg"
  },
  {
    "infinite": true,
    "cardType": "intelligence",
    "maxPurchases": 2,
    "cost": 5,
    "id": "us-074",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 74 Multi-Domain Task Force.jpg",
    "name": "Multi-Domain Task Force"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 75 Logistics Resiliency.jpg",
    "faction": "us",
    "infinite": true,
    "name": "Logistics Resiliency",
    "maxPurchases": 2,
    "cost": 5,
    "id": "us-075",
    "cardType": "maneuver"
  },
  {
    "id": "us-076",
    "maxPurchases": 2,
    "name": "MEF Information Group",
    "cardType": "communications",
    "faction": "us",
    "infinite": true,
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 76 MEF Information Group.jpg"
  },
  {
    "cost": 3,
    "cardType": "communications",
    "maxPurchases": 2,
    "infinite": true,
    "name": "EA-18G Growler",
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 3,
    "id": "us-077",
    "imagePath": "/images/Cartas USMC/LCC USMC 77 EA-18G Growler.jpg",
    "faction": "us",
    "requiredBaseId": "futenma-as"
  },
  {
    "cost": 5,
    "id": "us-078",
    "faction": "us",
    "maxPurchases": 2,
    "cardType": "communications",
    "name": "Coordinated Degradation",
    "imagePath": "/images/Cartas USMC/LCC USMC 78 Coordinated Degradation.jpg"
  },
  {
    "infinite": true,
    "cardType": "communications",
    "name": "Self-Healing Network",
    "maxPurchases": 2,
    "id": "us-079",
    "imagePath": "/images/Cartas USMC/LCC USMC 79 Self-Healing Network.jpg",
    "faction": "us",
    "cost": 4
  },
  {
    "maxPurchases": 4,
    "infinite": true,
    "cost": 3,
    "id": "us-080",
    "faction": "us",
    "name": "High Altitude Balloons",
    "imagePath": "/images/Cartas USMC/LCC USMC 80 High Altitude Balloons.jpg",
    "cardType": "intelligence"
  },
  {
    "infinite": true,
    "id": "us-081",
    "name": "Signal Management",
    "maxPurchases": 2,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 81 Signal Management.jpg",
    "cardType": "communications",
    "cost": 2
  },
  {
    "id": "us-082",
    "cardType": "maneuver",
    "faction": "us",
    "requiredBaseId": "sembawang-singapore",
    "imagePath": "/images/Cartas USMC/LCC USMC 82 Heavy Lift.jpg",
    "name": "Heavy Lift",
    "requiredBaseMaxDamage": 5,
    "cost": 3,
    "requiresBaseCondition": true,
    "infinite": true,
    "maxPurchases": 2
  },
  {
    "maxPurchases": 2,
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 83 NGAD Unmanned.jpg",
    "faction": "us",
    "id": "us-083",
    "name": "NGAD Unmanned",
    "cost": 4
  },
  {
    "maxPurchases": 0,
    "id": "us-084",
    "cost": 1,
    "imagePath": "/images/Cartas USMC/LCC USMC 84 Military Intelligence.jpg",
    "cardType": "intelligence",
    "faction": "us",
    "name": "Military Intelligence"
  },
  {
    "maxPurchases": 2,
    "name": "Long-Range Hypersonic Weapon",
    "faction": "us",
    "cardType": "attack",
    "cost": 5,
    "id": "us-085",
    "imagePath": "/images/Cartas USMC/LCC USMC 85 Long-Range Hypersonic Weapon.jpg"
  },
  {
    "cost": 3,
    "cardType": "maneuver",
    "maxPurchases": 2,
    "isAttachable": true,
    "sub": true,
    "name": "UUV Defense",
    "imagePath": "/images/Cartas USMC/LCC USMC 86 UUV Defense.jpg",
    "id": "us-086",
    "attachableCategory": "naval",
    "faction": "us",
    "submarineType": "asset"
  },
  {
    "id": "us-087",
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 87 Cyber Exploit.jpg",
    "name": "Cyber Exploit",
    "faction": "us",
    "cost": 5,
    "maxPurchases": 2
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 88 Patriot.jpg",
    "faction": "us",
    "attachableCategory": "interception",
    "isAttachable": true,
    "secondaryAmmoBonus": 4,
    "cost": 4,
    "cardType": "interception",
    "hpBonus": 1,
    "maxPurchases": 4,
    "id": "us-088",
    "name": "Patriot"
  },
  {
    "requiredBaseMaxDamage": 6,
    "transportCapacity": 4,
    "requiresBaseCondition": true,
    "cardType": "maneuver",
    "maxPurchases": 4,
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "imagePath": "/images/Cartas USMC/LCC USMC 89 C-130 Hercules.jpg",
    "id": "us-089",
    "cost": 4,
    "name": "C-130 Hercules",
    "faction": "us",
    "requiredBaseId": "kadena-ab",
    "isTransport": true
  },
  {
    "isAttachable": true,
    "cardType": "attack",
    "submarineType": "asw",
    "imagePath": "/images/Cartas USMC/LCC USMC 90 UUV Attack Unmanned.jpg",
    "sub": true,
    "cost": 4,
    "attachableCategory": "naval",
    "id": "us-090",
    "name": "UUV Attack Unmanned",
    "maxPurchases": 2,
    "faction": "us"
  },
  {
    "faction": "us",
    "name": "Civil Affairs Group",
    "isInfluenceCard": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 91 Civil Affairs Group.jpg",
    "id": "us-091",
    "maxPurchases": 4,
    "cost": 2,
    "cardType": "communications",
    "influenceThresholds": [
      {
        "influenceEffect": 2,
        "description": "Decisive Success",
        "maxRoll": 2,
        "minRoll": 1
      },
      {
        "maxRoll": 9,
        "minRoll": 3,
        "influenceEffect": 1,
        "description": "Minor Success"
      },
      {
        "maxRoll": 14,
        "minRoll": 10,
        "description": "No Effect",
        "influenceEffect": 0
      },
      {
        "maxRoll": 18,
        "influenceEffect": -2,
        "description": "Failure",
        "minRoll": 15
      },
      {
        "influenceEffect": -3,
        "maxRoll": 20,
        "description": "Major Failure",
        "minRoll": 19
      }
    ]
  },
  {
    "isInfluenceCard": true,
    "name": "Security Forces Assistance Brigade",
    "imagePath": "/images/Cartas USMC/LCC USMC 92 Security Forces Assistance Brigade.jpg",
    "cardType": "communications",
    "maxPurchases": 2,
    "id": "us-092",
    "faction": "us",
    "cost": 4,
    "influenceThresholds": [
      {
        "minRoll": 1,
        "maxRoll": 5,
        "description": "Decisive Success",
        "influenceEffect": 3
      },
      {
        "description": "Minor Success",
        "maxRoll": 11,
        "influenceEffect": 2,
        "minRoll": 6
      },
      {
        "maxRoll": 15,
        "minRoll": 12,
        "description": "No Effect",
        "influenceEffect": 0
      },
      {
        "minRoll": 16,
        "description": "Failure",
        "influenceEffect": -2,
        "maxRoll": 18
      },
      {
        "description": "Major Failure",
        "minRoll": 19,
        "maxRoll": 20,
        "influenceEffect": -4
      }
    ]
  },
  {
    "cost": 4,
    "id": "us-093",
    "requiredBaseMaxDamage": 4,
    "requiredBaseId": "sembawang-singapore",
    "faction": "us",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "transportCapacity": 6,
    "maxPurchases": 2,
    "name": "LCU-2000",
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "isTransport": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 93 LCU-2000.jpg"
  },
  {
    "name": "Glide Phase Interceptor",
    "imagePath": "/images/Cartas USMC/LCC USMC 94 Glide Phase Interceptor.jpg",
    "cost": 4,
    "id": "us-094",
    "cardType": "interception",
    "maxPurchases": 2,
    "isAttachable": true,
    "faction": "us",
    "attachableCategory": "naval"
  },
  {
    "cardType": "communications",
    "cost": 4,
    "isInfluenceCard": true,
    "influenceThresholds": [
      {
        "minRoll": 1,
        "maxRoll": 4,
        "influenceEffect": 2,
        "description": "Decisive Success"
      },
      {
        "maxRoll": 10,
        "influenceEffect": 1,
        "minRoll": 5,
        "description": "Minor Success"
      },
      {
        "influenceEffect": 0,
        "maxRoll": 14,
        "minRoll": 11,
        "description": "No Effect"
      },
      {
        "description": "Failure",
        "minRoll": 15,
        "maxRoll": 18,
        "influenceEffect": -1
      },
      {
        "maxRoll": 20,
        "influenceEffect": -3,
        "description": "Major Failure",
        "minRoll": 19
      }
    ],
    "id": "us-095",
    "imagePath": "/images/Cartas USMC/LCC USMC 95 Special Operations Forces Advisors.jpg",
    "maxPurchases": 2,
    "faction": "us",
    "name": "Special Operations Forces Advisors"
  },
  {
    "faction": "us",
    "submarineType": "asset",
    "id": "us-096",
    "infinite": true,
    "name": "Seaplanes",
    "cost": 3,
    "cardType": "maneuver",
    "maxPurchases": 2,
    "sub": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 96 Seaplanes.jpg"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 97 Public Affairs Officer.jpg",
    "cost": 2,
    "maxPurchases": 2,
    "faction": "us",
    "cardType": "communications",
    "influenceThresholds": [
      {
        "influenceEffect": 2,
        "maxRoll": 2,
        "minRoll": 1,
        "description": "Decisive Success"
      },
      {
        "minRoll": 3,
        "influenceEffect": 1,
        "maxRoll": 8,
        "description": "Minor Success"
      },
      {
        "maxRoll": 14,
        "minRoll": 9,
        "influenceEffect": 0,
        "description": "No Effect"
      },
      {
        "maxRoll": 18,
        "minRoll": 15,
        "description": "Failure",
        "influenceEffect": -1
      },
      {
        "influenceEffect": -3,
        "minRoll": 19,
        "description": "Major Failure",
        "maxRoll": 20
      }
    ],
    "id": "us-097",
    "isInfluenceCard": true,
    "name": "Public Affairs Officer"
  },
  {
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 98 Counter-Mobility OPS.jpg",
    "maxPurchases": 4,
    "id": "us-098",
    "name": "Counter-Mobility OPS",
    "attachableCategory": "ground",
    "faction": "us",
    "cardType": "maneuver",
    "isAttachable": true
  },
  {
    "maxPurchases": 2,
    "requiredBaseId": "kadena-ab",
    "cardType": "intelligence",
    "name": "JSTARS E-8C",
    "imagePath": "/images/Cartas USMC/LCC USMC 99 JSTARS E-8C.jpg",
    "cost": 5,
    "infinite": true,
    "requiredBaseMaxDamage": 4,
    "requiresBaseCondition": true,
    "faction": "us",
    "id": "us-099"
  },
  {
    "maxPurchases": 2,
    "cost": 3,
    "name": "Psyop",
    "id": "us-100",
    "cardType": "communications",
    "influenceThresholds": [
      {
        "influenceEffect": 2,
        "maxRoll": 4,
        "minRoll": 1,
        "description": "Decisive Success"
      },
      {
        "maxRoll": 10,
        "influenceEffect": 1,
        "minRoll": 5,
        "description": "Minor Success"
      },
      {
        "influenceEffect": 0,
        "description": "No Effect",
        "maxRoll": 14,
        "minRoll": 11
      },
      {
        "minRoll": 15,
        "influenceEffect": -1,
        "description": "Failure",
        "maxRoll": 18
      },
      {
        "maxRoll": 20,
        "influenceEffect": -3,
        "description": "Major Failure",
        "minRoll": 19
      }
    ],
    "imagePath": "/images/Cartas USMC/LCC USMC 100 Psyop.jpg",
    "isInfluenceCard": true,
    "faction": "us"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 101 AI-Enabled Targeting.jpg",
    "infinite": true,
    "faction": "us",
    "cardType": "intelligence",
    "cost": 3,
    "id": "us-101",
    "maxPurchases": 2,
    "name": "AI-Enabled Targeting"
  },
  {
    "attachableCategory": "ground",
    "faction": "us",
    "name": "Active Denial System",
    "cost": 2,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas USMC/LCC USMC 102 Active Denial System.jpg",
    "maxPurchases": 3,
    "isAttachable": true,
    "id": "us-102"
  },
  {
    "cardType": "interception",
    "imagePath": "/images/Cartas USMC/LCC USMC 103 Airborne Early Warning and Control.jpg",
    "infinite": true,
    "faction": "us",
    "maxPurchases": 2,
    "id": "us-103",
    "name": "Airborne Early Warning and Control",
    "cost": 4
  },
  {
    "id": "china-001",
    "maxPurchases": 0,
    "cardType": "intelligence",
    "cost": 0,
    "name": "Tactical Network",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 01 Tactical Network.jpg"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 02 Combat Air Patrols (x2).jpg",
    "maxPurchases": 4,
    "faction": "china",
    "deploymentTime": 2,
    "cost": 3,
    "name": "Combat Air Patrols",
    "cardType": "interception",
    "id": "china-002"
  },
  {
    "id": "china-003",
    "maxPurchases": 6,
    "submarineType": "asset",
    "faction": "china",
    "sub": true,
    "name": "Maritime Militia",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 03 Maritime Militia (x2).jpg",
    "cost": 1,
    "cardType": "intelligence"
  },
  {
    "secondaryAmmoBonus": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 04 DF-10A Long Sword.jpg",
    "name": "DF-10A Long Sword",
    "attachableCategory": "artillery",
    "faction": "china",
    "cardType": "attack",
    "deploymentTime": 2,
    "isAttachable": true,
    "hpBonus": 2,
    "id": "china-004",
    "cost": 3,
    "maxPurchases": 3
  },
  {
    "requiredBaseId": "custom-1761999685239",
    "name": "DF-21D Ballistic",
    "maxPurchases": 0,
    "cardType": "attack",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 05 DF-21D Ballistic (x2).jpg",
    "cost": 4,
    "faction": "china",
    "id": "china-005",
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 3
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 06 DF-16 Ballistic.jpg",
    "cost": 3,
    "maxPurchases": 0,
    "name": "DF-16 Ballistic",
    "faction": "china",
    "id": "china-006",
    "cardType": "attack"
  },
  {
    "name": "GJ-11 Unmanned",
    "id": "china-007",
    "cardType": "attack",
    "requiredBaseMaxDamage": 4,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 07 GJ-11 Unmanned.jpg",
    "faction": "china",
    "maxPurchases": 4,
    "requiresBaseCondition": true,
    "cost": 2,
    "requiredBaseId": "luzon-strait-patrols"
  },
  {
    "name": "Space Satellites",
    "maxPurchases": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 08 Space Satellites.jpg",
    "faction": "china",
    "id": "china-008",
    "cost": 4,
    "infinite": true,
    "cardType": "intelligence",
    "deploymentTime": 1
  },
  {
    "cardType": "communications",
    "cost": 3,
    "faction": "china",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 09 Blindspot.jpg",
    "id": "china-009",
    "name": "Blindspot"
  },
  {
    "cost": 3,
    "cardType": "communications",
    "faction": "china",
    "id": "china-010",
    "maxPurchases": 2,
    "name": "GPS Spoofing",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 10 GPS Spoofing.jpg"
  },
  {
    "faction": "china",
    "maxPurchases": 2,
    "name": "Attack on C2",
    "id": "china-011",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 11 Attack on C2.jpg",
    "cost": 2,
    "cardType": "communications"
  },
  {
    "id": "china-012",
    "cardType": "communications",
    "cost": 2,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 12 Tactical Cyber Defenses.jpg",
    "name": "Tactical Cyber Defenses",
    "maxPurchases": 4
  },
  {
    "name": "Social Media Exploitation",
    "faction": "china",
    "cost": 1,
    "maxPurchases": 0,
    "cardType": "communications",
    "id": "china-013",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 13 Social Media Exploitation (x2).jpg"
  },
  {
    "maxPurchases": 3,
    "name": "Strong-Arm Diplomacy",
    "cardType": "communications",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 14 Strong-Arm Diplomacy.jpg",
    "id": "china-014",
    "faction": "china",
    "cost": 4
  },
  {
    "id": "china-015",
    "name": "SOF Sabotage",
    "faction": "china",
    "deploymentTime": 2,
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 15 SOF Sabotage.jpg",
    "cardType": "maneuver",
    "maxPurchases": 4
  },
  {
    "cost": 1,
    "faction": "china",
    "maxPurchases": 0,
    "name": "Behind Enemy Lines",
    "deploymentTime": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 16 Behind Enemy Lines.jpg",
    "id": "china-016",
    "cardType": "intelligence"
  },
  {
    "cardType": "interception",
    "name": "HQ-22 IAMD",
    "hpBonus": 2,
    "id": "china-017",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 17 HQ-22 IAMD.jpg",
    "cost": 4,
    "isAttachable": true,
    "maxPurchases": 4,
    "attachableCategory": "artillery",
    "secondaryAmmoBonus": 4,
    "faction": "china"
  },
  {
    "deploymentTime": 3,
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 18 H-6K Cluster Bombs.jpg",
    "cardType": "attack",
    "requiredBaseId": "custom-1761996668729",
    "name": "H-6K Cluster Bombs",
    "maxPurchases": 2,
    "faction": "china",
    "requiresBaseCondition": true,
    "id": "china-018",
    "requiredBaseMaxDamage": 3
  },
  {
    "requiredBaseId": "custom-1761996668729",
    "name": "H-6K Aerial Strike",
    "maxPurchases": 2,
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 3,
    "id": "china-019",
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 19 H-6K Aerial Strike.jpg",
    "faction": "china",
    "deploymentTime": 3,
    "cardType": "attack"
  },
  {
    "faction": "china",
    "id": "china-020",
    "isAttachable": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 20 Tactical UAS (x2).jpg",
    "name": "Tactical UAS",
    "attachableCategory": "ground",
    "maxPurchases": 0,
    "cardType": "intelligence",
    "cost": 1
  },
  {
    "infinite": true,
    "id": "china-021",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 21 GJ-1D Unmaned.jpg",
    "name": "GJ-1D Unmaned",
    "cost": 2,
    "cardType": "attack",
    "maxPurchases": 2,
    "deploymentTime": 2
  },
  {
    "name": "Electro-Magnetic Sepctrum Defense",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 22 Electro-Magnetic Sepctrum Defense.jpg",
    "id": "china-022",
    "cardType": "communications",
    "cost": 3,
    "faction": "china"
  },
  {
    "name": "Electro-Magnetic Spectrum Jamming",
    "cardType": "communications",
    "faction": "china",
    "maxPurchases": 2,
    "id": "china-023",
    "cost": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 23 Electro-Magnetic Spectrum Jamming.jpg"
  },
  {
    "maxPurchases": 2,
    "id": "china-024",
    "cardType": "communications",
    "cost": 3,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 24 Logistics Attack.jpg",
    "name": "Logistics Attack"
  },
  {
    "name": "Intelligized Networks",
    "maxPurchases": 2,
    "id": "china-025",
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 25 Intelligized Networks.jpg",
    "cardType": "intelligence",
    "faction": "china"
  },
  {
    "faction": "china",
    "maxPurchases": 2,
    "name": "GJ-2 Unmanned",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 26 GJ-2 Unmanned (x2).jpg",
    "cardType": "attack",
    "deploymentTime": 2,
    "infinite": true,
    "id": "china-026",
    "cost": 3
  },
  {
    "secondaryAmmoBonus": 4,
    "cardType": "interception",
    "deploymentTime": 2,
    "id": "china-027",
    "cost": 3,
    "isAttachable": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 27 HQ-9B IAMD.jpg",
    "maxPurchases": 2,
    "faction": "china",
    "name": "HQ-9B IAMD",
    "attachableCategory": "artillery",
    "hpBonus": 2
  },
  {
    "faction": "china",
    "cardType": "attack",
    "cost": 5,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 28 Joint Fires.jpg",
    "id": "china-028",
    "name": "Joint Fires"
  },
  {
    "maxPurchases": 0,
    "cost": 2,
    "name": "Human Intelligence",
    "cardType": "intelligence",
    "faction": "china",
    "id": "china-029",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 29 Human Intelligence (x2).jpg"
  },
  {
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 30 Torpedo Attack.jpg",
    "cardType": "attack",
    "id": "china-030",
    "maxPurchases": 2,
    "name": "Torpedo Attack",
    "cost": 4
  },
  {
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "LIGHT TANK PLATOON",
      "LIGHT TANK PLATOON"
    ],
    "cost": 3,
    "faction": "china",
    "requiredBaseMaxDamage": 5,
    "id": "china-031",
    "transportCapacity": 6,
    "name": "Amphibious Assault",
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "deploymentTime": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 31 Amphibious Assault.jpg",
    "isTransport": true,
    "requiredBaseId": "custom-1761997491910",
    "maxPurchases": 2
  },
  {
    "submarineType": "asset",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 32 Naval Swarm (x2).jpg",
    "isAttachable": true,
    "cost": 2,
    "sub": true,
    "cardType": "attack",
    "id": "china-032",
    "attachableCategory": "naval",
    "faction": "china",
    "deploymentTime": 2,
    "name": "Naval Swarm",
    "maxPurchases": 2,
    "secondaryAmmoBonus": 2
  },
  {
    "id": "china-033",
    "name": "Offensive Cyber",
    "cardType": "communications",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 33 Offensive Cyber.jpg",
    "cost": 4,
    "faction": "china"
  },
  {
    "name": "Defensive Cyber",
    "id": "china-034",
    "cost": 4,
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 34 Defensive Cyber.jpg",
    "maxPurchases": 2,
    "faction": "china"
  },
  {
    "cost": 2,
    "maxPurchases": 0,
    "faction": "china",
    "name": "Scatterable Landmines",
    "isAttachable": true,
    "cardType": "attack",
    "attachableCategory": "artillery",
    "id": "china-035",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 35 Scatterable Landmines.jpg"
  },
  {
    "name": "Cut the Link",
    "cardType": "communications",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 36 Cut the Link.jpg",
    "id": "china-036",
    "cost": 3,
    "maxPurchases": 2
  },
  {
    "id": "china-037",
    "cardType": "communications",
    "faction": "china",
    "name": "Coordinated Deception",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 37 Coordinated Deception.jpg",
    "maxPurchases": 2,
    "cost": 2
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 38 AI-Enabled Signal Intel.jpg",
    "faction": "china",
    "maxPurchases": 0,
    "id": "china-038",
    "name": "AI-Enabled Signal Intel",
    "cardType": "intelligence",
    "cost": 3,
    "deploymentTime": 2
  },
  {
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 39 Naval Deception (x2).jpg",
    "deploymentTime": 1,
    "faction": "china",
    "cost": 1,
    "id": "china-039",
    "name": "Naval Deception",
    "cardType": "communications"
  },
  {
    "name": "Quadcopter Drone",
    "isAttachable": true,
    "attachableCategory": "ground",
    "maxPurchases": 0,
    "cost": 1,
    "cardType": "intelligence",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 40 Quadcopter Drone.jpg",
    "id": "china-040",
    "faction": "china"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 41 Miilitary Deception (x2).jpg",
    "cost": 2,
    "faction": "china",
    "cardType": "communications",
    "deploymentTime": 2,
    "name": "Miilitary Deception",
    "id": "china-041",
    "maxPurchases": 2
  },
  {
    "deploymentTime": 1,
    "isAttachable": true,
    "maxPurchases": 4,
    "id": "china-042",
    "cost": 3,
    "cardType": "maneuver",
    "attachableCategory": "ground",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 42 Combat Engineers.jpg",
    "name": "Combat Engineers",
    "faction": "china"
  },
  {
    "cost": 3,
    "id": "china-043",
    "name": "Maritime Mines",
    "faction": "china",
    "submarineType": "asset",
    "cardType": "attack",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 43 Maritime Mines.jpg",
    "sub": true,
    "maxPurchases": 4
  },
  {
    "isInfluenceCard": true,
    "maxPurchases": 4,
    "cost": 3,
    "name": "Disinformation Operations",
    "id": "china-044",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 44 Disinformation Operations.jpg",
    "cardType": "communications",
    "influenceThresholds": [
      {
        "influenceEffect": 3,
        "minRoll": 1,
        "description": "Decisive Success",
        "maxRoll": 5
      },
      {
        "minRoll": 6,
        "maxRoll": 11,
        "description": "Minor Success",
        "influenceEffect": 2
      },
      {
        "influenceEffect": 0,
        "minRoll": 12,
        "description": "No Effect",
        "maxRoll": 12
      },
      {
        "description": "Failure",
        "influenceEffect": -1,
        "minRoll": 13,
        "maxRoll": 16
      },
      {
        "maxRoll": 20,
        "minRoll": 17,
        "description": "Major Failure",
        "influenceEffect": -4
      }
    ],
    "faction": "china"
  },
  {
    "cost": 2,
    "faction": "china",
    "name": "Tactical Cyber Attack",
    "maxPurchases": 4,
    "id": "china-045",
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 45 Tactical Cyber Attack (x2).jpg"
  },
  {
    "id": "china-046",
    "cost": 4,
    "infinite": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 46 CH-7 Unmanned.jpg",
    "faction": "china",
    "name": "CH-7 Unmanned",
    "cardType": "attack",
    "deploymentTime": 2,
    "maxPurchases": 2
  },
  {
    "cardType": "interception",
    "maxPurchases": 2,
    "deploymentTime": 2,
    "id": "china-047",
    "faction": "china",
    "name": "Airborne Early Warning and Control",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 47 Airborne Early Warning and Control.jpg",
    "cost": 4,
    "infinite": true
  },
  {
    "faction": "china",
    "attachableCategory": "naval",
    "maxPurchases": 2,
    "id": "china-048",
    "cardType": "attack",
    "deploymentTime": 2,
    "isAttachable": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 48 UUV Attack Unmanned.jpg",
    "name": "UUV Attack Unmanned",
    "cost": 4
  },
  {
    "deploymentTime": 1,
    "cardType": "maneuver",
    "name": "Mine Clearing Unmanned",
    "cost": 3,
    "isAttachable": true,
    "maxPurchases": 2,
    "id": "china-049",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 49 Mine Clearing Unmanned.jpg",
    "attachableCategory": "naval",
    "sub": true,
    "faction": "china",
    "submarineType": "asset"
  },
  {
    "cardType": "intelligence",
    "id": "china-050",
    "name": "AI-Enabled Planning",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 50 AI-Enabled Planning.jpg",
    "maxPurchases": 3,
    "cost": 3
  },
  {
    "id": "china-051",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 51 Unmanned Ground Vehicles (UGVS)(x3).jpg",
    "hpBonus": 2,
    "isAttachable": true,
    "cost": 1,
    "name": "Unmanned Ground Vehicles (UGVS)",
    "cardType": "maneuver",
    "attachableCategory": "ground",
    "maxPurchases": 4,
    "faction": "china",
    "deploymentTime": 2
  },
  {
    "isAttachable": true,
    "maxPurchases": 2,
    "faction": "china",
    "submarineType": "asset",
    "deploymentTime": 2,
    "cardType": "intelligence",
    "id": "china-052",
    "sub": true,
    "name": "Unmanned Underwater ISR",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 52 Unmanned Underwater ISR.jpg",
    "cost": 1,
    "attachableCategory": "naval"
  },
  {
    "cardType": "attack",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 53 YJ-12B Anti-Ship Missile.jpg",
    "name": "YJ-12B Anti-Ship Missile",
    "faction": "china",
    "attachableCategory": "artillery",
    "isAttachable": true,
    "id": "china-053",
    "secondaryAmmoBonus": 4,
    "cost": 2,
    "deploymentTime": 2,
    "hpBonus": 2
  },
  {
    "deploymentTime": 2,
    "cost": 5,
    "requiredBaseMaxDamage": 3,
    "faction": "china",
    "cardType": "attack",
    "maxPurchases": 2,
    "requiresBaseCondition": true,
    "requiredBaseId": "custom-1761999685239",
    "name": "Hypersonic Glide Vehicle",
    "id": "china-054",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 54 Hypersonic Glide Vehicle.jpg"
  },
  {
    "hpBonus": 2,
    "id": "china-055",
    "cardType": "interception",
    "faction": "china",
    "secondaryAmmoBonus": 6,
    "maxPurchases": 2,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 55 HQ-16B IAMD.jpg",
    "attachableCategory": "interception",
    "cost": 2,
    "name": "HQ-16B IAMD",
    "isAttachable": true
  },
  {
    "cardType": "maneuver",
    "maxPurchases": 2,
    "requiredBaseMaxDamage": 3,
    "id": "china-056",
    "attachableCategory": "ground",
    "cost": 3,
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 56 Patrol Boats (x2).jpg",
    "submarineType": "asw",
    "secondaryAmmoBonus": 4,
    "faction": "china",
    "deploymentTime": 2,
    "isAttachable": true,
    "sub": true,
    "name": "Patrol Boats",
    "requiredBaseId": "custom-1761997117112"
  },
  {
    "deploymentTime": 2,
    "cost": 3,
    "faction": "china",
    "id": "china-057",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 57 Z-10 Attack.jpg",
    "maxPurchases": 4,
    "name": "Z-10 Attack",
    "cardType": "attack",
    "infinite": true
  },
  {
    "maxPurchases": 2,
    "name": "Breaking Link-16",
    "id": "china-058",
    "cost": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 58 Breaking Link-16.jpg",
    "faction": "china",
    "cardType": "communications"
  },
  {
    "name": "Counter-Narratives",
    "cardType": "communications",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 59 Counter-Narratives.jpg",
    "influenceThresholds": [
      {
        "minRoll": 1,
        "influenceEffect": 3,
        "description": "Decisive Success",
        "maxRoll": 3
      },
      {
        "description": "Minor Success",
        "minRoll": 4,
        "maxRoll": 10,
        "influenceEffect": 2
      },
      {
        "maxRoll": 12,
        "minRoll": 11,
        "influenceEffect": 0,
        "description": "No Effect"
      },
      {
        "description": "Failure",
        "maxRoll": 16,
        "minRoll": 13,
        "influenceEffect": -1
      },
      {
        "influenceEffect": -4,
        "description": "Major Failure",
        "minRoll": 17,
        "maxRoll": 20
      }
    ],
    "id": "china-059",
    "isInfluenceCard": true,
    "faction": "china",
    "cost": 3
  },
  {
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 60 Censorship.jpg",
    "cardType": "communications",
    "maxPurchases": 4,
    "name": "Censorship",
    "faction": "china",
    "id": "china-060"
  },
  {
    "cost": 4,
    "cardType": "communications",
    "id": "china-061",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 61 Big Brother Is Watching.jpg",
    "name": "Big Brother Is Watching",
    "faction": "china"
  },
  {
    "cardType": "maneuver",
    "deploymentTime": 2,
    "cost": 4,
    "name": "Submarine Insertion",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 62 Submarine Insertion.jpg",
    "maxPurchases": 4,
    "faction": "china",
    "id": "china-062"
  },
  {
    "id": "china-063",
    "requiredBaseMaxDamage": 2,
    "faction": "china",
    "requiredBaseId": "luzon-strait-patrols",
    "maxPurchases": 2,
    "deploymentTime": 2,
    "requiresBaseCondition": true,
    "name": "HALO Insertion",
    "cardType": "maneuver",
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 63 HALO Insertion.jpg"
  },
  {
    "name": "Deep Fakes",
    "cardType": "communications",
    "cost": 4,
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "maxRoll": 6,
        "minRoll": 1,
        "influenceEffect": 4
      },
      {
        "maxRoll": 13,
        "minRoll": 7,
        "description": "Minor Success",
        "influenceEffect": 2
      },
      {
        "influenceEffect": 0,
        "maxRoll": 15,
        "description": "No Effect",
        "minRoll": 14
      },
      {
        "minRoll": 16,
        "maxRoll": 17,
        "influenceEffect": -1,
        "description": "Failure"
      },
      {
        "minRoll": 18,
        "description": "Major Failure",
        "influenceEffect": -4,
        "maxRoll": 20
      }
    ],
    "maxPurchases": 2,
    "faction": "china",
    "id": "china-064",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 64 Deep Fakes.jpg",
    "isInfluenceCard": true
  },
  {
    "isInfluenceCard": true,
    "cost": 4,
    "cardType": "communications",
    "influenceThresholds": [
      {
        "minRoll": 1,
        "influenceEffect": 3,
        "maxRoll": 6,
        "description": "Decisive Success"
      },
      {
        "description": "Minor Success",
        "influenceEffect": 2,
        "maxRoll": 12,
        "minRoll": 7
      },
      {
        "influenceEffect": 0,
        "description": "No Effect",
        "minRoll": 13,
        "maxRoll": 15
      },
      {
        "influenceEffect": -1,
        "description": "Failure",
        "minRoll": 16,
        "maxRoll": 18
      },
      {
        "influenceEffect": -4,
        "maxRoll": 20,
        "minRoll": 19,
        "description": "Major Failure"
      }
    ],
    "maxPurchases": 2,
    "id": "china-065",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 65 False Death Notifications.jpg",
    "name": "False Death Notifications",
    "faction": "china"
  },
  {
    "cost": 2,
    "faction": "china",
    "maxPurchases": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 66 CH-901 Swarm.jpg",
    "name": "CH-901 Swarm",
    "attachableCategory": "ground",
    "id": "china-066",
    "deploymentTime": 1,
    "cardType": "attack",
    "isAttachable": true,
    "secondaryAmmoBonus": 8
  },
  {
    "isAttachable": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 67 UUV Defense.jpg",
    "attachableCategory": "naval",
    "cardType": "maneuver",
    "name": "UUV Defense",
    "id": "china-067",
    "maxPurchases": 2,
    "cost": 3,
    "faction": "china"
  },
  {
    "id": "china-068",
    "cardType": "attack",
    "name": "CH-901 Swarm",
    "faction": "china",
    "isAttachable": true,
    "deploymentTime": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 68 CH-901 Swarm.jpg",
    "secondaryAmmoBonus": 8,
    "cost": 2,
    "attachableCategory": "ground",
    "maxPurchases": 2
  },
  {
    "maxPurchases": 6,
    "faction": "china",
    "id": "china-069",
    "requiresBaseCondition": true,
    "submarineType": "submarine",
    "name": "SUI-Class Sub",
    "cost": 5,
    "sub": true,
    "deploymentTime": 2,
    "cardType": "maneuver",
    "requiredBaseMaxDamage": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 69 SUI-Class Sub (x2).jpg",
    "requiredBaseId": "custom-1761995950315"
  },
  {
    "cost": 5,
    "requiredBaseId": "custom-1761995950315",
    "maxPurchases": 4,
    "name": "Shang II-Class Sub",
    "requiresBaseCondition": true,
    "deploymentTime": 2,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 70 Shang II-Class Sub.jpg",
    "requiredBaseMaxDamage": 2,
    "id": "china-070",
    "faction": "china",
    "sub": true,
    "submarineType": "submarine"
  },
  {
    "submarineType": "asw",
    "cardType": "intelligence",
    "requiredBaseId": "custom-1761997279599",
    "requiredBaseMaxDamage": 5,
    "deploymentTime": 2,
    "cost": 3,
    "sub": true,
    "faction": "china",
    "requiresBaseCondition": true,
    "maxPurchases": 4,
    "infinite": true,
    "id": "china-071",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 71 Y-8Q Surveillance.jpg",
    "name": "Y-8Q Surveillance"
  },
  {
    "deploymentTime": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 72 Proxy Forces.jpg",
    "cost": 5,
    "faction": "china",
    "name": "Proxy Forces",
    "infinite": true,
    "cardType": "maneuver",
    "maxPurchases": 4,
    "id": "china-072"
  },
  {
    "deploymentTime": 3,
    "requiredBaseId": "custom-1761997279599",
    "name": "Expeditionary Logistics",
    "cost": 5,
    "requiredBaseMaxDamage": 5,
    "id": "china-073",
    "faction": "china",
    "maxPurchases": 2,
    "requiresBaseCondition": true,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 73 Expeditionary Logistics.jpg"
  },
  {
    "requiredBaseMaxDamage": 4,
    "requiredBaseId": "custom-1761997491910",
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON"
    ],
    "name": "Littoral Movement",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 74 Littoral Movement.jpg",
    "cardType": "maneuver",
    "isTransport": true,
    "requiresBaseCondition": true,
    "deploymentTime": 3,
    "maxPurchases": 2,
    "transportCapacity": 4,
    "faction": "china",
    "id": "china-074",
    "cost": 4
  },
  {
    "maxPurchases": 4,
    "name": "Ballistic Missile Defense",
    "isAttachable": true,
    "id": "china-075",
    "faction": "china",
    "attachableCategory": "naval",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 75 Ballistic Missile Defense (x3).jpg",
    "cost": 0,
    "cardType": "interception",
    "secondaryAmmoBonus": 6
  },
  {
    "maxPurchases": 2,
    "name": "PLA Strategic Support Force",
    "faction": "china",
    "cardType": "communications",
    "id": "china-076",
    "infinite": true,
    "cost": 5,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 76 PLA Strategic Support Force.jpg"
  },
  {
    "name": "Logistics Resiliency",
    "faction": "china",
    "maxPurchases": 2,
    "cardType": "maneuver",
    "infinite": true,
    "cost": 5,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 77 Logistics Resiliency.jpg",
    "id": "china-077"
  },
  {
    "id": "china-078",
    "maxPurchases": 2,
    "faction": "china",
    "isAttachable": true,
    "attachableCategory": "artillery",
    "name": "YJ-18 Anti-Ship Missile",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 78 YJ-18 Anti-Ship Missile.jpg",
    "cost": 1,
    "cardType": "attack",
    "deploymentTime": 2,
    "hpBonus": 2,
    "secondaryAmmoBonus": 4
  },
  {
    "requiresBaseCondition": true,
    "cardType": "communications",
    "infinite": true,
    "cost": 3,
    "deploymentTime": 2,
    "faction": "china",
    "requiredBaseId": "custom-1761996786665",
    "name": "Shenyang J-15D",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 79 Shenyang J-15D.jpg",
    "requiredBaseMaxDamage": 3,
    "maxPurchases": 2,
    "id": "china-079"
  },
  {
    "name": "Signal Management",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 80 Signal Management.jpg",
    "cardType": "communications",
    "infinite": true,
    "faction": "china",
    "cost": 3,
    "id": "china-080",
    "maxPurchases": 2
  },
  {
    "cardType": "communications",
    "id": "china-081",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 81 Coordinated Degradation.jpg",
    "faction": "china",
    "deploymentTime": 2,
    "name": "Coordinated Degradation",
    "cost": 4,
    "maxPurchases": 4
  },
  {
    "faction": "china",
    "infinite": true,
    "name": "Self-Healing Network",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 82 Self-Healing Network.jpg",
    "cardType": "communications",
    "id": "china-082",
    "cost": 4
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 83 High Altitude Balloons.jpg",
    "id": "china-083",
    "cost": 3,
    "infinite": true,
    "faction": "china",
    "maxPurchases": 6,
    "deploymentTime": 1,
    "cardType": "intelligence",
    "name": "High Altitude Balloons"
  },
  {
    "deploymentTime": 2,
    "faction": "china",
    "attachableCategory": "naval",
    "submarineType": "asw",
    "isAttachable": true,
    "maxPurchases": 2,
    "cardType": "intelligence",
    "sub": true,
    "name": "Helo ASW",
    "cost": 1,
    "id": "china-084",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 84 Helo ASW.jpg"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 85 Logistics Unmanned.jpg",
    "maxPurchases": 2,
    "cardType": "maneuver",
    "isAttachable": true,
    "attachableCategory": "supply",
    "name": "Logistics Unmanned",
    "cost": 2,
    "id": "china-085",
    "deploymentTime": 2,
    "faction": "china"
  },
  {
    "name": "Heavy Lift",
    "cardType": "maneuver",
    "infinite": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 86 Heavy Lift (x2).jpg",
    "deploymentTime": 2,
    "faction": "china",
    "maxPurchases": 3,
    "cost": 3,
    "id": "china-086"
  },
  {
    "faction": "china",
    "name": "Active Denial System (ADS)",
    "maxPurchases": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 87 Active Denial System (ADS).jpg",
    "isAttachable": true,
    "id": "china-087",
    "attachableCategory": "ground",
    "cardType": "maneuver",
    "cost": 2,
    "deploymentTime": 2
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 88 Cyber Exploit.jpg",
    "maxPurchases": 2,
    "cost": 5,
    "name": "Cyber Exploit",
    "cardType": "communications",
    "faction": "china",
    "id": "china-088"
  },
  {
    "name": "Military Intelligence",
    "cardType": "intelligence",
    "cost": 1,
    "maxPurchases": 0,
    "faction": "china",
    "id": "china-089",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 89 Military Intelligence.jpg"
  },
  {
    "cost": 3,
    "faction": "china",
    "sub": true,
    "infinite": true,
    "submarineType": "asset",
    "id": "china-090",
    "deploymentTime": 2,
    "name": "Seaplanes",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 90 Seaplanes.jpg",
    "cardType": "maneuver",
    "maxPurchases": 2
  },
  {
    "maxPurchases": 2,
    "name": "AI-Enabled Targeting",
    "id": "china-091",
    "cardType": "intelligence",
    "faction": "china",
    "cost": 3,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 91 AI-Enabled Targeting.jpg",
    "infinite": true
  },
  {
    "requiresBaseCondition": true,
    "maxPurchases": 3,
    "cost": 4,
    "name": "Y-8F600 Transport",
    "requiredBaseId": "custom-1761996997961",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 92 Y-8F600 Transport.jpg",
    "requiredBaseMaxDamage": 2,
    "transportSlots": [
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON",
      "MECHANIZED WEAPONS PLATOON"
    ],
    "faction": "china",
    "cardType": "maneuver",
    "isTransport": true,
    "transportCapacity": 4,
    "deploymentTime": 2,
    "id": "china-092"
  },
  {
    "deploymentTime": 3,
    "requiresBaseCondition": true,
    "name": "Xian H-20 Bomber",
    "cardType": "attack",
    "id": "china-093",
    "faction": "china",
    "requiredBaseMaxDamage": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 93 Xian H-20 Bomber.jpg",
    "maxPurchases": 2,
    "cost": 5,
    "requiredBaseId": "luzon-strait-patrols"
  },
  {
    "requiredBaseId": "custom-1761997491910",
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON",
      "LIGHT TANK PLATOON"
    ],
    "name": "Type 072A Landing",
    "faction": "china",
    "transportCapacity": 5,
    "maxPurchases": 2,
    "deploymentTime": 2,
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "id": "china-094",
    "requiredBaseMaxDamage": 5,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 94 Type 072A Landing.jpg",
    "isTransport": true,
    "cost": 4
  }
];

// Initial budget for each faction (Command Points)
export const initialCommandPoints = {
  us: 50,
  china: 50,
};
