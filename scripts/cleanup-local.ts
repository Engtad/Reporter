// scripts/cleanup-local.ts
// Manual cleanup script for local development and Railway
// Run: npm run cleanup

import { performFullCleanup, cleanAllTempFiles } from '../src/utils/cleanup.js';

async function main() {
  console.log('🧹 Field Report Bot - Cleanup Utility\n');

  const args = process.argv.slice(2);
  const command = args[0] || 'old';

  switch (command) {
    case 'all':
      console.log('⚠️  Cleaning ALL temp files immediately...\n');
      const count = await cleanAllTempFiles();
      console.log(`\n✅ Deleted ${count} file(s)`);
      break;

    case 'old':
    default:
      const hours = parseInt(args[1] || '24');
      console.log(`🕒 Cleaning files older than ${hours} hours...\n`);
      const result = await performFullCleanup(hours);
      console.log(`\n✅ Summary:`);
      console.log(`   • Local files deleted: ${result.localDeleted}`);
      console.log(`   • Cloud files deleted: ${result.cloudDeleted}`);
      break;
  }
}

main().catch(console.error);
