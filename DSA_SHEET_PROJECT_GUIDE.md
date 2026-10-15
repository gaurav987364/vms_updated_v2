# DSA Sheet Application - Complete Project Guide
**Apna College Technical Team Lead Assessment**

---

## 📋 Table of Contents
1. [Assessment Requirements Analysis](#assessment-requirements-analysis)
2. [Current Boilerplate Analysis](#current-boilerplate-analysis)
3. [Tech Stack Finalization](#tech-stack-finalization)
4. [Database Schema Design (LLD)](#database-schema-design-lld)
5. [System Architecture Design (HLD)](#system-architecture-design-hld)
6. [API Design](#api-design)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Additional Features (Stand Out)](#additional-features-stand-out)
9. [Deployment Strategy (AWS)](#deployment-strategy-aws)
10. [Deliverables Checklist](#deliverables-checklist)
11. [Scalability & Performance Optimization](#scalability--performance-optimization)

---

## 1. Assessment Requirements Analysis

### Core Features Required

#### ✅ 1.1 Authentication System
- **Requirement**: Secure login/authentication for students
- **Implementation**: JWT-based authentication
- **Status in Boilerplate**: ✅ Already implemented
  - User registration
  - Login with JWT tokens
  - Password hashing with bcrypt
  - JWT refresh token mechanism

#### ✅ 1.2 Structured DSA Sheet
- **Requirement**: Chapters → Topics → Problems hierarchy
- **Status**: ❌ Need to implement
- **Components needed**:
  - DSA Sheet model (Chapters, Topics, Problems)
  - Hierarchical navigation UI
  - Collapsible sections for chapters/topics

#### ✅ 1.3 Calendar Feature (Core Standalone Feature)
- **Requirement**: Dedicated page for study schedule planning
- **Status**: ❌ Need to implement
- **Features**:
  - Full calendar view (monthly/weekly)
  - Drag-and-drop problem scheduling
  - Date-wise problem assignment
  - Visual indicators for completed/pending tasks
  - Timeline view for daily planning

#### ✅ 1.4 Problem Breakdown
- **Requirement**: Each chapter → subtopics → problems
- **Status**: ❌ Need to implement
- **Structure**:
  ```
  Chapter: Arrays
    ├── Topic: Two Pointer Technique
    │   ├── Problem: Two Sum
    │   ├── Problem: Container With Most Water
    │   └── Problem: 3Sum
    └── Topic: Sliding Window
        ├── Problem: Maximum Subarray
        └── Problem: Longest Substring Without Repeating
  ```

#### ✅ 1.5 Learning Resources Integration
- **Requirement**: Each problem must have:
  - YouTube tutorial link
  - LeetCode/Codeforces link
  - Article link (theory reference)
- **Status**: ❌ Need to implement
- **Implementation**: Resource links embedded in Problem model

#### ✅ 1.6 Difficulty Level Indicator
- **Requirement**: Easy / Medium / Hard tags
- **Status**: ❌ Need to implement
- **UI**: Color-coded badges (Green/Yellow/Red)

#### ✅ 1.7 Progress Tracker
- **Requirement**: 
  - Checkbox for each problem
  - Persist progress across sessions
  - Resume from where left off
- **Status**: ❌ Need to implement
- **Features**:
  - Real-time progress update
  - Progress percentage calculation
  - Visual progress bars (chapter-wise, overall)
  - Streak tracking (bonus)

---

## 2. Current Boilerplate Analysis

### ✅ What You Already Have

#### Backend (Node.js + Express + TypeScript + MongoDB)
```
Backend/
├── src/
│   ├── api/
│   │   ├── auth/                    ✅ Complete auth system
│   │   │   ├── authController.ts
│   │   │   ├── authService.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── authValidators.ts
│   │   │   └── userModel.ts
│   │   ├── sessions/                ✅ Session management
│   │   └── userList/                ✅ User CRUD operations
│   ├── config/                      ✅ App configuration
│   ├── database/                    ✅ MongoDB connection
│   ├── middlewares/                 ✅ Error handling, async handler, passport JWT
│   ├── services/                    ✅ JWT, notification services
│   └── utils/                       ✅ Helpers, error types, JWT utils
```

**Backend Strengths:**
- ✅ Complete authentication system (JWT + refresh tokens)
- ✅ Proper error handling middleware
- ✅ TypeScript setup with type safety
- ✅ MongoDB integration with Mongoose
- ✅ Passport JWT authentication middleware
- ✅ CORS configured
- ✅ Cookie-based auth support
- ✅ Email notification service integration

#### Frontend (React + TypeScript + Vite + TailwindCSS)
```
Frontend/vms-psi/src/
├── components/
│   ├── auth/                        ✅ Auth components
│   ├── common/                      ✅ Reusable UI components
│   └── ui/                          ✅ UI library components
├── context/                         ✅ Auth, Theme, Network, Alert contexts
├── hooks/                           ✅ Custom hooks (useDebounce, useQuery)
├── pages/
│   ├── auth/                        ✅ Login/Register pages
│   ├── dashboard/                   ✅ Dashboard layout
│   └── users/                       ✅ User management pages
├── routes/                          ✅ React Router setup
└── services/api/                    ✅ API integration with axios
```

**Frontend Strengths:**
- ✅ React 19 with TypeScript
- ✅ TailwindCSS for styling
- ✅ React Query (@tanstack/react-query) for data fetching
- ✅ React Hook Form + Zod for form validation
- ✅ Context API for state management (Auth, Theme, Network, Alert)
- ✅ React Router v7 for routing
- ✅ Offline detection and handling
- ✅ shadcn/ui components
- ✅ Responsive design setup

### ❌ What Needs to be Built

#### Backend - New Models & APIs
1. **DSA Chapter Model** (New)
2. **DSA Topic Model** (New)
3. **DSA Problem Model** (New)
4. **User Progress Model** (New)
5. **Calendar Event Model** (New)
6. **Resource Links Model** (can be embedded in Problem)

#### Backend - New API Endpoints
1. DSA Sheet APIs (CRUD for chapters, topics, problems)
2. Progress Tracking APIs (mark complete/incomplete)
3. Calendar APIs (schedule, reschedule, get events)
4. Analytics APIs (progress stats, streaks)

#### Frontend - New Pages & Components
1. **DSA Sheet Page** (main page with hierarchy)
2. **Calendar Page** (standalone, dedicated)
3. **Problem Detail Page** (with resources)
4. **Progress Dashboard** (analytics, stats)
5. **Problem List Component** (with checkboxes, filters)
6. **Calendar Component** (interactive calendar)

---

## 3. Tech Stack Finalization

### ✅ Confirmed Stack (Based on Your Boilerplate)

#### Frontend
```javascript
{
  "framework": "React 19",
  "language": "TypeScript",
  "styling": "TailwindCSS v4",
  "router": "React Router v7",
  "forms": "React Hook Form + Zod validation",
  "dataFetching": "@tanstack/react-query",
  "icons": "lucide-react + react-icons",
  "uiLibrary": "shadcn/ui components",
  "calendar": "react-big-calendar" // NEW - to be added
}
```

#### Backend
```javascript
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "language": "TypeScript",
  "database": "MongoDB + Mongoose",
  "authentication": "JWT + Passport.js",
  "validation": "Zod",
  "security": "bcrypt (password hashing)"
}
```

#### Deployment (AWS)
```
Frontend: AWS S3 + CloudFront (static hosting with CDN)
Backend: AWS EC2 / Elastic Beanstalk / ECS (containerized)
Database: MongoDB Atlas (already using this)
Domain: AWS Route 53 (optional)
SSL: AWS Certificate Manager
```

---

## 4. Database Schema Design (LLD)

### 4.1 Users Collection (Already Exists - Modify)
```typescript
// Backend/src/api/auth/userModel.ts (Modify existing)
interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;                  // Already exists
  username: string;               // Already exists
  password: string;               // Already exists (hashed)
  role: string;                   // Already exists
  
  // NEW FIELDS FOR DSA TRACKER
  totalProblemsCompleted: number; // Cache for performance
  currentStreak: number;          // Consecutive days of solving
  longestStreak: number;          // Historical best streak
  lastActiveDate: Date;           // For streak calculation
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes (already have unique on email, username)
// Add new index: { lastActiveDate: -1 }
```

### 4.2 DSA Chapters Collection (NEW)
```typescript
interface ChapterDocument {
  _id: ObjectId;
  title: string;                  // "Arrays", "Linked Lists", "Trees"
  description: string;            // Brief overview of chapter
  order: number;                  // Display order (1, 2, 3...)
  icon?: string;                  // Icon name or emoji
  estimatedHours: number;         // Estimated time to complete
  totalTopics: number;            // Count of topics (calculated)
  totalProblems: number;          // Count of problems (calculated)
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// { order: 1 } - for sorting
```

### 4.3 DSA Topics Collection (NEW)
```typescript
interface TopicDocument {
  _id: ObjectId;
  chapterId: ObjectId;            // Reference to Chapter
  title: string;                  // "Two Pointer", "Sliding Window"
  description: string;
  order: number;                  // Display order within chapter
  totalProblems: number;          // Count of problems (calculated)
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// { chapterId: 1, order: 1 } - for querying topics by chapter
```

### 4.4 DSA Problems Collection (NEW) - Core Model
```typescript
interface ResourceLinks {
  youtubeUrl?: string;           // YouTube tutorial
  leetcodeUrl?: string;          // LeetCode problem link
  codeforcesUrl?: string;        // Codeforces link (optional)
  articleUrl?: string;           // Blog/article for theory
  officialSolution?: string;     // Official solution link
}

interface ProblemDocument {
  _id: ObjectId;
  chapterId: ObjectId;            // Reference to Chapter
  topicId: ObjectId;              // Reference to Topic
  
  title: string;                  // "Two Sum", "Reverse Linked List"
  description: string;            // Problem statement summary
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  resources: ResourceLinks;       // Learning resources (embedded)
  
  tags: string[];                 // ["array", "hash-table", "two-pointer"]
  companies: string[];            // ["Google", "Amazon", "Meta"] - bonus
  
  order: number;                  // Display order within topic
  estimatedTime: number;          // Time in minutes
  
  likes: number;                  // Community likes (bonus)
  completionRate: number;         // % of users who completed (bonus)
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// { topicId: 1, order: 1 } - for querying problems by topic
// { difficulty: 1 } - for filtering by difficulty
// { tags: 1 } - for tag-based search
// { chapterId: 1 } - for chapter-wide queries
```

### 4.5 User Progress Collection (NEW) - Critical
```typescript
interface UserProgressDocument {
  _id: ObjectId;
  userId: ObjectId;               // Reference to User
  problemId: ObjectId;            // Reference to Problem
  
  // Progress tracking
  isCompleted: boolean;           // Checkbox state
  completedAt?: Date;             // When marked complete
  
  // Additional tracking (bonus)
  attempts: number;               // How many times attempted
  timeSpent: number;              // Total time in minutes
  notes?: string;                 // User's personal notes
  rating?: number;                // 1-5 star self-rating
  
  // Revision tracking (bonus)
  lastRevisedAt?: Date;
  revisionCount: number;
  nextRevisionDate?: Date;        // Spaced repetition
  
  createdAt: Date;                // First attempt date
  updatedAt: Date;
}

// Indexes (CRITICAL for performance with 10K-50K users)
// { userId: 1, problemId: 1 } - UNIQUE compound index
// { userId: 1, isCompleted: 1 } - for progress queries
// { userId: 1, completedAt: -1 } - for recent activity
// { problemId: 1, isCompleted: 1 } - for problem stats
```

### 4.6 Calendar Events Collection (NEW)
```typescript
interface CalendarEventDocument {
  _id: ObjectId;
  userId: ObjectId;               // Reference to User
  problemId?: ObjectId;           // Reference to Problem (optional)
  
  title: string;                  // "Solve Two Sum" or custom event
  description?: string;
  
  // Scheduling
  scheduledDate: Date;            // Date of the event
  startTime?: string;             // "09:00 AM" (optional)
  endTime?: string;               // "10:30 AM" (optional)
  duration: number;               // Duration in minutes
  
  // Status
  status: 'pending' | 'completed' | 'missed';
  completedAt?: Date;
  
  // Recurrence (bonus)
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'custom';
  
  // Reminders (bonus)
  reminderEnabled: boolean;
  reminderTime?: number;          // Minutes before event
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// { userId: 1, scheduledDate: 1 } - for calendar queries
// { userId: 1, status: 1 } - for filtering events
// { scheduledDate: 1 } - for date-range queries
```

### 4.7 Database Relationships

```
User (1) ─────< UserProgress >───── (1) Problem
              (Many-to-Many)
              
User (1) ─────< CalendarEvent >──── (0..1) Problem
              (One-to-Many)
              
Chapter (1) ─< Topic (Many)
Chapter (1) ─< Problem (Many)
Topic (1) ───< Problem (Many)
```

### 4.8 Data Seeding Strategy

You'll need to seed the database with DSA problems. Here's a sample structure:

```javascript
// Example seed data structure
const dsaSheetData = [
  {
    chapter: {
      title: "Arrays",
      order: 1,
      description: "Learn fundamental array operations and techniques"
    },
    topics: [
      {
        title: "Two Pointer Technique",
        order: 1,
        problems: [
          {
            title: "Two Sum",
            difficulty: "Easy",
            order: 1,
            resources: {
              leetcodeUrl: "https://leetcode.com/problems/two-sum/",
              youtubeUrl: "https://www.youtube.com/watch?v=...",
              articleUrl: "https://..."
            },
            tags: ["array", "hash-table"],
            estimatedTime: 20
          },
          // ... more problems
        ]
      },
      // ... more topics
    ]
  },
  // ... more chapters
];
```

**Recommended DSA Sheet Structure** (Popular sheets to reference):
- Striver's SDE Sheet (191 problems)
- Love Babbar DSA Sheet (450 problems)
- Blind 75 LeetCode
- NeetCode 150

---

## 5. System Architecture Design (HLD)

### 5.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Browser    │  │   Browser    │         │
│  │  (Student 1) │  │  (Student 2) │  │  (Student N) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┴─────────────────┘                  │
│                           │                                     │
│                           │ HTTPS (443)                         │
│                           ▼                                     │
├─────────────────────────────────────────────────────────────────┤
│                        CDN LAYER                                │
│               (AWS CloudFront - Caching)                        │
│                           │                                     │
├───────────────────────────┼─────────────────────────────────────┤
│                           ▼                                     │
│  ┌────────────────────────────────────────────────┐            │
│  │         FRONTEND (AWS S3 Static Hosting)       │            │
│  │                                                 │            │
│  │  - React App (SPA)                             │            │
│  │  - TailwindCSS                                 │            │
│  │  - React Query (Client-side caching)           │            │
│  │  - Service Worker (Offline support - bonus)    │            │
│  └────────────────────┬───────────────────────────┘            │
│                       │                                         │
│                       │ REST API (HTTPS)                        │
│                       │ JWT Token in Headers                    │
│                       ▼                                         │
├─────────────────────────────────────────────────────────────────┤
│                    LOAD BALANCER                                │
│          (AWS Application Load Balancer - ALB)                  │
│                       │                                         │
│         ┌─────────────┴─────────────┐                          │
│         ▼                           ▼                          │
│  ┌─────────────┐             ┌─────────────┐                  │
│  │  Backend    │             │  Backend    │                  │
│  │  Server 1   │             │  Server 2   │                  │
│  │  (Node.js)  │             │  (Node.js)  │                  │
│  └─────┬───────┘             └─────┬───────┘                  │
│        │                           │                          │
│        └───────────┬───────────────┘                          │
│                    │                                           │
├────────────────────┼───────────────────────────────────────────┤
│                    │  Backend Services                         │
│  ┌─────────────────┴─────────────────────────────┐            │
│  │                                                 │            │
│  │  ┌──────────────┐  ┌──────────────┐           │            │
│  │  │ Auth Service │  │ DSA Service  │           │            │
│  │  │  - JWT       │  │  - Problems  │           │            │
│  │  │  - Refresh   │  │  - Progress  │           │            │
│  │  └──────────────┘  └──────────────┘           │            │
│  │                                                 │            │
│  │  ┌──────────────┐  ┌──────────────┐           │            │
│  │  │Calendar Svc  │  │Analytics Svc │           │            │
│  │  │  - Events    │  │  - Stats     │           │            │
│  │  │  - Schedule  │  │  - Streaks   │           │            │
│  │  └──────────────┘  └──────────────┘           │            │
│  │                                                 │            │
│  └─────────────────┬───────────────────────────────┘          │
│                    │                                           │
│                    │ Mongoose ODM                              │
│                    ▼                                           │
├─────────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                               │
│                  (MongoDB Atlas)                                │
│  ┌──────────────────────────────────────────────────┐          │
│  │                                                   │          │
│  │  Collections:                                     │          │
│  │  - users          (Authentication)                │          │
│  │  - chapters       (DSA hierarchy)                 │          │
│  │  - topics         (DSA hierarchy)                 │          │
│  │  - problems       (DSA problems + resources)      │          │
│  │  - userProgress   (Completion tracking)           │          │
│  │  - calendarEvents (Schedule planning)             │          │
│  │                                                   │          │
│  │  Replica Set: PRIMARY + 2 SECONDARIES             │          │
│  │  Auto-scaling enabled                             │          │
│  │  Automated backups (Point-in-time recovery)       │          │
│  │                                                   │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

External Services:
├── AWS CloudWatch (Monitoring, Logs)
├── AWS SES / Lambda (Email notifications - already integrated)
└── AWS Certificate Manager (SSL/TLS)
```

### 5.2 Request Flow

#### Authentication Flow
```
1. User enters credentials
   │
   ├─> Frontend validates input (Zod schema)
   │
   └─> POST /api/v1/auth/login
       │
       ├─> Backend validates credentials
       │   ├─> Query users collection
       │   └─> Compare password (bcrypt)
       │
       ├─> Generate JWT tokens (access + refresh)
       │
       └─> Return tokens + user data
           │
           └─> Frontend stores tokens (localStorage/cookie)
               │
               └─> Redirect to Dashboard
```

#### Progress Tracking Flow
```
1. User clicks problem checkbox
   │
   ├─> Frontend optimistically updates UI (React Query)
   │
   └─> PATCH /api/v1/progress/:problemId
       │
       ├─> Backend: authenticateJWT middleware
       │   └─> Extract userId from token
       │
       ├─> Backend: Update/Create userProgress document
       │   ├─> Set isCompleted = true/false
       │   ├─> Set completedAt = new Date()
       │   └─> Update user.totalProblemsCompleted (cache)
       │
       ├─> Backend: Check and update streak
       │   ├─> Calculate days since last activity
       │   └─> Update currentStreak, longestStreak
       │
       └─> Return updated progress
           │
           └─> Frontend updates cache (React Query)
               │
               └─> UI reflects new state (progress bar, streak)
```

#### Calendar Scheduling Flow
```
1. User drags problem to calendar date
   │
   ├─> Frontend creates calendar event
   │
   └─> POST /api/v1/calendar/events
       │
       ├─> Backend: authenticateJWT middleware
       │
       ├─> Backend: Validate event data
       │   ├─> Check date conflicts (optional)
       │   └─> Validate problemId exists
       │
       ├─> Backend: Create calendarEvent document
       │
       └─> Return created event
           │
           └─> Frontend updates calendar view
```

### 5.3 Scalability Considerations (10K-50K Users)

#### 5.3.1 Database Optimization
```javascript
// Compound indexes for common queries
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
calendarEventSchema.index({ userId: 1, scheduledDate: 1 });

// Read preference for analytics queries (use secondaries)
const progressStats = await UserProgress.find()
  .read('secondary')
  .where('userId').equals(userId);
```

#### 5.3.2 Caching Strategy
```javascript
// Frontend: React Query cache
queryClient.setDefaultOptions({
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
});

// Backend: Cached aggregations (for leaderboards, stats)
// Use Redis or in-memory cache for frequently accessed data
```

#### 5.3.3 Load Balancing
- AWS Application Load Balancer distributes traffic
- Multiple Node.js instances (horizontal scaling)
- Session-less architecture (JWT tokens = stateless)

#### 5.3.4 Connection Pooling
```javascript
// MongoDB connection pooling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 50,  // 50 concurrent connections
  minPoolSize: 10,
  socketTimeoutMS: 45000,
});
```

#### 5.3.5 API Rate Limiting
```javascript
// Add express-rate-limit middleware
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

---

## 6. API Design

### 6.1 Authentication APIs (Already Exists)
```
POST   /api/v1/auth/register        - Register new user
POST   /api/v1/auth/login           - Login user
POST   /api/v1/auth/refresh         - Refresh access token
POST   /api/v1/auth/logout          - Logout user
GET    /api/v1/auth/me              - Get current user
```

### 6.2 DSA Sheet APIs (NEW)

#### Chapters
```
GET    /api/v1/chapters              - Get all chapters (with counts)
GET    /api/v1/chapters/:id          - Get single chapter details
POST   /api/v1/chapters              - Create chapter (admin only - bonus)
PUT    /api/v1/chapters/:id          - Update chapter (admin only)
DELETE /api/v1/chapters/:id          - Delete chapter (admin only)
```

#### Topics
```
GET    /api/v1/topics                - Get all topics (filtered by chapterId)
GET    /api/v1/topics/:id            - Get single topic details
GET    /api/v1/chapters/:chapterId/topics  - Get topics by chapter
```

#### Problems
```
GET    /api/v1/problems              - Get all problems (with filters)
                                       ?difficulty=Easy
                                       ?topicId=xxx
                                       ?chapterId=xxx
                                       ?tags=array,hash-table
                                       ?page=1&limit=20

GET    /api/v1/problems/:id          - Get single problem details

GET    /api/v1/topics/:topicId/problems    - Get problems by topic

GET    /api/v1/chapters/:chapterId/problems - Get all problems in chapter
```

### 6.3 Progress Tracking APIs (NEW - CRITICAL)
```
// Get user progress
GET    /api/v1/progress              - Get all progress for current user
                                       Returns: list of completed problemIds

GET    /api/v1/progress/stats        - Get progress statistics
                                       Returns: {
                                         totalProblems: 450,
                                         completedProblems: 87,
                                         completionRate: 19.3,
                                         byDifficulty: {
                                           easy: { total: 150, completed: 45 },
                                           medium: { total: 200, completed: 32 },
                                           hard: { total: 100, completed: 10 }
                                         },
                                         byChapter: [...],
                                         currentStreak: 5,
                                         longestStreak: 12
                                       }

GET    /api/v1/progress/recent       - Get recently completed problems (limit 10)

// Update progress
POST   /api/v1/progress/:problemId   - Mark problem as complete
DELETE /api/v1/progress/:problemId   - Mark problem as incomplete

PATCH  /api/v1/progress/:problemId   - Update progress details
                                       Body: {
                                         notes: "string",
                                         rating: 4,
                                         timeSpent: 45
                                       }
```

### 6.4 Calendar APIs (NEW - CORE FEATURE)
```
// Get calendar events
GET    /api/v1/calendar/events       - Get all events for current user
                                       ?startDate=2024-01-01
                                       ?endDate=2024-01-31
                                       ?status=pending

GET    /api/v1/calendar/events/:id   - Get single event

GET    /api/v1/calendar/today        - Get today's scheduled problems

// Manage events
POST   /api/v1/calendar/events       - Create calendar event
                                       Body: {
                                         problemId: "xxx",
                                         title: "Solve Two Sum",
                                         scheduledDate: "2024-01-15",
                                         startTime: "09:00 AM",
                                         duration: 60,
                                         reminderEnabled: true
                                       }

PUT    /api/v1/calendar/events/:id   - Update event (reschedule)

DELETE /api/v1/calendar/events/:id   - Delete event

PATCH  /api/v1/calendar/events/:id/complete - Mark event as completed
```

### 6.5 Analytics APIs (Bonus)
```
GET    /api/v1/analytics/dashboard   - Get dashboard summary
                                       Returns: {
                                         todayCompleted: 3,
                                         weeklyCompleted: 15,
                                         currentStreak: 5,
                                         upcomingEvents: [...],
                                         weakTopics: [...]
                                       }

GET    /api/v1/analytics/heatmap     - Get activity heatmap data (GitHub style)
                                       Returns: [{date: "2024-01-15", count: 3}, ...]

GET    /api/v1/analytics/leaderboard - Get top performers (optional)
```

### 6.6 API Response Format (Standardized)
```typescript
// Success response
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error response
{
  success: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    statusCode: 400
  }
}

// Paginated response
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 10,
    totalItems: 200
  }
}
```

---

## 7. Implementation Roadmap

### Phase 1: Backend Foundation (Week 1)

#### Day 1-2: Database Models
- [ ] Create Chapter model (`Backend/src/api/dsa/chapterModel.ts`)
- [ ] Create Topic model (`Backend/src/api/dsa/topicModel.ts`)
- [ ] Create Problem model (`Backend/src/api/dsa/problemModel.ts`)
- [ ] Create UserProgress model (`Backend/src/api/progress/progressModel.ts`)
- [ ] Create CalendarEvent model (`Backend/src/api/calendar/calendarModel.ts`)
- [ ] Add indexes to all models
- [ ] Modify User model (add streak fields)

#### Day 3-4: DSA Sheet APIs
- [ ] Create DSA module structure
  ```
  Backend/src/api/dsa/
  ├── chapterController.ts
  ├── chapterRoutes.ts
  ├── chapterService.ts
  ├── topicController.ts
  ├── problemController.ts
  └── validators.ts
  ```
- [ ] Implement Chapter CRUD APIs
- [ ] Implement Topic GET APIs
- [ ] Implement Problem GET APIs (with filtering)
- [ ] Add pagination support
- [ ] Test all endpoints with Postman/Thunder Client

#### Day 5-6: Progress Tracking APIs
- [ ] Create Progress module
  ```
  Backend/src/api/progress/
  ├── progressController.ts
  ├── progressRoutes.ts
  ├── progressService.ts
  └── progressModel.ts
  ```
- [ ] Implement progress tracking endpoints
- [ ] Implement streak calculation logic
- [ ] Implement progress stats aggregation
- [ ] Add authentication middleware to all routes
- [ ] Test progress tracking flow

#### Day 7: Calendar APIs
- [ ] Create Calendar module
  ```
  Backend/src/api/calendar/
  ├── calendarController.ts
  ├── calendarRoutes.ts
  ├── calendarService.ts
  └── calendarModel.ts
  ```
- [ ] Implement calendar CRUD operations
- [ ] Add date-range query support
- [ ] Test calendar functionality

### Phase 2: Frontend - Core UI (Week 2)

#### Day 8-9: DSA Sheet Page
- [ ] Create DSA Sheet page layout
  ```
  Frontend/vms-psi/src/pages/dsa-sheet/
  ├── DsaSheetPage.tsx
  ├── components/
  │   ├── ChapterCard.tsx
  │   ├── TopicSection.tsx
  │   ├── ProblemRow.tsx
  │   └── ProgressBar.tsx
  └── hooks/
      ├── useDsaSheet.ts
      └── useProgress.ts
  ```
- [ ] Implement hierarchical navigation (Chapters → Topics → Problems)
- [ ] Add collapsible sections
- [ ] Implement problem checkboxes
- [ ] Add difficulty badges (Easy/Medium/Hard)
- [ ] Add resource links (YouTube, LeetCode, Article)
- [ ] Implement search/filter functionality

#### Day 10-11: Calendar Page (Core Feature)
- [ ] Install react-big-calendar
  ```bash
  npm install react-big-calendar date-fns
  npm install --save-dev @types/react-big-calendar
  ```
- [ ] Create Calendar page
  ```
  Frontend/vms-psi/src/pages/calendar/
  ├── CalendarPage.tsx
  ├── components/
  │   ├── CalendarView.tsx
  │   ├── EventModal.tsx
  │   ├── DayView.tsx
  │   └── ProblemSelector.tsx
  └── hooks/
      └── useCalendar.ts
  ```
- [ ] Implement monthly/weekly calendar view
- [ ] Add event creation (drag-drop or click)
- [ ] Add event editing/deletion
- [ ] Implement event status indicators
- [ ] Add today's schedule sidebar

#### Day 12-13: Progress Dashboard
- [ ] Create Dashboard page
  ```
  Frontend/vms-psi/src/pages/dashboard/
  ├── DashboardPage.tsx
  ├── components/
  │   ├── StatsCard.tsx
  │   ├── ProgressChart.tsx
  │   ├── StreakDisplay.tsx
  │   ├── RecentActivity.tsx
  │   └── UpcomingEvents.tsx
  └── hooks/
      └── useDashboard.ts
  ```
- [ ] Display progress statistics (overall, by difficulty, by chapter)
- [ ] Add progress charts (bar chart, pie chart)
- [ ] Display current streak and longest streak
- [ ] Show recent activity
- [ ] Show upcoming scheduled events

#### Day 14: Integration & Routing
- [ ] Update routing (`Frontend/vms-psi/src/routes/Approutes.tsx`)
  ```typescript
  {
    path: '/dsa-sheet',
    element: <DsaSheetPage />,
  },
  {
    path: '/calendar',
    element: <CalendarPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/problem/:id',
    element: <ProblemDetailPage />,
  }
  ```
- [ ] Update navigation menu (add DSA Sheet, Calendar, Dashboard links)
- [ ] Add protected routes (require authentication)
- [ ] Test all navigation flows

### Phase 3: Data Seeding (Can be done in parallel)

#### DSA Sheet Content Population
- [ ] Create seed script (`Backend/src/scripts/seedDsaSheet.ts`)
- [ ] Populate chapters (Arrays, Strings, Linked Lists, Trees, Graphs, DP, etc.)
- [ ] Populate topics under each chapter
- [ ] Populate problems with all required fields:
  - Title, description, difficulty
  - YouTube tutorial link
  - LeetCode/Codeforces link
  - Article link
  - Tags, estimated time

**Recommended Approach:**
1. Use Striver's SDE Sheet as reference (190+ problems)
2. Or Love Babbar's DSA Sheet (450 problems)
3. Create JSON file with structured data
4. Write seed script to populate database

**Seed Script Structure:**
```typescript
// Backend/src/scripts/seedDsaSheet.ts
import mongoose from 'mongoose';
import Chapter from '../api/dsa/chapterModel';
import Topic from '../api/dsa/topicModel';
import Problem from '../api/dsa/problemModel';
import dsaData from './dsa-sheet-data.json';

async function seedDatabase() {
  for (const chapterData of dsaData) {
    // Create chapter
    const chapter = await Chapter.create({
      title: chapterData.title,
      order: chapterData.order,
      description: chapterData.description
    });
    
    // Create topics and problems...
  }
}

seedDatabase();
```

### Phase 4: Polish & Enhancement (Week 3)

#### Day 15-16: UI/UX Polish
- [ ] Implement loading states (skeletons)
- [ ] Add error states and error boundaries
- [ ] Add success/error notifications (toasts)
- [ ] Improve responsive design (mobile-first)
- [ ] Add smooth animations and transitions
- [ ] Implement dark mode consistency
- [ ] Add empty states (no problems completed, no events scheduled)

#### Day 17: Advanced Features (Bonus)
- [ ] Add problem search (by title, tags)
- [ ] Add filters (difficulty, chapter, topic, completion status)
- [ ] Add sorting (by difficulty, order, completion rate)
- [ ] Add bulk operations (mark multiple as complete)
- [ ] Add problem notes functionality
- [ ] Add spaced repetition reminders

#### Day 18: Analytics & Visualization
- [ ] Add activity heatmap (GitHub-style)
  ```bash
  npm install react-activity-calendar
  ```
- [ ] Add progress charts (Chart.js or Recharts)
  ```bash
  npm install recharts
  ```
- [ ] Add chapter-wise progress breakdown
- [ ] Add weak topics identification
- [ ] Add time spent analytics

#### Day 19: Performance Optimization
- [ ] Implement lazy loading for problem lists
- [ ] Add infinite scroll or pagination
- [ ] Optimize API calls (batch requests where possible)
- [ ] Add request debouncing for search
- [ ] Implement service worker for offline support (PWA - bonus)
- [ ] Optimize bundle size (code splitting)

#### Day 20-21: Testing & Bug Fixes
- [ ] Test all user flows end-to-end
- [ ] Test authentication flows (login, logout, session expiry)
- [ ] Test progress persistence (logout and login again)
- [ ] Test calendar operations (create, edit, delete events)
- [ ] Test edge cases (empty states, error cases)
- [ ] Fix bugs and issues
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing

### Phase 5: Deployment (Week 4)

#### Day 22-23: AWS Deployment - Backend
- [ ] Set up AWS account
- [ ] Option 1: AWS EC2
  - Launch EC2 instance (t2.micro or t3.micro)
  - Install Node.js, npm, Git
  - Clone repository
  - Set up environment variables
  - Install PM2 for process management
    ```bash
    npm install -g pm2
    pm2 start dist/index.js --name dsa-backend
    pm2 startup
    pm2 save
    ```
  - Configure security groups (allow port 80, 443, 5000)
  - Set up Nginx as reverse proxy
  - Configure SSL with Let's Encrypt (Certbot)

- [ ] Option 2: AWS Elastic Beanstalk (Easier)
  - Install EB CLI
    ```bash
    pip install awsebcli
    ```
  - Initialize EB application
    ```bash
    eb init
    eb create dsa-backend-env
    eb deploy
    ```
  - Configure environment variables in EB console
  - Set up SSL certificate

- [ ] Option 3: AWS ECS with Docker (Modern)
  - Create Dockerfile
  - Build and push to AWS ECR
  - Create ECS cluster and service
  - Configure ALB and target groups

#### Day 24: AWS Deployment - Frontend
- [ ] Build production frontend
  ```bash
  cd Frontend/vms-psi
  npm run build
  ```
  
- [ ] Create S3 bucket for static hosting
  - Bucket name: `dsa-sheet-app` (unique name)
  - Enable static website hosting
  - Set bucket policy (public read access)
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::dsa-sheet-app/*"
      }
    ]
  }
  ```

- [ ] Upload build files to S3
  ```bash
  aws s3 sync dist/ s3://dsa-sheet-app --delete
  ```

- [ ] Set up CloudFront CDN
  - Create CloudFront distribution
  - Set S3 bucket as origin
  - Configure custom error responses (SPA routing)
  - Set up SSL certificate (AWS Certificate Manager)
  - Wait for distribution deployment (~15 minutes)

- [ ] Update frontend API base URL
  ```typescript
  // Frontend/vms-psi/src/config/api.ts
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-domain.com/api/v1';
  ```

#### Day 25: Domain & SSL Setup (Optional but Recommended)
- [ ] Register domain (AWS Route 53 or external registrar)
- [ ] Create Route 53 hosted zone
- [ ] Create A record for backend (points to EC2/ALB)
- [ ] Create CNAME record for frontend (points to CloudFront)
- [ ] Set up SSL certificates (AWS Certificate Manager)
- [ ] Update CORS configuration in backend to allow new domain

#### Day 26: Documentation
- [ ] Create comprehensive README.md
  - Project overview
  - Features list
  - Tech stack
  - Installation instructions
  - Environment variables
  - API documentation
  - Deployment instructions

- [ ] Create System Design Document
  ```
  SYSTEM_DESIGN.md
  ├── High-Level Architecture diagram
  ├── Request flow explanation
  ├── Authentication mechanism
  ├── Data flow for progress tracking
  ├── Scalability considerations
  └── Trade-offs and design decisions
  ```

- [ ] Create Database Schema Document
  ```
  DATABASE_SCHEMA.md
  ├── All collection schemas
  ├── Relationships diagram
  ├── Indexing strategy
  └── Sample queries
  ```

- [ ] Create API Documentation
  - Use Postman collection export
  - Or create manual API docs with examples

#### Day 27: Video Recording
- [ ] Prepare video script (2-5 minutes)
  ```
  1. Introduction (15 seconds)
     - Project name and purpose
     
  2. Application Flow (1 minute)
     - Login/Registration
     - DSA Sheet navigation
     - Problem browsing (chapters, topics, problems)
     
  3. Key Features (2 minutes)
     - Progress tracking (checkbox demo)
     - Persistence demo (logout and login, progress restored)
     - Resource links (YouTube, LeetCode, Articles)
     - Difficulty indicators
     
  4. Calendar Feature (1.5 minutes)
     - Navigate to calendar page
     - Schedule a problem
     - Show calendar view with scheduled events
     - Mark event as complete
     
  5. Progress Dashboard (30 seconds)
     - Show statistics
     - Show streak information
     - Show charts/visualizations
     
  6. Conclusion (15 seconds)
     - Thank you and summary
  ```

- [ ] Record video using:
  - OBS Studio (free, open-source)
  - Loom (easy screen recording with webcam)
  - Or any screen recording tool

- [ ] Edit video (add intro slide, transitions if needed)
- [ ] Upload to YouTube (unlisted) or Google Drive
- [ ] Add video link to deliverables

#### Day 28: Final Testing & Submission
- [ ] Test deployed application end-to-end
- [ ] Verify all features work on live deployment
- [ ] Test from multiple devices (desktop, mobile, tablet)
- [ ] Check performance (Lighthouse score)
- [ ] Verify SSL certificates are working
- [ ] Test API endpoints from deployed frontend

- [ ] Prepare submission package:
  ```
  Deliverables/
  ├── GitHub Repository Link (source code)
  ├── AWS Deployment Link (live app)
  ├── System Design Document (PDF/MD)
  ├── Database Schema Document (PDF/MD)
  ├── Video Link (YouTube/Drive)
  └── README.md (comprehensive)
  ```

- [ ] Submit all deliverables
- [ ] Optional: Send thank you email with submission confirmation

---

## 8. Additional Features (Stand Out)

These features go beyond the requirements and will make your submission exceptional:

### 8.1 Spaced Repetition System
```typescript
// Calculate next revision date based on performance
interface RevisionSchedule {
  easyInterval: 7,    // Review after 7 days
  mediumInterval: 3,  // Review after 3 days
  hardInterval: 1     // Review after 1 day
}

// Add to UserProgress model
nextRevisionDate: Date;
revisionCount: number;

// Show "Due for Revision" badge on problems
```

### 8.2 Activity Heatmap (GitHub-style)
```bash
npm install react-activity-calendar
```
```typescript
// Show daily problem-solving activity
<ActivityCalendar data={activityData} />
```

### 8.3 Leaderboard (Optional - Social Feature)
```typescript
// Weekly leaderboard
GET /api/v1/leaderboard/weekly
// Returns top 10 users by problems solved this week

// Display on dashboard
<LeaderboardCard />
```

### 8.4 Problem Bookmarks/Favorites
```typescript
// Allow users to bookmark important problems
interface UserProgress {
  isBookmarked: boolean;
}

// Add filter: Show only bookmarked problems
```

### 8.5 Notes & Code Snippets
```typescript
// Allow users to save notes and solution code
interface UserProgress {
  notes: string;
  solutionCode: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
}

// Display in problem detail modal
<CodeEditor value={progress.solutionCode} />
```

### 8.6 Timer Feature (Pomodoro)
```typescript
// Add timer to track time spent on each problem
interface UserProgress {
  timeSpent: number;  // in minutes
  timerSessions: Array<{
    startedAt: Date;
    endedAt: Date;
    duration: number;
  }>;
}

// UI component
<PomodoroTimer problemId={problemId} />
```

### 8.7 Daily Challenge
```typescript
// Random problem of the day
GET /api/v1/daily-challenge

// Returns: One random unsolved problem
// Display prominently on dashboard
```

### 8.8 Progress Export
```typescript
// Export progress as CSV/PDF
GET /api/v1/progress/export?format=csv

// User can download their progress report
```

### 8.9 Email Reminders (Already have email service!)
```typescript
// Send daily reminder emails for scheduled problems
// Leverage existing EMAIL_URL and EMAIL_API_KEY

// Cron job (daily at 8 AM)
import cron from 'node-cron';

cron.schedule('0 8 * * *', async () => {
  // Find users with events scheduled for today
  // Send reminder emails
});
```

### 8.10 PWA Support (Offline Capability)
```typescript
// Add service worker for offline support
// User can access DSA sheet without internet

// In Frontend/vms-psi/vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DSA Sheet Tracker',
        short_name: 'DSA Tracker',
        description: 'Track your DSA preparation',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

### 8.11 Topics Mastery Indicator
```typescript
// Calculate mastery level for each topic
interface TopicMastery {
  topicId: string;
  totalProblems: number;
  completedProblems: number;
  masteryLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  percentage: number;
}

// Display badges based on mastery
<MasteryBadge level={mastery.masteryLevel} />
```

### 8.12 Problem Recommendations
```typescript
// Suggest next problems based on:
// - User's weak topics
// - Problem difficulty
// - Similar problems completed

GET /api/v1/recommendations

// Returns: 5-10 recommended problems
```

---

## 9. Deployment Strategy (AWS)

### 9.1 Frontend Deployment (S3 + CloudFront)

**Step-by-step:**

1. **Build Frontend:**
   ```bash
   cd Frontend/vms-psi
   npm run build
   # Creates dist/ folder
   ```

2. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://dsa-sheet-app-frontend --region us-east-1
   ```

3. **Configure Bucket for Static Hosting:**
   ```bash
   aws s3 website s3://dsa-sheet-app-frontend \
     --index-document index.html \
     --error-document index.html
   ```

4. **Set Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::dsa-sheet-app-frontend/*"
       }
     ]
   }
   ```

5. **Upload Build Files:**
   ```bash
   aws s3 sync dist/ s3://dsa-sheet-app-frontend --delete
   ```

6. **Create CloudFront Distribution:**
   - Origin: S3 bucket
   - Enable HTTPS
   - Set default root object: `index.html`
   - Custom error responses:
     - 403 → `/index.html` (200) - for SPA routing
     - 404 → `/index.html` (200) - for SPA routing

7. **Get CloudFront URL:**
   ```
   https://d111111abcdef8.cloudfront.net
   ```

### 9.2 Backend Deployment (EC2)

**Step-by-step:**

1. **Launch EC2 Instance:**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t3.micro (free tier) or t3.small
   - Security group:
     - SSH (22) - Your IP only
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
     - Custom TCP (5000) - 0.0.0.0/0 (or restrict to frontend)

2. **Connect to EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version
   npm --version
   ```

4. **Install Git:**
   ```bash
   sudo apt-get install git -y
   ```

5. **Clone Repository:**
   ```bash
   git clone https://github.com/yourusername/dsa-sheet-app.git
   cd dsa-sheet-app/Backend
   ```

6. **Install Dependencies:**
   ```bash
   npm install
   ```

7. **Build TypeScript:**
   ```bash
   npm run build
   ```

8. **Create .env file:**
   ```bash
   nano .env
   # Paste your environment variables
   # Update MONGO_URI, JWT secrets, etc.
   # Update APP_ORIGIN to CloudFront URL
   ```

9. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

10. **Start Application:**
    ```bash
    pm2 start dist/index.js --name dsa-backend
    pm2 startup
    pm2 save
    ```

11. **Install Nginx (Reverse Proxy):**
    ```bash
    sudo apt-get install nginx -y
    ```

12. **Configure Nginx:**
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
    ```nginx
    server {
        listen 80;
        server_name your-domain.com; # or EC2 public IP
        
        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

13. **Restart Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

14. **Install SSL (Certbot - Let's Encrypt):**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d your-domain.com
    # Follow prompts
    ```

15. **Backend URL:**
    ```
    https://your-domain.com
    or
    http://ec2-xx-xx-xx-xx.compute.amazonaws.com
    ```

### 9.3 Database (MongoDB Atlas)

**Already configured!** Your MONGO_URI is already pointing to MongoDB Atlas:
```
mongodb+srv://gauravsharma_db_user:THyJ2TG3YSQKDVmj@cluster0.akto2qh.mongodb.net/?appName=VMS_TEST
```

**Recommendations:**
1. Create a new database for DSA app (separate from VMS)
2. Update MONGO_URI to point to new database:
   ```
   mongodb+srv://user:pass@cluster0.akto2qh.mongodb.net/dsa_tracker?retryWrites=true&w=majority
   ```
3. Ensure IP whitelist allows EC2 instance IP
4. Enable backup and point-in-time recovery

### 9.4 Cost Estimation (AWS Free Tier)

**Free Tier Resources (12 months):**
- EC2: 750 hours/month of t2.micro or t3.micro
- S3: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- CloudFront: 50GB data transfer out, 2,000,000 HTTP requests
- Route 53: First hosted zone free

**Estimated Monthly Cost (After Free Tier):**
- EC2 t3.micro: ~$7.50/month
- S3: ~$0.50/month (for 10GB)
- CloudFront: ~$1.00/month (for 10GB transfer)
- Route 53: ~$0.50/month per hosted zone
- MongoDB Atlas: Free tier (512MB) or $9/month (M2 shared)

**Total: ~$10-20/month** (or free during AWS free tier period)

### 9.5 Alternative: Vercel + Render (Simpler, Free)

**Frontend on Vercel (Free):**
```bash
npm install -g vercel
cd Frontend/vms-psi
vercel --prod
```

**Backend on Render (Free):**
1. Go to render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add environment variables
5. Deploy

**Cost: $0** (with limitations: cold starts, limited resources)

---

## 10. Deliverables Checklist

### 10.1 Source Code
- [ ] GitHub repository (public or private)
- [ ] Clean, well-organized code structure
- [ ] Proper naming conventions
- [ ] Comments on complex logic
- [ ] TypeScript types properly defined
- [ ] No hardcoded credentials (use .env)
- [ ] .gitignore configured properly
- [ ] Separate .env.example file with required variables

### 10.2 AWS Deployment Link
- [ ] Frontend URL (CloudFront or S3)
- [ ] Backend URL (EC2 or Elastic Beanstalk)
- [ ] Both URLs working and accessible
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured correctly
- [ ] No console errors in browser
- [ ] Test user credentials provided (optional)

### 10.3 System Design Document
```markdown
# SYSTEM_DESIGN.md

## 1. High-Level Architecture (HLD)
[Include architecture diagram - can use draw.io, Lucidchart, or ASCII]

## 2. Request Flow
- User authentication flow
- Problem progress tracking flow
- Calendar scheduling flow

## 3. Authentication Mechanism
- JWT-based authentication
- Token refresh strategy
- Session management

## 4. Data Flow for Progress Tracking
- How progress is saved
- How progress is retrieved
- Synchronization strategy

## 5. Scalability Considerations
- Database indexing
- Connection pooling
- Caching strategy
- Load balancing
- Horizontal scaling approach

## 6. Handling 10K-50K Active Users
- Concurrent connection handling
- Database query optimization
- API rate limiting
- CDN usage for static assets

## 7. Trade-offs and Design Decisions
- Why MongoDB over PostgreSQL?
- Why JWT over session-based auth?
- Why separate collections for progress?
- When to denormalize data?
```

### 10.4 Database Schema Document
```markdown
# DATABASE_SCHEMA.md

## Collections

### 1. users
- Schema definition
- Indexes
- Sample document

### 2. chapters
- Schema definition
- Indexes
- Sample document

### 3. topics
- Schema definition
- Indexes
- Relationships

### 4. problems
- Schema definition
- Indexes
- Relationships
- Sample document with resources

### 5. userProgress
- Schema definition
- Indexes (compound indexes explained)
- Relationships
- Query patterns

### 6. calendarEvents
- Schema definition
- Indexes
- Relationships

## Entity Relationships
[Include ER diagram or textual description]

## Indexing Strategy
- Why these indexes?
- Query patterns optimized
- Performance considerations

## Sample Queries
```javascript
// Get user progress stats
// Get all problems in a chapter
// Get scheduled events for date range
```
```

### 10.5 Short Video (2-5 minutes)
- [ ] Clear audio (no background noise)
- [ ] Screen recording in HD (1080p minimum)
- [ ] Show application flow smoothly
- [ ] Demonstrate ALL key features:
  - Login/Registration
  - DSA Sheet navigation (chapters, topics, problems)
  - Checkbox functionality (mark complete)
  - Resource links (click YouTube, LeetCode links)
  - Difficulty indicators
  - Calendar page (create event, view events)
  - Progress dashboard (stats, streaks)
  - Persistence demo (logout and login, progress restored)
- [ ] Speak clearly and confidently
- [ ] Keep it under 5 minutes
- [ ] Upload to YouTube (unlisted) or Google Drive
- [ ] Ensure video is publicly accessible (test link)

**Video Script Template:**
```
[0:00-0:15] Introduction
"Hi, I'm [Your Name]. This is my DSA Sheet Tracker application built for the Apna College Technical Team Lead assessment. Let me walk you through the key features."

[0:15-1:00] Authentication & Overview
"First, let me log in to the application. [Login demo]
Once logged in, we land on the dashboard which shows our progress statistics, current streak, and upcoming scheduled problems."

[1:00-2:00] DSA Sheet Feature
"Here's the core DSA Sheet page. It's organized hierarchically into chapters like Arrays, Linked Lists, Trees, etc.
Each chapter contains multiple topics. For example, under Arrays, we have Two Pointer Technique, Sliding Window, and more.
Each topic contains specific problems. Let me expand the Arrays chapter and Two Pointer topic.
You can see problems like Two Sum, Container With Most Water, etc.
Each problem has a difficulty indicator - Easy is green, Medium is yellow, Hard is red.
Most importantly, each problem has learning resources: a YouTube tutorial link, the LeetCode problem link, and an article for theory reference."

[2:00-2:45] Progress Tracking
"Now, let me demonstrate the progress tracking. When I check this box, it marks the problem as complete.
This progress is persisted in the database. Let me log out and log back in to prove it.
[Logout, login, navigate back]
As you can see, the problem is still marked as complete. The progress is restored exactly where I left off."

[2:45-3:45] Calendar Feature
"Now for the calendar feature - this is a core, standalone feature of the application.
Here, I can plan my study schedule. Let me schedule a problem for tomorrow.
[Create event demo]
I can select a problem, set a date and time, and save it.
The calendar now shows my scheduled events. I can view them in monthly or weekly view.
This helps students plan their DSA preparation in an organized way."

[3:45-4:30] Progress Dashboard
"Back on the dashboard, you can see my progress statistics:
- Total problems completed
- Completion rate by difficulty level
- Chapter-wise progress breakdown
- Current streak of consecutive days
- Recently completed problems
- Upcoming scheduled events
This gives a comprehensive view of the learning journey."

[4:30-5:00] Conclusion
"That covers all the key features:
- Secure authentication
- Hierarchical DSA sheet with progress tracking
- Learning resources integration
- Calendar-based study planning
- Comprehensive progress analytics

The application is deployed on AWS and the source code is on GitHub.
Thank you for reviewing my submission!"
```

### 10.6 README.md
```markdown
# DSA Sheet Tracker - Apna College Assessment

## Overview
A full-stack web application to help students track and plan their Data Structures & Algorithms preparation in a structured, engaging way.

## Live Demo
- **Frontend:** https://your-cloudfront-url.cloudfront.net
- **Backend API:** https://your-backend-domain.com

## Test Credentials (Optional)
- Email: test@example.com
- Password: Test@123

## Features
✅ Secure authentication (JWT-based)
✅ Structured DSA sheet (Chapters → Topics → Problems)
✅ Progress tracking with persistence
✅ Learning resources integration (YouTube, LeetCode, Articles)
✅ Difficulty level indicators
✅ Dedicated calendar page for study planning
✅ Progress analytics and statistics
✅ Dark mode support
✅ Responsive design (mobile-friendly)

## Tech Stack
**Frontend:**
- React 19 with TypeScript
- TailwindCSS v4
- React Router v7
- React Query (@tanstack/react-query)
- React Hook Form + Zod
- react-big-calendar

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Passport.js

**Deployment:**
- Frontend: AWS S3 + CloudFront
- Backend: AWS EC2
- Database: MongoDB Atlas

## Installation & Setup

### Prerequisites
- Node.js 20+
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run server  # Development
npm run build   # Production build
npm start       # Production
```

### Frontend Setup
```bash
cd Frontend/vms-psi
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev     # Development
npm run build   # Production build
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
APP_ORIGIN=https://your-frontend-url.com
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com/api/v1
```

## API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## System Design
See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)

## Database Schema
See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## Project Structure
```
├── Backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── dsa/
│   │   │   ├── progress/
│   │   │   └── calendar/
│   │   ├── config/
│   │   ├── middlewares/
│   │   └── index.ts
│   └── package.json
│
└── Frontend/
    └── vms-psi/
        ├── src/
        │   ├── pages/
        │   │   ├── dsa-sheet/
        │   │   ├── calendar/
        │   │   └── dashboard/
        │   ├── components/
        │   ├── hooks/
        │   └── App.tsx
        └── package.json
```

## Author
[Your Name]
[Your Email]
[Your GitHub Profile]

## License
MIT
```

---

## 11. Scalability & Performance Optimization

### 🎯 Overview: Can This Architecture Scale?

**Question:** Can this system handle 50k-100k concurrent users?

**Short Answer:**
- ✅ **10k-50k active users**: YES, with basic architecture (as designed)
- ✅ **50k-100k concurrent users**: YES, with strategic upgrades
- ⚠️ **500k+ concurrent users**: Requires microservices architecture

---

### 11.1 Scalability Assessment: Current vs Optimized

#### 📊 Performance Comparison Table

| **Metric** | **Basic Architecture** | **Optimized Architecture** |
|------------|------------------------|---------------------------|
| **Concurrent Users** | 500-1,000 | 50,000-100,000 |
| **Requests/second** | 100-200 | 5,000-10,000 |
| **Response Time (p95)** | 500-1000ms | 50-200ms |
| **Database Connections** | 50-100 | 2,000-3,000 |
| **Cache Hit Rate** | 0% (no cache) | 85-95% |
| **Database Load** | 100% | 10-15% (cached) |
| **Monthly Cost** | $10-20 | $800-1,500 |
| **Availability (SLA)** | 95% (single point of failure) | 99.9% (redundancy) |

---

### 11.2 Bottleneck Analysis & Solutions

#### 🔴 Bottleneck #1: Backend Server (Node.js)

**Problem:**
```
Single EC2 Instance Limitations:
├─ t3.micro: ~100-200 concurrent connections
├─ t3.small: ~300-500 concurrent connections
├─ Single-threaded Node.js (event loop blocking)
└─ No fault tolerance (crashes = downtime)
```

**Solution: Horizontal Scaling + Load Balancing**

```
┌─────────────────────────────────────────────┐
│    AWS Application Load Balancer (ALB)     │
│    - Health checks every 30 seconds        │
│    - Automatic traffic distribution        │
│    - SSL/TLS termination                   │
└──────┬──────────┬──────────┬──────────┬────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │Node.js │ │Node.js │ │Node.js │ │Node.js │  (10-50 instances)
   │  API   │ │  API   │ │  API   │ │  API   │
   │ Server │ │ Server │ │ Server │ │ Server │
   └────────┘ └────────┘ └────────┘ └────────┘
     EC2        EC2        EC2        EC2
  t3.medium  t3.medium  t3.medium  t3.medium
```

**Implementation: Node.js Cluster Mode**

```typescript
// Backend/src/cluster.ts
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Workers share the same server port
  import('./index.js');  // Your Express app
  console.log(`Worker ${process.pid} started`);
}
```

**Auto Scaling Configuration (AWS):**

```yaml
# AWS Auto Scaling Group
MinInstances: 3
MaxInstances: 20
DesiredCapacity: 5

ScalingPolicy:
  - Type: TargetTrackingScaling
    TargetValue: 70  # CPU utilization
  - Type: TargetTrackingScaling
    TargetValue: 80  # Memory utilization
```

**Capacity Planning:**
- Each t3.medium: ~2,000-5,000 concurrent connections
- For 50k concurrent: Need 10-25 instances
- For 100k concurrent: Need 20-50 instances

---

#### 🔴 Bottleneck #2: Database (MongoDB)

**Problem:**
```
MongoDB Atlas Free/Shared Tier Issues:
├─ Limited connections: 100-500
├─ Shared CPU/RAM (unpredictable performance)
├─ No read replicas (all reads hit primary)
├─ Storage limit: 512MB-10GB
└─ No point-in-time recovery
```

**Solution: Dedicated Cluster + Read Replicas + Sharding**

```
┌───────────────────────────────────────────────┐
│         MongoDB Atlas M30 Cluster             │
│                                               │
│  ┌──────────────────┐                        │
│  │  PRIMARY NODE    │◄─── All WRITES         │
│  │  (M30: 8GB RAM)  │                        │
│  └────────┬─────────┘                        │
│           │                                   │
│           │ (Replication)                     │
│           │                                   │
│     ┌─────┴──────┐                           │
│     │            │                           │
│     ▼            ▼                           │
│  ┌────────┐  ┌────────┐                     │
│  │SECOND  │  │SECOND  │◄─── READ queries    │
│  │ARY #1  │  │ARY #2  │     (analytics,     │
│  │        │  │        │      stats, etc)     │
│  └────────┘  └────────┘                     │
│                                               │
│  Connection Pool: 2,000-3,000 connections    │
│  Auto-scaling storage enabled                │
└───────────────────────────────────────────────┘
```

**Read/Write Splitting Strategy:**

```typescript
// For WRITES (user actions) - always use PRIMARY
const updateProgress = await UserProgress.findOneAndUpdate(
  { userId, problemId },
  { isCompleted: true, completedAt: new Date() },
  { upsert: true, new: true }
);
// Goes to PRIMARY node

// For READS (analytics, stats) - use SECONDARIES
const progressStats = await UserProgress.aggregate([
  { $match: { userId: mongoose.Types.ObjectId(userId) } },
  { $group: { _id: '$difficulty', count: { $sum: 1 } } }
])
.read('secondaryPreferred');  // Routes to SECONDARY nodes
// Offloads read traffic from PRIMARY

// For critical reads (must be fresh) - use PRIMARY
const userProgress = await UserProgress.find({ userId })
  .read('primary');  // Ensures latest data
```

**Connection Pooling Configuration:**

```typescript
// Backend/src/database/database.ts
mongoose.connect(MONGO_URI, {
  maxPoolSize: 100,       // Max connections per instance
  minPoolSize: 20,        // Keep 20 connections ready
  maxIdleTimeMS: 30000,   // Close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,              // Use IPv4
});

// With 20 backend instances × 100 pool = 2,000 connections
// M30 supports up to 1,500-3,000 connections ✅
```

**Database Indexing (Performance Critical):**

```typescript
// Compound indexes for frequent queries
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
userProgressSchema.index({ userId: 1, completedAt: -1 });

problemSchema.index({ topicId: 1, order: 1 });
problemSchema.index({ difficulty: 1, chapterId: 1 });
problemSchema.index({ tags: 1 });  // For tag search

calendarEventSchema.index({ userId: 1, scheduledDate: 1 });
calendarEventSchema.index({ userId: 1, status: 1 });

// Analyze slow queries
db.setProfilingLevel(1, { slowms: 100 });  // Log queries > 100ms
```

**Cost:**
- M10: $57/month (2GB RAM) - Good for 10k-20k users
- M20: $150/month (4GB RAM) - Good for 20k-40k users  
- M30: $580/month (8GB RAM) - Good for 50k-100k users

---

#### 🔴 Bottleneck #3: No Caching Layer (CRITICAL!)

**Problem:**
```
Every request hits the database:
├─ Get DSA problems: 50-100ms query time × 1000 users = database overload
├─ Get user progress: 30-50ms × 5000 concurrent = 150,000 DB queries/sec
├─ Get chapters/topics: Repeated queries for same static data
└─ Result: Database becomes bottleneck at scale
```

**Solution: Redis Caching Layer (AWS ElastiCache)**

**Impact:** 90% cache hit rate = **10x reduction in database load**

```
┌─────────────────────────────────────────┐
│  Request Flow with Redis Cache          │
└─────────────────────────────────────────┘

User Request
    │
    ├─► Check Redis Cache (1-3ms latency) ⚡
    │       │
    │       ├─► CACHE HIT (90% of requests)
    │       │   └─► Return data immediately ✅
    │       │
    │       └─► CACHE MISS (10% of requests)
    │           └─► Query MongoDB (50-100ms)
    │               └─► Store in Redis (TTL: 5-10 min)
    │                   └─► Return data
    │
    └─► Response to user
```

**What to Cache:**

```typescript
// Backend/src/services/cache.service.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

// Cache TTL strategy
const CACHE_TTL = {
  STATIC: 3600,      // 1 hour (DSA problems, chapters, topics)
  SEMI_STATIC: 300,  // 5 minutes (user progress summary)
  DYNAMIC: 60,       // 1 minute (leaderboards)
  REALTIME: 10,      // 10 seconds (live stats)
};

// Get DSA problems with caching
export async function getCachedProblems(chapterId: string) {
  const cacheKey = `problems:chapter:${chapterId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache HIT:', cacheKey);
    return JSON.parse(cached);
  }
  
  // Cache miss - query database
  console.log('Cache MISS:', cacheKey);
  const problems = await Problem.find({ chapterId })
    .select('title difficulty order resources tags')
    .lean();
  
  // Store in cache (1 hour TTL - problems rarely change)
  await redis.setex(cacheKey, CACHE_TTL.STATIC, JSON.stringify(problems));
  
  return problems;
}

// Get user progress with caching
export async function getCachedUserProgress(userId: string) {
  const cacheKey = `progress:user:${userId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const progress = await UserProgress.find({ userId, isCompleted: true })
    .select('problemId completedAt')
    .lean();
  
  // Cache for 5 minutes (updates frequently)
  await redis.setex(cacheKey, CACHE_TTL.SEMI_STATIC, JSON.stringify(progress));
  
  return progress;
}

// Invalidate cache on updates
export async function invalidateUserProgressCache(userId: string) {
  const cacheKey = `progress:user:${userId}`;
  await redis.del(cacheKey);
  console.log('Cache invalidated:', cacheKey);
}

// Usage in controller
export async function markProblemComplete(req, res) {
  const { problemId } = req.params;
  const userId = req.user._id;
  
  // Update database
  await UserProgress.findOneAndUpdate(
    { userId, problemId },
    { isCompleted: true, completedAt: new Date() },
    { upsert: true }
  );
  
  // Invalidate cache (user's progress changed)
  await invalidateUserProgressCache(userId);
  
  res.json({ success: true });
}
```

**Cache Patterns:**

```typescript
// Pattern 1: Cache-Aside (Lazy Loading) ✅ Most common
async function getData(key) {
  let data = await cache.get(key);
  if (!data) {
    data = await database.find(key);
    await cache.set(key, data, TTL);
  }
  return data;
}

// Pattern 2: Write-Through (Update cache on write)
async function updateData(key, value) {
  await database.update(key, value);
  await cache.set(key, value, TTL);  // Update cache immediately
}

// Pattern 3: Write-Behind (Async cache invalidation)
async function updateData(key, value) {
  await database.update(key, value);
  await cache.del(key);  // Delete from cache, will be refreshed on next read
}
```

**Redis Configuration:**
- cache.t3.micro: $15/month (512MB) - Development
- cache.t3.small: $35/month (1.37GB) - Small scale (10k-20k users)
- cache.r6g.large: $160/month (13GB) - Production scale (50k-100k users)

**Expected Performance:**
- Cache hit rate: 85-95%
- Cache response time: 1-5ms
- Database queries reduced by: 10x-20x
- API response time: 50ms → 5ms (for cached data)

---

#### 🔴 Bottleneck #4: API Rate Limiting (Security)

**Problem:**
- Single user can send unlimited requests
- DDoS attacks can overwhelm server
- Expensive analytics queries can be abused

**Solution: Distributed Rate Limiting with Redis**

```typescript
// Backend/src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../services/cache.service';

// Global rate limiter (all API routes)
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per 15 min per IP
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for expensive operations
export const analyticsLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:analytics:',
  }),
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 10,                    // 10 requests per 5 min
  message: 'Analytics rate limit exceeded',
});

// Authentication endpoints (prevent brute force)
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts per 15 min
  message: 'Too many login attempts, please try again later',
});

// Apply in routes
app.use('/api/', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/analytics/', analyticsLimiter);
```

---

### 11.3 Complete Optimized Architecture (50k-100k Concurrent)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (100k users)                     │
│                    Browsers, Mobile Apps                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│               AWS CloudFront CDN (Edge Locations)                 │
│  - Static assets cached at 200+ edge locations globally          │
│  - HTTPS/SSL termination                                         │
│  - DDoS protection (AWS Shield)                                  │
│  ✅ Handles millions of req/sec                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    AWS S3 (Frontend Hosting)                      │
│                   React SPA (Optimized Build)                     │
│  - Code splitting (lazy loading)                                 │
│  - Service Worker (PWA offline support)                          │
│  - Gzip/Brotli compression                                       │
└────────────────────────────┬─────────────────────────────────────┘
                             │ API Requests
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│          AWS Application Load Balancer (ALB)                      │
│  - SSL/TLS termination                                           │
│  - Health checks (every 30 sec)                                  │
│  - Connection draining                                           │
│  - Sticky sessions (optional)                                    │
└─────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘
      │      │      │      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
   ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐
   │Node ││Node ││Node ││Node ││Node ││Node ││Node ││Node │ (10-50)
   │ API ││ API ││ API ││ API ││ API ││ API ││ API ││ API │
   │ #1  ││ #2  ││ #3  ││ #4  ││ #5  ││ #6  ││ #7  ││ #8  │
   └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘
      │      │      │      │      │      │      │      │
      └──────┴──────┴──────┴──────┴──────┴──────┴──────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
   ┌─────────────────────┐    ┌─────────────────────┐
   │  Redis ElastiCache  │    │    AWS SQS Queue    │
   │  (cache.r6g.large)  │    │  - Email jobs       │
   │                     │    │  - Analytics jobs   │
   │  Cache Hit: 90%     │    │  - Export jobs      │
   │  Response: 1-3ms    │    │  (Async processing) │
   └──────────┬──────────┘    └─────────────────────┘
              │
              │ (10% cache miss)
              ▼
   ┌────────────────────────────────────────────┐
   │      MongoDB Atlas M30 Cluster             │
   │                                            │
   │   ┌──────────────┐                        │
   │   │   PRIMARY    │ ◄─── All WRITES        │
   │   │ (M30: 8GB)   │                        │
   │   └───────┬──────┘                        │
   │           │ Replication                    │
   │     ┌─────┴────┐                          │
   │     ▼          ▼                          │
   │  ┌────────┐ ┌────────┐                   │
   │  │SECOND  │ │SECOND  │ ◄─── READ queries │
   │  │ARY #1  │ │ARY #2  │      (analytics)  │
   │  └────────┘ └────────┘                   │
   │                                            │
   │  Connections: 2,000-3,000                 │
   │  Storage: Auto-scaling                    │
   │  Backups: Continuous                      │
   └────────────────────────────────────────────┘
```

---

### 11.4 Performance Optimization Checklist

#### Backend Optimizations

```typescript
// ✅ 1. Enable gzip compression
import compression from 'compression';
app.use(compression());

// ✅ 2. Use lean() for read-only queries (faster)
const problems = await Problem.find().lean();  // Returns plain objects

// ✅ 3. Project only needed fields
const users = await User.find().select('name email');  // Don't load password, etc.

// ✅ 4. Batch database operations
// ❌ Bad: N+1 queries
for (const problem of problems) {
  const progress = await UserProgress.findOne({ problemId: problem._id });
}

// ✅ Good: Single query
const problemIds = problems.map(p => p._id);
const progressList = await UserProgress.find({ problemId: { $in: problemIds } });

// ✅ 5. Use aggregation pipelines for complex queries
const stats = await UserProgress.aggregate([
  { $match: { userId } },
  { $group: { _id: '$difficulty', count: { $sum: 1 } } }
]);

// ✅ 6. Add proper indexes (see Database Schema section)
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// ✅ 7. Connection pooling
mongoose.connect(MONGO_URI, { maxPoolSize: 100 });

// ✅ 8. Async operations (don't block)
// ❌ Bad: Synchronous email sending blocks response
await sendEmail(user.email, 'Welcome!');
res.json({ success: true });

// ✅ Good: Queue email, respond immediately
await emailQueue.add({ to: user.email, subject: 'Welcome!' });
res.json({ success: true });
```

#### Frontend Optimizations

```typescript
// ✅ 1. Code splitting (lazy loading)
const DsaSheetPage = React.lazy(() => import('./pages/dsa-sheet/DsaSheetPage'));
const CalendarPage = React.lazy(() => import('./pages/calendar/CalendarPage'));

// ✅ 2. React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000,
    },
  },
});

// ✅ 3. Virtualized lists (for long lists)
import { FixedSizeList } from 'react-window';
// Only render visible items

// ✅ 4. Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 300);

// ✅ 5. Optimize images
// Use WebP format, lazy loading, responsive images

// ✅ 6. Service Worker (PWA)
// Cache static assets for offline support
```

---

### 11.5 Monitoring & Observability

**AWS CloudWatch Metrics to Track:**

```
Backend Metrics:
├─ CPU Utilization (target: < 70%)
├─ Memory Usage (target: < 80%)
├─ Request Count (per minute)
├─ Response Time (p50, p95, p99)
├─ Error Rate (target: < 0.1%)
└─ Active Connections

Database Metrics:
├─ Connection Count (vs max pool size)
├─ Query Execution Time (slow queries > 100ms)
├─ Replication Lag (secondaries)
├─ Storage Usage (vs capacity)
└─ Index Hit Ratio (target: > 95%)

Cache Metrics:
├─ Cache Hit Rate (target: > 85%)
├─ Cache Miss Rate
├─ Eviction Count
├─ Memory Usage
└─ Response Time (target: < 5ms)

Business Metrics:
├─ Active Users (real-time)
├─ Problems Completed (per hour)
├─ API Requests (per endpoint)
├─ User Registrations (per day)
└─ Calendar Events Created
```

**Set Up Alarms:**

```yaml
Alarms:
  - Name: HighCPUUtilization
    Metric: CPUUtilization
    Threshold: 80%
    Action: Trigger auto-scaling
    
  - Name: HighDatabaseConnections
    Metric: DatabaseConnections
    Threshold: 2500 (out of 3000)
    Action: Send SNS notification
    
  - Name: LowCacheHitRate
    Metric: CacheHitRate
    Threshold: 70% (below target)
    Action: Investigate cache TTLs
    
  - Name: HighErrorRate
    Metric: 5XXError
    Threshold: 1%
    Action: Page on-call engineer
```

---

### 11.6 Cost Optimization Strategies

#### For Assessment (Budget-Friendly)

```
Minimal Production Setup (~$100-150/month):
├─ S3 + CloudFront: $5-10/month (low traffic)
├─ EC2 t3.small (2 instances): $30-40/month
├─ ALB: $23/month
├─ MongoDB Atlas M10: $57/month
├─ ElastiCache t3.micro: $15/month
└─ Route 53 + misc: $5/month
Total: ~$135-150/month

Handles: 10k-30k active users comfortably
```

#### For Production Scale (50k-100k Concurrent)

```
Full Production Setup (~$900-1,200/month):
├─ S3 + CloudFront (1TB transfer): $86/month
├─ EC2 Auto Scaling (10-15 instances): $300-450/month
├─ ALB: $23/month
├─ MongoDB Atlas M30: $580/month
├─ ElastiCache r6g.large: $160/month
├─ AWS SQS + SNS: $10/month
├─ CloudWatch: $50/month
└─ Route 53: $1/month
Total: ~$1,210/month

Handles: 50k-100k concurrent users
With Reserved Instances (1-year): ~$800-900/month (25% savings)
```

**Cost Saving Tips:**
1. **Use AWS Free Tier** (first 12 months):
   - EC2: 750 hours/month of t2.micro/t3.micro
   - S3: 5GB storage, 20k GET, 2k PUT
   - CloudFront: 50GB transfer

2. **Reserved Instances** (1-3 year commitment):
   - Save 30-70% on EC2 costs
   - Save 20-40% on RDS/ElastiCache

3. **Spot Instances** (for non-critical workloads):
   - Save up to 90% on EC2 costs
   - Good for background workers, batch jobs

4. **Auto-Scaling** (scale down during low traffic):
   - Reduce instances at night (if users are in one timezone)
   - Scale down on weekends

5. **MongoDB Atlas Shared Cluster** (for assessment):
   - M0: Free (512MB) - for development
   - M2: $9/month - for demo/assessment

---

### 11.7 Scalability Roadmap (Phased Approach)

#### Phase 1: Current Architecture (Assessment)
**Timeline:** Week 1-4  
**Budget:** $10-50/month (use free tiers)  
**Capacity:** 10k-50k active users

```
Infrastructure:
├─ Frontend: S3 + CloudFront
├─ Backend: Single EC2 t3.micro (or free tier)
├─ Database: MongoDB Atlas M0/M2 (free/shared)
├─ Cache: None (optional: Redis local)
└─ Load Balancer: None

Focus:
✅ Build all features
✅ Deploy successfully
✅ Create documentation
✅ Record demo video
```

#### Phase 2: Production-Ready (Post-Assessment)
**Timeline:** Week 5-6  
**Budget:** $100-200/month  
**Capacity:** 20k-50k active users

```
Upgrades:
├─ Backend: 2-3 EC2 t3.small instances
├─ Add: Application Load Balancer
├─ Database: MongoDB Atlas M10
├─ Add: ElastiCache Redis (t3.small)
└─ Add: Rate limiting

Focus:
✅ Add Redis caching
✅ Implement load balancing
✅ Add monitoring (CloudWatch)
✅ Optimize database queries
```

#### Phase 3: High-Scale (If Hired / Production Launch)
**Timeline:** Month 2-3  
**Budget:** $800-1,200/month  
**Capacity:** 50k-100k concurrent users

```
Upgrades:
├─ Backend: EC2 Auto Scaling (10-20 instances)
├─ Database: MongoDB Atlas M30 + read replicas
├─ Cache: ElastiCache r6g.large
├─ Add: AWS SQS for async jobs
├─ Add: CloudWatch dashboards
└─ Add: CI/CD pipeline (optional)

Focus:
✅ Horizontal scaling
✅ Database read replicas
✅ Advanced caching strategies
✅ Performance testing (load tests)
```

---

### 11.8 For Your System Design Document

Include this section in your `SYSTEM_DESIGN.md`:

```markdown
## Scalability Considerations

### Target: 10,000 - 50,000 Active Users

The system is designed with scalability in mind from the start:

#### 1. Stateless Backend
- JWT-based authentication (no session state)
- Allows horizontal scaling without session management
- Any instance can handle any request

#### 2. Database Optimization
- Compound indexes on frequently queried fields
- Connection pooling (100 connections per instance)
- Read replicas for analytics queries (future)

#### 3. Caching Strategy (Recommended)
- Redis cache for static data (DSA problems, chapters)
- Cache user progress summaries
- Target: 80-90% cache hit rate
- Reduces database load by 10x

#### 4. CDN for Static Assets
- CloudFront caches frontend globally
- 99.99% availability
- Sub-100ms latency worldwide

#### 5. Load Balancing (Phase 2)
- Application Load Balancer distributes traffic
- Health checks ensure instance availability
- Auto-scaling based on CPU/memory metrics

### Scaling Path: 50k-100k Concurrent Users

If the application needs to scale beyond 50k concurrent users:

**Required Upgrades:**
1. EC2 Auto Scaling Group (10-20 t3.medium instances)
2. MongoDB Atlas M30 cluster with read replicas
3. Redis ElastiCache (cache.r6g.large)
4. AWS SQS for async operations (emails, analytics)
5. Enhanced monitoring and alerting

**Estimated Cost:** $900-1,200/month

**Timeline:** 1-2 weeks implementation

### Bottleneck Mitigation

| Component | Bottleneck | Solution |
|-----------|-----------|----------|
| **Backend** | Single instance limit | Horizontal scaling + ALB |
| **Database** | Connection limit | Connection pooling + read replicas |
| **Database** | Query performance | Indexing + caching |
| **Frontend** | API response time | CDN + code splitting |
| **Overall** | No caching | Redis layer (10x improvement) |

### Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| Response Time (p95) | < 200ms | CloudWatch |
| Database Query Time | < 100ms | MongoDB Atlas |
| Cache Hit Rate | > 85% | Redis metrics |
| Error Rate | < 0.1% | Application logs |
| Uptime | > 99.9% | Health checks |

This architecture can be incrementally scaled as user base grows.
```

---

### 11.9 Final Scalability Summary

**✅ For Your Assessment (10k-50k active users):**

Deploy the **basic architecture** (S3 + EC2 + MongoDB). This is sufficient and cost-effective. In your System Design document, demonstrate that you **understand** how to scale further if needed.

**Key Points to Mention:**
1. **Current architecture handles the requirement** (10k-50k active users)
2. **Stateless design** allows horizontal scaling
3. **Database indexes** optimize query performance
4. **Optional caching layer** can be added for 10x improvement
5. **Clear path to scale** to 100k+ concurrent users (documented)

**This shows you're a Technical Team Lead who:**
- ✅ Builds pragmatically (don't over-engineer)
- ✅ Understands scalability principles
- ✅ Knows when and how to optimize
- ✅ Thinks about cost vs performance trade-offs

---

## Summary & Quick Reference

### What Needs to Be Built (Priority Order)

**Backend (Week 1):**
1. ✅ Database Models (Chapter, Topic, Problem, UserProgress, CalendarEvent)
2. ✅ DSA Sheet APIs (GET chapters, topics, problems)
3. ✅ Progress Tracking APIs (POST/DELETE progress)
4. ✅ Calendar APIs (CRUD events)
5. ✅ Seed script (populate DSA problems)

**Frontend (Week 2):**
1. ✅ DSA Sheet Page (hierarchical view, checkboxes, resources)
2. ✅ Calendar Page (dedicated, full-featured)
3. ✅ Progress Dashboard (stats, streaks, charts)
4. ✅ Routing and navigation
5. ✅ UI polish and responsive design

**Deployment (Week 3-4):**
1. ✅ Frontend to S3 + CloudFront
2. ✅ Backend to EC2
3. ✅ Testing and bug fixes
4. ✅ Documentation (System Design, Database Schema, README)
5. ✅ Video recording
6. ✅ Submission

### Key Differentiators to Stand Out
1. **Excellent UI/UX** - Smooth animations, intuitive navigation
2. **Comprehensive Progress Tracking** - Streaks, analytics, heatmaps
3. **Robust Calendar Feature** - Not just a widget, a full page with drag-drop
4. **Additional Features** - Spaced repetition, bookmarks, notes, timer
5. **Professional Deployment** - Proper SSL, CDN, optimized performance
6. **Thorough Documentation** - Clear system design, database schema
7. **High-Quality Video** - Professional, clear demonstration of features

### Time Estimate
- **Minimum (Core features only): 2-3 weeks** (working 4-6 hours/day)
- **Recommended (With bonus features): 3-4 weeks** (working 4-6 hours/day)
- **Intensive (All in): 10-14 days** (working 8-10 hours/day)

---

## Next Steps

1. **Review this entire document carefully**
2. **Ask me any questions or clarifications**
3. **I'll help you start implementing phase by phase**
4. **We'll begin with backend models and APIs**
5. **Then move to frontend components**
6. **Finally deployment and documentation**

**Are you ready to start? Which phase would you like to begin with?**

I recommend starting with:
1. **Database Models** (Backend)
2. **Seed Script** (populate sample problems)
3. **DSA Sheet APIs** (Backend)
4. **Then move to Frontend**

Let me know and I'll guide you step by step! 🚀





--------------------------------------------------------------------------------
🔴 Current Architecture: NOT Ready for 50k-100k Concurrent

The basic architecture I outlined would handle the assessment requirements (10k-50k active users) but needs significant upgrades for 50k-100k concurrent users.

---

📊 Scalability Analysis

✅ What's Already Scalable (No Changes Needed)

Frontend (S3 + CloudFront CDN)
├─ CloudFront can handle millions of requests/sec
├─ S3 has virtually unlimited scalability
├─ Static assets cached at edge locations
└─ ✅ READY FOR 100k+ concurrent users

⚠️ What Needs Upgrading

1. Backend Server - Current: Single EC2 ❌

Problem:
- Single EC2 instance (t3.micro/small): ~100-500 concurrent connections max
- Node.js single-threaded (though event-driven)
- No fault tolerance (single point of failure)

Solution for 50k-100k concurrent:
AWS Application Load Balancer (ALB)
    │
    ├─> EC2 Auto Scaling Group (10-20 instances)
    │   ├─> EC2 Instance 1 (t3.medium/large)
    │   ├─> EC2 Instance 2
    │   ├─> EC2 Instance 3
    │   └─> ... (auto-scales based on CPU/memory)
    │
    └─> Health checks + automatic instance replacement

Configuration:
// Each Node.js instance handles ~2000-5000 concurrent connections
// For 50k concurrent: Need 10-25 instances
// For 100k concurrent: Need 20-50 instances

// Enable cluster mode in Node.js
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start Express server
  app.listen(PORT);
}

Cost: ~$200-500/month (with reserved instances)

---

2. Database (MongoDB) - Current: Atlas Shared ❌

Problem:
- MongoDB Atlas Free tier: 512MB storage, shared resources
- M2 tier: Not suitable for high concurrency
- Default connection limit: 500-1000 connections
- No read replicas

Solution for 50k-100k concurrent:
MongoDB Atlas - Dedicated Cluster
    │
    ├─> Primary Node (M30 or M40)
    ├─> Secondary Node 1 (Read replica)
    ├─> Secondary Node 2 (Read replica)
    │
    └─> Sharding (if database grows beyond 100GB)

Required Tier:
- M30 Cluster: 8GB RAM, 40GB storage (~$580/month)
- M40 Cluster: 16GB RAM, 80GB storage (~$1,160/month)
- Connection limit: 1,500-3,000 connections

Connection Pooling Configuration:
mongoose.connect(MONGO_URI, {
  maxPoolSize: 100,    // Per backend instance
  minPoolSize: 20,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// With 20 backend instances × 100 pool size = 2,000 connections
// Well within M30/M40 limits

Read/Write Splitting:
// Read from secondaries for analytics, stats
const stats = await UserProgress.find()
  .read('secondaryPreferred')  // Offload reads from primary
  .where('userId').equals(userId);

// Writes always go to primary
const progress = await UserProgress.create({ ... });

Cost: ~$580-1,200/month

---

3. Caching Layer - Current: None ❌ CRITICAL!

Problem:
- Every request hits database
- Repeated queries for same data (DSA problems, chapters, topics)
- Database becomes bottleneck

Solution: Redis Cache (AWS ElastiCache)
Client Request
    │
    ├─> Check Redis Cache (1-5ms latency)
    │   ├─> Cache HIT: Return immediately ✅
    │   └─> Cache MISS: Query MongoDB ↓
    │
    └─> Query MongoDB (20-100ms latency)
        └─> Store in Redis for 5-10 minutes

What to Cache:
// Cache static/semi-static data
- All DSA problems (rarely change)
- Chapters and topics (rarely change)
- User progress summary (invalidate on update)
- Leaderboards (refresh every 5 mins)
- Daily challenge

Implementation:
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Get problems with caching
async function getProblems(chapterId) {
  const cacheKey = `problems:chapter:${chapterId}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Query database
  const problems = await Problem.find({ chapterId });

  // Store in cache (10 minutes TTL)
  await redis.setex(cacheKey, 600, JSON.stringify(problems));

  return problems;
}

Redis Configuration:
- AWS ElastiCache: cache.t3.micro ($15/month) to cache.r6g.large ($160/month)
- For 50k-100k concurrent: cache.r6g.large (13.07 GB RAM)

Cache Hit Rate Target: 80-90%
- 90% cache hit = 90% of requests never touch database
- Database load reduced by 10x

Cost: ~$50-200/month

---

4. Database Indexes - Current: Basic ✅ → Optimize

Already have these (good!):
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
calendarEventSchema.index({ userId: 1, scheduledDate: 1 });

Additional Compound Indexes for Scale:
// For common filtered queries
problemSchema.index({ difficulty: 1, chapterId: 1 });
problemSchema.index({ topicId: 1, order: 1 });
userProgressSchema.index({ userId: 1, completedAt: -1 }); // Recent activity

// For analytics queries (use secondaries)
userProgressSchema.index({ completedAt: 1 }); // Time-based queries
problemSchema.index({ tags: 1 }); // Tag search

Query Optimization:
// ❌ BAD: Loads all fields, slow
const problems = await Problem.find({ chapterId });

// ✅ GOOD: Only load needed fields
const problems = await Problem
  .find({ chapterId })
  .select('title difficulty order resources')
  .lean();  // Returns plain JS objects (faster)

---

5. API Rate Limiting - Current: None ❌

Problem:
- Single user can overwhelm server with requests
- No protection against abuse/DDoS

Solution:
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Create rate limiter with Redis store
const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later',
});

// Apply to all routes
app.use('/api/', limiter);

// Stricter limits for expensive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use('/api/v1/analytics/', strictLimiter);

---

6. Async Operations & Message Queue - Current: None

For heavy operations, use async processing:
// Example: Sending email reminders (don't block API response)

// ❌ BAD: Synchronous (blocks response)
app.post('/api/calendar/events', async (req, res) => {
  const event = await CalendarEvent.create(req.body);
  await sendEmailReminder(event);  // Blocks response!
  res.json(event);
});

// ✅ GOOD: Async with SQS
app.post('/api/calendar/events', async (req, res) => {
  const event = await CalendarEvent.create(req.body);

  // Send to queue (returns immediately)
  await sqs.sendMessage({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ eventId: event._id }),
  });

  res.json(event);  // Respond immediately
});

// Separate worker processes messages from queue
// Worker sends emails in background

Use Cases:
- Email notifications
- Analytics calculations
- Leaderboard updates
- Data exports

---

✅ Upgraded Architecture for 50k-100k Concurrent Users

┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (50k-100k users)            │
│                         Browsers/Mobile                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  AWS CloudFront CDN                          │
│              (Static Assets Cached at Edge)                  │
│              ✅ Handles millions of req/sec                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               AWS S3 (Frontend Static Hosting)               │
│                  React SPA (optimized)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ API Requests (HTTPS)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          AWS Application Load Balancer (ALB)                 │
│              - Health checks                                 │
│              - SSL termination                               │
│              - Path-based routing                            │
└─────┬───────────┬───────────┬───────────┬───────────────────┘
      │           │           │           │
      ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Node.js │ │ Node.js │ │ Node.js │ │ Node.js │  ... (10-50 instances)
│   API   │ │   API   │ │   API   │ │   API   │
│(t3.med) │ │(t3.med) │ │(t3.med) │ │(t3.med) │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴───────────┴───────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────────┐    ┌──────────────────────┐
│ Redis Cache     │    │ AWS SQS (Queue)      │
│ (ElastiCache)   │    │ - Email jobs         │
│ - DSA problems  │    │ - Analytics jobs     │
│ - User progress │    │ - Export jobs        │
│ - Leaderboards  │    └──────────────────────┘
│ ✅ 80-90% cache │
│    hit rate     │
└────┬────────────┘
     │
     │ (Cache miss)
     ▼
┌─────────────────────────────────────────────┐
│         MongoDB Atlas M30/M40 Cluster       │
│                                             │
│  ┌─────────────┐                           │
│  │  PRIMARY    │ ◄──── Writes              │
│  │   (M30)     │                           │
│  └─────┬───────┘                           │
│        │                                    │
│        ├─► SECONDARY 1 (Read replica)      │
│        └─► SECONDARY 2 (Read replica)      │
│                                             │
│  Connection Pooling: 2,000 connections     │
│  Auto-scaling storage                      │
│  Point-in-time recovery                    │
└─────────────────────────────────────────────┘

---

📈 Performance Estimates

With Upgraded Architecture:

┌──────────────────────┬──────────────────────┬───────────────────┐
│        Metric        │ Without Optimization │ With Optimization │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Concurrent Users     │ 500-1,000            │ 50,000-100,000    │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Requests/sec         │ 100-200              │ 5,000-10,000      │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Response Time (p95)  │ 500-1000ms           │ 50-200ms          │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Database Connections │ 50-100               │ 2,000-3,000       │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Cache Hit Rate       │ 0%                   │ 85-95%            │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Database Load        │ 100%                 │ 10-15%            │
├──────────────────────┼──────────────────────┼───────────────────┤
│ Monthly Cost         │ $10-20               │ $800-1,500        │
└──────────────────────┴──────────────────────┴───────────────────┘

---

💰 Cost Breakdown for 50k-100k Concurrent

┌───────────────────────────┬──────────────────────┬───────────────┐
│          Service          │    Configuration     │ Monthly Cost  │
├───────────────────────────┼──────────────────────┼───────────────┤
│ CloudFront                │ 1TB transfer         │ $85           │
├───────────────────────────┼──────────────────────┼───────────────┤
│ S3                        │ 50GB storage         │ $1            │
├───────────────────────────┼──────────────────────┼───────────────┤
│ EC2 Auto Scaling          │ 15× t3.medium        │ $450          │
├───────────────────────────┼──────────────────────┼───────────────┤
│ Application Load Balancer │ 1 ALB                │ $23           │
├───────────────────────────┼──────────────────────┼───────────────┤
│ MongoDB Atlas             │ M30 cluster          │ $580          │
├───────────────────────────┼──────────────────────┼───────────────┤
│ ElastiCache Redis         │ cache.r6g.large      │ $160          │
├───────────────────────────┼──────────────────────┼───────────────┤
│ AWS SQS                   │ Millions of requests │ $10           │
├───────────────────────────┼──────────────────────┼───────────────┤
│ CloudWatch                │ Monitoring/Logs      │ $50           │
├───────────────────────────┼──────────────────────┼───────────────┤
│ Route 53                  │ DNS                  │ $1            │
├───────────────────────────┼──────────────────────┼───────────────┤
│ Total                     │                      │ ~$1,360/month │
└───────────────────────────┴──────────────────────┴───────────────┘

With reserved instances (1-year): ~$900-1,000/month

---

🎯 For Your Assessment (10k-50k Active Users)

Good news: The original architecture is sufficient with minor tweaks:

Minimal Upgrades Needed:

✅ Keep: S3 + CloudFront (frontend)
✅ Keep: Basic EC2 setup (1-2 instances + ALB)
✅ Add: Redis caching (ElastiCache t3.small - $35/month)
✅ Upgrade: MongoDB Atlas M10 ($57/month) or M20 ($150/month)
✅ Add: Basic rate limiting
✅ Add: Connection pooling optimization

Total Cost: ~$100-200/month
Can handle: 10k-50k active users comfortably

For the Assessment:

1. Deploy the basic architecture I outlined (S3 + EC2 + MongoDB Atlas)
2. Add Redis caching (critical for performance demo)
3. Add rate limiting (shows you understand security)
4. Use MongoDB Atlas M10/M20 (not free tier - more professional)
5. In your System Design doc, explain how to scale to 100k+ (show you understand)

---

📝 System Design Doc: Add "Scalability Path" Section

## Future Scalability (50k-100k Concurrent Users)

### Phase 1: Current (10k-50k active users)
- Single/dual EC2 instances with ALB
- MongoDB Atlas M10/M20
- Redis caching layer
- Cost: ~$150/month

### Phase 2: Growth (50k-100k concurrent users)
Required upgrades:
1. EC2 Auto Scaling Group (10-20 instances)
2. MongoDB Atlas M30 cluster with read replicas
3. Redis ElastiCache (cache.r6g.large)
4. SQS for async operations
5. Enhanced monitoring (CloudWatch dashboards)

Cost: ~$1,000/month
Timeline: 1-2 weeks implementation

### Bottleneck Mitigation:
- Database: Sharding + read replicas
- API: Horizontal scaling with ALB
- Caching: 90% hit rate target
- Async: SQS for heavy operations

---

✅ Final Answer: Can It Scale?

For Assessment (10k-50k active): ✅ YES, easily

For 50k-100k concurrent: ✅ YES, with upgrades
- Add Redis caching (critical)
- Auto-scaling EC2 instances
- MongoDB Atlas M30+
- Cost: ~$1,000/month

For 500k+ concurrent: ⚠️ Need microservices architecture
- Separate services (Auth, DSA, Progress, Calendar)
- Kubernetes/ECS for orchestration
- Multiple Redis clusters
- MongoDB sharding
- CDN optimization
- Cost: $5,000-10,000/month

---