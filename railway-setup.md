# Railway Setup Guide

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub
4. Connect your GitHub repository

## Step 2: Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the DATABASE_URL from the database service

## Step 3: Deploy Your App
1. Click "New" → "GitHub Repo"
2. Select your Booking-Easy repository
3. Set "Root Directory" to `booking-app`
4. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `NEXTAUTH_URL` (your Railway app URL)
   - `NEXTAUTH_SECRET` (generate a random string)

## Step 4: Deploy
Railway will automatically deploy your app!

## Benefits over Vercel:
- ✅ Built-in PostgreSQL database
- ✅ No deployment protection issues
- ✅ Better for full-stack apps
- ✅ $5/month after trial (very affordable)
- ✅ No 404 errors with API routes
