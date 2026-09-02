# TDCTF

A modern Capture The Flag (CTF) competition platform built with Next.js, Supabase, and Tailwind CSS. Designed for hosting cybersecurity competitions, training sessions, and workshops with real-time scoring, multi-event support, and team management.

---

## Overview

TDCTF provides a complete platform for running Jeopardy-style CTF competitions. It handles challenge distribution, real-time flag verification, dynamic scoring, and live scoreboards for both individual and team participation.

### Key Capabilities

- **Challenge Engine**: Multi-category challenges (Web, Reverse, Binary Exploitation, Cryptography, Forensics, OSINT, etc.) with dynamic score decay based on solve count.
- **Real-Time Scoreboard**: Instant leaderboard updates powered by Supabase real-time channels, supporting both individual competitors and team rankings.
- **Multi-Event Management**: Create and isolate multiple CTF events on a single platform instance with individual timelines and scoreboards.
- **Team Collaboration**: Team creation, invite links, join approvals, and member role management.
- **Dynamic Challenge Services**: Integration with TDCTL for provisioning ephemeral on-demand challenge containers.
- **Administration & Moderation**: In-app management for challenges, announcements, audit logging, first-blood alerts, and user roles.
- **Authentication**: Email/password authentication and Google OAuth support with optional Cloudflare Turnstile verification.

---

## Architecture & Stack

- **Framework**: Next.js 14 (App Router / Pages)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime, Auth)
- **UI & Styling**: Tailwind CSS, Radix UI / Shadcn, Framer Motion
- **Analytics & Graphs**: Chart.js
- **Container Orchestration (Optional)**: TDCTL

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase account and project

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/farishhz/TDCTF.git
cd TDCTF
npm install
```

### 2. Database Setup

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Execute your database schema and RPC functions in the Supabase SQL Editor.
3. In your Supabase Dashboard under **Authentication > URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your production domain).
   - Configure your redirect URLs accordingly.

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional Configurations
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
# TDCTL_API_URL=http://localhost:8000
# TDCTL_API_TOKEN=your_tdctl_token
# NEXT_PUBLIC_MAINTENANCE_MODE=no
```

### 4. Running the Development Server

Start the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 5. Creating an Administrator Account

1. Register a new account via the platform's sign-up page (`/register`).
2. Open your Supabase Dashboard and navigate to the `users` table.
3. Locate your user record and set the `admin` column to `true`.
4. Refresh the application to access the Admin dashboard.

---

## Database Types Synchronization

To synchronize database TypeScript definitions with your remote Supabase instance:

```bash
npm run update-types <your-project-ref>
```

For a local Supabase CLI instance:

```bash
npm run update-types:local
```

---

## Configuration

Platform settings can be adjusted directly in `src/config.ts`:

```typescript
export const APP = {
  shortName: "TDCTF",
  fullName: "TDCTF Platform",
  description: "Capture The Flag Competition Platform",
  flagFormat: "TDCTF{...}",
  challengeCategories: [
    "Web Exploitation",
    "Cryptography",
    "Reverse Engineering",
    "Binary Exploitation",
    "Forensics",
    "OSINT",
    "Miscellaneous"
  ],
  teams: {
    enabled: true,
    hideScoreboardIndividual: false,
    hideScoreboardTotal: false,
  },
  hideEventMain: false,
  eventMainLabel: "main",
};
```

---

## Deployment

### Vercel Deployment

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy the application.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Compiles the production build |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint checks |
| `npm run update-types` | Generates TypeScript types from remote Supabase |

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
