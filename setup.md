# Booking App Setup Guide

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Database
   DATABASE_URL="file:./dev.db"

   # Stripe Configuration (optional - for payments)
   # Get these from https://dashboard.stripe.com/test/apikeys
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   # Email Configuration (optional - for notifications)
   RESEND_API_KEY=your_resend_api_key_here
   ```

3. **Initialize the database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Demo Mode

The app works in **demo mode** without Stripe configuration:
- Bookings are created directly without payment processing
- Perfect for testing and development
- No real payments are processed

## Production Setup

For production deployment:

1. Set up proper environment variables
2. Configure Stripe for real payments
3. Set up a production database (PostgreSQL recommended)
4. Configure email notifications
5. Set up proper domain and SSL certificates

## Features

- ✅ User authentication
- ✅ Provider management
- ✅ Service booking
- ✅ Time slot management
- ✅ Payment processing (Stripe integration)
- ✅ Admin panel
- ✅ Responsive design
- ✅ Professional UI/UX

## Default Login

- **Provider:** provider@example.com (no password required)
- **Admin:** admin@example.com (no password required)
- **Customer:** any email address (auto-creates account)
