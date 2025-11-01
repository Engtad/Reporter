import OpenAI from 'openai';
import {
  NoteType,
  SeverityLevel,
  CategorizedNote,
  ExtractedEntity,
  ContentAnalysisResult
} from '../types/noteTypes.js';

export class ContentAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Analyze all notes with AI + fallback
  async analyzeNotes(notes: string[]): Promise<ContentAnalysisResult> {
    const analyzedNotes: CategorizedNote[] = [];
    for (let i = 0; i < notes.length; i++) {
      try {
        const categorized = await this.categorizeNote(notes[i], i);
        analyzedNotes.push(categorized);
      } catch (err) {
        console.error(`Error analyzing note ${i}:`, err);
        analyzedNotes.push(this.createFallbackNote(notes[i], i));
      }
    }
    const summary = this.generateSummary(analyzedNotes);
    return { notes: analyzedNotes, summary };
  }

  // AI categorization for a single note using GPT-5
  private async categorizeNote(noteText: string, index: number): Promise<CategorizedNote> {
   const prompt = `You are +25 years expert hydraulic engineer , analyzing field inspection notes to extract structured technical data.

Analyze the cleaned inspection note and classify it with precision:

TYPE DEFINITIONS:
- observation: Visual inspection findings, condition assessments
- measurement: Quantified data (pressure, temperature, dimensions, flow rates)
- issue: Problems, defects, malfunctions requiring attention
- recommendation: Suggested actions, maintenance needs
- safety: Hazards, safety violations, protective measures

SEVERITY LEVELS:
- normal: Routine findings, acceptable conditions, standard observations
- warning: Requires attention within 30 days, minor degradation, monitor closely
- critical: Immediate action required, equipment failure risk, safety hazard

ENTITY EXTRACTION:
- equipment: Specific components (pump, valve, motor, cylinder, hose)
- measurements: Extract {"value": number, "unit": "string", "parameter": "pressure|temp|flow|etc"}
- locations: Building, floor, area, room, equipment ID
- personnel: Names or roles mentioned

TAGS: Generate 3-5 specific keywords (e.g., "hydraulic", "leak", "pressure-test", "cylinder-rod")

CONFIDENCE: Rate 0.0-1.0 based on clarity of the note

Return ONLY valid JSON with this exact structure:
{
  "type": "observation|measurement|issue|recommendation|safety",
  "severity": "normal|warning|critical",
  "entities": {
    "equipment": ["list"],
    "measurements": [{"value": number, "unit": "string", "parameter": "string"}],
    "locations": ["list"],
    "personnel": ["list"]
  },
  "tags": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.85
}

Note to analyze: "${noteText}"`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_completion_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices?.[0]?.message?.content ?? '';
    if (!responseContent) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response
    let aiResult: any;
    try {
      aiResult = JSON.parse(responseContent);
    } catch (e) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      id: `note-${index + 1}`,
      originalText: noteText,
      cleanedText: noteText,
      type: this.mapToNoteType(aiResult.type),
      severity: this.mapToSeverityLevel(aiResult.severity),
      entities: this.normalizeEntities(aiResult.entities),
      tags: Array.isArray(aiResult.tags) ? aiResult.tags : [],
      timestamp: new Date(),
      confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 0.7
    };
  }

  private createFallbackNote(noteText: string, index: number): CategorizedNote {
    return {
      id: `note-${index + 1}`,
      originalText: noteText,
      cleanedText: noteText,
      type: NoteType.OBSERVATION,
      severity: SeverityLevel.NORMAL,
      entities: { equipment: [], measurements: [], locations: [], personnel: [] },
      tags: ['unanalyzed'],
      timestamp: new Date(),
      confidence: 0.5
    };
  }

  private mapToNoteType(type: string): NoteType {
    const map: Record<string, NoteType> = {
      observation: NoteType.OBSERVATION,
      measurement: NoteType.MEASUREMENT,
      issue: NoteType.ISSUE,
      recommendation: NoteType.RECOMMENDATION,
      safety: NoteType.SAFETY
    };
    return map[(type || '').toLowerCase()] ?? NoteType.OBSERVATION;
  }

  private mapToSeverityLevel(severity: string): SeverityLevel {
    const map: Record<string, SeverityLevel> = {
      normal: SeverityLevel.NORMAL,
      warning: SeverityLevel.WARNING,
      critical: SeverityLevel.CRITICAL
    };
    return map[(severity || '').toLowerCase()] ?? SeverityLevel.NORMAL;
  }

  private normalizeEntities(entities: any): ExtractedEntity {
    if (!entities || typeof entities !== 'object') {
      return { equipment: [], measurements: [], locations: [], personnel: [] };
    }
    return {
      equipment: Array.isArray(entities.equipment) ? entities.equipment : [],
      measurements: Array.isArray(entities.measurements) ? entities.measurements : [],
      locations: Array.isArray(entities.locations) ? entities.locations : [],
      personnel: Array.isArray(entities.personnel) ? entities.personnel : []
    };
  }

  private generateSummary(notes: CategorizedNote[]): ContentAnalysisResult['summary'] {
    const critical = notes.filter(n => n.severity === SeverityLevel.CRITICAL);
    const warning = notes.filter(n => n.severity === SeverityLevel.WARNING);
    const normal = notes.filter(n => n.severity === SeverityLevel.NORMAL);
    const mainIssues = notes.filter(n => n.type === NoteType.ISSUE).map(n => n.cleanedText).slice(0, 3);
    const recommendations = notes.filter(n => n.type === NoteType.RECOMMENDATION).map(n => n.cleanedText).slice(0, 3);
    return {
      totalNotes: notes.length,
      criticalCount: critical.length,
      warningCount: warning.length,
      normalCount: normal.length,
      mainIssues,
      recommendations
    };
  }

  getAllEquipment(notes: CategorizedNote[]): string[] {
    const set = new Set<string>();
    notes.forEach(n => n.entities?.equipment?.forEach(e => set.add(e)));
    return Array.from(set);
  }

  getAllMeasurements(notes: CategorizedNote[]): Array<{ value: number; unit: string; parameter: string }> {
    const out: Array<{ value: number; unit: string; parameter: string }> = [];
    notes.forEach(n => n.entities?.measurements && out.push(...n.entities.measurements));
    return out;
  }
}