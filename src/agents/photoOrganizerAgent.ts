export type PhotoCategory = 'cover' | 'before' | 'during' | 'after' | 'final' | 'uncategorized';

const KEYWORDS: Record<PhotoCategory, string[]> = {
  cover: [
    'cover', 'title', 'overview', 'site overview', 'front', 'entrance',
    'facility', 'building exterior', 'site entry', 'main view'
  ],
  before: [
    'before', 'pre-repair', 'pre repair', 'initial', 'as received',
    'baseline', 'original condition', 'prior to work', 'pre-service',
    'starting condition', 'as-found'
  ],
  during: [
    'during', 'in-progress', 'in progress', 'install', 'installation',
    'assembly', 'repairing', 'work in progress', 'mid-repair',
    'disassembly', 'removing', 'installing', 'assembling'
  ],
  after: [
    'after', 'post-repair', 'post repair', 'complete', 'completed',
    'finished', 'repaired', 'post-service', 'after repair',
    'completion', 'final assembly'
  ],
  final: [
    'final', 'inspection', 'handover', 'closeout', 'sign-off', 'sign off',
    'final check', 'acceptance', 'verification', 'final inspection',
    'quality check', 'commissioning'
  ],
  uncategorized: []
};


export function categorizePhoto(caption?: string | null): PhotoCategory {
  const text = (caption || '').toLowerCase();
  if (!text) return 'uncategorized';

  // Priority ordering: cover -> before -> during -> after -> final
  const order: PhotoCategory[] = ['cover', 'before', 'during', 'after', 'final'];
  for (const cat of order) {
    const words = KEYWORDS[cat];
    for (const w of words) {
      if (text.includes(w)) return cat;
    }
  }
  return 'uncategorized';
}
