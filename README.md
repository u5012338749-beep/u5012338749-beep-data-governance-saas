# Multi-tenant Data Governance SaaS

A comprehensive data governance platform with multi-tenant workspaces, user authentication, and dataset management capabilities.

## Features

- 🔐 **User Authentication** - Register/Login with secure session management using Passport.js
- 🏢 **Multi-tenant Workspaces** - Create and manage multiple tenants with role-based access control
- 📊 **Dataset Management** - Full CRUD operations for datasets with status tracking
- 🔄 **Jobs & Workflows** - Create and manage data processing jobs with run tracking
- 👥 **Team Collaboration** - Invite team members with role-based permissions
- 🔑 **API Keys** - Generate and manage API keys for programmatic access
- 🎨 **Modern UI** - React 18 with TailwindCSS and shadcn/ui components

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js (Local Strategy) with bcrypt
- **Database**: PostgreSQL with Drizzle ORM
- **Logging**: Winston
- **Validation**: Zod
- **Security**: Helmet, CORS, Compression

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: Wouter
- **Data Fetching**: React Query (@tanstack/react-query)
- **UI Components**: Custom components with shadcn/ui patterns

### Deployment
- **Platform**: Vercel
- **Architecture**: Serverless functions + Static frontend

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone <repository-url>
cd u5012338749-beep-data-governance-saas
```

### 2. Install dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/data_governance
SESSION_SECRET=your-super-secret-key-change-this
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Set up the database

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with test data
npm run seed
```

### 5. Run the application

```bash
# Terminal 1: Start the backend server
npm run dev

# Terminal 2: Start the frontend dev server
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Test Credentials

After running the seed script, you can log in with:
- **Email**: test@example.com
- **Password**: password123
- **Workspace**: my-workspace

## Project Structure

```
.
├── api/                    # Vercel serverless functions
│   └── index.ts           # API entry point
├── server/                 # Backend application
│   ├── config/            # Configuration files
│   │   └── passport.ts    # Passport authentication strategy
│   ├── db/                # Database connection
│   │   └── index.ts       # Drizzle client setup
│   ├── lib/               # Utility libraries
│   │   ├── logger.ts      # Winston logger
│   │   └── utils.ts       # Helper functions
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # Authentication guards
│   │   ├── error-handler.ts # Error handling
│   │   └── validate.ts    # Zod validation
│   ├── routes/            # API routes
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── tenants.ts     # Workspace management
│   │   ├── datasets.ts    # Dataset CRUD
│   │   ├── jobs.ts        # Job management
│   │   ├── members.ts     # Team members
│   │   ├── api-keys.ts    # API key management
│   │   └── health.ts      # Health check
│   └── index.ts           # Express app setup
├── shared/                # Shared code
│   └── schema.ts          # Drizzle database schema
├── scripts/               # Utility scripts
│   └── seed.ts            # Database seeding
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── ui/        # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Client utilities
│   │   │   ├── api.ts     # API client
│   │   │   └── utils.ts   # Helper functions
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Login/Register
│   │   │   ├── dashboard/ # Main dashboard
│   │   │   ├── datasets/  # Dataset management
│   │   │   ├── jobs/      # Job management
│   │   │   ├── members/   # Team members
│   │   │   ├── api-keys/  # API keys
│   │   │   └── tenants/   # Workspace selection
│   │   ├── App.tsx        # Main app with routing
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── vite.config.ts     # Vite configuration
│   └── package.json       # Client dependencies
├── package.json           # Server dependencies
├── tsconfig.json          # TypeScript config
├── drizzle.config.ts      # Drizzle ORM config
└── vercel.json            # Vercel deployment config
```

## Database Schema

### Tables

- **users** - User accounts with email/password authentication
- **tenants** - Workspace/organization entities
- **tenant_members** - User-tenant relationships with roles (owner, admin, member)
- **datasets** - Data collection entities with status tracking
- **dataset_records** - Individual records within datasets
- **jobs** - Background job definitions
- **job_runs** - Job execution history
- **api_keys** - API authentication tokens
- **invitations** - Pending team member invitations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/user` - Get current user info

### Tenants/Workspaces
- `GET /api/tenants` - List user's workspaces
- `POST /api/tenants` - Create new workspace
- `GET /api/tenants/:id` - Get workspace details
- `PATCH /api/tenants/:id` - Update workspace
- `DELETE /api/tenants/:id` - Delete workspace

### Datasets
- `GET /api/tenants/:tenantId/datasets` - List datasets
- `POST /api/tenants/:tenantId/datasets` - Create dataset
- `GET /api/tenants/:tenantId/datasets/:id` - Get dataset details
- `PATCH /api/tenants/:tenantId/datasets/:id` - Update dataset
- `DELETE /api/tenants/:tenantId/datasets/:id` - Delete dataset

### Jobs
- `GET /api/tenants/:tenantId/jobs` - List jobs
- `POST /api/tenants/:tenantId/jobs` - Create job
- `POST /api/tenants/:tenantId/jobs/:id/run` - Execute job
- `GET /api/tenants/:tenantId/jobs/:id/runs` - Get job run history

### Team Members
- `GET /api/tenants/:tenantId/members` - List team members
- `POST /api/tenants/:tenantId/members/invite` - Invite member
- `DELETE /api/tenants/:tenantId/members/:userId` - Remove member
- `PATCH /api/tenants/:tenantId/members/:userId/role` - Update member role

### API Keys
- `GET /api/tenants/:tenantId/api-keys` - List API keys
- `POST /api/tenants/:tenantId/api-keys` - Generate new key
- `DELETE /api/tenants/:tenantId/api-keys/:id` - Revoke key

### Health
- `GET /api/health` - Service health check

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Random secret key for sessions

3. Deploy:
```bash
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel project settings:
- `DATABASE_URL` - Production PostgreSQL URL
- `SESSION_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `NODE_ENV` - Set to `production`

## Development

### Run tests
```bash
npm test
```

### Lint code
```bash
npm run lint
```

### Build for production
```bash
npm run build
```

### Database management
```bash
# Open Drizzle Studio (visual database editor)
npm run db:studio

# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Drizzle ORM
- Role-based access control

## License

MIT