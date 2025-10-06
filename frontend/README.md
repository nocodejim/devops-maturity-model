# DevOps Maturity Assessment - Frontend

React + TypeScript frontend for the DevOps Maturity Assessment Platform.

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form + Zod
- Recharts (for visualizations)
- React Router

## Setup

### Using Docker (Recommended)

The frontend runs in a Docker container. See the main project README for instructions.

### Local Development

If you need to run locally without Docker:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Layout
│   │   ├── assessment/      # Assessment form components
│   │   ├── results/         # Results display components
│   │   └── common/          # Shared components
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AssessmentPage.tsx
│   │   └── ResultsPage.tsx
│   ├── services/            # API client
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Code Quality

The project uses:
- ESLint for linting
- Prettier for code formatting
- TypeScript for type safety

## Environment Variables

See `.env.example` for required environment variables.

## Features

### Implemented
- Project structure and configuration
- API client with axios
- TypeScript types
- Routing setup
- Tailwind CSS styling

### To Be Implemented
- Login/Authentication UI
- Dashboard with assessments list
- Assessment form (20 questions)
- Results visualization
- Report download
- Analytics dashboard

## License

Internal use only.
