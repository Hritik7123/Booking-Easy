#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates backups of your SQLite database for data persistence
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const backupDir = path.join(__dirname, '../backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `dev-${timestamp}.db`);

try {
  // Copy the database file
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Database backup created: ${backupPath}`);
  
  // Keep only the last 10 backups
  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('dev-') && file.endsWith('.db'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  // Remove old backups (keep last 10)
  if (files.length > 10) {
    const filesToDelete = files.slice(10);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Removed old backup: ${file.name}`);
    });
  }

  console.log(`📊 Total backups: ${files.length}`);
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
