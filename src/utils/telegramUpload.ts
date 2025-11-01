// src/utils/telegramUpload.ts
// Minimal typed wrapper for Telegram Bot API sendDocument.
// Response: { ok: boolean, result?: Message }
type TelegramApiError = { ok: false; error_code?: number; description?: string };
type TelegramDocument = { file_id: string };
type TelegramMessage = { message_id: number; document?: TelegramDocument };
type TelegramApiOk<T> = { ok: true; result: T };
type TelegramApiResponse<T> = TelegramApiOk<T> | TelegramApiError;

export async function sendReportToTelegram(
  buffer: Buffer,
  filename: string,
  chatId: string | number,
  caption?: string,
  mimeType: string = 'application/pdf'
): Promise<{ file_id: string; message_id: number }> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN missing');

  const endpoint = `https://api.telegram.org/bot${token}/sendDocument`;

  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('document', new Blob([buffer], { type: mimeType }), filename);
  if (caption) form.append('caption', caption);

  const res = await fetch(endpoint, { method: 'POST', body: form });
  const json = (await res.json()) as TelegramApiResponse<TelegramMessage>;

  if (!('ok' in json) || json.ok !== true) {
    const msg = (json as TelegramApiError).description ?? 'unknown error';
    const code = (json as TelegramApiError).error_code ?? 0;
    throw new Error(`Telegram sendDocument failed: ${msg} (${code})`);
  }

  const msg = json.result;
  const fileId = msg.document?.file_id;
  if (!fileId) throw new Error('Telegram response missing document.file_id');

  return { file_id: fileId, message_id: msg.message_id };
}
