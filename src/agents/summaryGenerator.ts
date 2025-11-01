import OpenAI from 'openai';
import { CategorizedNote, SeverityLevel } from '../types/noteTypes.js';

export interface IntelligentSummary {
  executiveSummary: string;
  scopeDescription: string;
  siteConditions: string;
  workPerformedStructured: string[];           // Completed and verified work
  workInProgress: string[];                     // Started but not complete (NEW)
  requiredCorrectiveActions: string[];         // Not yet started (NEW)
  verificationMethods: string[];               // How work was verified (NEW)
  finalResults: string;
  intelligentRecommendations: string[];
  nextSteps: string;
}

export class SummaryGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  // Main function to generate all report sections intelligently
  async generateIntelligentSummary(
    notes: CategorizedNote[],
    photos: Array<{ caption: string; id: string }>,
    scopeType?: string
  ): Promise<IntelligentSummary> {

    // Prepare notes text for AI processing
    const allNotesText = notes.map(n => n.cleanedText).join('\n');
    const criticalNotes = notes.filter(n => n.severity === SeverityLevel.CRITICAL);
    const warningNotes = notes.filter(n => n.severity === SeverityLevel.WARNING);

    // Classify all work activities first
    const workClassification = await this.classifyWorkActivities(allNotesText);

    // Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary(allNotesText, criticalNotes, warningNotes);

    // Generate scope description
    const scopeDescription = await this.generateScope(allNotesText, scopeType);

    // Extract site conditions
    const siteConditions = await this.extractSiteConditions(allNotesText);

    // Extract verification methods
    const verificationMethods = await this.extractVerificationMethods(allNotesText);

    // Generate final results with work status
    const finalResults = await this.generateFinalResults(allNotesText, criticalNotes, warningNotes, workClassification);

    // Generate intelligent recommendations
    const intelligentRecommendations = await this.generateRecommendations(allNotesText, criticalNotes, warningNotes);

    // Determine next steps
    const nextSteps = await this.determineNextSteps(allNotesText, criticalNotes);

    return {
      executiveSummary,
      scopeDescription,
      siteConditions,
      workPerformedStructured: workClassification.completed,
      workInProgress: workClassification.inProgress,
      requiredCorrectiveActions: workClassification.required,
      verificationMethods,
      finalResults,
      intelligentRecommendations,
      nextSteps
    };
  }

  // Generate executive summary from all notes
  private async generateExecutiveSummary(
    allNotes: string,
    criticalNotes: CategorizedNote[],
    warningNotes: CategorizedNote[]
  ): Promise<string> {
    
   const prompt = `You are a field engineer writing an executive summary for technical management.

REQUIREMENTS:
- Write 2-3 direct, quantitative sentences
- State WHAT was inspected (specific equipment/system)
- Report KEY FINDINGS with numbers (e.g., "3 critical issues", "pressure 15% below spec")
- Give OVERALL STATUS (operational, requires repair, shutdown recommended)
- Use active voice and technical precision
- NO vague language ("significant", "some", "various")

CONTEXT:
Inspection Notes:
${allNotes}

Critical Issues Found: ${criticalNotes.length}
Warnings Found: ${warningNotes.length}

OUTPUT: Only the executive summary text (2-3 sentences). Do NOT include section label.`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_completion_tokens: 300,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Inspection completed. See detailed findings below.';
  }

  // Generate scope based on report type
  private async generateScope(allNotes: string, scopeType?: string): Promise<string> {
    
    const reportTypes = {
      'initial': 'Initial Site Visit and Inspection Report',
      'repair': 'Equipment Repair and Service Report',
      'warranty': 'Warranty Inspection and Validation Report',
      'followup': 'Follow-up Inspection Report',
      'preventive': 'Preventive Maintenance Inspection Report',
      'emergency': 'Emergency Service Call Report'
    };

    let scopeTypeText = 'General Field Inspection Report';
    
    // Check if technician specified scope type
    if (scopeType) {
      const typeKey = scopeType.toLowerCase();
      scopeTypeText = reportTypes[typeKey] || scopeType;
    } else {
      // Use AI to detect report type from notes
      const detectedType = await this.detectReportType(allNotes);
      scopeTypeText = reportTypes[detectedType] || scopeTypeText;
    }

    const prompt = `You are a field engineer defining the inspection scope.

REQUIREMENTS:
- Write 1-2 concise sentences
- Specify EXACT equipment/systems inspected (with model numbers if available)
- State report type clearly: "${scopeTypeText}"
- Mention key activities (installation, testing, measurement, visual inspection)
- Be specific and quantitative

CONTEXT:
Inspection Notes:
${allNotes}

OUTPUT: Only the scope text (1-2 sentences). Do NOT include "Scope:" label.`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_completion_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || `This report documents findings from a ${scopeTypeText.toLowerCase()}.`;
  }

  // Detect report type from notes
  private async detectReportType(notes: string): Promise<string> {
    const keywords = {
      'initial': ['first visit', 'initial', 'baseline', 'new site', 'assessment'],
      'repair': ['repair', 'fix', 'broken', 'malfunction', 'replace'],
      'warranty': ['warranty', 'claim', 'defect', 'manufacturer'],
      'followup': ['follow up', 'followup', 'revisit', 'previous'],
      'preventive': ['preventive', 'maintenance', 'pm', 'scheduled', 'routine'],
      'emergency': ['emergency', 'urgent', 'failure', 'down', 'critical']
    };

    const notesLower = notes.toLowerCase();
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => notesLower.includes(word))) {
        return type;
      }
    }

    return 'initial'; // default
  }

  // Enhanced work classification with verification detection
  private async classifyWorkActivities(allNotes: string): Promise<{
    completed: string[];
    required: string[];
    inProgress: string[];
  }> {
    const prompt = `You are +25 years field engineer analyzing work activities to determine completion status.

CLASSIFICATION RULES:

**COMPLETED WORK** - Include if ANY of these conditions are met:
1. Explicit completion language: "replaced", "installed", "repaired", "changed", "overhauled"
2. Verification evidence: "tested", "verified", "confirmed", "checked", "commissioned"
3. Photo evidence labels: "after repair", "post-replacement", "completed"
4. Performance confirmation: "operational", "working", "functioning as designed"
5. Test results documented: measurements, pass/fail criteria, acceptance testing

Examples of COMPLETED work:
- "Replaced reservoir cover gasket and verified no leaks during pressure test"
- "Installed limit switch on pump suction line valve and confirmed actuation at valve-open position"
- "Replaced stainless steel tubing section and tested at operating pressure with no leaks"
- "Changed cylinder rod to stainless steel type and performed stroke testing"
- "Photo labeled 'After repair' showing installed component"

**REQUIRED WORK** - Include if:
1. Future tense or recommendation language: "need to", "should be", "recommended", "requires"
2. No verification evidence provided
3. Identified during inspection but not addressed

Examples of REQUIRED work:
- "Need to add limit switch to make sure valve is open"
- "Recommended to change the cylinder rod to stainless steel type"
- "Tubing section has to be replaced"
- "Gasket has to be replaced at next oil change"

**IN-PROGRESS WORK** - Include if:
1. Work started but not finished
2. Awaiting parts or completion
3. Partially complete with noted limitations

CRITICAL INSTRUCTIONS:
- Look for VERIFICATION EVIDENCE to classify as completed
- Testing, checking, confirming = completed work
- "Need to", "should", "recommended" = required work
- Default to REQUIRED if status unclear
- Preserve exact technical details from notes

CONTEXT:
Field Notes:
${allNotes}

OUTPUT: Return a JSON object with three arrays:
{
  "completed": ["item1", "item2", ...],
  "required": ["item1", "item2", ...],
  "inProgress": ["item1", "item2", ...]
}

Include the complete description for each item with verification method if completed.`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_completion_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content?.trim() || '{}';

    try {
      const classified = JSON.parse(response);
      return {
        completed: classified.completed || [],
        required: classified.required || [],
        inProgress: classified.inProgress || []
      };
    } catch (error) {
      console.error('Error parsing work classification:', error);
      return { completed: [], required: [], inProgress: [] };
    }
  }

  // NEW METHOD: Extract verification and testing methods used
  private async extractVerificationMethods(allNotes: string): Promise<string[]> {
    const prompt = `You are +25 hydraulic field engineer extracting verification and testing methods from field notes.

IDENTIFY verification activities such as:
- Pressure testing and results
- Leak checks (pressure test , cylinder is holding under load , responce time , etc.)
- Functional testing (cycling, stroking, actuation)
- Performance measurements (flow, pressure, temperature)
- Visual inspection post-repair
- Acceptance criteria verification
- Commissioning tests

REQUIREMENTS:
- List only actual testing/verification performed
- Include test results or acceptance criteria if stated
- Be specific about method and outcome
- Maximum 8 items

CONTEXT:
Field Notes:
${allNotes}

OUTPUT: List of verification methods, one per line. Return "No verification testing documented" if none found.`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_completion_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content?.trim() || 'No verification testing documented';

    return response
      .split('\n')
      .map(line => line.replace(/^[-•*0-9.]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 8);
  }

  // Extract site conditions from notes
  private async extractSiteConditions(allNotes: string): Promise<string> {
    
   const prompt = `You are a +25 years hydraulic field engineer documenting site conditions.

EXTRACT ONLY:
- Location: Building/floor/area/equipment tag
- Cleanliness: Clean, dusty, contaminated (be specific)
- Safety: Ventilation, hazards, PPE requirements
- Environmental: Temperature range, humidity, noise level
- Equipment condition: Age, maintenance status, wear patterns

RULES:
- Be direct and quantitative (e.g., "ambient temperature 32°C")
- If NO site conditions mentioned, write: "Site conditions not documented in field notes"
- Use 2-3 complete sentences maximum

CONTEXT:
Inspection Notes:
${allNotes}

OUTPUT: Only site conditions text (2-3 sentences).`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_completion_tokens: 250,
    });

    return completion.choices[0]?.message?.content?.trim() || 'No specific site conditions documented.';
  }

  // Structure work performed in logical order - now returns only completed work
  private async structureWorkPerformed(allNotes: string): Promise<string[]> {
    const classification = await this.classifyWorkActivities(allNotes);

    // Return only completed work for the "Work Performed" section
    return classification.completed;
  }

  // Generate final results section with work status
  private async generateFinalResults(
    allNotes: string,
    criticalNotes: CategorizedNote[],
    warningNotes: CategorizedNote[],
    workClassification: { completed: string[]; required: string[]; inProgress: string[] }
  ): Promise<string> {
    const prompt = `You are +25 years hydraulic field engineer summarizing inspection and repair outcomes.

WORK STATUS SUMMARY:
- Completed Work: ${workClassification.completed.length} items
- In-Progress Work: ${workClassification.inProgress.length} items
- Required Future Work: ${workClassification.required.length} items
- Critical Issues: ${criticalNotes.length}
- Warnings: ${warningNotes.length}

ADDRESS THESE POINTS:
- Current operational status after completed work
- Work verification and testing results
- Remaining issues requiring follow-up
- Timeline for outstanding corrective actions

REQUIREMENTS:
- Write 3-5 direct sentences, each on a new line
- Clearly state what WAS completed vs what REMAINS to be done
- Reference verification testing results
- Be specific about equipment status (operational, degraded, functional)
- Include timeline estimates for remaining work

CONTEXT:
Field Notes:
${allNotes}

OUTPUT: Final results text (3-5 sentences separated by periods). No label.`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 400,
    });

    const rawResults = completion.choices[0]?.message?.content?.trim() ||
      'Inspection and repair work completed. Equipment status documented for maintenance planning.';

    // Format with line breaks after each sentence
    const formattedResults = rawResults
      .split(/\.\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.endsWith('.') ? sentence : sentence + '.')
      .join('.\n');

    return formattedResults;
  }

  // Generate intelligent recommendations
  private async generateRecommendations(
    allNotes: string,
    criticalNotes: CategorizedNote[],
    warningNotes: CategorizedNote[]
  ): Promise<string[]> {
    
    const prompt = `You are +25 years hydraulic field engineer providing actionable maintenance recommendations.

MANDATORY ITEMS (always include):
1. Review parts inventory for critical spares based on inspection findings
2. Schedule preventive maintenance according to manufacturer guidelines and observed conditions

ADDITIONAL ITEMS (generate 1-3 based on findings):
- Specific repairs needed with timeline
- Further testing or monitoring required
- Equipment upgrades or replacements
- Training or procedure updates
- Safety improvements

REQUIREMENTS:
- Be direct and specific (not "consider repair" but "replace pump seal within 30 days")
- Quantify where possible (timelines, quantities, measurements)
- Prioritize by severity
- Maximum 5 recommendations total
- Each recommendation is actionable and clear

CONTEXT:
Inspection Notes:
${allNotes}

Critical Issues: ${criticalNotes.map(n => n.cleanedText).join('; ')}

Warnings: ${warningNotes.map(n => n.cleanedText).join('; ')}

OUTPUT: Recommendation text only, one per line, no numbers/bullets, maximum 5 items.`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 1,
      max_completion_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    const recommendations = response
      .split('\n')
      .map(line => line.replace(/^[-•*0-9.]\s*/, '').trim())
      .filter(line => line.length > 0);

    // Ensure standard recommendations are included
    const standardRecs = [
      'Review parts inventory for critical spares',
      'Schedule preventive maintenance based on manufacturer guidance'
    ];

    const finalRecs = [...new Set([...recommendations, ...standardRecs])].slice(0, 5);
    
    return finalRecs;
  }

  // Determine next steps based on findings
  private async determineNextSteps(allNotes: string, criticalNotes: CategorizedNote[]): Promise<string> {
    
    if (criticalNotes.length > 0) {
      return 'Immediate action required on critical findings. Schedule emergency service within 24-48 hours.';
    }

   const prompt = `You are +10 hydraulic field engineering manager determining immediate next actions.

DECISION LOGIC:
- If critical issues exist → "Immediate action required: schedule emergency service within 24-48 hours"
- If warnings exist → "Schedule maintenance within 30 days to address warning-level findings"
- If measurements needed → "Prepare detailed quote for repairs based on collected measurements"
- If planning shutdown → "Incorporate findings into next scheduled shutdown maintenance scope"
- If routine → "Schedule routine follow-up inspection per maintenance schedule"

REQUIREMENTS:
- Write exactly 1 clear, directive sentence
- Include timeline if applicable
- Be specific about action type

CONTEXT:
Inspection Notes:
${allNotes}

OUTPUT: One sentence only describing next steps.`;


    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_completion_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Schedule routine follow-up inspection.';
  }
}