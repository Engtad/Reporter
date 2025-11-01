import { generateText } from '../utils/groq';

export interface FrameTitleAnalysis {
  projectTitle: string;
  sectionTitles: string[];
  suggestedFrameTitles: string[];
}






export async function generateFrameTitles(
  notes: string[],
  photoCaptions: string[],
  projectName?: string
): Promise<FrameTitleAnalysis> {
  const content = `
User Notes: ${notes.join(', ')}
Photo Captions: ${photoCaptions.join(', ')}
Project Name: ${projectName || 'Field Report'}

Based on this field report content, generate appropriate frame titles for a professional engineering report with ISO 5457 border frames.

Please provide:
1. A main project title for the cover page
2. Section titles for different pages (executive summary, observations, photos, etc.)
3. Frame titles for the header-info boxes in the border frames

Format the response as a JSON object with:
- projectTitle: string
- sectionTitles: string[]
- suggestedFrameTitles: string[]
`;

  try {
    const prompt = `You are an expert engineering report writer. Generate professional, concise titles for engineering report sections and frame headers.

${content}

Please provide:
1. A main project title for the cover page
2. Section titles for different pages (executive summary, observations, photos, etc.)
3. Frame titles for the header-info boxes in the border frames

Format the response as a JSON object with:
- projectTitle: string
- sectionTitles: string[]
- suggestedFrameTitles: string[]`;

    const response = await generateText({
      system: 'You are an expert engineering report writer. Generate professional, concise titles for engineering report sections and frame headers.',
      user: content,
      temperature: 0.3
    });

    const result = JSON.parse(response);
    
    return {
      projectTitle: result.projectTitle || projectName || 'Engineering Field Report',
      sectionTitles: result.sectionTitles || ['Executive Summary', 'Field Observations', 'Documentation Photos'],
      suggestedFrameTitles: result.suggestedFrameTitles || ['ENGINEERING REPORT', 'EXECUTIVE SUMMARY', 'FIELD OBSERVATIONS', 'DOCUMENTATION PHOTOS']
    };
  } catch (error) {
    console.error('❌ AI frame title generation error:', error);
    
    // Fallback titles
    return {
      projectTitle: projectName || 'Engineering Field Report',
      sectionTitles: ['Executive Summary', 'Field Observations', 'Documentation Photos'],
      suggestedFrameTitles: ['ENGINEERING REPORT', 'EXECUTIVE SUMMARY', 'FIELD OBSERVATIONS', 'DOCUMENTATION PHOTOS']
    };
  }
}

export async function generateDynamicFrameTitle(
  content: string,
  pageType: 'cover' | 'summary' | 'observations' | 'photos' | 'analysis'
): Promise<string> {
  const pageContext = {
    cover: 'cover page with project overview',
    summary: 'executive summary section',
    observations: 'field observations and notes',
    photos: 'documentation photos section',
    analysis: 'technical analysis section'
  };

  try {
    const prompt = `Generate a concise, professional frame title for engineering reports. Keep it under 40 characters.

Content: ${content}
Page Type: ${pageContext[pageType]}
Generate a short frame title for the border header.`;

    const response = await generateText({
      system: 'Generate a concise, professional frame title for engineering reports. Keep it under 40 characters.',
      user: prompt,
      temperature: 0.2
    });

    return response.trim() || pageType.toUpperCase() + ' REPORT';
  } catch (error) {
    console.error('❌ AI dynamic frame title error:', error);
    return pageType.toUpperCase() + ' REPORT';
  }
}