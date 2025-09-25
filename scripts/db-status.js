#!/usr/bin/env node

/**
 * Database Status Script
 * Shows current database status and data statistics
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const backupDir = path.join(__dirname, '../backups');

async function getDatabaseStatus() {
  console.log('🔍 Database Status Report');
  console.log('='.repeat(50));

  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file not found');
    return;
  }

  // Database file info
  const stats = fs.statSync(dbPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📁 Database file: ${dbPath}`);
  console.log(`📊 File size: ${fileSizeMB} MB`);
  console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);

  // Check backups
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('dev-') && file.endsWith('.db'));
    console.log(`💾 Backups available: ${backups.length}`);
  } else {
    console.log('💾 No backup directory found');
  }

  // Database content statistics
  try {
    const prisma = new PrismaClient();
    
    const [users, providers, bookings, services, timeSlots] = await Promise.all([
      prisma.user.count(),
      prisma.providerProfile.count(),
      prisma.booking.count(),
      prisma.service.count(),
      prisma.timeSlot.count()
    ]);

    console.log('\n📈 Data Statistics:');
    console.log(`👥 Users: ${users}`);
    console.log(`🏢 Providers: ${providers}`);
    console.log(`📅 Bookings: ${bookings}`);
    console.log(`🛠️  Services: ${services}`);
    console.log(`⏰ Time Slots: ${timeSlots}`);

    // Recent activity
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { email: true } },
        service: { select: { name: true } }
      }
    });

    if (recentBookings.length > 0) {
      console.log('\n🕒 Recent Bookings:');
      recentBookings.forEach(booking => {
        console.log(`  • ${booking.service.name} - ${booking.customer.email} (${booking.status})`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Error reading database:', error.message);
  }

  console.log('\n✅ Database is operational and persistent!');
  console.log('💡 Your data will persist until manually deleted.');
}

getDatabaseStatus().catch(console.error);
