# QUICK FIX - Remove PDF & Switch to OpenAI GPT-5

## What I Did:
✅ Replaced old GROQ agent files with GPT-5 versions
✅ Renamed files:
   - `summary_generator_gpt5.ts` → `summaryGenerator.ts`
   - `content_analyzer_gpt5.ts` → `contentAnalyzer.ts`
   - Old GROQ files backed up with `_OLD_` prefix

## What You Need to Do Now (2 Minutes):

### Step 1: Update Your Main Bot File
The correct file is: `api/telegram_webhook.ts` (with underscore, not hyphen)

This file already has:
- ✅ OpenAI API configured
- ✅ No PDF generation
- ❌ But it's not being used!

### Step 2: Rename to Active File
Run in PowerShell:

```powershell
cd C:\Users\tad.haby\projects\MyProj\field_report\field-report-bot\api

# Backup old one with PDF
Rename-Item -Path "_____telegram-webhook.ts" -NewName "OLD_WITH_PDF_telegram-webhook.ts"

# Make your clean version the main one
Rename-Item -Path "telegram_webhook.ts" -NewName "telegram-webhook.ts"
```

### Step 3: Install OpenAI Package
```powershell
cd ..
npm install openai --save
```

### Step 4: Update .env File
Edit `.env` and add:
```env
OPENAI_API_KEY=sk-proj-your_key_here
```

Get key from: https://platform.openai.com/api-keys

### Step 5: Rebuild & Run
```powershell
# Clean build
Remove-Item -Recurse -Force dist

# Rebuild TypeScript
npm run build

# Run bot
npm run start
```

## Expected Output:
```
✅ Bot is running with polling mode!
📡 Listening for messages...
🤖 AI-powered reports with OpenAI GPT-5!
💾 Storage: Telegram-only (No external database)
```

## Test:
1. Send `/start` in Telegram
2. Send test note: "Tested hydraulic pump"
3. Send `/exportword`
4. Should get ONLY Word document (no PDF)

## If Still Getting PDFs:
The old `_____telegram-webhook.ts` has PDF code. Make sure it's renamed and NOT being compiled.

Check what's in dist/:
```powershell
dir dist\api\telegram-webhook.js
```

If it still has PDF code, delete dist/ folder and rebuild.
