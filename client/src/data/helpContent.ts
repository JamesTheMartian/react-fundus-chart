import type { HelpCategory } from '../utils/onboardingTypes';

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'Rocket',
    articles: [
      {
        id: 'what-is-retinachart',
        title: 'What is RetinaChart Expert?',
        content: `RetinaChart Expert is a modern, interactive fundus charting application designed for ophthalmologists and eye care professionals.

**Key Features:**
- Draw and annotate fundus examination charts
- View charts in interactive 3D eye models
- Save and share charts with colleagues
- Manage patient records and chart history

The application works on both desktop and mobile devices, making it perfect for use in clinics, operating rooms, or on-the-go.`,
        keywords: ['introduction', 'about', 'features', 'overview'],
      },
      {
        id: 'first-chart',
        title: 'Creating Your First Chart',
        content: `**Step 1: Select the Eye**
Choose OD (right eye) or OS (left eye) using the eye selector.

**Step 2: Choose a Tool**
Select a drawing tool from the toolbar. The pen tool is great for general annotations.

**Step 3: Pick a Color**
Each color has medical significance. Red for hemorrhages, blue for detachments, etc.

**Step 4: Draw**
Click/touch and drag on the fundus diagram to draw your findings.

**Step 5: Save**
Click the save button to store your chart. Guest users can download as an image.`,
        keywords: ['create', 'first', 'new', 'chart', 'tutorial', 'begin'],
      },
      {
        id: 'account-benefits',
        title: 'Why Create an Account?',
        content: `Creating an account unlocks powerful features:

**Cloud Sync**
Your charts are automatically saved and synced across all your devices.

**Patient Management**
Associate charts with patient records for organized documentation.

**Sharing**
Generate secure links to share charts with colleagues.

**Chart History**
Access all your previous charts from anywhere.

Guest users can still use the drawing features, but charts are only saved locally.`,
        keywords: ['account', 'login', 'register', 'sign up', 'benefits'],
      },
    ],
  },
  {
    id: 'drawing-tools',
    title: 'Drawing Tools',
    icon: 'Pencil',
    articles: [
      {
        id: 'pen-tool',
        title: 'Pen Tool',
        content: `The pen tool creates smooth, freehand strokes on the canvas.

**Usage:**
- Click and drag to draw
- Adjust brush size with the slider
- Works with all colors

**Tip:** Use lighter pressure for thin lines, or increase brush size for bolder strokes.`,
        keywords: ['pen', 'draw', 'freehand', 'stroke'],
      },
      {
        id: 'brush-tool',
        title: 'Brush Tool',
        content: `The brush tool creates thicker, more prominent strokes ideal for marking larger areas.

**Best for:**
- Highlighting areas of concern
- Drawing vitreous opacities
- Marking large pathological areas`,
        keywords: ['brush', 'thick', 'wide', 'stroke'],
      },
      {
        id: 'pattern-tool',
        title: 'Pattern Tool',
        content: `Use patterns for specific pathologies:

**Available Patterns:**
- Hemorrhage dots
- Exudate marks
- Drusen patterns

Select the pattern from the dropdown after choosing the pattern tool.`,
        keywords: ['pattern', 'hemorrhage', 'exudate', 'drusen'],
      },
      {
        id: 'eraser',
        title: 'Eraser Tool',
        content: `The eraser removes strokes from the canvas.

**How it works:**
- Click/drag over strokes to erase them
- Adjust eraser size for precision
- Erased content can be recovered with Undo

**Tip:** For precise erasing, use a smaller eraser size.`,
        keywords: ['eraser', 'delete', 'remove', 'clear'],
      },
      {
        id: 'fill-tool',
        title: 'Fill Tool',
        content: `The fill tool creates solid filled shapes.

**Usage:**
- Click to start a fill point
- Drag to define the area
- Release to fill

**Best for:** Marking retinal detachment areas, large hemorrhages.`,
        keywords: ['fill', 'solid', 'area', 'shape'],
      },
    ],
  },
  {
    id: 'colors-pathology',
    title: 'Colors & Pathology',
    icon: 'Palette',
    articles: [
      {
        id: 'color-meanings',
        title: 'Medical Color Meanings',
        content: `Each color represents specific findings:

| Color | Meaning |
|-------|---------|
| 🔴 Red | Arterioles, Hemorrhages, Retinal Tears |
| 🔵 Blue | Detached Retina, Veins, Lattice |
| 🟢 Green | Vitreous Opacities |
| 🟤 Brown | Choroidal tissue, Pigment |
| 🟡 Yellow | Exudates, Drusen, Edema |
| ⚫ Black | Sclerosed vessels, Scars |
| 🩷 Pink | Normal/General annotations |

Following these conventions ensures your charts are universally understood.`,
        keywords: ['color', 'meaning', 'red', 'blue', 'green', 'yellow', 'legend'],
      },
      {
        id: 'pathology-presets',
        title: 'Pathology Presets',
        content: `Pathology presets automatically configure the right tool and color for common findings:

**Available Presets:**
- Hemorrhage (red, pen tool)
- Vitreous hemorrhage (green, brush)
- Tear (red, pattern)
- Detachment (blue, fill)
- Hole (red, circle)
- Drusen (yellow, pattern)
- Cotton wool spot (white, brush)
- Hard exudate (yellow, pattern)
- Edema (yellow, fill)
- Lattice (blue, pattern)

Select a preset from the pathology dropdown in the toolbar.`,
        keywords: ['pathology', 'preset', 'hemorrhage', 'detachment', 'drusen'],
      },
    ],
  },
  {
    id: '3d-visualization',
    title: '3D Visualization',
    icon: 'Box',
    articles: [
      {
        id: '3d-overview',
        title: 'Using 3D View',
        content: `The 3D view renders your chart on an interactive eye model.

**Controls:**
- Click and drag to rotate the eye
- Scroll/pinch to zoom
- Double-click to reset view

**Features:**
- Retinal detachments shown with realistic depth
- Vitreous hemorrhage visualization
- Adjustable detachment height
- Multiple quality settings`,
        keywords: ['3d', 'view', 'rotate', 'zoom', 'model'],
      },
      {
        id: 'graphics-quality',
        title: 'Graphics Quality Settings',
        content: `Adjust 3D quality based on your device:

**Low:** Simple rendering. Best for older devices or battery saving.

**Medium:** Basic animations and effects. Good balance.

**High:** Full liquid effects and animations. Best visual experience.

Change this in Settings → 3D Graphics.`,
        keywords: ['graphics', 'quality', 'performance', 'low', 'medium', 'high'],
      },
    ],
  },
  {
    id: 'saving-sharing',
    title: 'Saving & Sharing',
    icon: 'Share2',
    articles: [
      {
        id: 'save-chart',
        title: 'Saving Charts',
        content: `**Logged-in Users:**
Charts auto-save every 2 seconds. You can also manually save with a name and patient association.

**Guest Users:**
Charts are saved to browser local storage. Download as image for permanent backup.

**Tip:** Associate charts with patients for organized record-keeping.`,
        keywords: ['save', 'auto-save', 'store', 'backup'],
      },
      {
        id: 'share-charts',
        title: 'Sharing Charts',
        content: `Generate secure shareable links for any saved chart.

**How to share:**
1. Save your chart first
2. Click the Share button
3. Copy the generated link
4. Send to colleagues

Recipients can view the chart without logging in. They cannot edit the original.`,
        keywords: ['share', 'link', 'send', 'colleague'],
      },
      {
        id: 'export-image',
        title: 'Exporting as Image',
        content: `Download your chart as a PNG image:

1. Click the Download button in the toolbar
2. The image is saved to your downloads folder
3. Image includes only the fundus diagram (no UI elements)

**Use cases:** Printing, EMR integration, presentation slides.`,
        keywords: ['export', 'download', 'image', 'png', 'print'],
      },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    icon: 'Keyboard',
    articles: [
      {
        id: 'shortcuts-reference',
        title: 'Complete Shortcut Reference',
        content: `**General:**
- \`Ctrl+Z\` / \`⌘Z\`: Undo
- \`Ctrl+Y\` / \`⌘+Shift+Z\`: Redo
- \`Ctrl+S\` / \`⌘S\`: Save
- \`Ctrl+Shift+S\`: Download image
- \`?\`: Show keyboard shortcuts
- \`Escape\`: Deselect / Close modal

**Tools:**
- \`P\`: Pen tool
- \`B\`: Brush tool
- \`E\`: Eraser
- \`F\`: Fill tool
- \`S\`: Select tool

**View:**
- \`3\`: Toggle 3D view
- \`D\`: Toggle dark mode
- \`Delete\`: Delete selected element`,
        keywords: ['keyboard', 'shortcut', 'hotkey', 'ctrl', 'command'],
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: 'AlertCircle',
    articles: [
      {
        id: 'not-saving',
        title: 'Charts Not Saving',
        content: `If your charts aren't saving:

1. **Check login status**: You need to be logged in for cloud save
2. **Check internet connection**: Cloud sync requires internet
3. **Browser storage**: Guest saves may fail if browser storage is full
4. **Try refreshing**: Sometimes a refresh resolves sync issues

Guest users: Your work is saved locally. Clear browser data will erase it!`,
        keywords: ['save', 'not saving', 'error', 'lost', 'sync'],
      },
      {
        id: '3d-slow',
        title: '3D View is Slow',
        content: `If 3D view is laggy:

1. Lower graphics quality in Settings → 3D Graphics
2. Close other browser tabs
3. On mobile: Close background apps
4. Try a different browser (Chrome recommended)

The 3D view uses WebGL. Older devices may struggle with high settings.`,
        keywords: ['3d', 'slow', 'lag', 'performance', 'freeze'],
      },
      {
        id: 'touch-issues',
        title: 'Touch Drawing Issues',
        content: `If touch drawing isn't working properly:

1. **Palm rejection**: Rest your palm away from the screen
2. **Use a stylus**: For precision, consider an active stylus
3. **Zoom out**: Ensure the canvas isn't zoomed in excessively
4. **Clear browser cache**: Outdated scripts can cause issues

For iPad: Safari and Chrome both work well. Enable "Desktop Website" for full features.`,
        keywords: ['touch', 'drawing', 'mobile', 'tablet', 'stylus'],
      },
    ],
  },
];

// Helper function for fuzzy search
export function searchHelpContent(query: string): Array<{ category: HelpCategory; article: typeof HELP_CATEGORIES[0]['articles'][0] }> {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: Array<{ category: HelpCategory; article: typeof HELP_CATEGORIES[0]['articles'][0]; score: number }> = [];
  
  for (const category of HELP_CATEGORIES) {
    for (const article of category.articles) {
      let score = 0;
      
      // Check title
      if (article.title.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }
      
      // Check keywords
      for (const keyword of article.keywords) {
        if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) {
          score += 5;
        }
      }
      
      // Check content
      if (article.content.toLowerCase().includes(normalizedQuery)) {
        score += 2;
      }
      
      if (score > 0) {
        results.push({ category, article, score });
      }
    }
  }
  
  return results
    .sort((a, b) => b.score - a.score)
    .map(({ category, article }) => ({ category, article }));
}
