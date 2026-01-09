#!/usr/bin/env node
/**
 * sync-changelog.mjs
 * Parses CHANGELOG.md and updates client/src/data/changelog.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const CHANGELOG_PATH = join(ROOT_DIR, 'CHANGELOG.md');
const OUTPUT_PATH = join(ROOT_DIR, 'client/src/data/changelog.ts');

/**
 * Parse CHANGELOG.md and extract entries
 */
function parseChangelog(content) {
  const entries = [];
  // Split by version headers (both # [version] and ## [version])
  const sections = content.split(/^#{1,2} \[/gm);

  for (let i = 1; i < sections.length; i++) {
    const section = '# [' + sections[i];
    const match = section.match(/^#{1,2} \[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/);
    
    if (!match) continue;

    const [, version, date] = match;
    const entry = {
      version,
      date,
      features: [],
      improvements: [],
      bugFixes: [],
      breaking: [],
    };

    // Extract sections
    const featuresMatch = section.match(/### Features\n([\s\S]*?)(?=###|$)/);
    const improvementsMatch = section.match(/### (?:Improvements|Performance Improvements)\n([\s\S]*?)(?=###|$)/);
    const bugFixesMatch = section.match(/### Bug Fixes\n([\s\S]*?)(?=###|$)/);
    const breakingMatch = section.match(/### BREAKING CHANGES\n([\s\S]*?)(?=###|$)/);

    if (featuresMatch) {
      entry.features = extractItems(featuresMatch[1]);
    }
    if (improvementsMatch) {
      entry.improvements = extractItems(improvementsMatch[1]);
    }
    if (bugFixesMatch) {
      entry.bugFixes = extractItems(bugFixesMatch[1]);
    }
    if (breakingMatch) {
      entry.breaking = extractItems(breakingMatch[1]);
    }

    entries.push(entry);
  }

  return entries;
}

/**
 * Extract bullet items from a section
 */
function extractItems(content) {
  const lines = content.split('\n');
  const items = [];

  for (const line of lines) {
    const match = line.match(/^\* (.+?)(?:\s*\(\[[a-f0-9]+\]|$)/);
    if (match) {
      // Clean up the message - remove commit hash links and trailing parentheses
      let item = match[1].trim();
      // Remove trailing incomplete parentheses with commit references
      item = item.replace(/\s*\([^)]*$/, '').trim();
      if (item) {
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Generate TypeScript code for changelog.ts
 */
function generateTypeScript(entries) {
  const entriesJson = JSON.stringify(entries, null, 2)
    .replace(/\"(\w+)\":/g, '$1:')  // Remove quotes from keys
    .replace(/\\"/g, '"')           // Unescape double quotes from JSON
    .replace(/'/g, "\\'")           // Escape single quotes in content
    .replace(/"/g, "'");            // Use single quotes for strings

  return `import type { ChangelogEntry } from '../utils/onboardingTypes';

// Auto-generated from CHANGELOG.md by scripts/sync-changelog.mjs
// Do not edit manually - run 'make version-patch/minor/major' to update
export const CHANGELOG: ChangelogEntry[] = ${entriesJson};

// Helper to check if a version is newer than what user has seen
export function isNewVersion(currentVersion: string, lastSeenVersion: string | null): boolean {
  if (!lastSeenVersion) return true;
  
  const current = currentVersion.split('.').map(Number);
  const seen = lastSeenVersion.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if ((current[i] || 0) > (seen[i] || 0)) return true;
    if ((current[i] || 0) < (seen[i] || 0)) return false;
  }
  
  return false;
}

// Get entries newer than a specific version
export function getNewChanges(sinceVersion: string | null): ChangelogEntry[] {
  if (!sinceVersion) return CHANGELOG;
  
  return CHANGELOG.filter(entry => isNewVersion(entry.version, sinceVersion));
}
`;
}

// Main execution
try {
  console.log('Reading CHANGELOG.md...');
  const changelogContent = readFileSync(CHANGELOG_PATH, 'utf-8');
  
  console.log('Parsing changelog entries...');
  const entries = parseChangelog(changelogContent);
  
  console.log(`Found ${entries.length} version entries`);
  
  console.log('Generating TypeScript file...');
  const tsContent = generateTypeScript(entries);
  
  console.log('Writing to client/src/data/changelog.ts...');
  writeFileSync(OUTPUT_PATH, tsContent, 'utf-8');
  
  console.log('✓ Changelog synced successfully!');
} catch (error) {
  console.error('Error syncing changelog:', error.message);
  process.exit(1);
}
