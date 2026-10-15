# DSA Tracker - System Design & Database Schema

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Design (HLD)](#high-level-design-hld)
3. [Low-Level Design (LLD)](#low-level-design-lld)
4. [Database Schema](#database-schema)
5. [Scalability & Performance](#scalability--performance)

---

## System Overview

**DSA Tracker** is a comprehensive platform for tracking Data Structures & Algorithms practice. The system is designed to handle **10,000–50,000 active users** with features including:

- User authentication and session management
- Problem tracking across multiple platforms (LeetCode, Codeforces)
- Progress analytics and streak tracking
- Study plan scheduling with email reminders
- Topic-wise problem organization
- Code execution environment

**Tech Stack:**
- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT with refresh tokens (httpOnly cookies)
- **Deployment:** AWS EC2, Nginx
- **Email Service:** AWS Lambda (SES)
- **Caching:** In-memory caching for frequently accessed data

---

## High-Level Design (HLD)

### 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   React SPA (Vite + TypeScript)                          │  │
│  │   - Authentication UI                                     │  │
│  │   - Dashboard & Analytics                                 │  │
│  │   - Study Plan Calendar                                   │  │
│  │   - Problem Browser & Code Editor                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST API
                         │ (JWT Auth)
┌────────────────────────▼────────────────────────────────────────┐
│                      NGINX REVERSE PROXY                         │
│  - Static file serving (React build)                            │
│  - API request routing (/api/v1/*)                              │
│  - SSL termination (production)                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    APPLICATION LAYER (PM2)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Express.js REST API Server                     │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Controllers Layer                                  │ │  │
│  │  │  - Auth Controller (login, register, refresh)      │ │  │
│  │  │  - Progress Controller (track, stats, streaks)     │ │  │
│  │  │  - Problem Controller (CRUD, sync)                 │ │  │
│  │  │  - Study Plan Controller (schedule, reminders)     │ │  │
│  │  │  - Topic Controller (hierarchy, filtering)         │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Middleware Layer                                   │ │  │
│  │  │  - JWT Authentication (Passport.js)                │ │  │
│  │  │  - CORS Handler                                    │ │  │
│  │  │  - Error Handler                                   │ │  │
│  │  │  - Request Validation                              │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Service Layer                                      │ │  │
│  │  │  - Authentication Service                          │ │  │
│  │  │  - Progress Tracking Service                       │ │  │
│  │  │  - Reminder Service (Background Job)               │ │  │
│  │  │  - Email Notification Service                      │ │  │
│  │  │  - External API Integration (LeetCode, CF)         │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴──────────────────┐
        │                                   │
┌───────▼──────────┐              ┌────────▼─────────┐
│  MongoDB Atlas   │              │  External APIs   │
│  (Database)      │              │  - AWS Lambda    │
│  - Users         │              │  - LeetCode API  │
│  - Problems      │              │  - Codeforces    │
│  - Progress      │              │  - Judge0        │
│  - Study Plans   │              └──────────────────┘
│  - Sessions      │
│  - Topics        │
└──────────────────┘
```

### 2. Request Flow

#### **A. User Registration Flow**
```
1. User enters credentials → Frontend validation
2. POST /api/v1/auth/register
3. Backend validates email/username uniqueness
4. Password hashed (bcrypt, salt rounds: 10)
5. User document created in MongoDB
6. JWT access token (1h) + refresh token (30d) generated
7. Tokens set as httpOnly cookies
8. User object returned to frontend
9. User redirected to dashboard
```

#### **B. Authentication Flow**
```
1. Login: POST /api/v1/auth/login
   ├─ Validate credentials
   ├─ Generate access token (1h expiry)
   ├─ Generate refresh token (30d expiry)
   ├─ Store refresh token in database (Sessions collection)
   └─ Set httpOnly cookies

2. Protected Route Access:
   ├─ Frontend sends request with cookies
   ├─ Middleware extracts access token
   ├─ JWT verification (passport-jwt strategy)
   ├─ If valid → proceed to controller
   └─ If expired → 401 Unauthorized

3. Token Refresh: GET /api/v1/auth/refresh
   ├─ Extract refresh token from cookie
   ├─ Verify refresh token in database
   ├─ Generate new access token
   ├─ Set new access token cookie
   └─ Return success

4. Logout: POST /api/v1/auth/logout
   ├─ Delete session from database
   ├─ Clear cookies
   └─ Return success
```

#### **C. Progress Tracking Flow**
```
1. User marks problem as solved
2. POST /api/v1/progress/update
3. Backend validates problem exists
4. Update/Create UserProgress document:
   ├─ Add problem to solved array
   ├─ Update difficulty counts
   ├─ Recalculate streak
   └─ Update lastSolvedDate
5. Update UserStats aggregate:
   ├─ Total solved count
   ├─ Difficulty breakdown
   ├─ Current streak
   └─ Max streak
6. Return updated stats to frontend
7. Frontend updates dashboard in real-time
```

#### **D. Study Plan with Reminder Flow**
```
1. User creates study plan:
   ├─ Selects date, problems, time range
   ├─ Optionally sets reminder
   └─ POST /api/v1/study-plans

2. Backend creates StudyPlan document:
   ├─ Links to user and problems
   ├─ Stores reminder settings
   └─ Saves to MongoDB

3. Background Reminder Service (runs every 5 min):
   ├─ Query study plans with pending reminders
   ├─ Check if reminder time reached
   ├─ Send email via AWS Lambda
   ├─ Mark reminder as sent
   └─ Log activity

4. User completes study plan:
   ├─ Updates isCompleted flag
   ├─ Marks problems as solved
   └─ Syncs with UserProgress
```

### 3. Authentication Mechanism

#### **JWT-Based Authentication**

**Token Structure:**
```typescript
AccessToken (1 hour):
{
  userId: ObjectId,
  email: string,
  exp: timestamp
}

RefreshToken (30 days):
{
  userId: ObjectId,
  sessionId: ObjectId,
  exp: timestamp
}
```

**Security Measures:**
- Tokens stored in **httpOnly cookies** (XSS protection)
- **CORS** enabled for specific origin only
- **SameSite: strict** in production (CSRF protection)
- **Secure: true** in production (HTTPS only)
- Refresh tokens stored in database for revocation
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting on auth endpoints (future enhancement)

#### **Session Management**
- Each login creates a new session document
- Refresh token tied to session
- Logout deletes session (immediate revocation)
- Expired sessions cleaned up periodically

### 4. Data Flow for Progress Tracking

```
┌──────────────────────────────────────────────────────────────┐
│                    PROGRESS TRACKING FLOW                     │
└──────────────────────────────────────────────────────────────┘

User Action (Frontend)
    │
    ├─ Mark Problem as Solved
    │  POST /api/v1/progress/update
    │  { problemId, status: 'solved', notes, difficulty }
    │
    ▼
Authentication Middleware
    │
    ├─ Verify JWT Token
    ├─ Extract userId
    │
    ▼
Progress Controller
    │
    ├─ Validate problem exists
    ├─ Check if already solved
    │
    ▼
Progress Service
    │
    ├─ Find or Create UserProgress document
    │
    ├─ Update Progress:
    │  ├─ Add to solved problems array
    │  ├─ Increment difficulty counter
    │  ├─ Update total solved count
    │  └─ Set lastSolvedDate
    │
    ├─ Calculate Streak:
    │  ├─ Check if solved yesterday
    │  ├─ Increment current streak
    │  ├─ Update max streak if needed
    │  └─ Reset streak if gap > 1 day
    │
    ├─ Update Study Plan:
    │  ├─ Mark problem as completed in active plan
    │  ├─ Auto-complete plan if all problems done
    │  └─ Sync progress between plan and tracking
    │
    └─ Save to MongoDB
       │
       ▼
Response to Frontend
    │
    ├─ Return updated progress
    ├─ Return new stats (total, streak, breakdown)
    │
    ▼
Frontend Updates
    │
    ├─ Update dashboard counters
    ├─ Refresh progress charts
    ├─ Show success notification
    └─ Trigger confetti animation (if milestone)
```

**Real-time Dashboard Updates:**
- Frontend polls `/api/v1/progress/stats` every 30s
- Alternative: WebSocket for instant updates (future)
- Optimistic UI updates (update UI before server confirms)

### 5. Basic Scalability Considerations

#### **For 10,000–50,000 Active Users**

##### **A. Application Layer Scaling**
```
Current Setup: Single EC2 instance with PM2
├─ PM2 manages process crashes and restarts
├─ Vertical scaling: Upgrade EC2 instance type
└─ Monitoring: PM2 built-in monitoring

Recommended for Scale:
├─ Horizontal scaling: Multiple EC2 instances
├─ Load balancer (AWS ALB) for traffic distribution
├─ PM2 cluster mode (multi-core utilization)
├─ Auto-scaling based on CPU/memory metrics
└─ Health checks and automatic failover
```

##### **B. Database Optimization**
```
Current: MongoDB Atlas M0 (Free Tier)
└─ Suitable for development/testing

For Production Scale:
├─ Upgrade to M10+ cluster (Dedicated)
├─ Enable replica sets (high availability)
├─ Implement proper indexing:
│  ├─ User email (unique, fast lookup)
│  ├─ Problem IDs (fast filtering)
│  ├─ Progress userId + problemId (composite)
│  └─ Study plan dates (range queries)
├─ Connection pooling (10-20 connections per instance)
├─ Query optimization (use explain() for slow queries)
└─ Data archiving (move old sessions to archive collection)
```

##### **C. Caching Strategy**
```
Level 1: In-Memory Cache (Node.js)
├─ Cache frequently accessed data
├─ Problem lists (refresh every 1 hour)
├─ Topic hierarchies (refresh on update)
└─ User session data

Level 2: Redis (Future Enhancement)
├─ Shared cache across instances
├─ Session store for distributed setup
├─ Rate limiting counters
└─ Real-time leaderboard
```

##### **D. API Rate Limiting**
```
Current: No rate limiting
└─ Vulnerable to abuse

Recommended:
├─ Per-user: 100 requests/min
├─ Per-IP: 500 requests/min
├─ Auth endpoints: 5 attempts/min
├─ Implement using express-rate-limit
└─ Store counters in Redis for distributed setup
```

##### **E. Background Jobs**
```
Current: Reminder service (every 5 minutes)
└─ Runs in main process

For Scale:
├─ Separate background worker process
├─ Job queue with Bull (Redis-backed)
├─ Jobs:
│  ├─ Email reminders (scheduled)
│  ├─ Problem sync from external APIs (daily)
│  ├─ User stats recalculation (nightly)
│  └─ Session cleanup (weekly)
└─ Monitoring and alerting for failed jobs
```

##### **F. Monitoring & Observability**
```
Essential Metrics:
├─ API response times (P50, P95, P99)
├─ Error rates by endpoint
├─ Database query performance
├─ Active users (real-time)
├─ Memory and CPU usage
└─ Failed background jobs

Tools:
├─ PM2 monitoring (basic)
├─ AWS CloudWatch (EC2 metrics)
├─ MongoDB Atlas monitoring (query performance)
├─ Application logs (Winston/Pino)
└─ Future: Datadog, New Relic, or Grafana
```

##### **G. Security Enhancements**
```
Current:
├─ JWT authentication ✓
├─ CORS enabled ✓
├─ httpOnly cookies ✓
└─ Password hashing ✓

Additional:
├─ Rate limiting (prevent brute force)
├─ Input sanitization (prevent NoSQL injection)
├─ Helmet.js (security headers)
├─ HTTPS only (SSL certificate)
├─ Regular security audits
└─ Environment variable encryption
```

##### **H. Cost Optimization**
```
For 10K-50K Users:
├─ Backend: 2-3 EC2 t3.medium instances (~$60-90/mo)
├─ Database: MongoDB Atlas M10 (~$57/mo)
├─ Load Balancer: AWS ALB (~$20-30/mo)
├─ S3 + CloudFront: Frontend hosting (~$5-10/mo)
├─ Email: AWS SES (~$1/10k emails)
└─ Total: ~$150-200/month

Auto-scaling policy:
├─ Scale up: CPU > 70% for 5 minutes
├─ Scale down: CPU < 30% for 10 minutes
├─ Min instances: 2 (high availability)
└─ Max instances: 5 (cost control)
```

---

## Low-Level Design (LLD)

### API Endpoints Structure

#### **Authentication APIs**
```
POST   /api/v1/auth/register       - Create new user
POST   /api/v1/auth/login          - Login user
GET    /api/v1/auth/refresh        - Refresh access token
POST   /api/v1/auth/logout         - Logout user
POST   /api/v1/auth/password/forgot - Send password reset email
POST   /api/v1/auth/password/reset  - Reset password
PUT    /api/v1/auth/profile        - Update user profile
PUT    /api/v1/auth/password/change - Change password
```

#### **User Progress APIs**
```
GET    /api/v1/progress/stats      - Get user statistics
POST   /api/v1/progress/update     - Mark problem as solved
GET    /api/v1/progress/:problemId - Get progress for specific problem
DELETE /api/v1/progress/:problemId - Remove problem from solved
```

#### **Problem Management APIs**
```
GET    /api/v1/problems            - List problems (with filters)
GET    /api/v1/problems/:id        - Get problem details
POST   /api/v1/problems/sync       - Sync problems from external APIs
GET    /api/v1/problems/topics     - Get all topics/tags
GET    /api/v1/problems/stats      - Get problem statistics
```

#### **Study Plan APIs**
```
GET    /api/v1/study-plans         - Get user's study plans
POST   /api/v1/study-plans         - Create new study plan
GET    /api/v1/study-plans/:id     - Get specific study plan
PUT    /api/v1/study-plans/:id     - Update study plan
DELETE /api/v1/study-plans/:id     - Delete study plan
POST   /api/v1/study-plans/:id/complete - Mark plan as completed
```

#### **Topics APIs**
```
GET    /api/v1/topics              - Get all topics
GET    /api/v1/topics/:id          - Get topic hierarchy
```

#### **Session Management APIs**
```
GET    /api/v1/session             - Get all user sessions
DELETE /api/v1/session/:id         - Delete specific session
```

---

## Database Schema

### Collection: `users`

**Purpose:** Store user account information

```javascript
{
  _id: ObjectId,
  name: String,              // Required, min 2 chars
  username: String,          // Required, unique, min 3 chars
  email: String,             // Required, unique, lowercase
  password: String,          // Hashed with bcrypt
  createdAt: Date,           // Auto-generated
  updatedAt: Date,           // Auto-generated
  lastLoginAt: Date,         // Updated on each login
  isActive: Boolean,         // Default: true
  role: String,              // Default: 'user', enum: ['user', 'admin']
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
```

**Relationships:**
- One-to-Many with `sessions`
- One-to-One with `userstats`
- One-to-Many with `userprogresses`
- One-to-Many with `studyplans`

---

### Collection: `sessions`

**Purpose:** Track user sessions and refresh tokens for authentication

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to users collection
  refreshToken: String,       // JWT refresh token
  userAgent: String,         // Browser/device info
  createdAt: Date,           // Session start time
  expiresAt: Date,           // Expiration time (30 days from creation)
}
```

**Indexes:**
```javascript
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ refreshToken: 1 }, { unique: true })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index
```

**Relationships:**
- Many-to-One with `users`

**TTL (Time To Live):**
- MongoDB automatically deletes expired sessions
- `expireAfterSeconds: 0` on `expiresAt` field

---

### Collection: `problems`

**Purpose:** Store DSA problems from various platforms

```javascript
{
  _id: ObjectId,
  problemId: String,         // Platform-specific ID (unique)
  platform: String,          // 'leetcode' | 'codeforces' | 'gfg'
  title: String,             // Problem title
  description: String,       // Problem statement (optional)
  difficulty: String,        // 'Easy' | 'Medium' | 'Hard'
  tags: [String],            // ['Array', 'Dynamic Programming', ...]
  link: String,              // URL to problem
  acceptance: Number,        // Acceptance rate (percentage)
  totalSubmissions: Number,  // Total submissions
  totalAccepted: Number,     // Accepted submissions
  rating: Number,            // Codeforces rating (optional)
  contestId: Number,         // Codeforces contest ID (optional)
  index: String,             // Problem index (Codeforces)
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.problems.createIndex({ problemId: 1, platform: 1 }, { unique: true })
db.problems.createIndex({ difficulty: 1 })
db.problems.createIndex({ tags: 1 })
db.problems.createIndex({ platform: 1 })
db.problems.createIndex({ rating: 1 })
db.problems.createIndex({ title: "text" }) // Full-text search
```

**Relationships:**
- Many-to-Many with `userprogresses` (through problemId)
- Many-to-Many with `studyplans` (through items array)
- Many-to-Many with `topics` (through tags)

---

### Collection: `topics`

**Purpose:** Organize problems by topics/categories (DSA Sheet structure)

```javascript
{
  _id: ObjectId,
  name: String,              // 'Arrays', 'Graphs', 'Dynamic Programming'
  slug: String,              // URL-friendly name
  description: String,       // Topic description
  icon: String,              // Icon identifier
  order: Number,             // Display order
  parentId: ObjectId,        // Reference to parent topic (for hierarchy)
  level: Number,             // 0: root, 1: child, 2: sub-child
  problemCount: Number,      // Cached count of problems
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.topics.createIndex({ slug: 1 }, { unique: true })
db.topics.createIndex({ parentId: 1 })
db.topics.createIndex({ order: 1 })
```

**Relationships:**
- Self-referencing (tree structure via `parentId`)
- Many-to-Many with `problems` (through tags matching)

---

### Collection: `userprogresses`

**Purpose:** Track individual user's progress on problems

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to users
  problemId: ObjectId,       // Reference to problems
  status: String,            // 'solved' | 'attempted' | 'bookmarked'
  difficulty: String,        // Cached from problem
  solvedAt: Date,            // When problem was solved
  attempts: Number,          // Number of attempts
  notes: String,             // User's notes (optional)
  tags: [String],            // Cached from problem
  platform: String,          // Cached from problem
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.userprogresses.createIndex({ userId: 1, problemId: 1 }, { unique: true })
db.userprogresses.createIndex({ userId: 1, status: 1 })
db.userprogresses.createIndex({ userId: 1, solvedAt: -1 })
db.userprogresses.createIndex({ userId: 1, difficulty: 1 })
```

**Relationships:**
- Many-to-One with `users`
- Many-to-One with `problems`

**Query Patterns:**
```javascript
// Get all solved problems by user
db.userprogresses.find({ userId: userId, status: 'solved' })

// Get progress by difficulty
db.userprogresses.aggregate([
  { $match: { userId: userId, status: 'solved' } },
  { $group: { _id: '$difficulty', count: { $sum: 1 } } }
])
```

---

### Collection: `userstats`

**Purpose:** Store aggregated user statistics (denormalized for performance)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to users (unique)
  totalSolved: Number,       // Total problems solved
  solvedByDifficulty: {
    easy: Number,
    medium: Number,
    hard: Number,
  },
  solvedByPlatform: {
    leetcode: Number,
    codeforces: Number,
    gfg: Number,
  },
  currentStreak: Number,     // Current daily solving streak
  maxStreak: Number,         // Maximum streak achieved
  lastSolvedDate: Date,      // Last problem solved date
  totalAttempts: Number,     // Total attempts across all problems
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.userstats.createIndex({ userId: 1 }, { unique: true })
db.userstats.createIndex({ totalSolved: -1 }) // For leaderboard
db.userstats.createIndex({ currentStreak: -1 }) // For streak leaderboard
```

**Relationships:**
- One-to-One with `users`

**Update Strategy:**
- Updated whenever `userprogresses` changes
- Atomic updates using `$inc` and `$set`
- Pre-calculated for fast dashboard loading

---

### Collection: `studyplans`

**Purpose:** Track scheduled study sessions and reminders

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to users
  date: Date,                // Study plan date (normalized to UTC midnight)
  title: String,             // Optional title
  description: String,       // Optional description
  startTime: String,         // 'HH:MM' format
  endTime: String,           // 'HH:MM' format
  items: [
    {
      problemId: ObjectId,   // Reference to problems
      isCompleted: Boolean,  // Problem completion status
      completedAt: Date,
    }
  ],
  reminder: {
    enabled: Boolean,
    reminderDate: Date,      // When to send reminder
    reminderTime: String,    // 'HH:MM' format
    sent: Boolean,           // Reminder sent status
  },
  isCompleted: Boolean,      // Plan completion status
  totalPlanned: Number,      // Total problems in plan
  totalCompleted: Number,    // Problems completed
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.studyplans.createIndex({ userId: 1, date: 1 })
db.studyplans.createIndex({ userId: 1, isCompleted: 1 })
db.studyplans.createIndex({ 'reminder.enabled': 1, 'reminder.sent': 1, 'reminder.reminderDate': 1 })
```

**Relationships:**
- Many-to-One with `users`
- Many-to-Many with `problems` (through items array)

**Pre-save Hook:**
```javascript
// Automatically calculate totalPlanned and totalCompleted
studyPlanSchema.pre('save', function() {
  this.totalPlanned = this.items.length
  this.totalCompleted = this.items.filter(i => i.isCompleted).length
  this.isCompleted = this.totalCompleted === this.totalPlanned && this.totalPlanned > 0
})
```

---

### Collection: `verifications` (Password Reset)

**Purpose:** Store temporary verification tokens for password reset

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to users
  token: String,             // Unique verification token
  type: String,              // 'password_reset' | 'email_verification'
  expiresAt: Date,           // Token expiry (1 hour from creation)
  createdAt: Date,
}
```

**Indexes:**
```javascript
db.verifications.createIndex({ token: 1 }, { unique: true })
db.verifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL
```

**Relationships:**
- Many-to-One with `users`

---

## Entity Relationship Diagram (ERD)

```
┌──────────────┐
│    USERS     │
│              │
│ _id (PK)     │───┐
│ email*       │   │
│ username*    │   │
│ password     │   │
│ name         │   │
└──────────────┘   │
                   │ 1:1
       ┌───────────┴───────────┐
       │                       │
       │                       ▼
       │              ┌──────────────┐
       │              │  USERSTATS   │
       │              │              │
       │              │ _id (PK)     │
       │              │ userId* (FK) │
       │              │ totalSolved  │
       │              │ currentStreak│
       │              │ maxStreak    │
       │              └──────────────┘
       │
       │ 1:N
       ├────────────┐
       │            │
       ▼            ▼
┌──────────────┐  ┌─────────────────┐
│   SESSIONS   │  │ USERPROGRESSES  │
│              │  │                 │
│ _id (PK)     │  │ _id (PK)        │
│ userId (FK)  │  │ userId (FK)     │───┐
│ refreshToken │  │ problemId (FK)  │   │
│ expiresAt    │  │ status          │   │
└──────────────┘  │ solvedAt        │   │
                  │ notes           │   │
       │          └─────────────────┘   │
       │                                │ N:1
       │ 1:N                            │
       │          ┌──────────────┐      │
       │          │   PROBLEMS   │      │
       └──────────│              │◄─────┘
                  │ _id (PK)     │
┌──────────────┐  │ problemId*   │
│  STUDYPLANS  │  │ platform     │
│              │  │ title        │
│ _id (PK)     │  │ difficulty   │
│ userId (FK)  │  │ tags[]       │
│ date         │  │ link         │
│ items[]      │──│ rating       │
│  ├ problemId │  └──────────────┘
│  ├ isCompleted                 │
│ reminder{}   │                 │
│ isCompleted  │                 │
└──────────────┘                 │
                                 │
       │                         │ N:M
       │ 1:N                     │
       │          ┌──────────────┴─┐
       └──────────│    TOPICS      │
                  │                │
                  │ _id (PK)       │
                  │ name           │
                  │ slug*          │
                  │ parentId (FK)  │──┐
                  │ order          │  │
                  └────────────────┘  │
                         ▲            │
                         │            │
                         └────────────┘
                         Self-Reference
                         (Tree Structure)
```

**Legend:**
- `*` = Unique constraint
- `PK` = Primary Key
- `FK` = Foreign Key
- `1:1` = One-to-One relationship
- `1:N` = One-to-Many relationship
- `N:M` = Many-to-Many relationship

---

## Indexing Strategy

### Why Indexing Matters
- **Performance:** Indexes speed up queries by 10-100x
- **Scale:** Critical when database grows beyond 100K documents
- **Cost:** Reduces database read operations (cost savings)

### Index Types Used

#### **1. Single Field Indexes**
```javascript
// Fast lookup by single field
db.users.createIndex({ email: 1 })        // Used in login
db.users.createIndex({ username: 1 })     // User profile lookup
db.problems.createIndex({ difficulty: 1 }) // Filter by difficulty
```

#### **2. Compound Indexes**
```javascript
// Multiple fields queried together
db.userprogresses.createIndex({ userId: 1, problemId: 1 }, { unique: true })
// Used in: Check if user solved specific problem

db.studyplans.createIndex({ userId: 1, date: 1 })
// Used in: Get user's study plans for date range

db.problems.createIndex({ problemId: 1, platform: 1 }, { unique: true })
// Used in: Prevent duplicate problems from same platform
```

#### **3. TTL (Time To Live) Indexes**
```javascript
// Automatically delete expired documents
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.verifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

#### **4. Text Indexes**
```javascript
// Full-text search capability
db.problems.createIndex({ title: "text", description: "text" })
// Used in: Search problems by keywords
```

#### **5. Unique Indexes**
```javascript
// Enforce uniqueness at database level
db.users.createIndex({ email: 1 }, { unique: true })
db.sessions.createIndex({ refreshToken: 1 }, { unique: true })
db.topics.createIndex({ slug: 1 }, { unique: true })
```

### Index Selection Rules

**When to Create Index:**
1. Fields used in `WHERE` clauses (filters)
2. Fields used in `JOIN` operations (foreign keys)
3. Fields used in `ORDER BY` (sorting)
4. Fields used in `GROUP BY` (aggregation)

**When NOT to Create Index:**
1. Small collections (< 1000 documents)
2. Fields with low cardinality (e.g., boolean fields)
3. Fields that change frequently
4. Write-heavy collections

### Query Examples with Index Usage

#### **Example 1: User Login**
```javascript
// Query
db.users.find({ email: "user@example.com" })

// Index Used: { email: 1 }
// Execution Time: O(log n) with index vs O(n) without
```

#### **Example 2: Get User's Solved Problems**
```javascript
// Query
db.userprogresses.find({ 
  userId: ObjectId("..."),
  status: "solved" 
})

// Index Used: { userId: 1, status: 1 }
// Covers both filter fields
```

#### **Example 3: Study Plans for Date Range**
```javascript
// Query
db.studyplans.find({
  userId: ObjectId("..."),
  date: { $gte: startDate, $lte: endDate }
})

// Index Used: { userId: 1, date: 1 }
// Efficient range query on date
```

#### **Example 4: Check Pending Reminders**
```javascript
// Query
db.studyplans.find({
  "reminder.enabled": true,
  "reminder.sent": false,
  "reminder.reminderDate": { $lte: new Date() }
})

// Index Used: { 'reminder.enabled': 1, 'reminder.sent': 1, 'reminder.reminderDate': 1 }
// Background job uses this every 5 minutes
```

### Index Monitoring

```javascript
// View all indexes on collection
db.users.getIndexes()

// Check index usage stats
db.users.aggregate([{ $indexStats: {} }])

// Explain query execution plan
db.users.find({ email: "test@test.com" }).explain("executionStats")
```

---

## Performance Benchmarks

### Expected Performance Metrics (10K-50K Users)

| Operation | Target | Notes |
|-----------|--------|-------|
| Login API | < 200ms | With index on email |
| Dashboard Load | < 500ms | Aggregated stats cached |
| Problem List | < 300ms | With pagination (20/page) |
| Mark Problem Solved | < 250ms | Updates progress + stats |
| Study Plan Creation | < 150ms | Simple insert operation |
| Search Problems | < 400ms | Full-text search indexed |

### Database Query Optimization

```javascript
// BAD: Full collection scan
db.userprogresses.find({ userId: userId })

// GOOD: Uses index
db.userprogresses.find({ userId: userId }).hint({ userId: 1 })

// BAD: Loads all fields
db.problems.find({})

// GOOD: Project only needed fields
db.problems.find({}, { _id: 1, title: 1, difficulty: 1 })

// BAD: Multiple queries
const user = await User.findById(userId)
const stats = await UserStats.findOne({ userId })

// GOOD: Single aggregation
const result = await User.aggregate([
  { $match: { _id: userId } },
  { $lookup: { from: 'userstats', localField: '_id', foreignField: 'userId', as: 'stats' } }
])
```

---

## Summary

This system design supports **10,000–50,000 active users** with:

✅ **Scalable Architecture:** Horizontal scaling ready with load balancer  
✅ **Efficient Database:** Indexed queries, connection pooling, caching  
✅ **Secure Authentication:** JWT with refresh tokens, httpOnly cookies  
✅ **Real-time Tracking:** Progress updates, streak calculation, analytics  
✅ **Background Jobs:** Email reminders, data sync, cleanup tasks  
✅ **Monitoring:** Metrics, logging, alerting for production  
✅ **Cost-Effective:** ~$150-200/month for 10K-50K users  

**Key Technical Decisions:**
- **MongoDB** for flexible schema and fast reads
- **JWT** for stateless authentication
- **PM2** for process management and zero-downtime deploys
- **Nginx** for reverse proxy and static file serving
- **Indexes** on all frequently queried fields
- **Denormalized stats** for fast dashboard loading

---

**Document Version:** 1.0  
**Last Updated:** October 15, 2026  
**Author:** DSA Tracker Development Team
