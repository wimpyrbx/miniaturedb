# MiniatureDB

A modern database management system with a beautiful user interface.

## Quick Start
```bash
npm install
npm run dev    # Runs frontend (localhost:5173) and backend (localhost:3000)
```

## Project Structure
```
miniaturedb/
├── src/
│   ├── api/              # API endpoints by feature
│   │   └── index.js      # Centralized API exports
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities
│   ├── styles/          # Global styles
│   └── server.ts        # Backend server
├── auth.db              # Authentication database
├── minis.db            # Main application database
└── minis.db.sql        # Database schema
```

## Tech Stack
- Frontend: React 18, TypeScript, Mantine UI v7, React Router v7, Tanstack Query
- Backend: Express.js, better-sqlite3, express-session
- Database: SQLite (auth.db for authentication, minis.db for application data)
- Dev Tools: Vite, ESLint, TypeScript

## Project Rules

### File Organization
- Components: `components/<name>/<Name>.tsx` with sub-components in same folder
- API Endpoints: `api/<endpoint>/{get|post|put|delete}.ts`, exported in `api/index.js`
- Database: Queries centralized in `db/` directory

### Naming & Documentation
- `.tsx` files: PascalCase (e.g., `UserProfile.tsx`)
- `.ts` files & folders: lowercase (e.g., `utils.ts`, `hooks/`)
- Required file header:
  ```typescript
  /**
   * @file ComponentName.tsx
   * @description Brief description of purpose and functionality
   */
  ```

### Development
- Scripts
  - `dev`: Run full stack
  - `dev:frontend`: Frontend only
  - `dev:backend`: Backend only
  - `build`: Production build
  - `lint`: Run ESLint

## Requirements
- Node.js (LTS)
- SQLite
- npm/yarn
