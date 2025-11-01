# 🤖 How to Use Your Fixed Telegram Bot

## Quick Start

### 1. Rebuild the Bot
Open Command Prompt in your project folder and run:
```bash
npm run build
```

### 2. Start the Bot
Run one of these:

**Option A - Using the batch file (easiest):**
```bash
run-bot.bat
```

**Option B - Manual command:**
```bash
node dist/api/telegram-webhook.js
```

You should see:
```
✅ Bot is running with polling mode!
📡 Listening for messages...
🤖 AI-powered Flodraulic reports ready!
💾 Storage: Telegram-only (No external database)
```

---

## Using the Bot in Telegram

### Step 1: Start a Session
Open your Telegram bot and send:
```
/start
```

You'll see:
```
👋 Welcome to Field Report Bot!

Send me:
📝 Text notes about your field work
📷 Photos to document your inspection

📄 Commands:
/settime - Set inspection start time
/setscope - Set report type
/exportword - Generate Word + PDF (AI-cleaned)
/clear - Clear current session
/help - Show all commands
```

---

### Step 2: Add Notes
Send text messages about your inspection:

**Example:**
```
Hydraulic system pressure: 3500 PSI
Temperature: 180°F
Oil level: Normal
Small leak detected at fitting A3
```

After each note, the bot confirms:
```
✅ Note 1 saved!

📊 Current session:
• 1 note(s)
• 0 photo(s)
```

---

### Step 3: Add Photos (Optional)
Send photos of equipment:
- Take a photo with your phone
- Send to bot with caption (e.g., "Leak at fitting A3")
- Bot confirms:
```
📷 Photo 1 saved!
📝 Caption: "Leak at fitting A3"
```

---

### Step 4: Set Report Type (Optional)
```
/setscope
```

Reply with number:
```
1️⃣ Initial Site Visit Inspection
2️⃣ Repair Report
3️⃣ Warranty Inspection
4️⃣ Follow-up Report
5️⃣ Preventive Maintenance
6️⃣ Emergency Service Call
```

Example: Type `2` for Repair Report

---

### Step 5: Generate Reports
```
/exportword
```

The bot will:
1. Analyze your notes with AI (15-20 seconds)
2. Generate summaries (10-15 seconds)
3. Create PDF and Word files
4. **Send both files directly to you in Telegram**

You'll receive:
```
📕 PDF Report - Flodraulic Field Inspection
📘 Word Report - Flodraulic Field Inspection
```

---

## Example Full Workflow

```
User: /start
Bot: 👋 Welcome to Field Report Bot!

User: Inspected hydraulic pump HP-2000
User: Pressure reading: 3200 PSI
User: Temperature: 165°F
User: Small vibration detected

User: [sends photo of pump]

User: /setscope
User: 5  (Preventive Maintenance)

User: /exportword
Bot: 🤖 Step 1/3: Analyzing notes with AI...
Bot: ✅ Analysis complete!
     🔴 Critical: 0
     🟡 Warnings: 1
     🟢 Normal: 3
Bot: 🤖 Step 2/3: Generating summaries...
Bot: 📄 Step 3/3: Creating reports...
Bot: [sends PDF file]
Bot: [sends Word file]
Bot: ✅ Reports Generated Successfully!
     📊 Summary:
     • Total Notes: 4
     • Critical Issues: 0
     • Warnings: 1
     • Equipment: HP-2000
```

---

## Commands Reference

| Command | What It Does |
|---------|--------------|
| `/start` | Begin new session or check current status |
| `/settime` | Set inspection start time (auto-sets to now) |
| `/setscope` | Choose report type (maintenance, repair, etc.) |
| `/exportword` | Generate and send PDF + Word reports |
| `/clear` | Delete current session and start fresh |
| `/help` | Show command list |

---

## Tips for Best Results

### ✅ Good Practices
- Send multiple detailed notes before generating report
- Include specific measurements (pressure, temperature, etc.)
- Add photos with descriptive captions
- Use /setscope to categorize your report
- Use /settime if inspection started earlier

### ❌ Avoid
- Generating report with only 1 note
- Using abbreviations without context
- Forgetting to /clear between different inspections

---

## Troubleshooting

### Bot doesn't respond
- Check if bot is running in Command Prompt
- Look for "✅ Bot is running" message
- Restart with `run-bot.bat`

### Report generation fails
- Use `/clear` to start fresh
- Check GROQ_API_KEY in .env file
- Ensure you have at least 1 note

### Files not sent
- Check your internet connection
- Verify BOT_TOKEN in .env is correct
- Look for error messages in Command Prompt

---

## File Locations

- **Source Code**: `api/telegram-webhook.ts`
- **Compiled Code**: `dist/api/telegram-webhook.js`
- **Temp Photos**: `temp/photo-*.jpg` (auto-deleted)
- **Reports**: Sent via Telegram (no local storage)

---

## What Changed?

✅ **Fixed**: Removed Supabase database requirement  
✅ **Fixed**: Files now sent directly via Telegram  
✅ **Fixed**: No more RLS policy errors  
✅ **Improved**: Faster file delivery  
✅ **Simplified**: No cloud database setup needed  

---

## Need Help?

Check these files:
- `FIXES_APPLIED.md` - What was changed
- `CODE_COMPARISON.md` - Before/after code
- `README.md` - Original project docs

Your bot is now database-free and ready to use! 🎉
