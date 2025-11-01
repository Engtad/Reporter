# 📱 Client Onboarding Guide - Field Report Bot

## For: Redwood Materials Inspection Teams
**Purpose**: Use Telegram Bot for hydraulic system field reports

---

## 🎯 What You'll Get

✅ **Mobile & Desktop Access** - Use on phone and laptop  
✅ **AI-Powered Reports** - Automatic analysis of findings  
✅ **PDF & Word Exports** - Professional inspection reports  
✅ **Photo Documentation** - Attach equipment photos  
✅ **Fast & Simple** - No complex software needed  

---

## 📱 PART 1: Install Telegram on Your Phone

### For iPhone Users (iOS)

1. **Open App Store**
   - Tap the blue App Store icon

2. **Search for Telegram**
   - Tap search icon at bottom
   - Type "Telegram"
   - Look for app with blue paper plane icon

3. **Download**
   - Tap "GET" button
   - May need Face ID / Touch ID
   - Wait for download (30-60 seconds)

4. **Open Telegram**
   - Tap "OPEN" or find Telegram icon on home screen
   - Tap to launch

5. **Sign Up / Login**
   - Enter your phone number
   - Include country code (USA: +1)
   - Example: `+1 775 555 0123`
   - Tap "Next"

6. **Enter Verification Code**
   - You'll receive SMS with 5-digit code
   - Enter code
   - No password needed!

7. **Add Your Name**
   - First name (required)
   - Last name (optional)
   - Tap "Next"

✅ **Done!** Telegram is ready on your phone.

---

### For Android Users

1. **Open Google Play Store**
   - Tap Play Store icon (colorful triangle)

2. **Search for Telegram**
   - Tap search bar at top
   - Type "Telegram"
   - Select "Telegram Messenger"

3. **Install**
   - Tap "Install"
   - Wait for download (30-60 seconds)

4. **Open Telegram**
   - Tap "Open" or find on home screen

5. **Sign Up / Login**
   - Follow same steps as iPhone (steps 5-7 above)

✅ **Done!** Telegram is ready on your phone.

---

## 💻 PART 2: Install Telegram on Laptop/Desktop

### For Windows Users

1. **Download Telegram**
   - Open web browser
   - Go to: **https://desktop.telegram.org**
   - Click "Get Telegram for Windows"

2. **Install**
   - Open downloaded file (`TelegramSetup.exe`)
   - Click "Yes" if asked by Windows
   - Installation is automatic (30 seconds)

3. **Login**
   - Telegram opens automatically
   - Click "START MESSAGING"
   - Enter your phone number
   - Same number used on phone!
   - Example: `+1 775 555 0123`

4. **Verify on Phone**
   - Open Telegram on your phone
   - You'll see popup asking to confirm login
   - Tap "Confirm"

✅ **Done!** Telegram is synced across phone and laptop.

---

### For Mac Users

1. **Download Telegram**
   - Go to: **https://desktop.telegram.org**
   - Click "Get Telegram for macOS"

2. **Install**
   - Open downloaded file
   - Drag Telegram icon to Applications folder
   - Open Telegram from Applications

3. **Login**
   - Same steps as Windows (steps 3-4 above)

✅ **Done!** Telegram ready on Mac.

---

### Using Telegram Web (No Installation)

**Don't want to install software?**
1. Go to: **https://web.telegram.org**
2. Login with phone number
3. Works in any browser!

⚠️ **Note**: Files may download differently in web version

---

## 🤖 PART 3: Find and Start the Bot

### Step 1: Open Telegram
- On phone: Tap Telegram icon
- On computer: Click Telegram in taskbar/dock

### Step 2: Search for Bot
1. **Tap/Click** the search icon (magnifying glass) at top
2. **Type**: `@YOUR_BOT_NAME_bot`
   - Your trainer will provide exact bot name
   - Example: `@FlodraulicFieldBot`

### Step 3: Start Conversation
1. **Tap/Click** on the bot name in search results
2. **Tap/Click** the "START" button at bottom
3. Bot sends welcome message immediately

✅ **You're connected!** Bot is ready to use.

---

## 📝 PART 4: Create Your First Report

### Example: Hydraulic Pump Inspection

**1. Start Bot Session**
```
You: /start
```
Bot responds:
```
👋 Welcome to Field Report Bot!

Send me:
📝 Text notes about your field work
📷 Photos to document your inspection
```

---

**2. Send Inspection Notes**

Type your findings as separate messages:
```
You: Hydraulic pump HP-4500 inspection started at 9:30 AM

You: System pressure: 3800 PSI (normal range)

You: Oil temperature: 175°F

You: Minor leak detected at coupling B-23

You: Oil level: 80% (recommend top-off)

You: Filter condition: Clean, last changed 2 weeks ago
```

After each note, bot confirms:
```
✅ Note 1 saved!
📊 Current session:
• 1 note(s)
• 0 photo(s)
```

---

**3. Add Photos** (Optional but Recommended)

- Take photo with phone camera
- Open Telegram
- Tap 📎 (attachment icon)
- Select photo
- Add caption (description)
- Send

Example captions:
- "Leak at coupling B-23"
- "Pressure gauge reading"
- "Oil condition - amber color"

---

**4. Set Report Type** (Optional)

```
You: /setscope
```

Bot shows options:
```
1️⃣ Initial Site Visit
2️⃣ Repair Report
3️⃣ Warranty Inspection
4️⃣ Follow-up Report
5️⃣ Preventive Maintenance
6️⃣ Emergency Service
```

Reply with number:
```
You: 5
```

Bot confirms:
```
✅ Report scope set to: Preventive Maintenance
```

---

**5. Generate Report**

```
You: /exportword
```

Bot works for 30-45 seconds:
```
🤖 Step 1/3: Analyzing notes with AI... (15-20 seconds)
✅ Analysis complete!
🔴 Critical: 0
🟡 Warnings: 1
🟢 Normal: 5

🤖 Step 2/3: Generating summaries... (10-15 seconds)
📄 Step 3/3: Creating reports...
```

Then bot sends **TWO files**:
- 📕 **PDF Report** (for printing/sharing)
- 📘 **Word Report** (for editing)

---

**6. Download Your Reports**

**On Phone:**
- Tap PDF or Word file
- Opens in viewer
- Tap "Share" to send via email
- Or tap "Save" to device

**On Computer:**
- Right-click file
- Select "Download"
- Files save to Downloads folder

---

**7. Start New Report**

```
You: /clear
```

Bot confirms:
```
🗑️ Session cleared!
Start fresh by sending new notes and photos.
```

---

## 💡 Best Practices

### ✅ DO:
- **Send multiple notes** before generating report
- **Include specific numbers** (pressure, temp, time)
- **Add photos with captions** for clarity
- **Use /setscope** to categorize report type
- **Clear session** after each inspection with `/clear`

### ❌ DON'T:
- Don't generate report with only 1 note
- Don't use unclear abbreviations
- Don't forget to /clear between different jobs
- Don't send photos without captions

---

## 🔧 Common Tasks Quick Reference

| Task | Command |
|------|---------|
| Start new session | `/start` |
| Add inspection note | Just type message |
| Add photo | Tap 📎 → select photo |
| Set report type | `/setscope` → choose number |
| Set time | `/settime` |
| Generate reports | `/exportword` |
| Clear & start fresh | `/clear` |
| Get help | `/help` |

---

## 📖 Real-World Example

### Scenario: Preventive Maintenance on Rotary Kiln

**Technician sends:**
```
/start

Rotary kiln RK-2000 preventive maintenance

/setscope
5

Temperature outer shell: 220°F (normal)

Temperature inner refractory: 1800°F (normal)

Rotation speed: 2.5 RPM (within spec)

[sends photo of drive motor]

Drive motor vibration: 0.3 mm/s (acceptable)

Bearing temperature front: 145°F

Bearing temperature rear: 152°F

Small crack detected in refractory at 3 o'clock position

[sends photo of crack]

Recommend refractory patch repair within 30 days

/exportword
```

**Bot generates:**
- Professional PDF with photos
- Editable Word document
- AI analysis: 1 warning (crack), rest normal
- Equipment identified: RK-2000
- Maintenance type: Preventive

**Technician:**
- Downloads reports
- Emails to supervisor
- Attaches to work order
- Uses /clear for next inspection

---

## 🚨 Troubleshooting

### Can't Find Bot
**Problem**: Search doesn't show bot  
**Fix**: 
- Make sure bot username is correct (include @)
- Ask trainer for exact bot name
- Check internet connection

### Bot Doesn't Respond
**Problem**: Messages sent but no reply  
**Fix**:
- Press "START" button first
- Check if bot is online (ask admin)
- Try `/start` command

### Report Generation Fails
**Problem**: Bot says error during /exportword  
**Fix**:
- Use `/clear` and start fresh
- Make sure you sent at least 1 note
- Try again in 30 seconds

### Can't Download Files
**Problem**: Files won't open or download  
**Fix**:
- Make sure you have internet
- Try right-click → Save As (computer)
- On phone: tap Share → Save to Files

### Photos Won't Send
**Problem**: Photos fail to upload  
**Fix**:
- Check internet connection
- Use smaller photos (< 10MB)
- Try sending one photo at a time

---

## 📞 Support

### Need Help?
**Contact your site supervisor or:**
- Email: [your-support-email]
- Phone: [your-support-number]
- Available: Monday-Friday, 8 AM - 5 PM PST

### During Demo/Training
- Raise your hand
- Ask questions anytime
- Practice with sample inspection

---

## 📋 Pre-Demo Checklist

Before the training session, please complete:

- [ ] Telegram installed on phone
- [ ] Telegram installed on laptop (or web version ready)
- [ ] Logged in with same phone number on both
- [ ] Have phone ready with good signal
- [ ] Have laptop charged and connected to WiFi
- [ ] Bring sample notes from recent inspection (optional)

---

## 🎓 Training Session Agenda

**Duration**: 30 minutes

1. **Introduction** (5 min)
   - Why use bot vs manual reports
   - Benefits for field teams

2. **Live Demo** (10 min)
   - Presenter shows real inspection report
   - From notes → generated report

3. **Hands-On Practice** (10 min)
   - Everyone creates sample report
   - Instructor helps troubleshoot

4. **Q&A** (5 min)
   - Your questions answered

---

## 📊 Why Use This Bot?

### Old Way (Manual Reports):
❌ 30-45 minutes writing per report  
❌ Inconsistent format  
❌ Easy to forget details  
❌ Handwriting hard to read  
❌ Photos separate from report  

### New Way (Bot):
✅ 5 minutes total (just send notes)  
✅ Professional consistent format  
✅ AI organizes your notes  
✅ Typed, clear, searchable  
✅ Photos embedded in report  

**Time Saved**: 25-40 minutes per report  
**Quality**: Professional, consistent, complete  

---

## 🎉 You're Ready!

After reading this guide, you can:
- ✅ Install Telegram on phone and computer
- ✅ Find and start the bot
- ✅ Create inspection reports
- ✅ Add photos and notes
- ✅ Generate professional PDF/Word reports
- ✅ Download and share reports

**Questions?** Ask during training session!

**Ready to start?** Follow Part 1 above to install Telegram now!

---

## 📎 Quick Links

- **Telegram Download**: https://telegram.org/apps
- **Telegram Web**: https://web.telegram.org
- **Support Email**: [your-email]
- **Training Video**: [link-if-available]

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**For**: Redwood Materials Field Teams
