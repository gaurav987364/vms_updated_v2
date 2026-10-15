# Problems API Module

## Overview
This module handles DSA problems from Codeforces API. It provides endpoints to sync, fetch, filter, and get statistics about problems.

## Architecture
```
problems/
├── problemModel.ts       # MongoDB schema for problems
├── problemController.ts  # Request handlers
├── problemService.ts     # Business logic + Codeforces API integration
├── problemRoutes.ts      # Route definitions
├── problemValidators.ts  # Zod validation schemas
└── README.md            # This file
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1/problems
```

---

### 1. Sync Problems from Codeforces

**Endpoint:** `POST /sync`

**Description:** Fetches all problems from Codeforces API and stores them in MongoDB.

**Request Body:**
```json
{
  "force": false  // Optional: Set to true to re-sync existing data
}
```

**Response:**
```json
{
  "message": "Problems synced successfully",
  "data": {
    "count": 7523,
    "synced": true
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/problems/sync \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

---

### 2. Get Problems (with filters)

**Endpoint:** `GET /`

**Description:** Get problems with pagination and filters.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 50) - Problems per page
- `difficulty` - Filter by difficulty: "Easy" | "Medium" | "Hard"
- `tags` - Comma-separated tags (e.g., "Array,Dynamic Programming")
- `search` - Search in title and tags
- `platform` - Filter by platform: "codeforces" | "leetcode" | "custom"
- `minRating` - Minimum Codeforces rating
- `maxRating` - Maximum Codeforces rating

**Response:**
```json
{
  "message": "Problems fetched successfully",
  "data": [
    {
      "_id": "...",
      "problemId": "CF-1234A",
      "platform": "codeforces",
      "title": "Two Sum",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "link": "https://codeforces.com/problemset/problem/1234/A",
      "rating": 800,
      "totalSubmissions": 15000,
      "totalAccepted": 12000,
      "acceptance": 80,
      "contestId": 1234,
      "index": "A",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 7523,
    "totalPages": 151,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Examples:**
```bash
# Get first 20 easy problems
GET /problems?difficulty=Easy&limit=20

# Get problems with Array and Dynamic Programming tags
GET /problems?tags=Array,Dynamic%20Programming

# Search for "binary search" problems
GET /problems?search=binary%20search

# Get problems with rating between 1000-1500
GET /problems?minRating=1000&maxRating=1500

# Paginate through results
GET /problems?page=2&limit=50
```

---

### 3. Get Topics/Tags

**Endpoint:** `GET /topics`

**Description:** Get all unique topics/tags with problem counts.

**Query Parameters:**
- `platform` (optional) - Filter by platform: "codeforces" | "leetcode" | "custom"

**Response:**
```json
{
  "message": "Topics fetched successfully",
  "data": [
    { "name": "Array", "count": 345 },
    { "name": "String", "count": 149 },
    { "name": "Hash Table", "count": 141 },
    { "name": "Dynamic Programming", "count": 89 }
  ],
  "count": 63
}
```

**Example:**
```bash
curl http://localhost:5000/api/v1/problems/topics
```

---

### 4. Get Problem Statistics

**Endpoint:** `GET /stats`

**Description:** Get overall problem statistics.

**Response:**
```json
{
  "message": "Problem statistics fetched successfully",
  "data": {
    "total": 7523,
    "byDifficulty": [
      { "_id": "Easy", "count": 2241 },
      { "_id": "Medium", "count": 3500 },
      { "_id": "Hard", "count": 1782 }
    ],
    "byPlatform": [
      { "_id": "codeforces", "count": 7523 }
    ]
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/v1/problems/stats
```

---

## Setup Instructions

1. **Ensure MongoDB is running**
2. **Start the backend server:**
   ```bash
   cd Backend
   npm run server
   ```

3. **Sync problems from Codeforces:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/problems/sync \
     -H "Content-Type: application/json" \
     -d '{"force": false}'
   ```
   This will fetch ~7000+ problems from Codeforces and store them in MongoDB.

4. **Test the endpoints:**
   - Get topics: `GET /problems/topics`
   - Get problems: `GET /problems?limit=10`
   - Get stats: `GET /problems/stats`

---

## Data Model

### Problem Schema
```typescript
{
  problemId: string;      // Unique: "CF-1234A"
  platform: string;       // "codeforces" | "leetcode" | "custom"
  title: string;          // Problem title
  description?: string;   // Problem description (optional)
  difficulty: string;     // "Easy" | "Medium" | "Hard"
  tags: string[];        // ["Array", "DP", etc.]
  link: string;          // Direct link to problem
  acceptance?: number;    // Acceptance rate %
  totalSubmissions: number;
  totalAccepted: number;
  rating?: number;       // Codeforces rating
  contestId?: number;
  index?: string;        // Problem index (A, B, C, etc.)
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Rating to Difficulty Mapping

Codeforces problems are mapped to difficulty levels based on their rating:

- **Easy**: rating < 1200
- **Medium**: 1200 ≤ rating < 1800
- **Hard**: rating ≥ 1800

---

## Notes

- **First Sync**: Takes 10-30 seconds to sync all problems
- **Indexes**: Created on `tags`, `difficulty`, `platform`, `rating` for efficient queries
- **Rate Limiting**: Codeforces API has rate limits, avoid frequent re-syncs
- **Authentication**: `/sync` endpoint should be protected with admin auth (TODO)
