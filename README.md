# CleubAutomation - Home Automation Planning System

Premium home automation planning, estimation, and project management platform.

## About

CleubAutomation is a comprehensive solution for planning and estimating smart home automation projects. It provides tools for architects, builders, and tech enthusiasts to design, estimate costs, and manage automation projects for luxury homes.

## Key Features

- **Project Planning**: Interactive UI for designing home automation layouts
- **Cost Estimation**: Accurate pricing based on components and complexity
- **User Authentication**: Secure login with Supabase (Email + Google OAuth)
- **Admin Dashboard**: Manage projects, testimonials, and system settings
- **Inventory Management**: Track automation components and pricing
- **PDF Export**: Generate professional project reports and billing documents
- **Blog System**: Full-featured CMS with markdown support and admin portal
- **FAQ Management**: Dynamic FAQ system with categories and admin controls
- **Testimonials**: Showcase client case studies and success stories
- **SEO Optimized**: Server-side rendering, meta tags, sitemap, structured data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19 + TypeScript
- **UI Framework**: shadcn-ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Database**: PostgreSQL (via Supabase)
- **Icons**: Lucide React
- **State Management**: React Context API
- **PDF Generation**: jsPDF + html2canvas
- **Content**: Markdown support (react-markdown)
- **Deployment**: Vercel

## Project Structure

```
app/                    # Next.js App Router pages and layouts
├── admin/             # Admin dashboard pages
├── blog/              # Blog system (list, detail, admin)
├── faq/               # FAQ system (list, admin)
├── inquiry/           # Contact inquiry pages
├── layout.tsx         # Root layout with metadata
├── page.tsx           # Home page (premium landing)
└── ...                # Other routes (planner, history, etc.)

src/
├── components/
│   ├── admin/         # Admin-specific components
│   ├── features/      # Feature components (rooms, appliances, billing)
│   ├── inventory/     # Inventory management components
│   ├── seo/           # SEO components (Schema, metadata)
│   └── ui/            # Reusable UI components (shadcn-ui)
├── contexts/          # React Context API (Auth)
├── supabase/          # Supabase services & types
│   ├── config.ts      # Client configuration
│   ├── types.ts       # Database types
│   ├── userService.ts
│   ├── projectService.ts
│   └── adminService.ts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── constants/         # App-wide constants
└── hooks/             # Custom React hooks

lib/                   # Server-side utilities
└── supabase/         # SSR Supabase clients
    ├── client.ts     # Browser client
    ├── server.ts     # Server client
    └── middleware.ts # Auth middleware

middleware.ts          # Next.js middleware for route protection
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/bun
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Krishna9827/CleubAutomation.git
cd CleubAutomation

# 2. Install dependencies
npm install
# or with yarn: yarn install
# or with bun: bun install

# 3. Set up environment variables
# Create a .env.local file in the project root with your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
# Start the Next.js development server
npm run dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build locally
npm run preview
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Obtain these from your Supabase project settings.

## Authentication

The app uses Supabase Authentication with:

- Email/password login
- Google OAuth integration
- Automatic user profile creation on signup

## Database Setup

Database schema is managed through Supabase migrations in `supabase/migrations/`.

Key tables:

- `users` - User profiles and information
- `projects` - Automation projects
- `project_items` - Individual items in projects
- `testimonials` - Client case studies

## Key Pages

| Page             | Route             | Description                                 |
| ---------------- | ----------------- | ------------------------------------------- |
| Landing          | `/`               | Premium landing page with services overview |
| Blog             | `/blog`           | Blog listing with categories                |
| FAQ              | `/faq`            | Frequently asked questions                  |
| Inquiry          | `/inquiry`        | Contact form for project inquiries          |
| Login            | `/login`          | User authentication                         |
| Project Planning | `/intake`         | Start new automation project                |
| Room Selection   | `/room-selection` | Select rooms for automation                 |
| Requirements     | `/requirements`   | Detailed project requirements form          |
| Final Review     | `/final-review`   | Review and confirm project details          |
| Planner          | `/planner`        | Interactive project planning tool           |
| History          | `/history`        | View user's saved projects                  |
| Admin            | `/admin`          | Admin dashboard (protected)                 |

## Components

### ProfileMenu

Dropdown menu showing logged-in user profile with options:

- View Profile (shows name, email, address info)
- Settings (navigate to profile settings)
- Sign Out

Located in: `src/components/ui/profile-menu.tsx`

### Navigation (SiteNav)

Sticky header with:

- Brand logo
- Navigation links
- Profile menu (when authenticated)
- Mobile-responsive hamburger menu

## Git Workflow

See `GIT_WORKFLOW.md` for detailed GitHub collaboration guidelines.

Quick commands:

```bash
# Create a feature branch
git checkout -b feature/feature-name

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/feature-name

# Create a Pull Request on GitHub
```

## Deployment

The project is optimized for **Vercel** deployment with Next.js 15:

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
4. Deploy automatically on push to main

### Alternative Platforms

- **Netlify**: Supports Next.js with build command `npm run build`
- **Self-hosted**: Deploy with `npm run build && npm run start`

For production deployment:

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Module not found errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Supabase connection issues

- Verify `.env.local` has correct Supabase credentials
- Check Supabase project is active and not paused
- Ensure API key has proper permissions

### Build errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear all caches and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Migration from Vite

This project was migrated from Vite to Next.js 15. See `MIGRATION_NOTES.md` for full details.

## Support

For issues and questions:

- Open an issue on GitHub
- Contact: support@cleub.com
- Phone: +91 9667603999

## License

This project is proprietary and confidential.

## Authors

- Krishna Sharma - Lead Developer
- Cleub Automation Team

---

**Live URL**: https://cleubautomation.com
**Repository**: https://github.com/Krishna9827/CleubAutomation

```

```
