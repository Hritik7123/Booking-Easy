# Vercel Deployment Setup Guide

## 🚨 URGENT: Database Connection Error Fix

Your Vercel deployment is failing because it doesn't have a database connection. Here's how to fix it:

### Option 1: Use Vercel Postgres (Recommended - Free)

1. Go to your Vercel Dashboard
2. Click on your project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Copy the connection string
6. Add it as `DATABASE_URL` in Environment Variables

### Option 2: Use Railway (Free)

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → "Database" → "PostgreSQL"
4. Copy the connection string
5. Add it as `DATABASE_URL` in Vercel Environment Variables

### Option 3: Use Neon (Free)

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy the connection string
5. Add it as `DATABASE_URL` in Vercel Environment Variables

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

## After Setting Up Database

1. Redeploy your app
2. Run database migrations: `npx prisma db push`
3. Test the provider creation

## Quick Test

Visit: `https://your-app.vercel.app/api/db-health`
Should show: `{"status":"healthy","message":"Database connection successful"}`

If it shows an error, your DATABASE_URL is incorrect.
