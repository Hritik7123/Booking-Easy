# 🗄️ Database Persistence Guide

Your booking application is configured for **permanent data storage**. All user profiles, booking history, and provider data will persist until manually deleted.

## 📊 Current Database Setup

- **Database Type**: SQLite (file-based)
- **Location**: `prisma/dev.db`
- **Persistence**: ✅ **PERMANENT** - Data survives server restarts
- **Backup System**: ✅ **AUTOMATED** - Regular backups created

## 🔧 Database Management Commands

### Check Database Status
```bash
npm run db:status
```
Shows current database statistics, file size, and recent activity.

### Create Database Backup
```bash
npm run db:backup
```
Creates a timestamped backup of your database.

### Restore from Backup
```bash
npm run db:restore <backup-number>
```
Restores database from a previous backup.

### Reset Database (⚠️ DESTRUCTIVE)
```bash
npm run db:reset
```
**WARNING**: This will delete ALL data and reseed with sample data.

### Setup Fresh Database
```bash
npm run db:setup
```
Sets up a fresh database with sample data.

## 📁 Data Storage Details

### What Gets Stored Permanently:

1. **👥 User Accounts**
   - Email addresses
   - Names and roles
   - Account creation dates
   - Profile information

2. **🏢 Provider Profiles**
   - Business information
   - Services offered
   - Availability settings
   - Contact details

3. **📅 Booking History**
   - All past and future bookings
   - Booking status (confirmed, cancelled, etc.)
   - Payment information
   - Time slot details

4. **⏰ Time Slots**
   - Available appointment times
   - Booking status
   - Provider assignments

5. **💳 Payment Records**
   - Transaction history
   - Payment status
   - Amounts and currencies

## 🔒 Data Security & Backup

### Automatic Backups
- Backups are created in `backups/` directory
- Keeps last 10 backups automatically
- Each backup is timestamped
- Backups are created before major operations

### Manual Backup
```bash
# Create backup now
npm run db:backup

# List available backups
ls backups/

# Restore from specific backup
npm run db:restore 1
```

## 🚀 Production Deployment

For production, consider upgrading to:

1. **PostgreSQL** (recommended for production)
2. **MySQL** (alternative option)
3. **Cloud Database** (AWS RDS, Google Cloud SQL, etc.)

### Migration to PostgreSQL:
```bash
# Update schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Run migration
npx prisma migrate deploy
```

## 📈 Monitoring Your Data

### Check Data Statistics
```bash
npm run db:status
```

### View Database in Browser
```bash
npm run prisma:studio
```
Opens Prisma Studio to browse your data visually.

### Database File Location
- **Development**: `prisma/dev.db`
- **Size**: Check with `ls -lh prisma/dev.db`
- **Backups**: `backups/dev-*.db`

## ⚠️ Important Notes

1. **Data Persistence**: Your data is stored in `prisma/dev.db` and will persist between server restarts.

2. **Backup Regularly**: Use `npm run db:backup` before major changes.

3. **File Location**: Keep the `prisma/` directory safe - it contains your data.

4. **Version Control**: Don't commit the database file to git (it's in .gitignore).

5. **Production**: For production, use a proper database server (PostgreSQL/MySQL).

## 🆘 Troubleshooting

### Database Corrupted?
```bash
# Restore from latest backup
npm run db:restore 1
```

### Need Fresh Start?
```bash
# Reset everything (⚠️ DESTRUCTIVE)
npm run db:reset
```

### Check Database Health
```bash
# View database status
npm run db:status

# Open database browser
npm run prisma:studio
```

## 📞 Support

If you need help with database management:
1. Check database status: `npm run db:status`
2. Create backup: `npm run db:backup`
3. View data: `npm run prisma:studio`

Your booking system is now configured for **permanent data storage**! 🎉
