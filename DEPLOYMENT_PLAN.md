# 🚀 Cloud Deployment Plan - Telegram Field Report Bot

## Overview
This plan covers deploying your bot to the cloud so it runs 24/7 without your computer.

---

## ⚡ Quick Comparison - Cloud Options

| Platform | Cost | Setup Time | Best For | Difficulty |
|----------|------|------------|----------|------------|
| **Railway** | $5/month | 10 min | Easiest deployment | ⭐ Easy |
| **Render** | Free tier | 15 min | Zero cost option | ⭐⭐ Medium |
| **DigitalOcean** | $6/month | 30 min | Full control | ⭐⭐⭐ Advanced |
| **AWS EC2** | $8-15/month | 45 min | Enterprise-grade | ⭐⭐⭐⭐ Expert |

**Recommendation**: Start with **Railway** for demo/production (easiest, reliable)

---

## 🎯 OPTION 1: Railway (RECOMMENDED)

### Why Railway?
✅ Easiest setup (10 minutes)  
✅ Auto-restarts if bot crashes  
✅ Built-in monitoring  
✅ $5/month with $5 free trial  
✅ No credit card for trial  

### Step-by-Step Deployment

#### 1. Prepare Your Code
```bash
# Navigate to project folder
cd C:\Users\tad.haby\projects\MyProj\field_report\field-report-bot

# Make sure package.json has start script
npm run build
```

#### 2. Create Procfile
Create file named `Procfile` (no extension) in root folder:
```
worker: node dist/api/telegram-webhook.js
```

#### 3. Push to GitHub
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Prepare for Railway deployment"

# Create new GitHub repo (go to github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/field-report-bot.git
git branch -M main
git push -u origin main
```

#### 4. Deploy to Railway

**A. Sign up:**
- Go to https://railway.app
- Click "Start a New Project"
- Login with GitHub

**B. Deploy:**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `field-report-bot` repository
4. Railway auto-detects Node.js project

**C. Add Environment Variables:**
1. Click on your project
2. Go to "Variables" tab
3. Add these variables:
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   USE_SUPABASE=false
   ```

**D. Deploy:**
- Click "Deploy"
- Wait 2-3 minutes
- Check logs: Should see "✅ Bot is running"

**E. Test:**
- Open Telegram
- Send `/start` to your bot
- Should respond immediately!

#### 5. Monitor Your Bot
- Railway Dashboard → Your Project → Deployments
- View logs in real-time
- Check uptime and restarts

---

## 🎯 OPTION 2: Render (FREE)

### Why Render?
✅ Completely free tier  
✅ Good for demo/testing  
✅ Similar to Railway  
⚠️ Free tier sleeps after 15min inactivity  

### Deployment Steps

#### 1. Prepare Code
Same as Railway Option 1 - create Procfile and push to GitHub

#### 2. Deploy on Render

**A. Sign up:**
- Go to https://render.com
- Sign up with GitHub

**B. Create Web Service:**
1. Click "New +"
2. Select "Background Worker"
3. Connect your GitHub repo
4. Settings:
   - Name: `field-report-bot`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/api/telegram-webhook.js`

**C. Add Environment Variables:**
Same as Railway (see above)

**D. Deploy:**
- Click "Create Web Service"
- Wait 3-5 minutes
- Check logs for "✅ Bot is running"

⚠️ **Important**: Free tier sleeps after 15 min inactivity. For production, upgrade to $7/month plan.

---

## 🎯 OPTION 3: DigitalOcean Droplet (VPS)

### Why DigitalOcean?
✅ Full server control  
✅ $6/month reliable VPS  
✅ Good for production  
⚠️ Requires Linux knowledge  

### Deployment Steps

#### 1. Create Droplet
1. Sign up at https://digitalocean.com
2. Create Droplet:
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic $6/month (1GB RAM)
   - **Region**: Choose closest to your location
   - **Authentication**: SSH key (recommended) or password

#### 2. Connect to Server
```bash
ssh root@YOUR_DROPLET_IP
```

#### 3. Install Node.js
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

#### 4. Clone Your Code
```bash
# Install git
apt install git -y

# Clone repository
git clone https://github.com/YOUR_USERNAME/field-report-bot.git
cd field-report-bot

# Install dependencies
npm install

# Build
npm run build
```

#### 5. Set Environment Variables
```bash
nano .env
```

Paste:
```
BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
USE_SUPABASE=false
```

Save: `CTRL+X` → `Y` → `Enter`

#### 6. Install PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start dist/api/telegram-webhook.js --name "field-report-bot"

# Make it start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs
```

#### 7. Monitor & Manage
```bash
# View logs
pm2 logs field-report-bot

# Restart bot
pm2 restart field-report-bot

# Stop bot
pm2 stop field-report-bot

# Monitor resources
pm2 monit
```

---

## 🎯 OPTION 4: AWS EC2 (Enterprise)

### Why AWS?
✅ Enterprise-grade infrastructure  
✅ Scalable  
✅ Industry standard  
⚠️ More expensive ($8-15/month)  
⚠️ Complex setup  

### Quick Setup Guide

#### 1. Launch EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Settings:
   - **Name**: field-report-bot
   - **AMI**: Ubuntu Server 24.04 LTS
   - **Instance type**: t2.micro (free tier) or t3.small
   - **Key pair**: Create new (download .pem file)
   - **Security Group**: Allow SSH (port 22)

#### 2. Connect
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

#### 3. Install & Deploy
Follow same steps as DigitalOcean (Option 3)

---

## 📊 Cost Comparison

| Platform | Monthly Cost | Annual Cost | Notes |
|----------|--------------|-------------|-------|
| Railway | $5 | $60 | Best for small teams |
| Render Free | $0 | $0 | Sleeps after 15min |
| Render Paid | $7 | $84 | Always-on |
| DigitalOcean | $6 | $72 | Full control |
| AWS EC2 t2.micro | $8 | $96 | Free tier 12 months |
| AWS EC2 t3.small | $15 | $180 | Production-grade |

---

## 🛡️ Security Best Practices

### 1. Protect Your Tokens
**Before pushing to GitHub:**
```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "temp/" >> .gitignore
echo "node_modules/" >> .gitignore
```

### 2. Create .env.example
Create `.env.example` (safe to commit):
```
BOT_TOKEN=your_bot_token_here
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
NODE_ENV=production
```

### 3. Regenerate Tokens (Optional)
If you accidentally committed tokens:
1. Go to @BotFather in Telegram
2. Send `/revoke`
3. Choose your bot
4. Get new token
5. Update everywhere

---

## ✅ Deployment Checklist

### Before Deployment
- [ ] Code tested locally
- [ ] `.env` in `.gitignore`
- [ ] Code pushed to GitHub
- [ ] `Procfile` created
- [ ] Dependencies in `package.json`

### During Deployment
- [ ] Platform account created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Build successful
- [ ] Bot logs show "running"

### After Deployment
- [ ] Test `/start` command
- [ ] Send test notes
- [ ] Generate test report
- [ ] Verify files received
- [ ] Check logs for errors

---

## 🚨 Troubleshooting Deployment

### Bot Not Starting
**Check logs for:**
```
Error: BOT_TOKEN is undefined
```
**Fix**: Add BOT_TOKEN to environment variables

### Build Fails
**Error**: `Cannot find module`
**Fix**: 
```bash
npm install
npm run build
```

### Bot Crashes After Start
**Check**: GROQ_API_KEY is valid
**Test**: 
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_KEY"
```

---

## 📱 Post-Deployment: Client Setup

After deploying, give clients this info:
- Bot username: `@YourBotName_bot`
- Quick start guide (see CLIENT_ONBOARDING.md)
- Support contact

---

## 🔄 Updating Your Bot

### Railway/Render (Auto-Deploy)
```bash
# Make changes locally
npm run build

# Push to GitHub
git add .
git commit -m "Update bot features"
git push

# Railway/Render auto-deploys!
```

### DigitalOcean/AWS (Manual)
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to project
cd field-report-bot

# Pull latest code
git pull

# Rebuild
npm run build

# Restart
pm2 restart field-report-bot
```

---

## 📞 Need Help?

**Railway Support**: https://railway.app/help  
**Render Support**: https://render.com/docs  
**DigitalOcean Docs**: https://docs.digitalocean.com  
**AWS Support**: https://aws.amazon.com/support  

---

## 🎉 Recommended Setup for Demo

**For Client Demo/Production:**
1. Deploy to **Railway** ($5/month)
2. Takes 10 minutes
3. Rock-solid reliability
4. Easy to show client "cloud-hosted"
5. Professional dashboard to show

**Why Railway?**
- Fast setup = more time for demo prep
- Reliable = no crashes during demo
- Professional = impresses clients
- Affordable = easy to justify cost

---

## Next Steps

1. ✅ Choose platform (Railway recommended)
2. ✅ Follow deployment steps above
3. ✅ Test bot works in cloud
4. ✅ Read CLIENT_ONBOARDING.md
5. ✅ Prepare demo with DEMO_SCRIPT.md
