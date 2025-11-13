// Generated card data - DO NOT EDIT MANUALLY
// Este archivo contiene toda la información de las cartas del juego
// Total: 197 cartas (USMC: 103, PLAN: 94)
// Última actualización: 2025-11-13T12:07:08.164Z
import { Card } from '../types';

export const initialCards: Card[] = [
  {
    "name": "Tactical Network",
    "cardType": "intelligence",
    "id": "us-001",
    "faction": "us",
    "maxPurchases": 0,
    "imagePath": "/images/Cartas USMC/LCC USMC 01 Tactical Network.jpg",
    "cost": 0
  },
  {
    "maxPurchases": 4,
    "cardType": "interception",
    "cost": 4,
    "deploymentTime": 2,
    "id": "us-002",
    "faction": "us",
    "name": "Combat Air Patrols",
    "imagePath": "/images/Cartas USMC/LCC USMC 02 Combat Air Patrols.jpg"
  },
  {
    "faction": "us",
    "cost": 3,
    "maxPurchases": 2,
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 03 Deep Strike.jpg",
    "deploymentTime": 2,
    "requiredBaseId": "kadena-ab",
    "name": "Deep Strike",
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 4,
    "id": "us-003"
  },
  {
    "name": "Unmanned Helo",
    "imagePath": "/images/Cartas USMC/LCC USMC 04 Unmanned Helo.jpg",
    "id": "us-004",
    "faction": "us",
    "cost": 2,
    "maxPurchases": 2,
    "deploymentTime": 2,
    "cardType": "attack"
  },
  {
    "cardType": "interception",
    "cost": 5,
    "hpBonus": 1,
    "attachableCategory": "interception",
    "id": "us-005",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 05 THAAD.jpg",
    "isAttachable": true,
    "maxPurchases": 2,
    "name": "THAAD",
    "secondaryAmmoBonus": 4,
    "deploymentTime": 3
  },
  {
    "cost": 2,
    "faction": "us",
    "id": "us-006",
    "name": "Maritime Strike Tomahawk",
    "attachableCategory": "ground",
    "maxPurchases": 2,
    "hpBonus": 2,
    "isAttachable": true,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 06 Maritime Strike Tomahawk.jpg",
    "cardType": "attack",
    "secondaryAmmoBonus": 4
  },
  {
    "maxPurchases": 1,
    "imagePath": "/images/Cartas USMC/LCC USMC 07 Space Satellites.jpg",
    "name": "Space Satellites",
    "cost": 5,
    "faction": "us",
    "cardType": "intelligence",
    "infinite": true,
    "deploymentTime": 1,
    "id": "us-007"
  },
  {
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 08 B-1B Lancer.jpg",
    "maxPurchases": 2,
    "faction": "us",
    "name": "B-1B Lancer",
    "requiredBaseMaxDamage": 3,
    "cardType": "attack",
    "id": "us-008",
    "deploymentTime": 3,
    "requiredBaseId": "kadena-ab",
    "requiresBaseCondition": true
  },
  {
    "cardType": "communications",
    "name": "Electro-Magnetic Spectrum Jamming",
    "id": "us-009",
    "deploymentTime": 1,
    "maxPurchases": 3,
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 09 Electro-Magnetic Spectrum Jamming.jpg",
    "faction": "us"
  },
  {
    "id": "us-010",
    "deploymentTime": 1,
    "name": "Electro-Magnetic Spectrum Defense",
    "faction": "us",
    "maxPurchases": 3,
    "cost": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 10 Electro-Magnetic Spectrum Defense.jpg",
    "cardType": "communications"
  },
  {
    "name": "Attack on C2",
    "id": "us-011",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 11 Attack on C2.jpg",
    "cost": 3,
    "cardType": "communications",
    "maxPurchases": 2
  },
  {
    "cost": 3,
    "name": "Tactical Cyber Defenses",
    "imagePath": "/images/Cartas USMC/LCC USMC 12 Tactical Cyber Defenses.jpg",
    "maxPurchases": 4,
    "faction": "us",
    "cardType": "communications",
    "id": "us-012"
  },
  {
    "cardType": "communications",
    "name": "Defensive Cyber",
    "imagePath": "/images/Cartas USMC/LCC USMC 13 Defensive Cyber.jpg",
    "cost": 5,
    "maxPurchases": 4,
    "id": "us-013",
    "faction": "us"
  },
  {
    "id": "us-014",
    "name": "Offensive Cyber",
    "imagePath": "/images/Cartas USMC/LCC USMC 14 Offensive Cyber.jpg",
    "maxPurchases": 4,
    "faction": "us",
    "cost": 5,
    "cardType": "communications"
  },
  {
    "deploymentTime": 2,
    "name": "Military Deception",
    "faction": "us",
    "cardType": "communications",
    "cost": 2,
    "maxPurchases": 2,
    "id": "us-015",
    "imagePath": "/images/Cartas USMC/LCC USMC 15 Military Deception (x2).jpg"
  },
  {
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 16 Logistics Unmanned.jpg",
    "maxPurchases": 4,
    "faction": "us",
    "deploymentTime": 2,
    "attachableCategory": "supply",
    "name": "Logistics Unmanned",
    "id": "us-016",
    "cardType": "maneuver",
    "cost": 2
  },
  {
    "requiredBaseId": "kadena-ab",
    "maxPurchases": 2,
    "requiredBaseMaxDamage": 2,
    "cost": 4,
    "deploymentTime": 4,
    "cardType": "attack",
    "faction": "us",
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 17 B-2 Bomber.jpg",
    "id": "us-017",
    "name": "B-2 Bomber"
  },
  {
    "cost": 4,
    "deploymentTime": 4,
    "cardType": "attack",
    "faction": "us",
    "requiredBaseId": "kadena-ab",
    "requiredBaseMaxDamage": 3,
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 18 B-52 Stratofortress.jpg",
    "maxPurchases": 2,
    "name": "B-52 Stratofortress",
    "id": "us-018"
  },
  {
    "name": "Network Resiliency",
    "maxPurchases": 2,
    "id": "us-019",
    "imagePath": "/images/Cartas USMC/LCC USMC 19 Network Resiliency.jpg",
    "cost": 4,
    "cardType": "intelligence",
    "faction": "us"
  },
  {
    "cardType": "attack",
    "id": "us-020",
    "imagePath": "/images/Cartas USMC/LCC USMC 20 Maritime Mines (x2).jpg",
    "name": "Maritime Mines",
    "submarineType": "asset",
    "deploymentTime": 3,
    "cost": 3,
    "sub": true,
    "maxPurchases": 4,
    "faction": "us"
  },
  {
    "id": "us-021",
    "cost": 5,
    "name": "Submarine Strike",
    "maxPurchases": 4,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 21 Submarine Strike.jpg",
    "cardType": "attack"
  },
  {
    "maxPurchases": 2,
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON"
    ],
    "requiredBaseId": "futenma-as",
    "faction": "us",
    "id": "us-022",
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 2,
    "transportCapacity": 2,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas USMC/LCC USMC 22 Vertical Insertion.jpg",
    "isTransport": true,
    "deploymentTime": 2,
    "name": "Vertical Insertion",
    "cost": 2
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 23 Mine Clearing Unmanned.jpg",
    "deploymentTime": 2,
    "maxPurchases": 4,
    "cost": 3,
    "faction": "us",
    "submarineType": "asset",
    "attachableCategory": "naval",
    "name": "Mine Clearing Unmanned",
    "sub": true,
    "isAttachable": true,
    "cardType": "maneuver",
    "id": "us-023"
  },
  {
    "cardType": "maneuver",
    "deploymentTime": 2,
    "faction": "us",
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 24 Host Nation Logistics.jpg",
    "id": "us-024",
    "maxPurchases": 3,
    "name": "Host Nation Logistics"
  },
  {
    "faction": "us",
    "name": "Behind Enemy Lines",
    "cardType": "intelligence",
    "imagePath": "/images/Cartas USMC/LCC USMC 25 Behind Enemy Lines.jpg",
    "cost": 2,
    "id": "us-025",
    "maxPurchases": 0
  },
  {
    "id": "us-026",
    "imagePath": "/images/Cartas USMC/LCC USMC 26 Ground Sensors.jpg",
    "cardType": "intelligence",
    "infinite": true,
    "name": "Ground Sensors",
    "cost": 2,
    "faction": "us",
    "maxPurchases": 4
  },
  {
    "cardType": "attack",
    "infinite": true,
    "cost": 3,
    "maxPurchases": 4,
    "id": "us-027",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 27 Stealth Helo.jpg",
    "name": "Stealth Helo",
    "deploymentTime": 2
  },
  {
    "id": "us-028",
    "cost": 3,
    "maxPurchases": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 28 GPS Spoofing.jpg",
    "name": "GPS Spoofing",
    "cardType": "communications",
    "faction": "us"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 29 Precision Strike missile (x2).jpg",
    "cardType": "attack",
    "maxPurchases": 4,
    "id": "us-029",
    "attachableCategory": "artillery",
    "deploymentTime": 2,
    "isAttachable": true,
    "cost": 1,
    "name": "Precision Strike missile",
    "faction": "us"
  },
  {
    "faction": "us",
    "id": "us-030",
    "maxPurchases": 4,
    "attachableCategory": "interception",
    "name": "G ATOR Radar",
    "cost": 1,
    "cardType": "interception",
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 30 G ATOR Radar.jpg",
    "deploymentTime": 2
  },
  {
    "maxPurchases": 0,
    "id": "us-031",
    "imagePath": "/images/Cartas USMC/LCC USMC 31 Open Source Intel.jpg",
    "name": "Open Source Intel",
    "cost": 1,
    "faction": "us",
    "cardType": "communications"
  },
  {
    "secondaryAmmoBonus": 2,
    "id": "us-032",
    "sub": true,
    "name": "Naval Swarm",
    "attachableCategory": "naval",
    "imagePath": "/images/Cartas USMC/LCC USMC 32 Naval Swarm.jpg",
    "faction": "us",
    "deploymentTime": 2,
    "submarineType": "asset",
    "maxPurchases": 2,
    "cardType": "attack",
    "isAttachable": true,
    "cost": 2
  },
  {
    "cardType": "interception",
    "cost": 0,
    "imagePath": "/images/Cartas USMC/LCC USMC 33 Aegis Ballistic Defense (x2).jpg",
    "id": "us-033",
    "secondaryAmmoBonus": 4,
    "maxPurchases": 4,
    "isAttachable": true,
    "faction": "us",
    "attachableCategory": "naval",
    "name": "Aegis Ballistic Defense"
  },
  {
    "maxPurchases": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 34 Blindspot.jpg",
    "id": "us-034",
    "faction": "us",
    "cardType": "communications",
    "cost": 4,
    "name": "Blindspot"
  },
  {
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 35 Quadcopter Drone.jpg",
    "maxPurchases": 0,
    "cost": 1,
    "isAttachable": true,
    "cardType": "intelligence",
    "name": "Quadcopter Drone",
    "attachableCategory": "ground",
    "id": "us-035"
  },
  {
    "sub": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 36 Unmanned Underwater ISR.jpg",
    "maxPurchases": 4,
    "cost": 1,
    "submarineType": "asset",
    "deploymentTime": 2,
    "cardType": "intelligence",
    "isAttachable": true,
    "name": "Unmanned Underwater ISR",
    "id": "us-036",
    "attachableCategory": "naval",
    "faction": "us"
  },
  {
    "cost": 2,
    "attachableCategory": "artillery",
    "cardType": "attack",
    "id": "us-037",
    "maxPurchases": 0,
    "isAttachable": true,
    "name": "Scatterable Landmines",
    "imagePath": "/images/Cartas USMC/LCC USMC 37 Scatterable Landmines.jpg",
    "faction": "us"
  },
  {
    "maxPurchases": 4,
    "id": "us-038",
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 38 Cut The Link.jpg",
    "faction": "us",
    "name": "Cut The Link",
    "cost": 4
  },
  {
    "attachableCategory": "ground",
    "id": "us-039",
    "hpBonus": 2,
    "name": "Unmanned Ground Vehicles (UGVS)",
    "maxPurchases": 4,
    "faction": "us",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 39 Unmanned Ground Vehicles (UGVS).jpg",
    "cost": 1,
    "isAttachable": true,
    "cardType": "maneuver"
  },
  {
    "maxPurchases": 0,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 40 Coordinated Deception.jpg",
    "name": "Coordinated Deception",
    "cardType": "communications",
    "cost": 1,
    "id": "us-040"
  },
  {
    "cost": 1,
    "deploymentTime": 1,
    "id": "us-041",
    "attachableCategory": "ground",
    "maxPurchases": 4,
    "faction": "us",
    "name": "Anti-Tank Missile",
    "cardType": "maneuver",
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 41 Anti-Tank Missile.jpg"
  },
  {
    "deploymentTime": 3,
    "maxPurchases": 2,
    "cardType": "maneuver",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION"
    ],
    "imagePath": "/images/Cartas USMC/LCC USMC 42 Light Amphibious Warship (LAW).jpg",
    "requiredBaseId": "sembawang-singapore",
    "faction": "us",
    "requiresBaseCondition": true,
    "cost": 4,
    "name": "Light Amphibious Warship (LAW)",
    "requiredBaseMaxDamage": 4,
    "id": "us-042",
    "transportCapacity": 3,
    "isTransport": true
  },
  {
    "name": "Raider Sabotage",
    "cardType": "maneuver",
    "maxPurchases": 0,
    "cost": 2,
    "faction": "us",
    "id": "us-043",
    "imagePath": "/images/Cartas USMC/LCC USMC 43 Raider Sabotage.jpg"
  },
  {
    "cardType": "attack",
    "maxPurchases": 2,
    "faction": "us",
    "id": "us-044",
    "cost": 3,
    "name": "Joint Fires",
    "imagePath": "/images/Cartas USMC/LCC USMC 44 Joint Fires.jpg"
  },
  {
    "cost": 3,
    "maxPurchases": 0,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 45 Signal Intelligence.jpg",
    "cardType": "communications",
    "name": "Signal Intelligence",
    "id": "us-045"
  },
  {
    "id": "us-046",
    "imagePath": "/images/Cartas USMC/LCC USMC 46 Naval Deception (x2).jpg",
    "cardType": "communications",
    "faction": "us",
    "cost": 1,
    "maxPurchases": 4,
    "name": "Naval Deception",
    "deploymentTime": 1
  },
  {
    "maxPurchases": 4,
    "cardType": "maneuver",
    "deploymentTime": 2,
    "id": "us-047",
    "faction": "us",
    "name": "Riverine Squadron",
    "imagePath": "/images/Cartas USMC/LCC USMC 47 Riverine Squadron.jpg",
    "cost": 2
  },
  {
    "maxPurchases": 2,
    "deploymentTime": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 48 F-22 Escorts.jpg",
    "infinite": true,
    "requiredBaseId": "kadena-ab",
    "name": "F-22 Escorts",
    "cardType": "interception",
    "requiresBaseCondition": true,
    "faction": "us",
    "id": "us-048",
    "cost": 3,
    "requiredBaseMaxDamage": 4
  },
  {
    "sub": true,
    "cardType": "intelligence",
    "requiredBaseMaxDamage": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 49 P-8A Surveillance (x2).jpg",
    "infinite": true,
    "cost": 3,
    "maxPurchases": 2,
    "id": "us-049",
    "requiresBaseCondition": true,
    "deploymentTime": 3,
    "name": "P-8A Surveillance",
    "submarineType": "asw",
    "faction": "us",
    "requiredBaseId": "futenma-as"
  },
  {
    "name": "V-BAT",
    "cost": 1,
    "maxPurchases": 4,
    "faction": "us",
    "deploymentTime": 1,
    "cardType": "intelligence",
    "isAttachable": true,
    "id": "us-050",
    "attachableCategory": "ground",
    "imagePath": "/images/Cartas USMC/LCC USMC 50 V-BAT.jpg"
  },
  {
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 51 Torpedo Attack.jpg",
    "maxPurchases": 4,
    "name": "Torpedo Attack",
    "cardType": "attack",
    "id": "us-051",
    "faction": "us"
  },
  {
    "maxPurchases": 4,
    "faction": "us",
    "deploymentTime": 2,
    "name": "Close Air Support",
    "imagePath": "/images/Cartas USMC/LCC USMC 52 Close Air Support.jpg",
    "cardType": "attack",
    "cost": 2,
    "id": "us-052"
  },
  {
    "name": "Combat Engineers",
    "maxPurchases": 4,
    "cardType": "maneuver",
    "cost": 2,
    "deploymentTime": 1,
    "isAttachable": true,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 53 Combat Engineers.jpg",
    "attachableCategory": "ground",
    "id": "us-053"
  },
  {
    "cost": 3,
    "faction": "us",
    "id": "us-054",
    "maxPurchases": 4,
    "name": "Tactival Cyber Attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 54 Tactival Cyber Attack (x2).jpg",
    "cardType": "communications"
  },
  {
    "faction": "us",
    "name": "Anglico",
    "imagePath": "/images/Cartas USMC/LCC USMC 55 Anglico.jpg",
    "cost": 4,
    "hpBonus": 1,
    "attachableCategory": "ground",
    "isAttachable": true,
    "maxPurchases": 2,
    "cardType": "attack",
    "id": "us-055"
  },
  {
    "influenceThresholds": [
      {
        "maxRoll": 3,
        "influenceEffect": 3,
        "minRoll": 1,
        "description": "Decisive Success"
      },
      {
        "influenceEffect": 2,
        "description": "Minor Success",
        "minRoll": 4,
        "maxRoll": 9
      },
      {
        "minRoll": 10,
        "influenceEffect": 0,
        "description": "No Effect",
        "maxRoll": 12
      },
      {
        "minRoll": 13,
        "maxRoll": 16,
        "influenceEffect": -1,
        "description": "Failure"
      },
      {
        "description": "Major Failure",
        "minRoll": 17,
        "influenceEffect": -4,
        "maxRoll": 20
      }
    ],
    "deploymentTime": 2,
    "name": "Influence Operations",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 56 Influence Operations.jpg",
    "isInfluenceCard": true,
    "id": "us-056",
    "cardType": "communications",
    "cost": 5,
    "faction": "us"
  },
  {
    "maxPurchases": 2,
    "name": "Humanitarian Operations",
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "maxRoll": 3,
        "influenceEffect": 3,
        "minRoll": 1
      },
      {
        "minRoll": 4,
        "maxRoll": 12,
        "influenceEffect": 2,
        "description": "Minor Success"
      },
      {
        "influenceEffect": 0,
        "maxRoll": 17,
        "description": "No Effect",
        "minRoll": 13
      },
      {
        "maxRoll": 20,
        "minRoll": 18,
        "influenceEffect": -1,
        "description": "Failure"
      }
    ],
    "cardType": "communications",
    "faction": "us",
    "cost": 4,
    "deploymentTime": 2,
    "id": "us-057",
    "isInfluenceCard": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 57 Humanitarian Operations.jpg"
  },
  {
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 58 Combat Camera.jpg",
    "id": "us-058",
    "name": "Combat Camera",
    "faction": "us",
    "cardType": "communications",
    "deploymentTime": 2,
    "isInfluenceCard": true,
    "cost": 3,
    "influenceThresholds": [
      {
        "influenceEffect": 4,
        "description": "Decisive Success",
        "minRoll": 1,
        "maxRoll": 4
      },
      {
        "maxRoll": 14,
        "description": "Minor Success",
        "influenceEffect": 2,
        "minRoll": 5
      },
      {
        "description": "No Effect",
        "influenceEffect": 0,
        "maxRoll": 17,
        "minRoll": 15
      },
      {
        "description": "Failure",
        "minRoll": 18,
        "influenceEffect": -1,
        "maxRoll": 19
      },
      {
        "minRoll": 20,
        "maxRoll": 20,
        "influenceEffect": -4,
        "description": "Major Failure"
      }
    ]
  },
  {
    "cost": 4,
    "requiredBaseId": "kadena-ab",
    "id": "us-059",
    "requiredBaseMaxDamage": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 59 U-2 Recon.jpg",
    "deploymentTime": 3,
    "faction": "us",
    "cardType": "intelligence",
    "requiresBaseCondition": true,
    "name": "U-2 Recon",
    "maxPurchases": 2
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 60 SEAL Insertion.jpg",
    "cardType": "maneuver",
    "faction": "us",
    "cost": 4,
    "deploymentTime": 2,
    "name": "SEAL Insertion",
    "id": "us-060",
    "maxPurchases": 4
  },
  {
    "requiredBaseMaxDamage": 3,
    "requiresBaseCondition": true,
    "deploymentTime": 2,
    "id": "us-061",
    "faction": "us",
    "cost": 3,
    "cardType": "maneuver",
    "requiredBaseId": "futenma-as",
    "name": "MARSOC HALO",
    "maxPurchases": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 61 MARSOC HALO.jpg"
  },
  {
    "cost": 4,
    "name": "False Death Notifications",
    "cardType": "communications",
    "id": "us-062",
    "imagePath": "/images/Cartas USMC/LCC USMC 62 False Death Notifications.jpg",
    "maxPurchases": 2,
    "influenceThresholds": [
      {
        "minRoll": 1,
        "description": "Decisive Success",
        "influenceEffect": 3,
        "maxRoll": 6
      },
      {
        "influenceEffect": 2,
        "maxRoll": 12,
        "description": "Minor Success",
        "minRoll": 7
      },
      {
        "minRoll": 13,
        "influenceEffect": 0,
        "description": "No Effect",
        "maxRoll": 15
      },
      {
        "maxRoll": 18,
        "influenceEffect": -1,
        "description": "Failure",
        "minRoll": 16
      },
      {
        "maxRoll": 20,
        "minRoll": 19,
        "description": "Major Failure",
        "influenceEffect": -4
      }
    ],
    "faction": "us",
    "isInfluenceCard": true
  },
  {
    "faction": "us",
    "id": "us-063",
    "maxPurchases": 2,
    "cardType": "communications",
    "name": "Attacking AI",
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 63 Attacking AI.jpg"
  },
  {
    "cardType": "attack",
    "id": "us-064",
    "imagePath": "/images/Cartas USMC/LCC USMC 64 Hypersonic Glide Vehicle.jpg",
    "maxPurchases": 2,
    "cost": 5,
    "faction": "us",
    "deploymentTime": 2,
    "name": "Hypersonic Glide Vehicle"
  },
  {
    "isAttachable": true,
    "id": "us-065",
    "maxPurchases": 2,
    "cost": 1,
    "faction": "us",
    "deploymentTime": 2,
    "cardType": "intelligence",
    "attachableCategory": "naval",
    "imagePath": "/images/Cartas USMC/LCC USMC 65 Helo ASW.jpg",
    "name": "Helo ASW",
    "submarineType": "asw",
    "sub": true
  },
  {
    "name": "Valkyrie Unmanned",
    "infinite": true,
    "maxPurchases": 2,
    "cardType": "attack",
    "cost": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 66 Valkyrie Unmanned.jpg",
    "id": "us-066",
    "faction": "us"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 67 MUX Unmanned (x2).jpg",
    "faction": "us",
    "infinite": true,
    "cardType": "intelligence",
    "cost": 2,
    "maxPurchases": 2,
    "name": "MUX Unmanned",
    "id": "us-067"
  },
  {
    "cost": 2,
    "name": "Unmanned Boats",
    "submarineType": "asset",
    "sub": true,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 68 Unmanned Boats.jpg",
    "cardType": "maneuver",
    "faction": "us",
    "attachableCategory": "ground",
    "id": "us-068",
    "isAttachable": true
  },
  {
    "submarineType": "submarine",
    "cardType": "maneuver",
    "cost": 5,
    "id": "us-069",
    "imagePath": "/images/Cartas USMC/LCC USMC 69 Virginia-Class Sub (x2).jpg",
    "faction": "us",
    "sub": true,
    "maxPurchases": 4,
    "name": "Virginia-Class Sub"
  },
  {
    "maxPurchases": 4,
    "cardType": "maneuver",
    "id": "us-070",
    "cost": 5,
    "faction": "us",
    "sub": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 70 Ohio-Class Sub.jpg",
    "name": "Ohio-Class Sub",
    "submarineType": "submarine"
  },
  {
    "maxPurchases": 2,
    "id": "us-071",
    "faction": "us",
    "cardType": "communications",
    "imagePath": "/images/Cartas USMC/LCC USMC 71 Unmanned Hacking.jpg",
    "cost": 3,
    "name": "Unmanned Hacking"
  },
  {
    "cost": 3,
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 72 Littoral Movement.jpg",
    "transportCapacity": 4,
    "id": "us-072",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "name": "Littoral Movement",
    "isTransport": true,
    "cardType": "maneuver",
    "maxPurchases": 2
  },
  {
    "requiredBaseId": "sembawang-singapore",
    "imagePath": "/images/Cartas USMC/LCC USMC 73 Expeditionary Logistics.jpg",
    "requiredBaseMaxDamage": 4,
    "cost": 4,
    "name": "Expeditionary Logistics",
    "requiresBaseCondition": true,
    "cardType": "maneuver",
    "faction": "us",
    "maxPurchases": 2,
    "id": "us-073"
  },
  {
    "id": "us-074",
    "cardType": "intelligence",
    "name": "Multi-Domain Task Force",
    "cost": 5,
    "infinite": true,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 74 Multi-Domain Task Force.jpg",
    "faction": "us"
  },
  {
    "id": "us-075",
    "faction": "us",
    "cost": 5,
    "name": "Logistics Resiliency",
    "cardType": "maneuver",
    "maxPurchases": 2,
    "infinite": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 75 Logistics Resiliency.jpg"
  },
  {
    "name": "MEF Information Group",
    "maxPurchases": 2,
    "id": "us-076",
    "imagePath": "/images/Cartas USMC/LCC USMC 76 MEF Information Group.jpg",
    "infinite": true,
    "cost": 4,
    "cardType": "communications",
    "faction": "us"
  },
  {
    "maxPurchases": 2,
    "cost": 3,
    "name": "EA-18G Growler",
    "id": "us-077",
    "cardType": "communications",
    "requiredBaseId": "futenma-as",
    "requiresBaseCondition": true,
    "infinite": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 77 EA-18G Growler.jpg",
    "requiredBaseMaxDamage": 3,
    "faction": "us"
  },
  {
    "faction": "us",
    "cost": 5,
    "maxPurchases": 2,
    "cardType": "communications",
    "id": "us-078",
    "name": "Coordinated Degradation",
    "imagePath": "/images/Cartas USMC/LCC USMC 78 Coordinated Degradation.jpg"
  },
  {
    "maxPurchases": 2,
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 79 Self-Healing Network.jpg",
    "faction": "us",
    "infinite": true,
    "name": "Self-Healing Network",
    "id": "us-079",
    "cardType": "communications"
  },
  {
    "cardType": "intelligence",
    "infinite": true,
    "cost": 3,
    "imagePath": "/images/Cartas USMC/LCC USMC 80 High Altitude Balloons.jpg",
    "faction": "us",
    "id": "us-080",
    "maxPurchases": 4,
    "name": "High Altitude Balloons"
  },
  {
    "name": "Signal Management",
    "imagePath": "/images/Cartas USMC/LCC USMC 81 Signal Management.jpg",
    "maxPurchases": 2,
    "id": "us-081",
    "infinite": true,
    "cardType": "communications",
    "faction": "us",
    "cost": 2
  },
  {
    "infinite": true,
    "cost": 3,
    "requiredBaseMaxDamage": 5,
    "imagePath": "/images/Cartas USMC/LCC USMC 82 Heavy Lift.jpg",
    "requiredBaseId": "sembawang-singapore",
    "name": "Heavy Lift",
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "id": "us-082",
    "maxPurchases": 2,
    "faction": "us"
  },
  {
    "id": "us-083",
    "name": "NGAD Unmanned",
    "cost": 4,
    "imagePath": "/images/Cartas USMC/LCC USMC 83 NGAD Unmanned.jpg",
    "faction": "us",
    "maxPurchases": 2,
    "cardType": "attack"
  },
  {
    "cardType": "intelligence",
    "cost": 1,
    "id": "us-084",
    "maxPurchases": 0,
    "imagePath": "/images/Cartas USMC/LCC USMC 84 Military Intelligence.jpg",
    "name": "Military Intelligence",
    "faction": "us"
  },
  {
    "id": "us-085",
    "faction": "us",
    "cost": 5,
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 85 Long-Range Hypersonic Weapon.jpg",
    "name": "Long-Range Hypersonic Weapon",
    "maxPurchases": 2
  },
  {
    "sub": true,
    "id": "us-086",
    "faction": "us",
    "name": "UUV Defense",
    "submarineType": "asset",
    "cardType": "maneuver",
    "cost": 3,
    "isAttachable": true,
    "attachableCategory": "naval",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 86 UUV Defense.jpg"
  },
  {
    "name": "Cyber Exploit",
    "faction": "us",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 87 Cyber Exploit.jpg",
    "cost": 5,
    "cardType": "communications",
    "id": "us-087"
  },
  {
    "secondaryAmmoBonus": 4,
    "isAttachable": true,
    "attachableCategory": "interception",
    "id": "us-088",
    "imagePath": "/images/Cartas USMC/LCC USMC 88 Patriot.jpg",
    "cardType": "interception",
    "cost": 4,
    "faction": "us",
    "hpBonus": 1,
    "maxPurchases": 4,
    "name": "Patriot"
  },
  {
    "isTransport": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 89 C-130 Hercules.jpg",
    "requiredBaseId": "kadena-ab",
    "cardType": "maneuver",
    "id": "us-089",
    "transportCapacity": 4,
    "requiresBaseCondition": true,
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "requiredBaseMaxDamage": 6,
    "name": "C-130 Hercules",
    "cost": 4,
    "maxPurchases": 4,
    "faction": "us"
  },
  {
    "submarineType": "asw",
    "faction": "us",
    "cardType": "attack",
    "imagePath": "/images/Cartas USMC/LCC USMC 90 UUV Attack Unmanned.jpg",
    "cost": 4,
    "attachableCategory": "naval",
    "sub": true,
    "isAttachable": true,
    "id": "us-090",
    "name": "UUV Attack Unmanned",
    "maxPurchases": 2
  },
  {
    "cardType": "communications",
    "id": "us-091",
    "cost": 2,
    "name": "Civil Affairs Group",
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "influenceEffect": 2,
        "minRoll": 1,
        "maxRoll": 2
      },
      {
        "maxRoll": 9,
        "description": "Minor Success",
        "minRoll": 3,
        "influenceEffect": 1
      },
      {
        "maxRoll": 14,
        "influenceEffect": 0,
        "description": "No Effect",
        "minRoll": 10
      },
      {
        "minRoll": 15,
        "maxRoll": 18,
        "influenceEffect": -2,
        "description": "Failure"
      },
      {
        "description": "Major Failure",
        "maxRoll": 20,
        "minRoll": 19,
        "influenceEffect": -3
      }
    ],
    "imagePath": "/images/Cartas USMC/LCC USMC 91 Civil Affairs Group.jpg",
    "faction": "us",
    "maxPurchases": 4,
    "isInfluenceCard": true
  },
  {
    "cost": 4,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas USMC/LCC USMC 92 Security Forces Assistance Brigade.jpg",
    "influenceThresholds": [
      {
        "maxRoll": 5,
        "minRoll": 1,
        "description": "Decisive Success",
        "influenceEffect": 3
      },
      {
        "influenceEffect": 2,
        "minRoll": 6,
        "maxRoll": 11,
        "description": "Minor Success"
      },
      {
        "minRoll": 12,
        "influenceEffect": 0,
        "maxRoll": 15,
        "description": "No Effect"
      },
      {
        "influenceEffect": -2,
        "description": "Failure",
        "minRoll": 16,
        "maxRoll": 18
      },
      {
        "minRoll": 19,
        "maxRoll": 20,
        "description": "Major Failure",
        "influenceEffect": -4
      }
    ],
    "id": "us-092",
    "cardType": "communications",
    "isInfluenceCard": true,
    "name": "Security Forces Assistance Brigade",
    "faction": "us"
  },
  {
    "cardType": "maneuver",
    "id": "us-093",
    "faction": "us",
    "imagePath": "/images/Cartas USMC/LCC USMC 93 LCU-2000.jpg",
    "isTransport": true,
    "name": "LCU-2000",
    "requiredBaseMaxDamage": 4,
    "maxPurchases": 2,
    "requiredBaseId": "sembawang-singapore",
    "transportSlots": [
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "INFANTRY PLATOON",
      "ACV SECTION",
      "ACV SECTION",
      "ACV SECTION"
    ],
    "requiresBaseCondition": true,
    "cost": 4,
    "transportCapacity": 6
  },
  {
    "maxPurchases": 2,
    "cardType": "interception",
    "attachableCategory": "naval",
    "imagePath": "/images/Cartas USMC/LCC USMC 94 Glide Phase Interceptor.jpg",
    "cost": 4,
    "faction": "us",
    "isAttachable": true,
    "id": "us-094",
    "name": "Glide Phase Interceptor"
  },
  {
    "id": "us-095",
    "imagePath": "/images/Cartas USMC/LCC USMC 95 Special Operations Forces Advisors.jpg",
    "cardType": "communications",
    "faction": "us",
    "isInfluenceCard": true,
    "name": "Special Operations Forces Advisors",
    "influenceThresholds": [
      {
        "maxRoll": 4,
        "description": "Decisive Success",
        "influenceEffect": 2,
        "minRoll": 1
      },
      {
        "influenceEffect": 1,
        "description": "Minor Success",
        "maxRoll": 10,
        "minRoll": 5
      },
      {
        "description": "No Effect",
        "minRoll": 11,
        "influenceEffect": 0,
        "maxRoll": 14
      },
      {
        "influenceEffect": -1,
        "minRoll": 15,
        "maxRoll": 18,
        "description": "Failure"
      },
      {
        "description": "Major Failure",
        "influenceEffect": -3,
        "minRoll": 19,
        "maxRoll": 20
      }
    ],
    "cost": 4,
    "maxPurchases": 2
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 96 Seaplanes.jpg",
    "name": "Seaplanes",
    "faction": "us",
    "id": "us-096",
    "maxPurchases": 2,
    "submarineType": "asset",
    "cardType": "maneuver",
    "infinite": true,
    "sub": true,
    "cost": 3
  },
  {
    "id": "us-097",
    "imagePath": "/images/Cartas USMC/LCC USMC 97 Public Affairs Officer.jpg",
    "name": "Public Affairs Officer",
    "isInfluenceCard": true,
    "cost": 2,
    "faction": "us",
    "cardType": "communications",
    "maxPurchases": 2,
    "influenceThresholds": [
      {
        "influenceEffect": 2,
        "maxRoll": 2,
        "minRoll": 1,
        "description": "Decisive Success"
      },
      {
        "maxRoll": 8,
        "description": "Minor Success",
        "influenceEffect": 1,
        "minRoll": 3
      },
      {
        "maxRoll": 14,
        "influenceEffect": 0,
        "minRoll": 9,
        "description": "No Effect"
      },
      {
        "influenceEffect": -1,
        "minRoll": 15,
        "maxRoll": 18,
        "description": "Failure"
      },
      {
        "description": "Major Failure",
        "maxRoll": 20,
        "influenceEffect": -3,
        "minRoll": 19
      }
    ]
  },
  {
    "id": "us-098",
    "cost": 2,
    "faction": "us",
    "attachableCategory": "ground",
    "name": "Counter-Mobility OPS",
    "isAttachable": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 98 Counter-Mobility OPS.jpg",
    "maxPurchases": 4,
    "cardType": "maneuver"
  },
  {
    "requiredBaseId": "kadena-ab",
    "imagePath": "/images/Cartas USMC/LCC USMC 99 JSTARS E-8C.jpg",
    "cost": 5,
    "name": "JSTARS E-8C",
    "maxPurchases": 2,
    "faction": "us",
    "requiresBaseCondition": true,
    "cardType": "intelligence",
    "id": "us-099",
    "requiredBaseMaxDamage": 4,
    "infinite": true
  },
  {
    "maxPurchases": 2,
    "cardType": "communications",
    "id": "us-100",
    "imagePath": "/images/Cartas USMC/LCC USMC 100 Psyop.jpg",
    "faction": "us",
    "influenceThresholds": [
      {
        "minRoll": 1,
        "influenceEffect": 2,
        "maxRoll": 4,
        "description": "Decisive Success"
      },
      {
        "description": "Minor Success",
        "maxRoll": 10,
        "influenceEffect": 1,
        "minRoll": 5
      },
      {
        "maxRoll": 14,
        "influenceEffect": 0,
        "minRoll": 11,
        "description": "No Effect"
      },
      {
        "maxRoll": 18,
        "influenceEffect": -1,
        "description": "Failure",
        "minRoll": 15
      },
      {
        "minRoll": 19,
        "description": "Major Failure",
        "influenceEffect": -3,
        "maxRoll": 20
      }
    ],
    "isInfluenceCard": true,
    "cost": 3,
    "name": "Psyop"
  },
  {
    "id": "us-101",
    "name": "AI-Enabled Targeting",
    "maxPurchases": 2,
    "cardType": "intelligence",
    "cost": 3,
    "faction": "us",
    "infinite": true,
    "imagePath": "/images/Cartas USMC/LCC USMC 101 AI-Enabled Targeting.jpg"
  },
  {
    "cardType": "maneuver",
    "imagePath": "/images/Cartas USMC/LCC USMC 102 Active Denial System.jpg",
    "isAttachable": true,
    "id": "us-102",
    "cost": 2,
    "faction": "us",
    "maxPurchases": 3,
    "name": "Active Denial System",
    "attachableCategory": "ground"
  },
  {
    "imagePath": "/images/Cartas USMC/LCC USMC 103 Airborne Early Warning and Control.jpg",
    "faction": "us",
    "cardType": "interception",
    "infinite": true,
    "name": "Airborne Early Warning and Control",
    "maxPurchases": 2,
    "cost": 4,
    "id": "us-103"
  },
  {
    "name": "Tactical Network",
    "faction": "china",
    "maxPurchases": 0,
    "cost": 0,
    "cardType": "intelligence",
    "id": "china-001",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 01 Tactical Network.jpg"
  },
  {
    "name": "Combat Air Patrols",
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 02 Combat Air Patrols (x2).jpg",
    "maxPurchases": 4,
    "deploymentTime": 2,
    "cardType": "interception",
    "id": "china-002",
    "faction": "china"
  },
  {
    "sub": true,
    "cardType": "intelligence",
    "maxPurchases": 6,
    "cost": 1,
    "submarineType": "asset",
    "deploymentTime": 2,
    "id": "china-003",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 03 Maritime Militia (x2).jpg",
    "name": "Maritime Militia",
    "faction": "china"
  },
  {
    "deploymentTime": 2,
    "maxPurchases": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 04 DF-10A Long Sword.jpg",
    "id": "china-004",
    "name": "DF-10A Long Sword",
    "cost": 3,
    "isAttachable": true,
    "attachableCategory": "artillery",
    "cardType": "attack",
    "faction": "china",
    "secondaryAmmoBonus": 4,
    "hpBonus": 2
  },
  {
    "requiredBaseMaxDamage": 3,
    "requiredBaseId": "custom-1761999685239",
    "maxPurchases": 0,
    "name": "DF-21D Ballistic",
    "faction": "china",
    "requiresBaseCondition": true,
    "cost": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 05 DF-21D Ballistic (x2).jpg",
    "cardType": "attack",
    "id": "china-005"
  },
  {
    "name": "DF-16 Ballistic",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 06 DF-16 Ballistic.jpg",
    "maxPurchases": 0,
    "cardType": "attack",
    "id": "china-006",
    "faction": "china",
    "cost": 3
  },
  {
    "faction": "china",
    "cost": 2,
    "requiredBaseMaxDamage": 4,
    "requiredBaseId": "luzon-strait-patrols",
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 07 GJ-11 Unmanned.jpg",
    "id": "china-007",
    "requiresBaseCondition": true,
    "maxPurchases": 4,
    "name": "GJ-11 Unmanned",
    "cardType": "attack"
  },
  {
    "deploymentTime": 1,
    "name": "Space Satellites",
    "id": "china-008",
    "cost": 4,
    "infinite": true,
    "cardType": "intelligence",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 08 Space Satellites.jpg",
    "maxPurchases": 1
  },
  {
    "id": "china-009",
    "maxPurchases": 2,
    "faction": "china",
    "name": "Blindspot",
    "cost": 3,
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 09 Blindspot.jpg"
  },
  {
    "cost": 3,
    "id": "china-010",
    "maxPurchases": 2,
    "cardType": "communications",
    "name": "GPS Spoofing",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 10 GPS Spoofing.jpg"
  },
  {
    "cardType": "communications",
    "cost": 2,
    "name": "Attack on C2",
    "faction": "china",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 11 Attack on C2.jpg",
    "id": "china-011"
  },
  {
    "maxPurchases": 4,
    "cardType": "communications",
    "cost": 2,
    "name": "Tactical Cyber Defenses",
    "id": "china-012",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 12 Tactical Cyber Defenses.jpg",
    "faction": "china"
  },
  {
    "maxPurchases": 0,
    "name": "Social Media Exploitation",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 13 Social Media Exploitation (x2).jpg",
    "id": "china-013",
    "cost": 1,
    "cardType": "communications",
    "faction": "china"
  },
  {
    "maxPurchases": 3,
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 14 Strong-Arm Diplomacy.jpg",
    "faction": "china",
    "cardType": "communications",
    "cost": 4,
    "name": "Strong-Arm Diplomacy",
    "id": "china-014"
  },
  {
    "id": "china-015",
    "deploymentTime": 2,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 15 SOF Sabotage.jpg",
    "cardType": "maneuver",
    "maxPurchases": 4,
    "name": "SOF Sabotage",
    "cost": 3
  },
  {
    "maxPurchases": 0,
    "name": "Behind Enemy Lines",
    "deploymentTime": 1,
    "faction": "china",
    "cardType": "intelligence",
    "id": "china-016",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 16 Behind Enemy Lines.jpg",
    "cost": 1
  },
  {
    "faction": "china",
    "hpBonus": 2,
    "cost": 4,
    "deploymentTime": 2,
    "maxPurchases": 4,
    "isAttachable": true,
    "secondaryAmmoBonus": 4,
    "id": "china-017",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 17 HQ-22 IAMD.jpg",
    "attachableCategory": "artillery",
    "cardType": "interception",
    "name": "HQ-22 IAMD"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 18 H-6K Cluster Bombs.jpg",
    "maxPurchases": 2,
    "name": "H-6K Cluster Bombs",
    "faction": "china",
    "id": "china-018",
    "cost": 3,
    "requiresBaseCondition": true,
    "deploymentTime": 3,
    "requiredBaseMaxDamage": 3,
    "cardType": "attack",
    "requiredBaseId": "custom-1761996668729"
  },
  {
    "maxPurchases": 2,
    "requiredBaseMaxDamage": 3,
    "requiresBaseCondition": true,
    "requiredBaseId": "custom-1761996668729",
    "name": "H-6K Aerial Strike",
    "cardType": "attack",
    "cost": 3,
    "deploymentTime": 3,
    "id": "china-019",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 19 H-6K Aerial Strike.jpg",
    "faction": "china"
  },
  {
    "isAttachable": true,
    "name": "Tactical UAS",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 20 Tactical UAS (x2).jpg",
    "attachableCategory": "ground",
    "cost": 1,
    "id": "china-020",
    "maxPurchases": 0,
    "cardType": "intelligence",
    "faction": "china"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 21 GJ-1D Unmaned.jpg",
    "deploymentTime": 2,
    "faction": "china",
    "id": "china-021",
    "name": "GJ-1D Unmaned",
    "cost": 2,
    "infinite": true,
    "cardType": "attack",
    "maxPurchases": 2
  },
  {
    "id": "china-022",
    "name": "Electro-Magnetic Sepctrum Defense",
    "faction": "china",
    "cost": 3,
    "cardType": "communications",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 22 Electro-Magnetic Sepctrum Defense.jpg"
  },
  {
    "cost": 2,
    "maxPurchases": 2,
    "cardType": "communications",
    "faction": "china",
    "id": "china-023",
    "name": "Electro-Magnetic Spectrum Jamming",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 23 Electro-Magnetic Spectrum Jamming.jpg"
  },
  {
    "faction": "china",
    "maxPurchases": 2,
    "name": "Logistics Attack",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 24 Logistics Attack.jpg",
    "id": "china-024",
    "cardType": "communications",
    "cost": 3
  },
  {
    "cost": 3,
    "cardType": "intelligence",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 25 Intelligized Networks.jpg",
    "faction": "china",
    "name": "Intelligized Networks",
    "id": "china-025",
    "maxPurchases": 2
  },
  {
    "maxPurchases": 2,
    "name": "GJ-2 Unmanned",
    "id": "china-026",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 26 GJ-2 Unmanned (x2).jpg",
    "infinite": true,
    "faction": "china",
    "deploymentTime": 2,
    "cost": 3,
    "cardType": "attack"
  },
  {
    "isAttachable": true,
    "deploymentTime": 2,
    "faction": "china",
    "cost": 3,
    "attachableCategory": "artillery",
    "cardType": "interception",
    "secondaryAmmoBonus": 4,
    "name": "HQ-9B IAMD",
    "id": "china-027",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 27 HQ-9B IAMD.jpg",
    "hpBonus": 2,
    "maxPurchases": 2
  },
  {
    "name": "Joint Fires",
    "cost": 5,
    "cardType": "attack",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 28 Joint Fires.jpg",
    "id": "china-028",
    "faction": "china"
  },
  {
    "cardType": "intelligence",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 29 Human Intelligence (x2).jpg",
    "name": "Human Intelligence",
    "id": "china-029",
    "maxPurchases": 0,
    "cost": 2,
    "faction": "china"
  },
  {
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 30 Torpedo Attack.jpg",
    "id": "china-030",
    "cardType": "attack",
    "cost": 4,
    "name": "Torpedo Attack",
    "maxPurchases": 2
  },
  {
    "cardType": "maneuver",
    "transportCapacity": 6,
    "cost": 3,
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 5,
    "id": "china-031",
    "requiredBaseId": "custom-1761997491910",
    "maxPurchases": 2,
    "name": "Amphibious Assault",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 31 Amphibious Assault.jpg",
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "LIGHT TANK PLATOON",
      "LIGHT TANK PLATOON"
    ],
    "deploymentTime": 4,
    "faction": "china",
    "isTransport": true
  },
  {
    "name": "Naval Swarm",
    "cardType": "attack",
    "submarineType": "asset",
    "secondaryAmmoBonus": 2,
    "isAttachable": true,
    "cost": 2,
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 32 Naval Swarm (x2).jpg",
    "attachableCategory": "naval",
    "deploymentTime": 2,
    "faction": "china",
    "sub": true,
    "id": "china-032"
  },
  {
    "name": "Offensive Cyber",
    "faction": "china",
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 33 Offensive Cyber.jpg",
    "cost": 4,
    "id": "china-033",
    "maxPurchases": 2
  },
  {
    "cost": 4,
    "cardType": "communications",
    "id": "china-034",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 34 Defensive Cyber.jpg",
    "maxPurchases": 2,
    "faction": "china",
    "name": "Defensive Cyber"
  },
  {
    "isAttachable": true,
    "maxPurchases": 0,
    "attachableCategory": "artillery",
    "name": "Scatterable Landmines",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 35 Scatterable Landmines.jpg",
    "id": "china-035",
    "cardType": "attack",
    "faction": "china",
    "cost": 2
  },
  {
    "cardType": "communications",
    "maxPurchases": 2,
    "faction": "china",
    "name": "Cut the Link",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 36 Cut the Link.jpg",
    "id": "china-036",
    "cost": 3
  },
  {
    "id": "china-037",
    "name": "Coordinated Deception",
    "cost": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 37 Coordinated Deception.jpg",
    "faction": "china",
    "maxPurchases": 2,
    "cardType": "communications"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 38 AI-Enabled Signal Intel.jpg",
    "name": "AI-Enabled Signal Intel",
    "cost": 3,
    "maxPurchases": 0,
    "id": "china-038",
    "faction": "china",
    "cardType": "intelligence",
    "deploymentTime": 2
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 39 Naval Deception (x2).jpg",
    "cost": 1,
    "name": "Naval Deception",
    "faction": "china",
    "maxPurchases": 2,
    "cardType": "communications",
    "deploymentTime": 1,
    "id": "china-039"
  },
  {
    "cardType": "intelligence",
    "id": "china-040",
    "attachableCategory": "ground",
    "name": "Quadcopter Drone",
    "isAttachable": true,
    "faction": "china",
    "maxPurchases": 0,
    "cost": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 40 Quadcopter Drone.jpg"
  },
  {
    "deploymentTime": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 41 Miilitary Deception (x2).jpg",
    "faction": "china",
    "maxPurchases": 2,
    "name": "Miilitary Deception",
    "cardType": "communications",
    "cost": 2,
    "id": "china-041"
  },
  {
    "isAttachable": true,
    "deploymentTime": 1,
    "cost": 3,
    "attachableCategory": "ground",
    "cardType": "maneuver",
    "name": "Combat Engineers",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 42 Combat Engineers.jpg",
    "id": "china-042",
    "maxPurchases": 4,
    "faction": "china"
  },
  {
    "id": "china-043",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 43 Maritime Mines.jpg",
    "sub": true,
    "name": "Maritime Mines",
    "cost": 3,
    "deploymentTime": 2,
    "cardType": "attack",
    "faction": "china",
    "maxPurchases": 4,
    "submarineType": "asset"
  },
  {
    "faction": "china",
    "maxPurchases": 4,
    "influenceThresholds": [
      {
        "influenceEffect": 3,
        "minRoll": 1,
        "description": "Decisive Success",
        "maxRoll": 5
      },
      {
        "description": "Minor Success",
        "minRoll": 6,
        "influenceEffect": 2,
        "maxRoll": 11
      },
      {
        "description": "No Effect",
        "minRoll": 12,
        "influenceEffect": 0,
        "maxRoll": 12
      },
      {
        "minRoll": 13,
        "maxRoll": 16,
        "description": "Failure",
        "influenceEffect": -1
      },
      {
        "minRoll": 17,
        "maxRoll": 20,
        "description": "Major Failure",
        "influenceEffect": -4
      }
    ],
    "id": "china-044",
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 44 Disinformation Operations.jpg",
    "isInfluenceCard": true,
    "name": "Disinformation Operations",
    "cost": 3
  },
  {
    "cardType": "communications",
    "maxPurchases": 4,
    "faction": "china",
    "id": "china-045",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 45 Tactical Cyber Attack (x2).jpg",
    "cost": 2,
    "name": "Tactical Cyber Attack"
  },
  {
    "maxPurchases": 2,
    "infinite": true,
    "cost": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 46 CH-7 Unmanned.jpg",
    "deploymentTime": 2,
    "id": "china-046",
    "name": "CH-7 Unmanned",
    "faction": "china",
    "cardType": "attack"
  },
  {
    "deploymentTime": 2,
    "cost": 4,
    "infinite": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 47 Airborne Early Warning and Control.jpg",
    "faction": "china",
    "cardType": "interception",
    "id": "china-047",
    "maxPurchases": 2,
    "name": "Airborne Early Warning and Control"
  },
  {
    "cardType": "attack",
    "cost": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 48 UUV Attack Unmanned.jpg",
    "faction": "china",
    "name": "UUV Attack Unmanned",
    "isAttachable": true,
    "maxPurchases": 2,
    "attachableCategory": "naval",
    "deploymentTime": 2,
    "id": "china-048"
  },
  {
    "faction": "china",
    "maxPurchases": 2,
    "cost": 3,
    "sub": true,
    "cardType": "maneuver",
    "deploymentTime": 1,
    "name": "Mine Clearing Unmanned",
    "id": "china-049",
    "attachableCategory": "naval",
    "submarineType": "asset",
    "isAttachable": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 49 Mine Clearing Unmanned.jpg"
  },
  {
    "faction": "china",
    "cardType": "intelligence",
    "name": "AI-Enabled Planning",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 50 AI-Enabled Planning.jpg",
    "id": "china-050",
    "cost": 3,
    "maxPurchases": 3
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 51 Unmanned Ground Vehicles (UGVS)(x3).jpg",
    "isAttachable": true,
    "cost": 1,
    "id": "china-051",
    "maxPurchases": 4,
    "name": "Unmanned Ground Vehicles (UGVS)",
    "attachableCategory": "ground",
    "faction": "china",
    "deploymentTime": 2,
    "cardType": "maneuver",
    "hpBonus": 2
  },
  {
    "faction": "china",
    "name": "Unmanned Underwater ISR",
    "maxPurchases": 2,
    "attachableCategory": "naval",
    "id": "china-052",
    "cardType": "intelligence",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 52 Unmanned Underwater ISR.jpg",
    "isAttachable": true,
    "deploymentTime": 2,
    "cost": 1,
    "submarineType": "asset",
    "sub": true
  },
  {
    "name": "YJ-12B Anti-Ship Missile",
    "cost": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 53 YJ-12B Anti-Ship Missile.jpg",
    "id": "china-053",
    "attachableCategory": "artillery",
    "secondaryAmmoBonus": 4,
    "isAttachable": true,
    "deploymentTime": 2,
    "cardType": "attack",
    "maxPurchases": 2,
    "faction": "china",
    "hpBonus": 2
  },
  {
    "faction": "china",
    "cost": 5,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 54 Hypersonic Glide Vehicle.jpg",
    "requiresBaseCondition": true,
    "maxPurchases": 2,
    "cardType": "attack",
    "requiredBaseMaxDamage": 3,
    "deploymentTime": 2,
    "id": "china-054",
    "requiredBaseId": "custom-1761999685239",
    "name": "Hypersonic Glide Vehicle"
  },
  {
    "maxPurchases": 2,
    "id": "china-055",
    "secondaryAmmoBonus": 6,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 55 HQ-16B IAMD.jpg",
    "deploymentTime": 2,
    "faction": "china",
    "isAttachable": true,
    "hpBonus": 2,
    "cardType": "interception",
    "name": "HQ-16B IAMD",
    "cost": 2,
    "attachableCategory": "interception"
  },
  {
    "maxPurchases": 2,
    "isAttachable": true,
    "attachableCategory": "ground",
    "requiredBaseId": "custom-1761997117112",
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "sub": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 56 Patrol Boats (x2).jpg",
    "secondaryAmmoBonus": 4,
    "faction": "china",
    "cost": 3,
    "requiredBaseMaxDamage": 3,
    "name": "Patrol Boats",
    "id": "china-056",
    "submarineType": "asw",
    "deploymentTime": 2
  },
  {
    "id": "china-057",
    "cardType": "attack",
    "cost": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 57 Z-10 Attack.jpg",
    "infinite": true,
    "deploymentTime": 2,
    "faction": "china",
    "name": "Z-10 Attack",
    "maxPurchases": 4
  },
  {
    "name": "Breaking Link-16",
    "faction": "china",
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 58 Breaking Link-16.jpg",
    "cost": 4,
    "id": "china-058",
    "maxPurchases": 2
  },
  {
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 59 Counter-Narratives.jpg",
    "faction": "china",
    "cost": 3,
    "maxPurchases": 2,
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "minRoll": 1,
        "influenceEffect": 3,
        "maxRoll": 3
      },
      {
        "influenceEffect": 2,
        "maxRoll": 10,
        "description": "Minor Success",
        "minRoll": 4
      },
      {
        "description": "No Effect",
        "maxRoll": 12,
        "minRoll": 11,
        "influenceEffect": 0
      },
      {
        "minRoll": 13,
        "maxRoll": 16,
        "influenceEffect": -1,
        "description": "Failure"
      },
      {
        "description": "Major Failure",
        "minRoll": 17,
        "maxRoll": 20,
        "influenceEffect": -4
      }
    ],
    "name": "Counter-Narratives",
    "id": "china-059",
    "isInfluenceCard": true
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 60 Censorship.jpg",
    "name": "Censorship",
    "maxPurchases": 4,
    "cardType": "communications",
    "faction": "china",
    "id": "china-060",
    "cost": 3
  },
  {
    "faction": "china",
    "name": "Big Brother Is Watching",
    "cost": 4,
    "cardType": "communications",
    "maxPurchases": 2,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 61 Big Brother Is Watching.jpg",
    "id": "china-061"
  },
  {
    "maxPurchases": 4,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 62 Submarine Insertion.jpg",
    "name": "Submarine Insertion",
    "deploymentTime": 2,
    "faction": "china",
    "cost": 4,
    "id": "china-062"
  },
  {
    "name": "HALO Insertion",
    "requiredBaseId": "luzon-strait-patrols",
    "cardType": "maneuver",
    "requiredBaseMaxDamage": 2,
    "id": "china-063",
    "cost": 3,
    "deploymentTime": 2,
    "requiresBaseCondition": true,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 63 HALO Insertion.jpg",
    "maxPurchases": 2
  },
  {
    "name": "Deep Fakes",
    "isInfluenceCard": true,
    "id": "china-064",
    "cost": 4,
    "influenceThresholds": [
      {
        "minRoll": 1,
        "maxRoll": 6,
        "description": "Decisive Success",
        "influenceEffect": 4
      },
      {
        "influenceEffect": 2,
        "maxRoll": 13,
        "minRoll": 7,
        "description": "Minor Success"
      },
      {
        "minRoll": 14,
        "influenceEffect": 0,
        "maxRoll": 15,
        "description": "No Effect"
      },
      {
        "minRoll": 16,
        "maxRoll": 17,
        "description": "Failure",
        "influenceEffect": -1
      },
      {
        "influenceEffect": -4,
        "maxRoll": 20,
        "description": "Major Failure",
        "minRoll": 18
      }
    ],
    "imagePath": "/images/Cartas PLAN/LCC PLAN 64 Deep Fakes.jpg",
    "cardType": "communications",
    "faction": "china",
    "maxPurchases": 2
  },
  {
    "maxPurchases": 2,
    "influenceThresholds": [
      {
        "description": "Decisive Success",
        "maxRoll": 6,
        "influenceEffect": 3,
        "minRoll": 1
      },
      {
        "influenceEffect": 2,
        "description": "Minor Success",
        "maxRoll": 12,
        "minRoll": 7
      },
      {
        "description": "No Effect",
        "maxRoll": 15,
        "influenceEffect": 0,
        "minRoll": 13
      },
      {
        "influenceEffect": -1,
        "maxRoll": 18,
        "minRoll": 16,
        "description": "Failure"
      },
      {
        "minRoll": 19,
        "influenceEffect": -4,
        "description": "Major Failure",
        "maxRoll": 20
      }
    ],
    "isInfluenceCard": true,
    "id": "china-065",
    "cardType": "communications",
    "cost": 4,
    "faction": "china",
    "name": "False Death Notifications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 65 False Death Notifications.jpg"
  },
  {
    "maxPurchases": 4,
    "name": "CH-901 Swarm",
    "cost": 2,
    "faction": "china",
    "cardType": "attack",
    "deploymentTime": 1,
    "isAttachable": true,
    "id": "china-066",
    "secondaryAmmoBonus": 8,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 66 CH-901 Swarm.jpg",
    "attachableCategory": "ground"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 67 UUV Defense.jpg",
    "attachableCategory": "naval",
    "name": "UUV Defense",
    "maxPurchases": 2,
    "id": "china-067",
    "isAttachable": true,
    "cost": 3,
    "cardType": "maneuver",
    "faction": "china"
  },
  {
    "maxPurchases": 2,
    "id": "china-068",
    "isAttachable": true,
    "attachableCategory": "ground",
    "cardType": "attack",
    "secondaryAmmoBonus": 8,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 68 CH-901 Swarm.jpg",
    "faction": "china",
    "cost": 2,
    "name": "CH-901 Swarm",
    "deploymentTime": 1
  },
  {
    "maxPurchases": 6,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 69 SUI-Class Sub (x2).jpg",
    "id": "china-069",
    "cardType": "maneuver",
    "submarineType": "submarine",
    "requiredBaseId": "custom-1761995950315",
    "deploymentTime": 2,
    "cost": 5,
    "sub": true,
    "faction": "china",
    "requiresBaseCondition": true,
    "requiredBaseMaxDamage": 3,
    "name": "SUI-Class Sub"
  },
  {
    "faction": "china",
    "maxPurchases": 4,
    "sub": true,
    "id": "china-070",
    "deploymentTime": 2,
    "submarineType": "submarine",
    "requiredBaseMaxDamage": 2,
    "cardType": "maneuver",
    "cost": 5,
    "name": "Shang II-Class Sub",
    "requiresBaseCondition": true,
    "requiredBaseId": "custom-1761995950315",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 70 Shang II-Class Sub.jpg"
  },
  {
    "infinite": true,
    "sub": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 71 Y-8Q Surveillance.jpg",
    "id": "china-071",
    "requiresBaseCondition": true,
    "maxPurchases": 4,
    "cost": 3,
    "faction": "china",
    "requiredBaseMaxDamage": 5,
    "requiredBaseId": "custom-1761997279599",
    "name": "Y-8Q Surveillance",
    "submarineType": "asw",
    "deploymentTime": 2,
    "cardType": "intelligence"
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 72 Proxy Forces.jpg",
    "infinite": true,
    "deploymentTime": 1,
    "id": "china-072",
    "maxPurchases": 4,
    "faction": "china",
    "name": "Proxy Forces",
    "cost": 5,
    "cardType": "maneuver"
  },
  {
    "id": "china-073",
    "requiredBaseId": "custom-1761997279599",
    "maxPurchases": 2,
    "cardType": "maneuver",
    "deploymentTime": 3,
    "cost": 5,
    "requiresBaseCondition": true,
    "faction": "china",
    "name": "Expeditionary Logistics",
    "requiredBaseMaxDamage": 5,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 73 Expeditionary Logistics.jpg"
  },
  {
    "name": "Littoral Movement",
    "cardType": "maneuver",
    "isTransport": true,
    "requiredBaseId": "custom-1761997491910",
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON"
    ],
    "faction": "china",
    "deploymentTime": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 74 Littoral Movement.jpg",
    "requiresBaseCondition": true,
    "maxPurchases": 2,
    "id": "china-074",
    "requiredBaseMaxDamage": 4,
    "transportCapacity": 4,
    "cost": 4
  },
  {
    "cardType": "interception",
    "secondaryAmmoBonus": 6,
    "id": "china-075",
    "name": "Ballistic Missile Defense",
    "isAttachable": true,
    "maxPurchases": 4,
    "faction": "china",
    "attachableCategory": "naval",
    "cost": 0,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 75 Ballistic Missile Defense (x3).jpg"
  },
  {
    "id": "china-076",
    "name": "PLA Strategic Support Force",
    "cardType": "communications",
    "cost": 5,
    "maxPurchases": 2,
    "infinite": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 76 PLA Strategic Support Force.jpg",
    "faction": "china"
  },
  {
    "id": "china-077",
    "faction": "china",
    "cardType": "maneuver",
    "cost": 5,
    "name": "Logistics Resiliency",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 77 Logistics Resiliency.jpg",
    "infinite": true,
    "maxPurchases": 2
  },
  {
    "secondaryAmmoBonus": 4,
    "attachableCategory": "artillery",
    "deploymentTime": 2,
    "isAttachable": true,
    "maxPurchases": 2,
    "faction": "china",
    "name": "YJ-18 Anti-Ship Missile",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 78 YJ-18 Anti-Ship Missile.jpg",
    "hpBonus": 2,
    "cost": 1,
    "cardType": "attack",
    "id": "china-078"
  },
  {
    "requiredBaseMaxDamage": 3,
    "requiredBaseId": "custom-1761996786665",
    "id": "china-079",
    "cardType": "communications",
    "cost": 3,
    "deploymentTime": 2,
    "name": "Shenyang J-15D",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 79 Shenyang J-15D.jpg",
    "infinite": true,
    "maxPurchases": 2,
    "requiresBaseCondition": true,
    "faction": "china"
  },
  {
    "id": "china-080",
    "maxPurchases": 2,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 80 Signal Management.jpg",
    "infinite": true,
    "cost": 3,
    "cardType": "communications",
    "name": "Signal Management"
  },
  {
    "faction": "china",
    "deploymentTime": 2,
    "cost": 4,
    "name": "Coordinated Degradation",
    "cardType": "communications",
    "maxPurchases": 4,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 81 Coordinated Degradation.jpg",
    "id": "china-081"
  },
  {
    "faction": "china",
    "infinite": true,
    "cost": 4,
    "cardType": "communications",
    "maxPurchases": 2,
    "name": "Self-Healing Network",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 82 Self-Healing Network.jpg",
    "id": "china-082"
  },
  {
    "id": "china-083",
    "infinite": true,
    "deploymentTime": 1,
    "cost": 3,
    "name": "High Altitude Balloons",
    "maxPurchases": 6,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 83 High Altitude Balloons.jpg",
    "faction": "china",
    "cardType": "intelligence"
  },
  {
    "name": "Helo ASW",
    "attachableCategory": "naval",
    "id": "china-084",
    "deploymentTime": 2,
    "isAttachable": true,
    "faction": "china",
    "cost": 1,
    "cardType": "intelligence",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 84 Helo ASW.jpg",
    "sub": true,
    "submarineType": "asw",
    "maxPurchases": 2
  },
  {
    "imagePath": "/images/Cartas PLAN/LCC PLAN 85 Logistics Unmanned.jpg",
    "name": "Logistics Unmanned",
    "faction": "china",
    "deploymentTime": 2,
    "id": "china-085",
    "cost": 2,
    "maxPurchases": 2,
    "isAttachable": true,
    "attachableCategory": "supply",
    "cardType": "maneuver"
  },
  {
    "deploymentTime": 2,
    "id": "china-086",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 86 Heavy Lift (x2).jpg",
    "faction": "china",
    "name": "Heavy Lift",
    "cardType": "maneuver",
    "cost": 3,
    "infinite": true,
    "maxPurchases": 3
  },
  {
    "cardType": "maneuver",
    "maxPurchases": 3,
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 87 Active Denial System (ADS).jpg",
    "name": "Active Denial System (ADS)",
    "attachableCategory": "ground",
    "cost": 2,
    "id": "china-087",
    "isAttachable": true,
    "deploymentTime": 2
  },
  {
    "cost": 5,
    "cardType": "communications",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 88 Cyber Exploit.jpg",
    "faction": "china",
    "id": "china-088",
    "name": "Cyber Exploit",
    "maxPurchases": 2
  },
  {
    "faction": "china",
    "cost": 1,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 89 Military Intelligence.jpg",
    "maxPurchases": 0,
    "id": "china-089",
    "cardType": "intelligence",
    "name": "Military Intelligence"
  },
  {
    "submarineType": "asset",
    "maxPurchases": 2,
    "infinite": true,
    "id": "china-090",
    "name": "Seaplanes",
    "sub": true,
    "faction": "china",
    "cost": 3,
    "cardType": "maneuver",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 90 Seaplanes.jpg",
    "deploymentTime": 2
  },
  {
    "cardType": "intelligence",
    "cost": 3,
    "deploymentTime": 2,
    "id": "china-091",
    "faction": "china",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 91 AI-Enabled Targeting.jpg",
    "infinite": true,
    "name": "AI-Enabled Targeting",
    "maxPurchases": 2
  },
  {
    "transportCapacity": 4,
    "cost": 4,
    "cardType": "maneuver",
    "requiresBaseCondition": true,
    "maxPurchases": 3,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 92 Y-8F600 Transport.jpg",
    "id": "china-092",
    "name": "Y-8F600 Transport",
    "isTransport": true,
    "deploymentTime": 2,
    "requiredBaseId": "custom-1761996997961",
    "requiredBaseMaxDamage": 2,
    "faction": "china",
    "transportSlots": [
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON",
      "MECHANIZED WEAPONS PLATOON"
    ]
  },
  {
    "faction": "china",
    "requiredBaseMaxDamage": 2,
    "deploymentTime": 3,
    "maxPurchases": 2,
    "cardType": "attack",
    "requiredBaseId": "luzon-strait-patrols",
    "imagePath": "/images/Cartas PLAN/LCC PLAN 93 Xian H-20 Bomber.jpg",
    "name": "Xian H-20 Bomber",
    "requiresBaseCondition": true,
    "cost": 5,
    "id": "china-093"
  },
  {
    "name": "Type 072A Landing",
    "isTransport": true,
    "maxPurchases": 2,
    "cost": 4,
    "requiresBaseCondition": true,
    "imagePath": "/images/Cartas PLAN/LCC PLAN 94 Type 072A Landing.jpg",
    "faction": "china",
    "deploymentTime": 2,
    "id": "china-094",
    "transportCapacity": 5,
    "transportSlots": [
      "AMPHIBIOUS RECONNAISSANCE PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED INFANTRY PLATOON",
      "MECHANIZED WEAPONS PLATOON",
      "LIGHT TANK PLATOON"
    ],
    "cardType": "maneuver",
    "requiredBaseId": "custom-1761997491910",
    "requiredBaseMaxDamage": 5
  }
];

// Initial budget for each faction (Command Points)
export const initialCommandPoints = {
  us: 50,
  china: 50,
};
