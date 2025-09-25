#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores your SQLite database from a backup
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const backupDir = path.join(__dirname, '../backups');

// List available backups
const backups = fs.readdirSync(backupDir)
  .filter(file => file.startsWith('dev-') && file.endsWith('.db'))
  .map(file => ({
    name: file,
    path: path.join(backupDir, file),
    time: fs.statSync(path.join(backupDir, file)).mtime
  }))
  .sort((a, b) => b.time - a.time);

if (backups.length === 0) {
  console.log('❌ No backups found');
  process.exit(1);
}

console.log('📋 Available backups:');
backups.forEach((backup, index) => {
  console.log(`${index + 1}. ${backup.name} (${backup.time.toLocaleString()})`);
});

// Get backup selection from command line argument
const backupIndex = process.argv[2];
if (!backupIndex || isNaN(backupIndex) || backupIndex < 1 || backupIndex > backups.length) {
  console.log(`\nUsage: node restore-db.js <backup-number>`);
  console.log(`Example: node restore-db.js 1`);
  process.exit(1);
}

const selectedBackup = backups[backupIndex - 1];

try {
  // Create backup of current database before restoring
  const currentBackup = path.join(backupDir, `current-before-restore-${Date.now()}.db`);
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, currentBackup);
    console.log(`💾 Current database backed up to: ${currentBackup}`);
  }

  // Restore from selected backup
  fs.copyFileSync(selectedBackup.path, dbPath);
  console.log(`✅ Database restored from: ${selectedBackup.name}`);
  console.log(`📅 Backup date: ${selectedBackup.time.toLocaleString()}`);
} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
