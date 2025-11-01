// src/utils/cleanup.ts
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from './supabase.js';

/**
 * Delete specific files from local temp directory
 */
export async function deleteTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted temp file: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${filePath}:`, error);
    }
  }
}

/**
 * Clean all files in temp directory older than specified hours
 * @param maxAgeHours - Delete files older than this many hours (default: 24)
 */
export async function cleanOldTempFiles(maxAgeHours: number = 24): Promise<number> {
  const tempDir = path.join(process.cwd(), 'temp');

  if (!fs.existsSync(tempDir)) {
    console.log('📂 Temp directory does not exist');
    return 0;
  }

  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
  let deletedCount = 0;

  try {
    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);

      // Check if file is older than maxAge
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old file: ${file} (age: ${Math.round((now - stats.mtimeMs) / 3600000)}h)`);
        deletedCount++;
      }
    }

    console.log(`✅ Cleanup complete: ${deletedCount} file(s) deleted`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return deletedCount;
  }
}

/**
 * Clean all files in temp directory immediately
 */
export async function cleanAllTempFiles(): Promise<number> {
  const tempDir = path.join(process.cwd(), 'temp');

  if (!fs.existsSync(tempDir)) {
    console.log('📂 Temp directory does not exist');
    return 0;
  }

  let deletedCount = 0;

  try {
    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted: ${file}`);
      deletedCount++;
    }

    console.log(`✅ Cleanup complete: ${deletedCount} file(s) deleted`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return deletedCount;
  }
}

/**
 * Clean old files from Supabase storage bucket
 * @param bucketName - Name of the storage bucket
 * @param folderPath - Folder path in bucket (e.g., 'temp', 'photos')
 * @param maxAgeHours - Delete files older than this many hours (default: 24)
 */
export async function cleanSupabaseStorage(
  bucketName: string,
  folderPath: string = '',
  maxAgeHours: number = 24
): Promise<number> {
  try {
    const useSupabase = (process.env.USE_SUPABASE || '').toLowerCase() === 'true';

    if (!useSupabase) {
      console.log('⏭️ Supabase disabled, skipping cloud cleanup');
      return 0;
    }

    // List all files in the folder
    const { data: files, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list(folderPath);

    if (listError) {
      console.error('❌ Error listing Supabase files:', listError);
      return 0;
    }

    if (!files || files.length === 0) {
      console.log('📂 No files found in Supabase storage');
      return 0;
    }

    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const filesToDelete: string[] = [];

    // Filter files older than maxAge
    for (const file of files) {
      const fileAge = now - new Date(file.created_at).getTime();
      if (fileAge > maxAge) {
        const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
        filesToDelete.push(filePath);
      }
    }

    if (filesToDelete.length === 0) {
      console.log('✅ No old files to delete from Supabase');
      return 0;
    }

    // Delete old files
    const { data, error: deleteError } = await supabase
      .storage
      .from(bucketName)
      .remove(filesToDelete);

    if (deleteError) {
      console.error('❌ Error deleting Supabase files:', deleteError);
      return 0;
    }

    console.log(`✅ Supabase cleanup: ${filesToDelete.length} file(s) deleted from ${bucketName}/${folderPath}`);
    return filesToDelete.length;
  } catch (error) {
    console.error('❌ Supabase cleanup error:', error);
    return 0;
  }
}

/**
 * Clean user's session photos from temp after successful export
 */
export async function cleanUserSessionFiles(photos: Array<{ path: string }>): Promise<void> {
  const filePaths = photos.map(p => p.path);
  await deleteTempFiles(filePaths);
  console.log(`✅ Cleaned ${filePaths.length} session photo(s)`);
}

/**
 * Comprehensive cleanup: local temp + Supabase storage
 * @param maxAgeHours - Delete files older than this many hours
 */
export async function performFullCleanup(maxAgeHours: number = 24): Promise<{
  localDeleted: number;
  cloudDeleted: number;
}> {
  console.log('🧹 Starting full cleanup...');

  const localDeleted = await cleanOldTempFiles(maxAgeHours);
  const cloudDeleted = await cleanSupabaseStorage('field-reports', 'temp', maxAgeHours);

  console.log(`✅ Full cleanup complete: ${localDeleted} local, ${cloudDeleted} cloud`);

  return { localDeleted, cloudDeleted };
}
