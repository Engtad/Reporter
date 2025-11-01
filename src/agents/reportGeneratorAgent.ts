// src/agents/reportGeneratorAgent.ts
import { sendReportToTelegram } from '../utils/telegramUpload.js';
import type { FieldInput, Photo, FieldReportSession } from '../types/index';

// Simple section title helper
function sectionTitle(doc: any, title: string) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(16).text(title);
  doc.moveDown(0.25);
  doc.strokeColor('#CCCCCC').moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
  doc.font('Helvetica').fontSize(11);
}

// Convert a PDFKit document to a single Buffer
async function streamToBuffer(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: any) => reject(err));
  });
}

// Fetch an image as Buffer for embedding
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

// Main: generate a report HTML Buffer
export async function generateReportHTML({
  session,
  inputs,
  photos,
  units = 'both'
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
  units?: 'imperial' | 'metric' | 'both';
}): Promise<{ buffer: Buffer; filename: string }> {
  const summaryText =
    inputs
      .slice(-5)
      .map((i) => i.cleaned_content || i.raw_content || '')
      .filter(Boolean)
      .join(' ')
      .slice(0, 800) || 'Summary based on latest site notes and observations.';

  const conditions = inputs.find((i) => (i.raw_content || '').toLowerCase().includes('site'));
  const conditionsText = conditions ? conditions.cleaned_content || conditions.raw_content : '';

  const work = inputs.map((i) => i.cleaned_content || i.raw_content || '').filter(Boolean).map((t) => `<li>${t}</li>`).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Field Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        ul { padding-left: 20px; }
        .photo { margin: 20px 0; text-align: center; }
        .photo img { max-width: 500px; border: 1px solid #ccc; }
        .caption { font-style: italic; color: #666; }
      </style>
    </head>
    <body>
      <h1>Engineering Field Report</h1>
      <p><strong>Client:</strong> ${session.client_name || 'N/A'}</p>
      <p><strong>Site:</strong> ${session.site_name || 'N/A'}</p>
      <p><strong>Technician:</strong> @${session.telegram_username || session.telegram_user_id}</p>
      <p><strong>Units:</strong> ${units === 'both' ? 'Metric & Imperial' : units === 'metric' ? 'Metric' : 'Imperial'}</p>

      <h2>Executive Summary</h2>
      <p>${summaryText}</p>

      <h2>Scope</h2>
      <p>This report documents site conditions, work performed, and recommendations.</p>

      <h2>Site Conditions</h2>
      ${conditionsText ? `<p>Notes: ${conditionsText}</p>` : '<p>No specific site conditions noted.</p>'}

      <h2>Work Performed</h2>
      <ul>
        ${work || '<li>Inspected equipment and documented observations.</li>'}
      </ul>

      ${photos.length > 0 ? `
        <h2>Photos</h2>
        ${photos.map(p => `
          <div class="photo">
            <img src="${p.storage_url || ''}" alt="Field photo">
            <div class="caption">${p.caption || ''}</div>
          </div>
        `).join('')}
      ` : ''}

      <h2>Final Inspection</h2>
      <p>Final inspection confirms equipment status and compliance with work scope.</p>

      <h2>Recommendations</h2>
      <ul>
        <li>Monitor vibration and temperature trends over next 7 days.</li>
        <li>Schedule preventive maintenance based on manufacturer guidance.</li>
        <li>Review parts inventory for critical spares.</li>
      </ul>
    </body>
    </html>
  `;

  const buffer = Buffer.from(html, 'utf-8');
  const filename = `report_${session.id}_${Date.now()}.html`;
  return { buffer, filename };
}

// Store by sending to Telegram (no Supabase)
export async function storeReportToTelegram(buffer: Buffer, filename: string, session: FieldReportSession): Promise<{ file_id: string; message_id: number }> {
  const chatId = (session as any).telegram_chat_id ?? session.telegram_user_id;
  if (!chatId) throw new Error('telegram_chat_id or telegram_user_id is required on session');
  const mimeType = filename.endsWith('.html') ? 'text/html' : 'application/pdf';
  return await sendReportToTelegram(buffer, filename, chatId, 'Your report is ready.', mimeType);
}
