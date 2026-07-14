# VMS (Visitor Management System) - Full Stack Application

## Project Overview
VMS is a full-stack Visitor Management System built with Node.js/Express (Backend) and (Frontend TBD). This system manages visitor check-ins, check-outs, authentication, and tracking.

---

## Project Structure

```
VMS_New/
├── Backend/              # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── utils/       # Helper utilities
│   │   └── index.ts     # Application entry point
│   ├── dist/            # Compiled JavaScript (after build)
│   ├── .env             # Environment variables (DO NOT COMMIT)
│   ├── package.json     # Backend dependencies
│   └── tsconfig.json    # TypeScript configuration
│
├── Frontend/            # Frontend (Empty - To be initialized)
│
└── Readme.md           # This file
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JWT (Access + Refresh tokens) with bcrypt
- **Validation**: Zod v4.4.3
- **Dev Tools**: ts-node-dev, nodemon

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.2.1 | Web framework |
| mongoose | 9.7.3 | MongoDB ODM |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcrypt | 6.0.0 | Password hashing |
| zod | 4.4.3 | Schema validation |
| cors | 2.8.6 | Cross-origin resource sharing |
| cookie-parser | 1.4.7 | Cookie handling |
| dotenv | 17.4.2 | Environment variable management |
| date-fns | 4.4.0 | Date manipulation |
| moment | 2.30.1 | Date/time handling |

---

## Current Implementation Status

### Completed Features
- [x] Basic Express server setup
- [x] TypeScript configuration
- [x] Environment variable management
- [x] CORS configuration
- [x] Cookie parser middleware
- [x] HTTP status code constants
- [x] Configuration management system
- [x] JWT setup (tokens configured)
- [x] MongoDB connection URI configured

### Backend Architecture

#### 1. Entry Point (`src/index.ts`)
Main application file that:
- Initializes Express app
- Configures middleware (JSON parser, URL encoder, cookie parser, CORS)
- Sets up CORS with credentials support
- Defines base route (`/`) returning welcome message
- Starts server on configured port

#### 2. Configuration System (`src/config/app.config.ts`)
Centralized configuration management:
- **Environment**: `NODE_ENV` (development/production)
- **Server**: `PORT` (default: 5000)
- **CORS**: `APP_ORIGIN` (frontend URL - default: http://localhost:5173)
- **API**: `BASE_PATH` (default: /api)
- **JWT Settings**:
  - Access token: Secret + 1h expiry
  - Refresh token: Secret + 30d expiry
- **Database**: MongoDB URI

#### 3. HTTP Status Codes (`src/config/http.config.ts`)
Type-safe HTTP status code constants:
- Success: 200, 201, 202, 204
- Client Errors: 400, 401, 403, 404, 405, 409, 422, 429
- Server Errors: 500, 501, 502, 503, 504

#### 4. Helper Utils (`src/utils/helper.ts`)
- `getEnviourments()`: Safe environment variable getter with defaults and error handling

---

## Environment Variables

### Current Configuration (`.env`)
```bash
# Server Configuration
PORT=4000
NODE_ENV="developement"
APP_ORIGIN="https://localhost:5173"

# JWT Configuration
JWT_SECRET="jwt_secret_key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="jwt_refresh_secret_key"
JWT_REFRESH_EXPIRES_IN="30d"

# Database
MONGO_URI="mongodb+srv://sharmagourav9654:***@cluster5.1r2x2.mongodb.net/project_auth_kit"

# Email Service (Commented - Future Implementation)
# RESEND_API_KEY="re_***"
# MAILER_SENDER="onboarding@gmail.com"
```

**Important**: Never commit `.env` file. It's already in `.gitignore`.

---

## How to Run (Current Setup)

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account (using cloud DB)
- npm or yarn

### Backend Setup

1. **Navigate to Backend folder**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run server
   ```
   This runs `ts-node-dev --files ./src/index.ts` with hot-reload.

4. **Verify it's running**:
   - Server runs on: `http://localhost:4000`
   - Test endpoint: `GET http://localhost:4000/`
   - Expected response:
     ```json
     {
       "message": "Welcome to the VMS API"
     }
     ```

### Build for Production

1. **Compile TypeScript**:
   ```bash
   npm run build
   ```
   This creates the `dist/` folder with compiled JavaScript.

2. **Run production build**:
   ```bash
   npm start
   ```
   Runs `node dist/index.js`.

---

## Running Frontend & Backend Together (Future Setup)

Since the frontend is not yet initialized, here's the **recommended approach**:

### Option 1: Separate Terminal Windows (Development)
**Best for development** - run each in its own terminal:

```bash
# Terminal 1 - Backend
cd Backend
npm run server

# Terminal 2 - Frontend (when ready)
cd Frontend
npm run dev  # or npm start (depends on framework)
```

**Ports**:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173` (Vite) or `3000` (React/Next.js)

### Option 2: Concurrently Package (Recommended)
Install `concurrently` in the **root** folder to run both with one command:

```bash
# In project root (VMS_New/)
npm init -y
npm install concurrently --save-dev
```

Add scripts to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd Backend && npm run server",
    "dev:frontend": "cd Frontend && npm run dev"
  }
}
```

Then run:
```bash
npm run dev
```

### Option 3: Docker Compose (Production-Ready)
Create `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  backend:
    build: ./Backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
```

Run:
```bash
docker-compose up
```

---

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Visitors
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/:id` - Get visitor by ID
- `POST /api/visitors` - Register new visitor
- `PUT /api/visitors/:id` - Update visitor
- `DELETE /api/visitors/:id` - Delete visitor

### Check-in/Check-out
- `POST /api/checkin` - Check-in visitor
- `POST /api/checkout` - Check-out visitor
- `GET /api/visits` - Get visit history

---

## Database Schema (Planned)

### User Model
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  role: 'admin' | 'receptionist' | 'security'
  createdAt: Date
  updatedAt: Date
}
```

### Visitor Model
```typescript
{
  name: string
  email: string
  phone: string
  company: string
  purpose: string
  hostName: string
  photoUrl?: string
  idProof?: string
  createdAt: Date
}
```

### Visit Model
```typescript
{
  visitorId: ObjectId (ref: Visitor)
  checkInTime: Date
  checkOutTime?: Date
  status: 'checked-in' | 'checked-out'
  notes?: string
}
```

---

## Development Workflow

### How the Flow Works

1. **Request Flow**:
   ```
   Client → CORS Middleware → Express JSON Parser → Cookie Parser → Route Handler → Response
   ```

2. **Configuration Loading**:
   ```
   .env file → helper.getEnviourments() → app.config.ts → Used across app
   ```

3. **Type Safety**:
   - TypeScript ensures type checking at compile time
   - Zod will validate runtime data (when schemas are added)
   - HTTP status codes are type-safe via `HttpStatusCode` type

### Key Design Decisions

1. **Why separate config files?**
   - `app.config.ts`: Application-level settings (ports, JWT, DB)
   - `http.config.ts`: HTTP-related constants (reusable status codes)
   - Separation of concerns for better maintainability

2. **Why helper function for environment variables?**
   - Centralized error handling
   - Default value support
   - Type safety
   - Throws early if critical env vars are missing

3. **Why CORS with credentials?**
   - Enables cookie-based authentication (httpOnly cookies)
   - Secure JWT refresh token storage

4. **Why both access and refresh tokens?**
   - Access token: Short-lived (1h), used for API requests
   - Refresh token: Long-lived (30d), used to get new access tokens
   - Better security: if access token is compromised, it expires quickly

---

## Security Considerations

### Implemented
- [x] CORS configured with specific origin
- [x] Credentials enabled for secure cookie handling
- [x] Environment variables for secrets
- [x] JWT with separate access/refresh tokens
- [x] bcrypt for password hashing (library ready)

### To Implement
- [ ] Helmet.js for HTTP headers security
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation with Zod schemas
- [ ] SQL injection protection (using Mongoose prevents this)
- [ ] XSS protection
- [ ] CSRF tokens for state-changing operations
- [ ] MongoDB connection with proper authentication
- [ ] Password strength validation
- [ ] Account lockout after failed attempts
- [ ] Audit logging for sensitive operations

---

## Next Steps (Development Roadmap)

### Immediate Tasks
1. [ ] Connect MongoDB and test connection
2. [ ] Create Mongoose models (User, Visitor, Visit)
3. [ ] Implement authentication routes
4. [ ] Add Zod validation schemas
5. [ ] Create middleware (auth, error handling)
6. [ ] Initialize Frontend (React/Next.js/Vue)

### Phase 1 - Authentication
- [ ] User registration with validation
- [ ] Login with JWT generation
- [ ] Refresh token rotation
- [ ] Logout functionality
- [ ] Password reset flow

### Phase 2 - Visitor Management
- [ ] Visitor CRUD operations
- [ ] Check-in/check-out system
- [ ] Visit history tracking
- [ ] Photo upload (optional)

### Phase 3 - Frontend Integration
- [ ] Setup frontend framework
- [ ] Create authentication UI
- [ ] Build dashboard
- [ ] Visitor registration form
- [ ] Real-time visitor status

### Phase 4 - Advanced Features
- [ ] Email notifications (using RESEND_API)
- [ ] QR code generation for visitors
- [ ] SMS notifications
- [ ] Reports and analytics
- [ ] Role-based access control

---

## Troubleshooting

### Backend not starting?
1. Check if port 4000 is already in use:
   ```bash
   netstat -ano | findstr :4000  # Windows
   lsof -i :4000                 # Mac/Linux
   ```
2. Verify `.env` file exists in Backend folder
3. Check MongoDB URI is valid
4. Ensure Node.js version is 18+

### TypeScript errors?
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear TypeScript cache:
   ```bash
   rm -rf dist
   ```

### CORS issues?
1. Verify `APP_ORIGIN` in `.env` matches frontend URL
2. Check if frontend is running on the specified port
3. Ensure credentials: true is set in frontend fetch/axios config

---

## Maintenance Guidelines

### Adding New Environment Variables
1. Add to `.env` file
2. Update `app.config.ts` with `getEnviourments()` call
3. Document in this README under "Environment Variables"

### Adding New Routes
1. Create route file in `src/routes/`
2. Import in `index.ts`
3. Mount with `app.use(BASE_PATH, router)`
4. Document endpoint in "API Endpoints" section

### Adding New Models
1. Create schema in `src/models/`
2. Export model
3. Document schema in "Database Schema" section

### Code Style
- Use TypeScript strict mode
- Follow functional programming patterns
- Use async/await (not callbacks)
- Keep functions pure where possible
- Add JSDoc comments for complex logic

---

## Contact & Support

**Project Lead**: Gaurav Sharma
**Database**: MongoDB Atlas (Cluster5)

---

## License
[Add License Here]

---

**Last Updated**: July 4, 2026
**Version**: 0.1.0 (Initial Setup Phase)




















////---//
# Offline Support Feature
    2
    3 ## Overview
    4 This application now includes comprehensive offline support with production-ready features including:
    5 - Real-time network status monitoring
    6 - Elegant offline UI/UX with theme matching
    7 - Request queueing for offline operations
    8 - Automatic retry mechanism when connection is restored
    9 - Service worker for asset caching
   10 - Connection quality indicators
   11
   12 ## Features Implemented
   13
   14 ### 1. Network Status Hook (`useOnlineStatus`)
   15 **Location**: `src/hooks/useOnlineStatus.ts`
   16
   17 Provides real-time network monitoring with:
   18 - Online/offline status detection
   19 - Connection quality assessment (good/poor/offline)
   20 - Last online/offline timestamps
   21 - Periodic connectivity checks (every 30 seconds)
   22 - Automatic checks on tab focus/visibility change
   23
   24 ### 2. Offline Indicator Components
   25 **Location**: `src/components/common/OfflineIndicator.tsx`
   26
   27 Two main components:
   28
   29 #### `<OfflineIndicator />`
   30 - Small notification banner at top-right
   31 - Shows when connection is lost
   32 - Shows "Back online" message when reconnected (auto-dismisses after 5s)
   33 - Themed to match application colors
   34
   35 #### `<OfflineOverlay />`
   36 - Full-screen overlay when offline
   37 - Beautiful, centered UI with:
   38   - Animated cloud icon
   39   - Clear "You're Offline" message
   40   - "Try Again" button with loading state
   41   - Troubleshooting tips
   42   - Auto-reconnect messaging
   43
   44 ### 3. Connection Quality Indicator
   45 **Location**: `src/components/common/ConnectionQuality.tsx`
   46
   47 - Displays in header
   48 - Shows connection status with icons:
   49   - ✅ Green wifi icon = Connected
   50   - ⚠️ Yellow wifi icon = Slow connection
   51   - ❌ Red wifi-off icon = Offline
   52
   53 ### 4. Network Context
   54 **Location**: `src/context/NetworkContext.tsx`
   55
   56 Global state management for network status across the app.
   57
   58 ### 5. Offline Request Queue
   59 **Location**: `src/utils/offlineQueue.ts`
   60
   61 Intelligent request queueing system:
   62 - Queues POST/PUT/PATCH requests when offline
   63 - Stores in localStorage for persistence
   64 - Auto-retries up to 3 times when online
   65 - Processes queue automatically on connection restore
   66 - Dispatches custom events for success/failure
   67
   68 ### 6. Axios Integration
   69 **Modified**: `src/services/api/axiosInstance.ts`
   70
   71 Enhanced axios instance with:
   72 - Automatic offline detection
   73 - Request interception when offline
   74 - Queue management for failed requests
   75 - Network error handling
   76
   77 ### 7. Service Worker
   78 **Location**: `src/service-worker.js`
   79
   80 Provides:
   81 - Asset caching for offline availability
   82 - Cache-first strategy for performance
   83 - Automatic cache updates
   84
   85 ### 8. Custom Animations
   86 **Updated**: `src/index.css`
   87
   88 Added smooth animations:
   89 - `slide-down` - For indicator appearance
   90 - `slide-up` - For indicator disappearance
   91 - `pulse-slow` - For offline icon animation
   92
   93 ## How It Works
   94
   95 ### Detection Flow
   96 1. Browser's `navigator.onLine` provides initial state
   97 2. Custom hook adds periodic health checks
   98 3. Attempts to ping `/api/health` or Google's favicon
   99 4. Measures response time for quality assessment
  100 5. Listens to `online`/`offline` browser events
  101
  102 ### Offline Flow
  103 1. User loses connection
  104 2. `OfflineIndicator` shows warning banner
  105 3. `OfflineOverlay` displays full-screen message (optional, controlled by context)
  106 4. Any POST/PUT/PATCH requests are queued
  107 5. GET requests fail gracefully
  108
  109 ### Reconnection Flow
  110 1. Connection restored (detected via events or periodic checks)
  111 2. "Back online" notification appears
  112 3. Queued requests automatically process
  113 4. Custom events fired for app-wide updates
  114 5. User can continue work seamlessly
  115
  116 ## Usage
  117
  118 The offline support is automatically integrated. No manual setup needed.
  119
  120 ### Access Network Status in Components
  121 ```tsx
  122 import { useNetwork } from "@/context/NetworkContext"
  123
  124 function MyComponent() {
  125   const { isOnline, connectionQuality, showOfflineMode } = useNetwork()
  126
  127   return (
  128     <div>
  129       {!isOnline && <p>You're offline</p>}
  130       {connectionQuality === "poor" && <p>Slow connection</p>}
  131     </div>
  132   )
  133 }
  134 ```
  135
  136 ### Queue Custom Requests
  137 ```tsx
  138 import { offlineQueue } from "@/utils/offlineQueue"
  139
  140 // Add to queue manually
  141 offlineQueue.addRequest("/api/endpoint", "POST", { data: "value" })
  142
  143 // Check queue size
  144 const size = offlineQueue.getQueueSize()
  145
  146 // Clear queue (if needed)
  147 offlineQueue.clearQueue()
  148 ```
  149
  150 ### Listen to Network Events
  151 ```tsx
  152 useEffect(() => {
  153   const handleRestore = () => {
  154     console.log("Connection restored!")
  155     // Refresh data, show notification, etc.
  156   }
  157
  158   window.addEventListener("connection-restored", handleRestore)
  159   return () => window.removeEventListener("connection-restored", handleRestore)
  160 }, [])
  161 ```
  162
  163 ## Configuration
  164
  165 ### Customize Timings
  166 Edit `src/hooks/useOnlineStatus.ts`:
  167 ```ts
  168 const PING_INTERVAL = 30000 // Check every 30s
  169 const PING_TIMEOUT = 5000   // Wait 5s for response
  170 const POOR_CONNECTION_THRESHOLD = 3000 // 3s = poor connection
  171 ```
  172
  173 ### Customize Max Retries
  174 Edit `src/utils/offlineQueue.ts`:
  175 ```ts
  176 const MAX_RETRY_COUNT = 3 // Retry failed requests 3 times
  177 ```
  178
  179 ### Customize Service Worker Cache
  180 Edit `src/service-worker.js`:
  181 ```js
  182 const CACHE_NAME = "vms-cache-v1"
  183 const urlsToCache = [
  184   "/",
  185   "/index.html",
  186   // Add more URLs to cache
  187 ]
  188 ```
  189
  190 ## Theme Integration
  191
  192 All offline components use CSS variables from `styleConfig.css`:
  193 - `--color-background` - Background color
  194 - `--color-surface` - Card background
  195 - `--color-text-primary` - Primary text
  196 - `--color-text-secondary` - Secondary text
  197 - `--color-text-muted` - Muted text
  198 - `--color-border` - Border color
  199 - `--color-warning` - Warning color (offline indicator)
  200 - `--color-success` - Success color (reconnect indicator)
  201 - `--color-danger` - Danger color (connection quality)
  202
  203 Works seamlessly in both light and dark modes.
  204
  205 ## Production Checklist
  206
  207 ✅ Real-time network monitoring
  208 ✅ Offline detection with fallback checks
  209 ✅ Beautiful, themed offline UI
  210 ✅ Request queueing for offline operations
  211 ✅ Automatic retry mechanism
  212 ✅ Service worker caching
  213 ✅ Connection quality indicators
  214 ✅ Custom events for app-wide coordination
  215 ✅ LocalStorage persistence for queue
  216 ✅ Responsive design
  217 ✅ Dark mode support
  218 ✅ Smooth animations
  219 ✅ User-friendly error messages
  220 ✅ Troubleshooting tips
  221
  222 ## Browser Support
  223
  224 - ✅ Chrome/Edge (Chromium)
  225 - ✅ Firefox
  226 - ✅ Safari
  227 - ✅ Mobile browsers (iOS Safari, Chrome Mobile)
  228
  229 Requires:
  230 - Service Worker support
  231 - LocalStorage support
  232 - Fetch API support
  233
  234 ## Testing
  235
  236 ### Simulate Offline Mode
  237 1. Open Chrome DevTools
  238 2. Go to Network tab
  239 3. Select "Offline" from throttling dropdown
  240 4. Observe offline UI and behavior
  241
  242 ### Test Queue Persistence
  243 1. Go offline
  244 2. Make POST/PUT/PATCH request
  245 3. Check console for "queued" message
  246 4. Go back online
  247 5. Observe automatic request processing
  248
  249 ### Test Connection Quality
  250 1. Use Chrome DevTools Network throttling
  251 2. Select "Slow 3G" or "Fast 3G"
  252 3. Observe connection quality indicator in header
  253
  254 ## Events Reference
  255
  256 ### Custom Events Dispatched
  257
  258 - `connection-lost` - Fired when connection is lost
  259 - `connection-restored` - Fired when connection is restored
  260 - `offline-request-processed` - Fired when queued request succeeds
  261 - `offline-request-failed` - Fired when queued request fails after retries
  262 - `sw-update-available` - Fired when new service worker version available
  263
  264 Listen with:
  265 ```tsx
  264 Listen with:
  265 ```tsx
  266 window.addEventListener("connection-restored", handler)
  267 ```
  268
  269 ## Files Created/Modified
  270
  271 ### New Files
  272 - `src/hooks/useOnlineStatus.ts`
  273 - `src/components/common/OfflineIndicator.tsx`
  274 - `src/components/common/ConnectionQuality.tsx`
  275 - `src/context/NetworkContext.tsx`
  276 - `src/utils/offlineQueue.ts`
  277 - `src/utils/axiosInterceptor.ts` (deprecated - logic moved to axiosInstance)
  278 - `src/utils/registerServiceWorker.ts`
  279 - `src/service-worker.js`
  280
  281 ### Modified Files
  282 - `src/App.tsx` - Added NetworkProvider, OfflineIndicator, OfflineOverlay
  283 - `src/main.tsx` - Added service worker registration
  284 - `src/services/api/axiosInstance.ts` - Added offline detection and queueing
  285 - `src/layout/Header.tsx` - Added ConnectionQuality component
  286 - `src/index.css` - Added custom animations
  287 - `vite.config.ts` - Added service worker build configuration
  288
  289 ## Future Enhancements
  290
  291 Possible improvements:
  292 - [ ] IndexedDB for larger offline data storage
  293 - [ ] Background sync API for more reliable queueing
  294 - [ ] Offline data viewing (cached responses)
  295 - [ ] Conflict resolution for concurrent edits
  296 - [ ] Push notifications for connection status
  297 - [ ] Bandwidth usage monitoring
  298 - [ ] Offline analytics queueing
