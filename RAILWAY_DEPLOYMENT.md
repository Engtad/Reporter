# Railway Deployment Guide

## Quick Setup

### 1. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will automatically detect and deploy your app

### 2. Get Your Railway URL

After deployment, Railway will provide you with a URL like:
```
https://your-app-name.up.railway.app
```

### 3. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_DOMAIN=https://your-app-name.up.railway.app
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DAILY_REPORT_LIMIT=2
MAX_MEMORY_REPORTS=50
```

**Important:** Replace `your-app-name.up.railway.app` with your actual Railway URL (without trailing slash).

### 4. Telegram Webhook Configuration

The webhook will be automatically configured when your app starts. You'll see this in the logs:

```
✅ Webhook set successfully!
🔗 Webhook URL: https://your-app-name.up.railway.app/webhook
```

### 5. Verify Deployment

1. Check Railway logs for `✅ Bot is running with WEBHOOK mode!`
2. Visit `https://your-app-name.up.railway.app` - you should see:
   ```json
   {
     "status": "ok",
     "message": "Field Report Bot Webhook Server",
     "timestamp": "2025-11-01T..."
   }
   ```
3. Test the bot in Telegram by sending `/start`

## Troubleshooting

### Webhook Not Working

Check Telegram webhook status:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Manually set webhook (if needed):
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d url=https://your-app-name.up.railway.app/webhook
```

### Bot Not Responding

1. Check Railway logs for errors
2. Verify all environment variables are set correctly
3. Ensure `WEBHOOK_DOMAIN` matches your Railway URL exactly (no trailing slash)
4. Restart the deployment in Railway

### Check Current Webhook

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app-name.up.railway.app/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## Architecture

- **Web Server:** Express.js on port determined by Railway's `PORT` environment variable
- **Webhook Endpoint:** `/webhook` - receives updates from Telegram
- **Health Check:** `/` - returns JSON status
- **Bot Framework:** Telegraf with webhook mode
- **Deployment:** Railway automatically builds TypeScript and runs the compiled JavaScript

## Important Notes

- Railway automatically provides the `PORT` environment variable
- The Procfile uses `web:` worker type (required for HTTP webhooks)
- Webhook is set automatically on server startup
- Old polling mode has been replaced with webhook mode for production use
