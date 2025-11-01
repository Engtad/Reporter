import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Packer } from 'docx';
import { professionalWordReportTemplate } from '../src/templates/professionalWordReport.js';
import { cleanUserSessionFiles, cleanOldTempFiles } from '../src/utils/cleanup.js';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ============================================
// TYPE DEFINITIONS
// ============================================
interface UserSession {
  notes: string[];
  photos: Array<{ 
    id: string;
    path: string;
    caption: string 
  }>;
  metadata: {
    client?: string;
    site?: string;
    technician?: string;
    units?: string;
    startTime?: string;
    scopeType?: string;
  };
}

const sessions = new Map<string, UserSession>();

// ============================================
// COMMAND HANDLERS
// ============================================

// SET TIME COMMAND
bot.command('settime', async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (!sessions.has(userId)) {
    await ctx.reply('❌ Please use /start first to create a new session.');
    return;
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  sessions.get(userId)!.metadata.startTime = timeString;
  await ctx.reply(`⏰ Inspection start time set to: ${timeString}\n\nYou can manually change this by editing the report after generation.`);
});

// SET SCOPE COMMAND
bot.command('setscope', async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (!sessions.has(userId)) {
    await ctx.reply('❌ Please use /start first to create a new session.');
    return;
  }

  const scopeTypes = `📋 **Set Report Scope**\n\nReply with the number of your report type:\n\n1️⃣ Initial Site Visit Inspection\n2️⃣ Repair Report\n3️⃣ Warranty Inspection\n4️⃣ Follow-up Report\n5️⃣ Preventive Maintenance\n6️⃣ Emergency Service Call\n\nExample: Just type **2** for Repair Report`;
  
  await ctx.reply(scopeTypes, { parse_mode: 'Markdown' });
});

// SCOPE SELECTION HANDLER
bot.hears(/^[1-6]$/, async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (!sessions.has(userId)) {
    return;
  }

  const scopeMap: { [key: string]: string } = {
    '1': 'initial',
    '2': 'repair',
    '3': 'warranty',
    '4': 'followup',
    '5': 'preventive',
    '6': 'emergency'
  };
  
  const scopeNames: { [key: string]: string } = {
    '1': 'Initial Site Visit Inspection',
    '2': 'Repair Report',
    '3': 'Warranty Inspection',
    '4': 'Follow-up Report',
    '5': 'Preventive Maintenance',
    '6': 'Emergency Service Call'
  };

  const choice = ctx.message.text;
  sessions.get(userId)!.metadata.scopeType = scopeMap[choice];
  await ctx.reply(`✅ Report scope set to: **${scopeNames[choice]}**`, { parse_mode: 'Markdown' });
});

// START COMMAND
bot.start((ctx) => {
  const userId = ctx.from.id.toString();
  console.log(`✅ User started: ${ctx.from.first_name}`);

  if (!sessions.has(userId)) {
    sessions.set(userId, { 
      notes: [], 
      photos: [], 
      metadata: {} 
    });
  }

  const session = sessions.get(userId)!;
  ctx.reply(
    '👋 Welcome to Field Report Bot!\n\n' +
    'Send me:\n' +
    '📝 Text notes about your field work\n' +
    '📷 Photos to document your inspection\n\n' +
    '📄 Commands:\n' +
    '/settime - Set inspection start time\n' +
    '/setscope - Set report type\n' +
    '/exportword - Generate Word document (AI-powered)\n' +
    '/clear - Clear current session\n' +
    '/help - Show all commands\n\n' +
    `📊 Current session: ${session.notes.length} note(s), ${session.photos.length} photo(s)\n\n` +
    '🤖 Powered by FutureZ AI Agents Pipeline\n' +
    '✨ Enhanced with professional text cleaning & photo organization'
  );
});

// HELP COMMAND
bot.help((ctx) => {
  console.log(`📋 Help requested by ${ctx.from.first_name}`);
  ctx.reply(
    '📋 Available Commands:\n\n' +
    '/start - Start bot & show current session\n' +
    '/settime - Set inspection start time\n' +
    '/setscope - Set report type\n' +
    '/exportword - Generate Word document (AI-powered)\n' +
    '/clear - Clear session data\n' +
    '/help - Show this message\n\n' +
    '💡 Tip: Send multiple notes and photos before generating reports!\n' +
    '🤖 4-Agent AI Pipeline:\n' +
    '  1️⃣ Text Cleaner - Professionalizes notes\n' +
    '  2️⃣ Content Analyzer - Categorizes & extracts data\n' +
    '  3️⃣ Summary Generator - Creates report sections\n' +
    '  4️⃣ Photo Organizer - Structures before/during/after'
  );
});

// CLEAR COMMAND
bot.command('clear', async (ctx) => {
  const userId = ctx.from.id.toString();
  const session = sessions.get(userId);

  // Clean up temp photos before clearing session
  if (session && session.photos.length > 0) {
    await cleanUserSessionFiles(session.photos);
  }

  sessions.delete(userId);
  console.log(`🗑️ Session cleared for ${ctx.from.first_name}`);
  await ctx.reply(
    '🗑️ Session cleared!\n\n' +
    'Start fresh by sending new notes and photos.'
  );
});

// EXPORT WORD COMMAND (WITH ENHANCED 4-AGENT PIPELINE)
bot.command('exportword', async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (!sessions.has(userId) || sessions.get(userId)!.notes.length === 0) {
    await ctx.reply('📝 No notes found! Send some text messages first, then try /exportword again.');
    return;
  }

  const session = sessions.get(userId)!;
  
  try {
    // ==========================================
    // STEP 1: CLEAN RAW FIELD NOTES (NEW!)
    // ==========================================
    await ctx.reply('🧹 Step 1/4: Cleaning field notes with AI... (30 seconds)');
    
    const { cleanFieldText } = await import('../src/agents/dataCleanerAgent.js');
    
    const cleanedNotes: string[] = [];
    for (let i = 0; i < session.notes.length; i++) {
      try {
        const result = await cleanFieldText(session.notes[i]);
        cleanedNotes.push(result.cleaned);
        console.log(`✅ Cleaned note ${i + 1}/${session.notes.length}`);
      } catch (err) {
        console.error(`❌ Failed to clean note ${i}:`, err);
        cleanedNotes.push(session.notes[i]); // Fallback to raw
      }
    }
    
    await ctx.reply(`✅ Notes cleaned and professionalized!\n\n🤖 Step 2/4: Analyzing with FutureZ AI... (70 seconds)`);
    
    // ==========================================
    // STEP 2: ANALYZE CLEANED NOTES
    // ==========================================
    const { SummaryGenerator } = await import('../src/agents/summaryGenerator.js');
    const { ContentAnalyzer } = await import('../src/agents/contentAnalyzer.js');

    const analyzer = new ContentAnalyzer(OPENAI_API_KEY);
    const analysisResult = await analyzer.analyzeNotes(cleanedNotes); // Use CLEANED notes!

    await ctx.reply(
      `✅ Analysis complete!\n` +
      `🔴 Critical: ${analysisResult.summary.criticalCount}\n` +
      `🟡 Warnings: ${analysisResult.summary.warningCount}\n` +
      `🟢 Normal: ${analysisResult.summary.normalCount}\n\n` +
      `🤖 Step 3/4: Generating intelligent summaries... (90 seconds)`
    );

    // ==========================================
    // STEP 3: GENERATE INTELLIGENT SUMMARIES
    // ==========================================
    const summaryGen = new SummaryGenerator(OPENAI_API_KEY);
    const intelligentSummary = await summaryGen.generateIntelligentSummary(
      analysisResult.notes,
      session.photos,
      session.metadata.scopeType
    );

    await ctx.reply('📄 Step 4/4: Organizing photos & creating document...');

    // ==========================================
    // STEP 4: ORGANIZE PHOTOS BY CATEGORY (NEW!)
    // ==========================================
    const { categorizePhoto } = await import('../src/agents/photoOrganizerAgent.js');
    
    const organizedPhotos = session.photos.map(photo => ({
      ...photo,
      category: categorizePhoto(photo.caption)
    }));

    // Group photos by category
    const photosByCategory = {
      cover: organizedPhotos.filter(p => p.category === 'cover'),
      before: organizedPhotos.filter(p => p.category === 'before'),
      during: organizedPhotos.filter(p => p.category === 'during'),
      after: organizedPhotos.filter(p => p.category === 'after'),
      final: organizedPhotos.filter(p => p.category === 'final'),
      uncategorized: organizedPhotos.filter(p => p.category === 'uncategorized')
    };

    console.log('📸 Photo organization:');
    console.log(`  Cover: ${photosByCategory.cover.length}`);
    console.log(`  Before: ${photosByCategory.before.length}`);
    console.log(`  During: ${photosByCategory.during.length}`);
    console.log(`  After: ${photosByCategory.after.length}`);
    console.log(`  Final: ${photosByCategory.final.length}`);
    console.log(`  Uncategorized: ${photosByCategory.uncategorized.length}`);

    // ==========================================
    // STEP 5: GENERATE WORD REPORT
    // ==========================================
    const reportData = {
      client: session.metadata.client || '',
      site: session.metadata.site || '',
      technician: session.metadata.technician || ctx.from.username || 'Unknown',
      date: new Date().toLocaleDateString(),
      time: session.metadata.startTime || new Date().toLocaleTimeString(),
      units: session.metadata.units || '',
      notes: cleanedNotes, // Use CLEANED notes!
      rawNotes: session.notes, // Keep raw for reference
      photos: session.photos,
      photosByCategory: photosByCategory, // NEW! Organized photos
      intelligentSummary: intelligentSummary,
      metadata: session.metadata
    };

    const timestamp = Date.now();

    // Generate Word document
    const wordDoc = professionalWordReportTemplate(reportData);
    const wordBuffer = await Packer.toBuffer(wordDoc);
    const wordFileName = `flodraulic-report-${userId}-${timestamp}.docx`;
    
    // Send Word via Telegram
    await ctx.replyWithDocument(
      { source: wordBuffer, filename: wordFileName },
      { caption: '📘 Enhanced Professional Report - Flodraulic Field Inspection' }
    );

    // Extract equipment for summary
    const equipmentList = analyzer.getAllEquipment(analysisResult.notes);
    const equipmentText = equipmentList.length > 0 ? equipmentList.slice(0, 3).join(', ') : 'None detected';

    // Photo summary
    const photoSummary = [
      photosByCategory.cover.length > 0 ? `${photosByCategory.cover.length} cover` : '',
      photosByCategory.before.length > 0 ? `${photosByCategory.before.length} before` : '',
      photosByCategory.during.length > 0 ? `${photosByCategory.during.length} during` : '',
      photosByCategory.after.length > 0 ? `${photosByCategory.after.length} after` : '',
      photosByCategory.final.length > 0 ? `${photosByCategory.final.length} final` : ''
    ].filter(Boolean).join(', ');

    // Send completion message
    await ctx.reply(
      `✅ **Enhanced Report Generated!**\n\n` +
      `📊 **Analysis:**\n` +
      `• Total Notes: ${analysisResult.summary.totalNotes}\n` +
      `• Critical Issues: ${analysisResult.summary.criticalCount}\n` +
      `• Warnings: ${analysisResult.summary.warningCount}\n` +
      `• Equipment: ${equipmentText}\n\n` +
      `📸 **Photos Organized:**\n` +
      `• ${photoSummary || 'No photos categorized'}\n\n` +
      `✨ **Quality Enhancements:**\n` +
      `• Professional language throughout\n` +
      `• Chronological photo timeline\n` +
      `• AI-powered recommendations\n\n` +
      `📄 Word document sent above ⬆️\n\n` +
      `🤖 Processed by 4-Agent AI Pipeline\n` +
      `Use /clear to start a new report.`,
      { parse_mode: 'Markdown' }
    );

    // Clean up user's temp photos after successful export
    if (session.photos.length > 0) {
      await cleanUserSessionFiles(session.photos);
      console.log('🧹 Cleaned up session photos after export');
    }

  } catch (error) {
    console.error('Report generation error:', error);
    await ctx.reply('❌ Error generating report. Please try /clear and start fresh.');
  }
});

// ============================================
// MESSAGE HANDLERS
// ============================================

// TEXT HANDLER (Field Notes)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  // Ignore commands
  if (text.startsWith('/')) {
    return;
  }

  const userId = ctx.from.id.toString();
  const userName = ctx.from.first_name || 'User';
  console.log(`📝 Text from ${userName}: ${text}`);

  // Initialize session if needed
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      notes: [],
      photos: [],
      metadata: {}
    });
    console.log(`🆕 New session created for ${userName}`);
  }

  const session = sessions.get(userId)!;
  session.notes.push(text);
  console.log(`✅ Note added. Total notes: ${session.notes.length}`);

  await ctx.reply(
    `✅ Note ${session.notes.length} saved!\n\n` +
    `📊 Current session:\n` +
    `• ${session.notes.length} note(s)\n` +
    `• ${session.photos.length} photo(s)\n\n` +
    `Type /exportword when ready to generate enhanced report.`
  );
});

// PHOTO HANDLER
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (!sessions.has(userId)) {
    await ctx.reply('❌ Please use /start first to create a new session.');
    return;
  }

  const session = sessions.get(userId)!;
  const caption = ctx.message.caption || 'No caption provided';

  try {
    // Get highest resolution photo
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

    // Download photo
    const response = await fetch(fileLink.href);
    const photoBuffer = Buffer.from(await response.arrayBuffer());

    // Generate unique photo ID
    const photoId = `photo-${userId}-${Date.now()}`;
    const photoPath = path.join(tempDir, `${photoId}.jpg`);
    fs.writeFileSync(photoPath, photoBuffer);

    // Store photo with BOTH path and id
    session.photos.push({
      id: photoId,
      path: photoPath,
      caption: caption
    });

    console.log(`💾 Photo ${session.photos.length} saved (${(photoBuffer.length / 1024).toFixed(1)}KB)`);

    await ctx.reply(
      `📷 Photo ${session.photos.length} saved!${caption ? `\n📝 Caption: "${caption}"` : ''}\n\n` +
      `📊 Current session:\n` +
      `• ${session.notes.length} note(s)\n` +
      `• ${session.photos.length} photo(s)\n\n` +
      `💡 Tip: Add keywords like "before", "during", "after" in captions for better organization!\n\n` +
      `Use /exportword when ready to generate report.`
    );

  } catch (error) {
    console.error('Photo download error:', error);
    await ctx.reply('❌ Failed to save photo. Please try again.');
  }
});

// ============================================
// AUTOMATIC CLEANUP SCHEDULER
// ============================================
// Run cleanup every 6 hours to remove old temp files
const CLEANUP_INTERVAL_HOURS = 6;
const CLEANUP_MAX_AGE_HOURS = 24;

setInterval(async () => {
  console.log('🧹 Running scheduled cleanup...');
  try {
    const deletedCount = await cleanOldTempFiles(CLEANUP_MAX_AGE_HOURS);
    console.log(`✅ Scheduled cleanup: ${deletedCount} old file(s) removed`);
  } catch (error) {
    console.error('❌ Scheduled cleanup error:', error);
  }
}, CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);

// Run initial cleanup on startup
(async () => {
  console.log('🧹 Running startup cleanup...');
  const deletedCount = await cleanOldTempFiles(CLEANUP_MAX_AGE_HOURS);
  console.log(`✅ Startup cleanup: ${deletedCount} old file(s) removed`);
})();

// ============================================
// START BOT
// ============================================
bot.launch();
console.log('✅ Bot is running with polling mode!');
console.log('📡 Listening for messages...');
console.log('🤖 Enhanced 4-Agent FutureZ AI:');
console.log('   1️⃣ dataCleanerAgent - Professionalizes field notes');
console.log('   2️⃣ ContentAnalyzer - Categorizes & extracts entities');
console.log('   3️⃣ SummaryGenerator - Creates report sections');
console.log('   4️⃣ photoOrganizerAgent - Organizes photo timeline');
console.log('💾 Storage: Telegram-only');
console.log(`🧹 Auto-cleanup: Every ${CLEANUP_INTERVAL_HOURS}h (files older than ${CLEANUP_MAX_AGE_HOURS}h)`);

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
