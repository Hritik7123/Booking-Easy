# Service Booking + Subscriptions Platform

A full-stack Next.js application for service providers to manage availability, bookings, and subscriptions with Stripe payments.

## Features

- **Provider Management**: Set availability, manage services, view bookings
- **Customer Booking**: Browse providers, book sessions with Stripe Checkout
- **Subscriptions**: Monthly plans with credit-based booking system
- **Admin Panel**: Manage users, refunds, coupons, manual bookings
- **Email Notifications**: Booking confirmations, reminders (24h/2h before)
- **Role-based Access**: Customer, Provider, Admin roles

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js with Credentials provider
- **Payments**: Stripe (Checkout + Billing)
- **Email**: Resend (optional)

## Quick Start

### 1. Database Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations and seed data
npm run prisma:migrate
npm run db:seed
```

### 2. Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/booking_app?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"

# Stripe (required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional)
RESEND_API_KEY="re_..."
```

### 3. Start Development

```bash
npm run dev
```

### 4. Set up Stripe Webhooks

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Usage

### Demo Users

After seeding, you'll have:
- **Provider**: `provider@example.com` (set role to ADMIN in database for admin access)
- **Customer**: `customer@example.com`

### Key Flows

1. **Provider Setup**:
   - Login as provider → `/dashboard`
   - Add availability rules (weekday + time ranges)
   - Generate time slots
   - View bookings

2. **Customer Booking**:
   - Browse `/providers`
   - Select provider → choose service + time slot
   - Enter email + optional coupon code
   - Complete payment via Stripe Checkout

3. **Admin Management**:
   - Set user role to ADMIN in database
   - Access `/admin` for:
     - View all bookings
     - Process refunds
     - Create coupons
     - Manual booking creation
     - User role management

### API Endpoints

- `GET /api/me/availability` - Provider availability rules
- `POST /api/me/availability` - Add availability rule
- `DELETE /api/me/availability?id=...` - Remove rule
- `POST /api/slots/[providerId]` - Generate time slots
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/bookings/cancel` - Cancel booking (24h policy)
- `POST /api/bookings/reschedule` - Reschedule booking
- `POST /api/reminders` - Send due reminder emails
- `POST /api/admin/refund` - Process refunds
- `POST /api/admin/coupons` - Create coupons

## Database Schema

Key models:
- `User` - Authentication and roles
- `ProviderProfile` - Provider details and services
- `Service` - Bookable services with pricing
- `TimeSlot` - Generated bookable time slots
- `Booking` - Customer bookings
- `Payment` - Stripe payment records
- `Subscription` - Monthly plans and credits
- `Coupon` - Discount codes
- `Notification` - Email reminders

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Database

Use Neon, Supabase, or Railway for PostgreSQL:
- Copy connection string to `DATABASE_URL`
- Run migrations: `npx prisma migrate deploy`

### Stripe Webhooks

In production, configure webhook endpoint:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`

## Development

```bash
# Database
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Run migrations
npm run db:seed         # Seed demo data

# Development
npm run dev            # Start dev server
npm run build         # Build for production
npm run start         # Start production server
```

## License

MIT