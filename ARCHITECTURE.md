# VMS (Visitor Management System) - Architecture Documentation

## Project Tree Structure

```
VMS_New/
│
├── Backend/                                    # Node.js + Express + TypeScript Backend
│   ├── src/                                    # Source code directory
│   │   │
│   │   ├── @types/                            # TypeScript type definitions
│   │   │   └── types.d.ts                     # Custom type declarations
│   │   │
│   │   ├── api/                               # API layer (Business logic + Routes)
│   │   │   │
│   │   │   ├── auth/                          # Authentication module
│   │   │   │   ├── authController.ts          # Auth request handlers (login, register, logout)
│   │   │   │   ├── authRoutes.ts              # Auth endpoint definitions
│   │   │   │   ├── authService.ts             # Auth business logic
│   │   │   │   ├── authValidators.ts          # Zod validation schemas for auth
│   │   │   │   └── userModel.ts               # User database schema (Mongoose)
│   │   │   │
│   │   │   └── sessions/                      # Session management module
│   │   │       ├── sessionController.ts       # Session request handlers
│   │   │       ├── sessionModel.ts            # Session database schema
│   │   │       ├── sessionRoutes.ts           # Session endpoint definitions
│   │   │       ├── sessionService.ts          # Session business logic
│   │   │       └── verificationModel.ts       # Verification/OTP schema
│   │   │
│   │   ├── config/                            # Application configuration
│   │   │   ├── app.config.ts                  # Main app config (JWT, DB, Ports, ENV)
│   │   │   └── http.config.ts                 # HTTP status codes constants
│   │   │
│   │   ├── database/                          # Database layer
│   │   │   └── database.ts                    # MongoDB connection setup
│   │   │
│   │   ├── middlewares/                       # Express middlewares
│   │   │   ├── asyncHandler.ts                # Async error wrapper
│   │   │   ├── errorHandler.ts                # Global error handler
│   │   │   └── passport.ts                    # Passport.js authentication middleware
│   │   │
│   │   ├── services/                          # Shared services
│   │   │   ├── notification.service.ts        # Email/SMS notification service
│   │   │   ├── passportJwt.service.ts        # Passport JWT strategy
│   │   │   └── user.service.ts                # User-related utilities
│   │   │
│   │   ├── utils/                             # Utility functions & helpers
│   │   │   │
│   │   │   ├── Errors/                        # Custom error classes
│   │   │   │   └── ErrorTypes.ts              # AppError, ValidationError, etc.
│   │   │   │
│   │   │   ├── constants/                     # Application constants
│   │   │   │   └── constant.ts                # Shared constants
│   │   │   │
│   │   │   ├── cookies/                       # Cookie utilities
│   │   │   │   └── setCookies.ts              # Cookie helper functions
│   │   │   │
│   │   │   ├── jwt/                           # JWT utilities
│   │   │   │   └── jwt.ts                     # JWT sign/verify functions
│   │   │   │
│   │   │   ├── templates/                     # Email templates
│   │   │   │   └── template.ts                # HTML email templates
│   │   │   │
│   │   │   └── helper.ts                      # General helper functions
│   │   │
│   │   └── index.ts                           # Application entry point (Express server)
│   │
│   ├── node_modules/                          # Backend dependencies
│   ├── .env                                   # Environment variables (NOT in Git)
│   ├── .gitignore                            # Git ignore rules
│   ├── package.json                          # Backend dependencies & scripts
│   ├── package-lock.json                     # Dependency lock file
│   └── tsconfig.json                         # TypeScript configuration
│
│
├── Frontend/                                  # React + Vite + TypeScript Frontend
│   └── vms-psi/                              # Frontend application
│       │
│       ├── src/                              # Source code directory
│       │   │
│       │   ├── config/                       # Frontend configuration
│       │   │   └── styleConfig.css           # Custom CSS configurations
│       │   │
│       │   ├── context/                      # React Context providers
│       │   │   └── ThemeContext.tsx          # Theme management (light/dark mode)
│       │   │
│       │   ├── layout/                       # Layout components
│       │   │   ├── AppLayout.tsx             # Main app layout wrapper
│       │   │   ├── Header.tsx                # Header component (navbar)
│       │   │   └── Sidebar.tsx               # Sidebar navigation
│       │   │
│       │   ├── routes/                       # Routing configuration
│       │   │   └── Approutes.tsx             # React Router routes
│       │   │
│       │   ├── App.tsx                       # Root React component
│       │   ├── main.tsx                      # Application entry point (React + DOM)
│       │   ├── index.css                     # Global CSS styles
│       │   └── vite-env.d.ts                 # Vite environment types
│       │
│       ├── public/                           # Static assets
│       │   ├── favicon.svg                   # Browser favicon
│       │   ├── icons.svg                     # SVG icon sprite
│       │   ├── logo_blue_vms.png            # VMS logo (blue variant)
│       │   ├── logo_white_vms.png           # VMS logo (white variant)
│       │   └── premierSeals_group_logo.png  # Company logo
│       │
│       ├── node_modules/                     # Frontend dependencies
│       ├── .env                              # Frontend environment variables
│       ├── .gitignore                       # Git ignore rules
│       ├── index.html                        # HTML entry point
│       ├── package.json                      # Frontend dependencies & scripts
│       ├── package-lock.json                 # Dependency lock file
│       ├── eslint.config.js                  # ESLint configuration
│       ├── tsconfig.json                     # TypeScript base config
│       ├── tsconfig.app.json                 # TypeScript app-specific config
│       ├── tsconfig.node.json                # TypeScript Node.js config
│       ├── vite.config.ts                    # Vite bundler configuration
│       └── README.md                         # Frontend documentation
│
│
└── Readme.md                                  # Root project documentation

```

---

## Architecture Overview

### 1. Backend Architecture (Node.js + Express + TypeScript)

#### Layer Structure

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT REQUEST                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              MIDDLEWARE LAYER                        │
│  ├─ CORS (Cross-Origin Resource Sharing)            │
│  ├─ Body Parser (JSON/URL Encoded)                  │
│  ├─ Cookie Parser                                    │
│  ├─ Passport Authentication                         │
│  └─ Error Handler                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 ROUTE LAYER                         │
│  ├─ /api/auth/* (authRoutes.ts)                    │
│  └─ /api/sessions/* (sessionRoutes.ts)             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│             CONTROLLER LAYER                        │
│  ├─ authController.ts (Request Handlers)           │
│  └─ sessionController.ts (Request Handlers)         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              VALIDATION LAYER                       │
│  └─ Zod Schemas (authValidators.ts)                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              SERVICE LAYER                          │
│  ├─ authService.ts (Business Logic)                │
│  ├─ sessionService.ts                               │
│  ├─ notification.service.ts                         │
│  └─ user.service.ts                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            DATABASE LAYER (MongoDB)                 │
│  ├─ userModel.ts (Mongoose Schema)                 │
│  ├─ sessionModel.ts                                 │
│  └─ verificationModel.ts                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 RESPONSE                            │
└─────────────────────────────────────────────────────┘
```

#### File Path Mapping

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Entry Point** | `Backend/src/index.ts` | Express server initialization |
| **App Config** | `Backend/src/config/app.config.ts` | JWT, DB, Port, CORS settings |
| **HTTP Codes** | `Backend/src/config/http.config.ts` | Status code constants |
| **Database** | `Backend/src/database/database.ts` | MongoDB connection |
| **Auth Routes** | `Backend/src/api/auth/authRoutes.ts` | `/api/auth/*` endpoints |
| **Auth Controller** | `Backend/src/api/auth/authController.ts` | Request handlers |
| **Auth Service** | `Backend/src/api/auth/authService.ts` | Business logic |
| **Auth Validators** | `Backend/src/api/auth/authValidators.ts` | Zod schemas |
| **User Model** | `Backend/src/api/auth/userModel.ts` | User schema |
| **Session Routes** | `Backend/src/api/sessions/sessionRoutes.ts` | `/api/sessions/*` endpoints |
| **Session Controller** | `Backend/src/api/sessions/sessionController.ts` | Session handlers |
| **Session Service** | `Backend/src/api/sessions/sessionService.ts` | Session logic |
| **Session Model** | `Backend/src/api/sessions/sessionModel.ts` | Session schema |
| **Verification Model** | `Backend/src/api/sessions/verificationModel.ts` | OTP/Verification schema |
| **Error Handler** | `Backend/src/middlewares/errorHandler.ts` | Global error middleware |
| **Async Handler** | `Backend/src/middlewares/asyncHandler.ts` | Try-catch wrapper |
| **Passport Middleware** | `Backend/src/middlewares/passport.ts` | Auth middleware |
| **JWT Utilities** | `Backend/src/utils/jwt/jwt.ts` | Sign/verify JWT |
| **Cookie Utilities** | `Backend/src/utils/cookies/setCookies.ts` | Set cookies |
| **Error Types** | `Backend/src/utils/Errors/ErrorTypes.ts` | Custom errors |
| **Email Templates** | `Backend/src/utils/templates/template.ts` | Email HTML |
| **Helpers** | `Backend/src/utils/helper.ts` | General utilities |

---

### 2. Frontend Architecture (React + Vite + TypeScript)

#### Component Structure

```
┌─────────────────────────────────────────────────────┐
│              main.tsx (Entry Point)                  │
│              ├─ React.StrictMode                     │
│              └─ Renders <App />                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                    App.tsx                           │
│              ├─ ThemeContext Provider               │
│              ├─ React Query Provider                │
│              └─ Routes (Approutes.tsx)              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Approutes.tsx (Routing)                 │
│              └─ React Router (routes definition)    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            AppLayout.tsx (Main Layout)               │
│              ├─ <Header />                           │
│              ├─ <Sidebar />                          │
│              └─ <Outlet /> (Page content)           │
└─────────────────────────────────────────────────────┘
```

#### File Path Mapping

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Entry Point** | `Frontend/vms-psi/src/main.tsx` | React DOM render |
| **Root Component** | `Frontend/vms-psi/src/App.tsx` | App wrapper + providers |
| **Routes** | `Frontend/vms-psi/src/routes/Approutes.tsx` | React Router config |
| **Layout** | `Frontend/vms-psi/src/layout/AppLayout.tsx` | Main layout structure |
| **Header** | `Frontend/vms-psi/src/layout/Header.tsx` | Navigation header |
| **Sidebar** | `Frontend/vms-psi/src/layout/Sidebar.tsx` | Side navigation |
| **Theme Context** | `Frontend/vms-psi/src/context/ThemeContext.tsx` | Light/dark theme |
| **Global Styles** | `Frontend/vms-psi/src/index.css` | Base CSS |
| **Custom Styles** | `Frontend/vms-psi/src/config/styleConfig.css` | Custom CSS |
| **Vite Config** | `Frontend/vms-psi/vite.config.ts` | Build configuration |

---

## Technology Stack

### Backend Dependencies

| Package | Version | Purpose | File Path Usage |
|---------|---------|---------|-----------------|
| **express** | 5.2.1 | Web framework | `Backend/src/index.ts` |
| **mongoose** | 9.7.3 | MongoDB ODM | `Backend/src/database/database.ts` |
| **jsonwebtoken** | 9.0.3 | JWT auth | `Backend/src/utils/jwt/jwt.ts` |
| **bcrypt** | 6.0.0 | Password hashing | `Backend/src/api/auth/authService.ts` |
| **zod** | 4.4.3 | Validation | `Backend/src/api/auth/authValidators.ts` |
| **passport** | 0.7.0 | Auth middleware | `Backend/src/middlewares/passport.ts` |
| **passport-jwt** | 4.0.1 | JWT strategy | `Backend/src/services/passportJwt.service.ts` |
| **cors** | 2.8.6 | CORS handling | `Backend/src/index.ts` |
| **cookie-parser** | 1.4.7 | Cookie parsing | `Backend/src/index.ts` |
| **dotenv** | 17.4.2 | Environment vars | `Backend/src/config/app.config.ts` |
| **date-fns** | 4.4.0 | Date utilities | Throughout services |
| **moment** | 2.30.1 | Date/time | Throughout services |
| **axios** | 1.18.1 | HTTP client | Services layer |
| **uuid** | 14.0.1 | Unique IDs | Session/verification |

### Frontend Dependencies

| Package | Version | Purpose | File Path Usage |
|---------|---------|---------|-----------------|
| **react** | 19.2.7 | UI library | `Frontend/vms-psi/src/main.tsx` |
| **react-dom** | 19.2.7 | DOM rendering | `Frontend/vms-psi/src/main.tsx` |
| **react-router-dom** | 7.18.1 | Routing | `Frontend/vms-psi/src/routes/Approutes.tsx` |
| **@tanstack/react-query** | 5.101.2 | Data fetching | `Frontend/vms-psi/src/App.tsx` |
| **react-hook-form** | 7.80.0 | Form handling | Future forms |
| **zod** | 4.4.3 | Validation | Form validation |
| **axios** | 1.18.1 | API calls | API layer |
| **tailwindcss** | 4.3.2 | Styling | All components |
| **lucide-react** | 1.23.0 | Icons | UI components |
| **react-icons** | 5.7.0 | Icons | UI components |
| **vite** | 8.1.1 | Build tool | `Frontend/vms-psi/vite.config.ts` |

---

## API Endpoint Structure

### Authentication Endpoints
```
POST   /api/auth/register           → authController.ts::register()
POST   /api/auth/login              → authController.ts::login()
POST   /api/auth/logout             → authController.ts::logout()
POST   /api/auth/refresh            → authController.ts::refreshToken()
POST   /api/auth/verify-email       → authController.ts::verifyEmail()
POST   /api/auth/forgot-password    → authController.ts::forgotPassword()
POST   /api/auth/reset-password     → authController.ts::resetPassword()
```

### Session Endpoints
```
GET    /api/sessions                → sessionController.ts::getSessions()
GET    /api/sessions/:id            → sessionController.ts::getSessionById()
POST   /api/sessions                → sessionController.ts::createSession()
PUT    /api/sessions/:id            → sessionController.ts::updateSession()
DELETE /api/sessions/:id            → sessionController.ts::deleteSession()
```

---

## Database Schema Architecture

### User Model (`Backend/src/api/auth/userModel.ts`)
```typescript
{
  email: string (unique, indexed)
  password: string (hashed with bcrypt)
  name: string
  role: "admin" | "receptionist" | "security"
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Session Model (`Backend/src/api/sessions/sessionModel.ts`)
```typescript
{
  userId: ObjectId (ref: User)
  refreshToken: string
  ipAddress: string
  userAgent: string
  expiresAt: Date
  createdAt: Date
}
```

### Verification Model (`Backend/src/api/sessions/verificationModel.ts`)
```typescript
{
  userId: ObjectId (ref: User)
  code: string (OTP)
  type: "email" | "password-reset"
  expiresAt: Date
  createdAt: Date
}
```

---

## Data Flow Diagrams

### 1. User Registration Flow

```
┌───────────┐
│  Frontend │
│  (Form)   │
└─────┬─────┘
      │ POST /api/auth/register
      │ { email, password, name }
      ↓
┌──────────────────────────┐
│  authRoutes.ts           │
│  (Route Definition)      │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  authController.ts       │
│  register() handler      │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  authValidators.ts       │
│  Zod schema validation   │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  authService.ts          │
│  ├─ Hash password        │
│  ├─ Save to DB           │
│  └─ Send verification    │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  userModel.ts            │
│  Mongoose save()         │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  notification.service.ts │
│  Send verification email │
└─────────┬────────────────┘
          │
          ↓
┌───────────────────────────┐
│  Response to Frontend     │
│  { success, message }     │
└───────────────────────────┘
```

### 2. User Login Flow

```
┌───────────┐
│  Frontend │
│  (Form)   │
└─────┬─────┘
      │ POST /api/auth/login
      │ { email, password }
      ↓
┌──────────────────────────┐
│  authController.ts       │
│  login() handler         │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  authService.ts          │
│  ├─ Find user            │
│  ├─ Compare password     │
│  └─ Generate tokens      │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  jwt.ts                  │
│  ├─ Sign access token    │
│  └─ Sign refresh token   │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  setCookies.ts           │
│  Set httpOnly cookies    │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│  sessionService.ts       │
│  Save session to DB      │
└─────────┬────────────────┘
          │
          ↓
┌───────────────────────────┐
│  Response to Frontend     │
│  { user, accessToken }    │
│  + Set-Cookie header      │
└───────────────────────────┘
```

---

## Environment Configuration

### Backend (.env location: `Backend/.env`)
```bash
PORT=4000
NODE_ENV=development
APP_ORIGIN=https://localhost:5173

# JWT
JWT_SECRET=jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

**Used in**: `Backend/src/config/app.config.ts`

### Frontend (.env location: `Frontend/vms-psi/.env`)
```bash
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=VMS
```

**Used in**: API service layer (future implementation)

---

## Build & Deployment Flow

### Development Mode

```
┌────────────────────────────────────────┐
│  Terminal 1: Backend                    │
│  $ cd Backend                           │
│  $ npm run server                       │
│  → ts-node-dev --files ./src/index.ts  │
│  → Running on http://localhost:4000    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Terminal 2: Frontend                   │
│  $ cd Frontend/vms-psi                  │
│  $ npm run dev                          │
│  → vite dev server                      │
│  → Running on http://localhost:5173    │
└────────────────────────────────────────┘
```

### Production Build

**Backend**:
```bash
cd Backend
npm run build           # TypeScript → JavaScript (dist/)
npm start               # node dist/index.js
```

**Frontend**:
```bash
cd Frontend/vms-psi
npm run build           # Vite build → dist/
npm run preview         # Preview production build
```

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────┐
│  1. User logs in                                 │
│     ├─ Password verified with bcrypt            │
│     └─ JWT tokens generated                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Server sends tokens                          │
│     ├─ Access Token (1h) → Response body        │
│     └─ Refresh Token (30d) → httpOnly cookie    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Client stores tokens                         │
│     ├─ Access Token → Memory/State              │
│     └─ Refresh Token → Cookie (httpOnly)        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. API requests include access token            │
│     Header: Authorization: Bearer <token>        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5. passport.ts middleware verifies token        │
│     ├─ jwt.verify()                              │
│     ├─ Find user in DB                           │
│     └─ Attach user to req.user                   │
└─────────────────────────────────────────────────┘
```

**Key Files**:
- Token generation: `Backend/src/utils/jwt/jwt.ts`
- Cookie setting: `Backend/src/utils/cookies/setCookies.ts`
- Auth middleware: `Backend/src/middlewares/passport.ts`
- JWT strategy: `Backend/src/services/passportJwt.service.ts`

---

## Module Dependency Graph

### Backend Dependencies

```
index.ts (Entry)
  ├─→ config/app.config.ts
  ├─→ config/http.config.ts
  ├─→ database/database.ts
  ├─→ middlewares/errorHandler.ts
  ├─→ middlewares/passport.ts
  │     └─→ services/passportJwt.service.ts
  │           └─→ utils/jwt/jwt.ts
  │
  └─→ api/auth/authRoutes.ts
        └─→ api/auth/authController.ts
              ├─→ api/auth/authValidators.ts
              └─→ api/auth/authService.ts
                    ├─→ api/auth/userModel.ts
                    ├─→ services/notification.service.ts
                    ├─→ utils/jwt/jwt.ts
                    └─→ utils/cookies/setCookies.ts
```

### Frontend Dependencies

```
main.tsx (Entry)
  └─→ App.tsx
        ├─→ context/ThemeContext.tsx
        └─→ routes/Approutes.tsx
              └─→ layout/AppLayout.tsx
                    ├─→ layout/Header.tsx
                    └─→ layout/Sidebar.tsx
```

---

## Naming Conventions

### Backend

| Type | Convention | Example |
|------|------------|---------|
| **Files** | camelCase.ts | `authController.ts` |
| **Models** | camelCase + Model.ts | `userModel.ts` |
| **Routes** | camelCase + Routes.ts | `authRoutes.ts` |
| **Services** | camelCase + Service.ts | `authService.ts` |
| **Validators** | camelCase + Validators.ts | `authValidators.ts` |
| **Middlewares** | camelCase.ts | `errorHandler.ts` |
| **Utils** | camelCase.ts | `helper.ts` |
| **Types** | types.d.ts | `types.d.ts` |

### Frontend

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase.tsx | `Header.tsx` |
| **Contexts** | PascalCase + Context.tsx | `ThemeContext.tsx` |
| **Routes** | PascalCase + routes.tsx | `Approutes.tsx` |
| **Layouts** | PascalCase + Layout.tsx | `AppLayout.tsx` |
| **Styles** | camelCase.css | `styleConfig.css` |

---

## Port Configuration

| Service | Port | URL | Environment Variable |
|---------|------|-----|----------------------|
| **Backend API** | 4000 | http://localhost:4000 | `PORT` |
| **Frontend Dev** | 5173 | http://localhost:5173 | Vite default |
| **MongoDB** | 27017 | Cloud (Atlas) | `MONGO_URI` |

---

## Quick Reference: Common Tasks

### Add New API Endpoint

1. Create route in `Backend/src/api/<module>/<module>Routes.ts`
2. Create controller in `Backend/src/api/<module>/<module>Controller.ts`
3. Create service in `Backend/src/api/<module>/<module>Service.ts`
4. Create validator in `Backend/src/api/<module>/<module>Validators.ts`
5. Create model in `Backend/src/api/<module>/<module>Model.ts` (if needed)
6. Import route in `Backend/src/index.ts`

### Add New Frontend Page

1. Create component in `Frontend/vms-psi/src/pages/<PageName>.tsx`
2. Add route in `Frontend/vms-psi/src/routes/Approutes.tsx`
3. Add navigation link in `Frontend/vms-psi/src/layout/Sidebar.tsx`

### Add New Environment Variable

1. Add to `.env` file
2. Update `Backend/src/config/app.config.ts` (backend)
3. Update API config (frontend)
4. Document in this file

---

## Summary

This VMS application follows a **modular, layered architecture**:

- **Backend**: Express.js with TypeScript, following MVC pattern (Model-Controller-Service-Route)
- **Frontend**: React with Vite, component-based architecture
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with access/refresh tokens
- **Validation**: Zod for runtime type checking
- **Styling**: TailwindCSS for frontend

**Key Design Principles**:
1. Separation of concerns (routes → controllers → services → models)
2. Type safety (TypeScript + Zod)
3. Security-first (JWT, bcrypt, httpOnly cookies)
4. Modular structure (easy to extend)
5. Environment-based configuration

---

**Last Updated**: July 9, 2026  
**Version**: 1.0.0
