// Note classification types for Field Report Bot
export enum NoteType {
  OBSERVATION = 'observation',
  MEASUREMENT = 'measurement', 
  ISSUE = 'issue',
  RECOMMENDATION = 'recommendation',
  SAFETY = 'safety'
}

export enum SeverityLevel {
  NORMAL = 'normal',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

export interface ExtractedEntity {
  equipment?: string[];
  measurements?: Array<{
    value: number;
    unit: string;
    parameter: string;
  }>;
  locations?: string[];
  personnel?: string[];
}

export interface CategorizedNote {
  id: string;
  originalText: string;
  cleanedText: string;
  type: NoteType;
  severity: SeverityLevel;
  entities: ExtractedEntity;
  tags: string[];
  timestamp: Date;
  confidence: number;
}

export interface ContentAnalysisResult {
  notes: CategorizedNote[];
  summary: {
    totalNotes: number;
    criticalCount: number;
    warningCount: number;
    normalCount: number;
    mainIssues: string[];
    recommendations: string[];
  };
}
