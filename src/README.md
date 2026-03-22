# KQ System Admin Dashboard

A comprehensive admin dashboard for managing clients, appointments, and invoices with NDIS pricing integration.

## Overview

This project is a Next.js application with TypeScript and Supabase for the backend. It provides a full-featured admin interface for managing appointments, clients, and invoicing with support for NDIS pricing codes.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Supabase Auth
- **PDF Generation**: React-PDF

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (admin)/           # Admin dashboard routes
│   │   ├── appointments/  # Appointment management
│   │   ├── clients/        # Client management
│   │   ├── invoices/       # Invoice generation & management
│   │   └── dashboard/      # Admin dashboard
│   ├── (auth)/             # Authentication routes
│   └── api/                # API routes
├── components/            # Reusable components
│   ├── botanical/          # Custom design system components
│   ├── pdf/                # PDF generation components
│   ├── shared/             # Shared components
│   └── ui/                 # Shadcn/ui components
├── db/                     # Database schema
│   └── schema/             # Supabase table schemas
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
│   └── supabase/           # Supabase client setup
├── repositories/           # Data access layer
├── services/               # Business logic layer
└── styles/                 # Global styles
```

## Features

- **Client Management**: Add, edit, and manage client information with rate code status tracking
- **Appointment Scheduling**: Calendar-based appointment management with completion tracking
- **Invoice Generation**: Automated invoice creation with PDF export
- **NDIS Pricing**: Integrated NDIS pricing codes and calculations
- **Dashboard**: Real-time statistics and recent activity overview
- **Authentication**: Secure login with Supabase auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project with the required tables set up

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd 201_KQ_SYSTEM
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The database schema is located in `src/db/schema/`. Make sure to run the migrations in your Supabase project to set up the required tables:
- `appointments` - Appointment records
- `clients` - Client information
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items
- `ndis_pricing` - NDIS pricing reference data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]# Kq_admin_system
