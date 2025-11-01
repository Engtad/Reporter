// src/agents/professionalReportGenerator.ts
import { sendReportToTelegram } from '../utils/telegramUpload.js';



import { professionalReportTemplate } from '../templates/professionalReport.js';
import { professionalWordReportTemplate } from '../templates/professionalWordReport.js';
import { Packer } from 'docx';

import type { FieldReportSession, FieldInput, Photo } from '../types/index.js';



export interface ProfessionalReportData {
  client: string;
  site: string;
  technician: string;
  date: string;
  time: string;
  units: string;
  notes: string[];
  photos: Array<{ path: string; caption: string }>;
  intelligentSummary?: any;
  metadata?: {
    startTime?: string;
    scopeType?: string;
  };
}


export async function generateProfessionalHTML({
  session,
  inputs,
  photos
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
}): Promise<{ buffer: Buffer; filename: string }> {
  // Prepare data for professional template
  const reportData = prepareReportData(session, inputs, photos);

  // Generate HTML using professional template
  const html = professionalReportTemplate(reportData);

  // Convert HTML to buffer
  const buffer = Buffer.from(html, 'utf-8');
  const filename = `professional_report_${session.id}_${Date.now()}.html`;

  return { buffer, filename };
}

export async function generateProfessionalWord({
  session,
  inputs,
  photos
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
}): Promise<{ buffer: Buffer; filename: string }> {
  // Prepare data for professional template
  const reportData = prepareReportData(session, inputs, photos);
  
  // Generate Word document using professional template
  const doc = professionalWordReportTemplate(reportData);
  const buffer = await Packer.toBuffer(doc);
  
  const filename = `professional_report_${session.id}_${Date.now()}.docx`;
  
  return { buffer, filename };
}

function prepareReportData(
  session: FieldReportSession, 
  inputs: FieldInput[], 
  photos: Photo[]
): ProfessionalReportData {
  const notes = inputs
    .map(input => input.cleaned_content || input.raw_content || '')
    .filter(Boolean);
    
  // Convert Photo[] to the expected photos format
  const photosFormatted = photos.map(photo => ({
    path: photo.storage_url || '',
    caption: photo.caption || ''
  }));
  
  return {
    client: session.client_name || 'Client Name',
    site: session.site_name || 'Site Location',
    technician: `@${session.telegram_username || session.telegram_user_id}`,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    units: '',
    notes,
    photos: photosFormatted
  };
}
// Telegram-only delivery (no Supabase)
export async function storeProfessionalReport(
  buffer: Buffer,
  fileName: string,
  session: any,
  ctx?: any
): Promise<{ file_id: string; message_id: number; publicUrl: string }> {
  const chatId = (ctx?.chat?.id ?? session?.telegram_chat_id ?? session?.telegram_user_id);
  if (!chatId) throw new Error('Missing Telegram chat id for delivery');
  const mimeType = fileName.endsWith('.html') ? 'text/html' : 'application/pdf';
  const sent = await sendReportToTelegram(buffer, fileName, chatId, 'Your report is ready.', mimeType);
  const publicUrl = 'sent-via-telegram';
  return { file_id: sent.file_id, message_id: sent.message_id, publicUrl };
}
