# CleubAutomation - Home Automation Planning System

Premium home automation planning, estimation, and project management platform.

## About

CleubAutomation is a comprehensive solution for planning and estimating smart home automation projects. It provides tools for architects, builders, and tech enthusiasts to design, estimate costs, and manage automation projects for luxury homes.

## Key Features

- **Project Planning**: Interactive UI for designing home automation layouts
- **Cost Estimation**: Accurate pricing based on components and complexity
- **User Authentication**: Secure login with Supabase
- **Admin Dashboard**: Manage projects, testimonials, and system settings
- **Inventory Management**: Track automation components and pricing
- **PDF Export**: Generate professional project reports and billing documents
- **Testimonials**: Showcase client case studies and success stories
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn-ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Database**: PostgreSQL (via Supabase)
- **Icons**: Lucide React
- **State Management**: React Context API + React Query
- **PDF Generation**: jsPDF + html2canvas

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── features/       # Feature components (rooms, appliances, billing)
│   ├── inventory/      # Inventory management components
│   └── ui/             # Reusable UI components (buttons, dialogs, etc.)
├── pages/
│   ├── admin/          # Admin pages
│   ├── public/         # Public-facing pages (landing, login)
│   └── user/           # User dashboard and project pages
├── contexts/           # React Context API (Auth)
├── services/           # API and service layer
│   ├── firebase/       # Firebase configuration
│   └── supabase/       # Supabase services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # App-wide constants
└── hooks/              # Custom React hooks
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
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:5173
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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
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

| Page             | Route               | Description                                 |
| ---------------- | ------------------- | ------------------------------------------- |
| Landing          | `/`                 | Premium landing page with services overview |
| Login            | `/login`            | User authentication                         |
| Project Planning | `/project-planning` | Start new automation project                |
| Room Selection   | `/room-selection`   | Select rooms for automation                 |
| Requirements     | `/requirements`     | Detailed project requirements form          |
| Final Review     | `/final-review`     | Review and confirm project details          |
| Planner          | `/planner`          | Interactive project planning tool           |
| My Projects      | `/my-projects`      | View user's saved projects                  |
| Admin            | `/admin`            | Admin dashboard (protected)                 |

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

The project is ready to be deployed to:

- **Netlify** (recommended)
- **Vercel**
- **GitHub Pages**
- **Any Node.js hosting provider**

For Netlify:

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

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
# Clear Vite cache
rm -rf dist
npm run build
```

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
