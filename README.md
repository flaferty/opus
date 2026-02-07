# Job Application Tracking System

A full-stack job application tracking platform with a Kanban board interface for managing job applications across different statuses.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Dark Mode
- **UI**: shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query (React Query)
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React

## Project Structure

```
.
├── app/
│   ├── (auth)/login/         # Authentication page
│   ├── dashboard/            # Main Kanban board dashboard
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Global styles
│
├── components/
│   ├── KanbanBoard.tsx       # Kanban board with drag-and-drop
│   ├── JobCard.tsx           # Individual job application card
│   ├── AddJobDialog.tsx      # Modal for adding new applications
│   ├── Navbar.tsx            # Navigation with theme toggle
│   ├── ThemeProvider.tsx     # Dark mode theme context
│   └── ui/                   # shadcn/ui components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   └── utils.ts              # Utility functions
│
├── types/
│   └── database.types.ts     # TypeScript types and database schema
│
├── middleware.ts             # Authentication middleware
└── tailwind.config.ts        # Tailwind configuration
```

## Getting Started

### Prerequisites
- **Node.js 20+** (use `.nvmrc` with nvm: `nvm use`)
- npm
- Supabase account

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Setup database**
   - Run the SQL migration from `DATABASE_MIGRATION.md` in your Supabase SQL editor

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### GitHub Actions Setup (Optional)

To enable automatic Supabase keep-alive:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Workflow runs Monday & Thursday at 00:00 UTC (see `.github/workflows/keep-alive.yml`)

## Features

- **Authentication**: Email/password login with Supabase Auth
- **Kanban Board**: 5-column drag-and-drop interface (Wishlist, Applied, Interviewing, Offer, Rejected)
- **CRUD Operations**: Create, read, update, and delete job applications
- **Dark Mode**: System-aware theme toggle
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Automatic UI refresh with React Query
- **Row Level Security**: Users only see their own data

## Build & Deploy

Build for production:

```bash
npm run build
npm run start
```

Deploy to Vercel:

```bash
vercel
```

Set your environment variables in the Vercel dashboard.

## License

MIT
