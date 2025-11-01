# Cleanup System Guide

This bot includes an automatic cleanup system to prevent temp files from accumulating and slowing down the bot.

## Features

### 1. Automatic Cleanup (Railway Deployment)
- **Startup Cleanup**: Runs when the bot starts, removing old temp files
- **Scheduled Cleanup**: Runs every 6 hours automatically
- **Post-Export Cleanup**: Removes user photos immediately after generating report
- **Session Clear Cleanup**: Removes photos when user runs `/clear`

### 2. Cleanup Configuration
Default settings (can be customized in `api/telegram_webhook.ts`):
- **Cleanup Interval**: 6 hours
- **Max File Age**: 24 hours (files older than this are deleted)

### 3. Manual Cleanup Scripts

#### Clean old files (24+ hours old)
```bash
npm run cleanup
```

#### Clean old files with custom age
```bash
npm run cleanup old 48  # Delete files older than 48 hours
```

#### Clean ALL temp files immediately
```bash
npm run cleanup:all
```

## What Gets Cleaned

### Local Files
- All files in `temp/` directory older than 24 hours
- Includes photos downloaded from Telegram
- Includes any temporary documents

### Cloud Files (Supabase)
If you enable Supabase storage (`USE_SUPABASE=true`):
- Old files in the `field-reports/temp` bucket
- Configurable retention period

## How It Works

### 1. After Report Export
```
User sends /exportword
  → Bot generates report
  → Bot sends document to user
  → ✅ Bot deletes all session photos immediately
```

### 2. Scheduled Cleanup (Every 6 Hours)
```
Bot runs scheduled task
  → Scans temp/ directory
  → Identifies files older than 24 hours
  → ✅ Deletes old files
  → Logs cleanup results
```

### 3. User Clears Session
```
User sends /clear
  → ✅ Bot deletes session photos
  → Clears session data from memory
```

## Railway Deployment

The cleanup system is designed for Railway's persistent storage model:

1. **Automatic**: No cron jobs needed (runs in bot process)
2. **Efficient**: Only cleans old files, not active sessions
3. **Safe**: Never deletes files currently being used

### Environment Variables (Optional)

Add to Railway environment variables:

```env
# Enable Supabase cloud cleanup (optional)
USE_SUPABASE=true
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE=your-key
```

## Monitoring Cleanup

Check Railway logs for cleanup activity:

```
🧹 Running startup cleanup...
✅ Startup cleanup: 15 old file(s) removed

🧹 Running scheduled cleanup...
✅ Scheduled cleanup: 3 old file(s) removed

🧹 Cleaned up session photos after export
```

## Troubleshooting

### Temp files still accumulating
1. Check Railway logs for cleanup errors
2. Verify `temp/` directory permissions
3. Run manual cleanup: `npm run cleanup:all`

### Storage running low
1. Connect to Railway CLI
2. Run manual cleanup script
3. Reduce cleanup interval or max age in code

### Photos not cleaning after export
1. Check for errors in `/exportword` command
2. Verify cleanup function is being called
3. Check file paths are correct

## File Structure

```
src/utils/cleanup.ts          # Cleanup utility functions
scripts/cleanup-local.ts       # Manual cleanup script
api/telegram_webhook.ts        # Bot with automatic cleanup
temp/                          # Temporary files (auto-cleaned)
```

## Safety Features

✅ **Never deletes active files**: Only removes files older than 24 hours
✅ **Session protection**: Files in active sessions are kept
✅ **Graceful errors**: Cleanup errors don't crash the bot
✅ **Logging**: All cleanup actions are logged
✅ **Post-export cleanup**: User files removed immediately after use

## Customization

To adjust cleanup behavior, edit `api/telegram_webhook.ts`:

```typescript
// Change cleanup frequency (hours)
const CLEANUP_INTERVAL_HOURS = 6;  // Default: 6 hours

// Change max file age (hours)
const CLEANUP_MAX_AGE_HOURS = 24;  // Default: 24 hours
```

## Production Best Practices

1. **Monitor logs**: Watch for cleanup activity in Railway
2. **Set alerts**: Configure Railway to alert on high disk usage
3. **Regular checks**: Periodically verify temp/ is being cleaned
4. **Enable Supabase**: For long-term storage needs, use cloud storage
5. **Backup strategy**: Reports are sent via Telegram (no local storage needed)
