import type { ChangelogEntry } from '../utils/onboardingTypes';

// Auto-generated from CHANGELOG.md by scripts/sync-changelog.mjs
// Do not edit manually - run 'make version-patch/minor/major' to update
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-01-09',
    features: [
      'added CHANGELOG',
      'added tutorial and onboarding'
    ],
    improvements: [],
    bugFixes: [
      'client version',
      'made changes for aws for arm64',
      'mobile UI fixes',
      'Update artifact path for deployment',
      'version updater'
    ],
    breaking: []
  },
  {
    version: '0.1.0',
    date: '2026-01-02',
    features: [
      'ability to drag down mobile toolbar',
      'Add 3D view component with eye model, light controls, vitreous haze, and vitreous hemorrhage shaders.',
      'Add AI analysis modal and 3D view component.',
      'Add color legend modal and integrate color meanings into the AI analysis prompt.',
      'Add vitreous haze effect, shadow mask generation, and update 3D model textures and stroke rendering.',
      'Added arrows on scroll areas on mobile, minor mobile UI chnges',
      'added chart and retina view in 3d',
      'added docker support',
      'added graphics quality changer',
      'added make file',
      'added server backend',
      'adjust retinal detachment drawing color and 3D view material material properties.',
      'change light direction',
      'Display app version in the mobile/tablet header.',
      'Extend 3D view sphere from hemisphere to 7/8 sphere, adjusting geometry, position, and material properties.',
      'Implement 3D visualization of pathologies with brush size control and custom shader displacement for detachments.',
      'Implement common UI components (loading, toast, confirm dialog) and add dark mode and keyboard shortcuts.',
      'Implement core fundus chart application with drawing canvas, toolbar, 3D view, and keyboard shortcuts.',
      'Implement eye side selection (OD/OS) and image download functionality with improved responsiveness.',
      'Implement undo/redo/clear functionality, add an eraser tool, and configure GitHub Pages deployment.',
      'Implement vessel map overlay with opacity control via a new slider.',
      'improve responsiveness of layer panel and toolbar for mobile displays',
      'initial version control',
      'Introduce detachment height control for 3D model displacement with enhanced lighting and normal calculation.',
      'Introduce layer panel for managing fundus elements with visibility toggles and element manipulation.',
      'Introduce new server project with client API integration, update dependencies, and adjust CI/CD workflow.',
      'makefile for AWS',
      'Set up monorepo with client API (mock/real toggle) and basic Express server, updating deployment workflow.',
      'Update normal and roughness texture map',
      'updated make file'
    ],
    improvements: [],
    bugFixes: [
      '404 on loading from share link',
      'AWS build error fix',
      'AWS EC2 client build error',
      'better mobile UI',
      'dark mode',
      'docker not working fixed',
      'docker tsc error',
      'eraser now working correctly',
      'fill and pattern now work again',
      'server can now be accesed from remote device, and shared charts don\'t auto save',
      'shared drawing not rendering',
      'shortcut working in 3d view, changed retina color, minor changes'
    ],
    breaking: []
  }
];

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
