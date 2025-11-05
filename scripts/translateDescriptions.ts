import { unitsData } from './data/unitsData.js';
import { Unit } from './types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para traducir descripciones de unidades al español
 *
 * NOTA: Este script requiere una API key de traducción para funcionar automáticamente.
 * Actualmente está configurado para:
 * 1. Detectar descripciones en inglés
 * 2. Preparar el batch de traducciones
 * 3. Mostrar las traducciones que se necesitan
 *
 * Para usar con Claude API:
 * - Instalar: npm install @anthropic-ai/sdk
 * - Configurar ANTHROPIC_API_KEY en variables de entorno
 *
 * Para usar con Google Translate API:
 * - Instalar: npm install @google-cloud/translate
 * - Configurar GOOGLE_APPLICATION_CREDENTIALS
 */

interface TranslationTask {
  unitId: string;
  unitName: string;
  originalDescription: string;
  translatedDescription?: string;
}

async function translateDescriptions() {
  console.log('🌍 Iniciando proceso de traducción...\n');

  // Filter units that need translation (detect English text)
  const needsTranslation = unitsData.filter(unit => {
    const desc = unit.description.toLowerCase();
    // Simple heuristic: contains common English military terms
    return (
      desc.includes('the ') ||
      desc.includes(' is ') ||
      desc.includes(' are ') ||
      desc.includes('equipped with') ||
      desc.includes('capable of') ||
      desc.includes('designed for') ||
      desc.includes('armed with')
    );
  });

  console.log(`📊 Estadísticas:`);
  console.log(`   Total de unidades: ${unitsData.length}`);
  console.log(`   Requieren traducción: ${needsTranslation.length}`);
  console.log(`   Ya traducidas: ${unitsData.length - needsTranslation.length}\n`);

  if (needsTranslation.length === 0) {
    console.log('✅ Todas las descripciones ya están en español!');
    return;
  }

  // Prepare translation tasks
  const tasks: TranslationTask[] = needsTranslation.map(unit => ({
    unitId: unit.id,
    unitName: unit.name,
    originalDescription: unit.description,
  }));

  console.log('📝 Descripciones que requieren traducción:\n');
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.unitName} (${task.unitId})`);
    console.log(`   EN: ${task.originalDescription.substring(0, 80)}...`);
    console.log('');
  });

  console.log('\n⚠️  NOTA: Para completar la traducción automática, necesitas:');
  console.log('   1. Instalar una biblioteca de traducción (ver comentarios en el script)');
  console.log('   2. Configurar tu API key');
  console.log('   3. Descomentar la función de traducción correspondiente\n');

  // Uncomment and configure one of the following translation methods:

  // METHOD 1: Using Claude API (recommended for maintaining context and military terminology)
  // await translateWithClaude(tasks);

  // METHOD 2: Using Google Translate
  // await translateWithGoogle(tasks);

  // METHOD 3: Manual - Export to JSON for manual translation
  await exportForManualTranslation(tasks);
}

/**
 * METHOD 1: Translate using Claude API
 * Uncomment and configure ANTHROPIC_API_KEY to use
 */
/*
import Anthropic from '@anthropic-ai/sdk';

async function translateWithClaude(tasks: TranslationTask[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY no configurada');
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  console.log('🤖 Traduciendo con Claude API...\n');

  // Batch translations in groups of 10 for efficiency
  const batchSize = 10;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);

    const prompt = `Traduce las siguientes descripciones de unidades militares al español. Mantén la terminología militar precisa y el tono profesional. Responde SOLO con las traducciones numeradas, sin explicaciones adicionales.\n\n${
      batch.map((task, idx) => `${i + idx + 1}. ${task.originalDescription}`).join('\n\n')
    }`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse response and assign translations
    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const translations = content.split('\n\n').filter(t => t.trim());

    batch.forEach((task, idx) => {
      const translation = translations[idx]?.replace(/^\d+\.\s*/, '').trim();
      if (translation) {
        task.translatedDescription = translation;
        console.log(`✅ ${task.unitName}: Traducido`);
      }
    });
  }

  await updateUnitsFile(tasks);
}
*/

/**
 * METHOD 2: Translate using Google Translate
 * Uncomment and configure GOOGLE_APPLICATION_CREDENTIALS to use
 */
/*
import { v2 } from '@google-cloud/translate';

async function translateWithGoogle(tasks: TranslationTask[]) {
  const translate = new v2.Translate();

  console.log('🌍 Traduciendo con Google Translate API...\n');

  for (const task of tasks) {
    try {
      const [translation] = await translate.translate(task.originalDescription, {
        from: 'en',
        to: 'es',
      });
      task.translatedDescription = translation;
      console.log(`✅ ${task.unitName}: Traducido`);
    } catch (error) {
      console.error(`❌ Error traduciendo ${task.unitName}:`, error);
    }
  }

  await updateUnitsFile(tasks);
}
*/

/**
 * METHOD 3: Export to JSON for manual translation
 */
async function exportForManualTranslation(tasks: TranslationTask[]) {
  const outputPath = path.join(__dirname, 'translations-pending.json');

  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalTasks: tasks.length,
      instructions: 'Traduce el campo "originalDescription" y guarda la traducción en "translatedDescription"',
    },
    tasks: tasks.map(task => ({
      unitId: task.unitId,
      unitName: task.unitName,
      originalDescription: task.originalDescription,
      translatedDescription: '// TRADUCIR AQUÍ',
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n📄 Archivo exportado: ${outputPath}`);
  console.log('\n📝 Instrucciones:');
  console.log('   1. Abre el archivo translations-pending.json');
  console.log('   2. Traduce cada "originalDescription" al español');
  console.log('   3. Guarda las traducciones en "translatedDescription"');
  console.log('   4. Ejecuta: npm run apply-translations\n');
}

/**
 * Apply translations from JSON file
 */
export async function applyTranslationsFromFile() {
  const inputPath = path.join(__dirname, 'translations-pending.json');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ Error: No se encontró translations-pending.json');
    return;
  }

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const tasks: TranslationTask[] = data.tasks.filter(
    (task: any) => task.translatedDescription && task.translatedDescription !== '// TRADUCIR AQUÍ'
  );

  if (tasks.length === 0) {
    console.error('❌ Error: No se encontraron traducciones en el archivo');
    return;
  }

  console.log(`\n✅ Aplicando ${tasks.length} traducciones...\n`);
  await updateUnitsFile(tasks);
}

/**
 * Update unitsData.ts with translations
 */
async function updateUnitsFile(tasks: TranslationTask[]) {
  // Create a map of translations
  const translationMap = new Map(
    tasks
      .filter(t => t.translatedDescription)
      .map(t => [t.unitId, t.translatedDescription!])
  );

  // Update units
  const updatedUnits = unitsData.map(unit => {
    const translation = translationMap.get(unit.id);
    if (translation) {
      return { ...unit, description: translation };
    }
    return unit;
  });

  // Generate new unitsData.ts file
  const code = formatUnitsAsTypeScript(updatedUnits);
  const outputPath = path.join(__dirname, 'data', 'unitsData.ts');
  fs.writeFileSync(outputPath, code, 'utf-8');

  console.log(`\n✅ Archivo actualizado: ${outputPath}`);
  console.log(`📊 Traducciones aplicadas: ${translationMap.size}`);
  console.log('\n🎉 ¡Traducción completada!\n');
}

function formatUnitsAsTypeScript(units: Unit[]): string {
  const sortedUnits = [...units].sort((a, b) => {
    if (a.faction !== b.faction) {
      return a.faction === 'us' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  let code = `import { Unit } from '../types';\n\n`;
  code += `/**\n`;
  code += ` * Unit database\n`;
  code += ` * Last updated: ${new Date().toISOString()}\n`;
  code += ` * Total units: ${units.length}\n`;
  code += ` */\n`;
  code += `export const unitsData: Unit[] = [\n`;

  sortedUnits.forEach((unit, index) => {
    code += `  {\n`;
    code += `    id: '${unit.id}',\n`;
    code += `    name: '${escapeString(unit.name)}',\n`;
    code += `    type: '${escapeString(unit.type)}',\n`;
    code += `    description: '${escapeString(unit.description)}',\n`;
    code += `    faction: '${unit.faction}',\n`;
    code += `    image: '${unit.image}',\n`;
    code += `    damagePoints: ${unit.damagePoints},\n`;
    code += `    currentDamage: [${unit.currentDamage.join(', ')}],\n`;

    if (unit.taskForceId !== undefined && unit.taskForceId !== null) {
      code += `    taskForceId: '${unit.taskForceId}',\n`;
    } else {
      code += `    taskForceId: undefined,\n`;
    }

    if (unit.attackPrimary !== undefined) code += `    attackPrimary: ${unit.attackPrimary},\n`;
    if (unit.attackSecondary !== undefined) code += `    attackSecondary: ${unit.attackSecondary},\n`;
    if (unit.interception !== undefined) code += `    interception: ${unit.interception},\n`;
    if (unit.supply !== undefined) code += `    supply: ${unit.supply},\n`;
    if (unit.groundCombat !== undefined) code += `    groundCombat: ${unit.groundCombat},\n`;

    code += `  }${index < sortedUnits.length - 1 ? ',' : ''}\n`;
  });

  code += `];\n`;
  return code;
}

function escapeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Run translation process
if (process.argv[2] === '--apply') {
  applyTranslationsFromFile();
} else {
  translateDescriptions();
}
