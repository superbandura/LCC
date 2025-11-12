/**
 * Script to refactor firestoreService.ts to support multi-game architecture
 *
 * This script reads firestoreService.ts and performs the following transformations:
 * 1. Updates all subscription functions to accept gameId parameter
 * 2. Updates all update functions to accept gameId parameter
 * 3. Replaces GAME_DOC_REF with getGameRef(gameId) calls
 *
 * Usage: npx tsx scripts/refactorFirestoreService.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const FIRESTORE_SERVICE_PATH = path.join(__dirname, '..', 'firestoreService.ts');

// Read the file
let content = fs.readFileSync(FIRESTORE_SERVICE_PATH, 'utf-8');

console.log('Starting firestoreService.ts refactoring...\n');

// Pattern 1: Update subscription functions
// From: export const subscribeToXxx = (\n  callback: (xxx) => void\n): Unsubscribe => {\n  return onSnapshot(GAME_DOC_REF,
// To:   export const subscribeToXxx = (\n  callback: (xxx) => void,\n  gameId?: string\n): Unsubscribe => {\n  const gameRef = getGameRef(gameId);\n  return onSnapshot(gameRef,

const subscriptionPattern = /export const (subscribe[A-Z]\w+) = \(\s*callback: \([^)]+\) => void\s*\): Unsubscribe => \{\s*return onSnapshot\(GAME_DOC_REF,/g;

let subscriptionCount = 0;
content = content.replace(subscriptionPattern, (match, funcName) => {
  subscriptionCount++;
  return `export const ${funcName} = (\n  callback: (${match.match(/callback: \(([^)]+)\)/)?.[1] || 'data'}) => void,\n  gameId?: string\n): Unsubscribe => {\n  const gameRef = getGameRef(gameId);\n  return onSnapshot(gameRef,`;
});

console.log(`✅ Updated ${subscriptionCount} subscription functions`);

// Pattern 2: Update simple update functions that use setDoc(GAME_DOC_REF, ...)
const updatePattern = /export const (update[A-Z]\w+) = async \(\s*(\w+): ([^\)]+)\s*\): Promise<void> => \{/g;

let updateCount = 0;
content = content.replace(updatePattern, (match, funcName, paramName, paramType) => {
  updateCount++;
  return `export const ${funcName} = async (\n  ${paramName}: ${paramType},\n  gameId?: string\n): Promise<void> => {`;
});

console.log(`✅ Updated ${updateCount} update function signatures`);

// Pattern 3: Replace setDoc(GAME_DOC_REF, ... with setDoc(getGameRef(gameId), ...
const setDocPattern = /setDoc\(GAME_DOC_REF,/g;
const setDocMatches = content.match(setDocPattern);
const setDocCount = setDocMatches ? setDocMatches.length : 0;
content = content.replace(setDocPattern, 'setDoc(getGameRef(gameId),');

console.log(`✅ Replaced ${setDocCount} setDoc(GAME_DOC_REF) calls`);

// Pattern 4: Replace getDoc(GAME_DOC_REF) with getDoc(getGameRef(gameId))
const getDocPattern = /getDoc\(GAME_DOC_REF\)/g;
const getDocMatches = content.match(getDocPattern);
const getDocCount = getDocMatches ? getDocMatches.length : 0;
content = content.replace(getDocPattern, 'getDoc(getGameRef(gameId))');

console.log(`✅ Replaced ${getDocCount} getDoc(GAME_DOC_REF) calls`);

// Pattern 5: Replace updateDoc(GAME_DOC_REF, ... with updateDoc(getGameRef(gameId), ...
const updateDocPattern = /updateDoc\(GAME_DOC_REF,/g;
const updateDocMatches = content.match(updateDocPattern);
const updateDocCount = updateDocMatches ? updateDocMatches.length : 0;
content = content.replace(updateDocPattern, 'updateDoc(getGameRef(gameId),');

console.log(`✅ Replaced ${updateDocCount} updateDoc(GAME_DOC_REF) calls`);

// Write the refactored content back
fs.writeFileSync(FIRESTORE_SERVICE_PATH, content, 'utf-8');

console.log('\n✅ Refactoring complete!');
console.log(`\nSummary:`);
console.log(`  - ${subscriptionCount} subscription functions updated`);
console.log(`  - ${updateCount} update functions updated`);
console.log(`  - ${setDocCount} setDoc calls updated`);
console.log(`  - ${getDocCount} getDoc calls updated`);
console.log(`  - ${updateDocCount} updateDoc calls updated`);
console.log(`\nTotal changes: ${subscriptionCount + updateCount + setDocCount + getDocCount + updateDocCount}`);
