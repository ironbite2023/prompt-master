# API Reference 🔌

Complete reference for all API endpoints in Prompt Master. All API routes are serverless functions powered by Next.js App Router.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Prompt Analysis](#prompt-analysis)
4. [Bucket Management](#bucket-management)
5. [Prompt Management](#prompt-management)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## 🌐 Overview

### Base URL
\`\`\`
Development: http://localhost:3000/api
Production: https://your-domain.com/api
\`\`\`

### Response Format
All endpoints return JSON with consistent structure:

**Success Response:**
\`\`\`json
{
  "data": { ... },
  "status": "success"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Error message",
  "status": "error"
}
\`\`\`

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication

All protected endpoints require authentication via Supabase session cookies. The session is managed automatically by the Supabase client.

### Authentication Flow
1. User logs in via `/auth/callback`
2. Supabase sets session cookie
3. API routes validate session
4. User ID is extracted for queries

---

## 🔍 Prompt Analysis

### 1. Analyze Prompt (Normal/Extensive Mode)

**Endpoint:** `POST /api/analyze`

**Description:** Analyzes the initial prompt and generates clarifying questions based on the selected mode.

**Request Body:**
\`\`\`json
{
  "prompt": "Write a blog post about AI",
  "mode": "normal"
}
\`\`\`

**Parameters:**
- `prompt` (string, required) - The initial user prompt
- `mode` (string, required) - Analysis mode: "normal" or "extensive"

**Success Response (200):**
\`\`\`json
{
  "analysis": [
    {
      "question": "Who is your target audience for this blog post?",
      "suggestion": "e.g., Tech professionals, Students, General public"
    },
    {
      "question": "What tone should the blog post have?",
      "suggestion": "e.g., Professional, Casual, Educational"
    }
  ]
}
\`\`\`

**Error Responses:**
- `400` - Missing or invalid parameters
- `500` - Gemini API error

**Example Usage:**
\`\`\`typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Write a blog post about AI",
    mode: "normal"
  })
});

const { analysis } = await response.json();
\`\`\`

---

### 2. Generate Super Prompt

**Endpoint:** `POST /api/generate`

**Description:** Generates the optimized super prompt from the original prompt and user answers.

**Request Body:**
\`\`\`json
{
  "prompt": "Write a blog post about AI",
  "answers": {
    "Who is your target audience?": "Tech professionals",
    "What tone should it have?": "Professional but approachable"
  }
}
\`\`\`

**Parameters:**
- `prompt` (string, required) - Original prompt
- `answers` (object, required) - Question-answer pairs

**Success Response (200):**
\`\`\`json
{
  "superPrompt": "You are an expert tech writer...[complete optimized prompt]"
}
\`\`\`

**Error Responses:**
- `400` - Missing or invalid parameters
- `500` - Gemini API error

---

### 3. AI Mode (Analyze + Generate)

**Endpoint:** `POST /api/ai-analyze-generate`

**Description:** Fully automated analysis and generation. AI analyzes prompt, auto-fills answers, and generates super prompt in one step.

**Request Body:**
\`\`\`json
{
  "prompt": "Write a blog post about AI"
}
\`\`\`

**Parameters:**
- `prompt` (string, required) - The initial user prompt

**Success Response (200):**
\`\`\`json
{
  "superPrompt": "You are an expert tech writer...[complete optimized prompt]",
  "analysis": [
    {
      "question": "Who is your target audience?",
      "answer": "Tech professionals and AI enthusiasts",
      "suggestion": "Based on the prompt context"
    }
  ]
}
\`\`\`

**Error Responses:**
- `400` - Missing prompt
- `500` - Gemini API error

**Processing Time:** ~15-20 seconds

---

## 🗂️ Bucket Management

### 1. Get All Buckets

**Endpoint:** `GET /api/buckets`

**Description:** Retrieves all buckets for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- None

**Success Response (200):**
\`\`\`json
{
  "buckets": [
    {
      "id": "uuid",
      "name": "My Marketing Prompts",
      "category": "Marketing",
      "user_id": "uuid",
      "created_at": "2024-10-01T12:00:00Z"
    }
  ]
}
\`\`\`

**Error Responses:**
- `401` - Not authenticated
- `500` - Database error

---

### 2. Create Bucket

**Endpoint:** `POST /api/buckets`

**Description:** Creates a new bucket for organizing prompts.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "name": "Content Creation Ideas",
  "category": "Content Creation"
}
\`\`\`

**Parameters:**
- `name` (string, required) - Bucket name
- `category` (string, required) - Category from predefined list

**Success Response (201):**
\`\`\`json
{
  "bucket": {
    "id": "uuid",
    "name": "Content Creation Ideas",
    "category": "Content Creation",
    "user_id": "uuid",
    "created_at": "2024-10-01T12:00:00Z"
  }
}
\`\`\`

**Error Responses:**
- `400` - Missing or invalid parameters
- `401` - Not authenticated
- `500` - Database error

---

### 3. Update Bucket

**Endpoint:** `PATCH /api/buckets/:id`

**Description:** Updates an existing bucket.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "name": "Updated Bucket Name",
  "category": "Business"
}
\`\`\`

**Parameters:**
- `name` (string, optional) - New bucket name
- `category` (string, optional) - New category

**Success Response (200):**
\`\`\`json
{
  "bucket": {
    "id": "uuid",
    "name": "Updated Bucket Name",
    "category": "Business",
    "user_id": "uuid",
    "created_at": "2024-10-01T12:00:00Z"
  }
}
\`\`\`

**Error Responses:**
- `400` - Invalid parameters
- `401` - Not authenticated
- `403` - Not authorized to update this bucket
- `404` - Bucket not found
- `500` - Database error

---

### 4. Delete Bucket

**Endpoint:** `DELETE /api/buckets/:id`

**Description:** Deletes a bucket and all its prompts.

**Authentication:** Required

**Success Response (200):**
\`\`\`json
{
  "message": "Bucket deleted successfully"
}
\`\`\`

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to delete this bucket
- `404` - Bucket not found
- `500` - Database error

---

## 📝 Prompt Management

### 1. Get All Prompts

**Endpoint:** `GET /api/prompts`

**Description:** Retrieves all saved prompts for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `bucket_id` (string, optional) - Filter by bucket ID

**Success Response (200):**
\`\`\`json
{
  "prompts": [
    {
      "id": "uuid",
      "title": "Blog Post About AI",
      "original_prompt": "Write a blog post...",
      "super_prompt": "You are an expert...",
      "category": "Content Creation",
      "subcategory": "Blog Posts",
      "bucket_id": "uuid",
      "user_id": "uuid",
      "created_at": "2024-10-01T12:00:00Z"
    }
  ]
}
\`\`\`

**Error Responses:**
- `401` - Not authenticated
- `500` - Database error

---

### 2. Create Prompt (Quick Save)

**Endpoint:** `POST /api/prompts`

**Description:** Saves a new prompt to a bucket.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "title": "Marketing Email Template",
  "original_prompt": "Create a marketing email",
  "super_prompt": "You are an expert email marketer...",
  "bucket_id": "uuid",
  "category": "Marketing",
  "subcategory": "Email"
}
\`\`\`

**Parameters:**
- `title` (string, required) - Prompt title
- `original_prompt` (string, required) - Original user prompt
- `super_prompt` (string, required) - Generated super prompt
- `bucket_id` (string, required) - Bucket to save to
- `category` (string, required) - Category
- `subcategory` (string, optional) - Subcategory

**Success Response (201):**
\`\`\`json
{
  "prompt": {
    "id": "uuid",
    "title": "Marketing Email Template",
    "original_prompt": "Create a marketing email",
    "super_prompt": "You are an expert email marketer...",
    "bucket_id": "uuid",
    "category": "Marketing",
    "subcategory": "Email",
    "user_id": "uuid",
    "created_at": "2024-10-01T12:00:00Z"
  }
}
\`\`\`

**Error Responses:**
- `400` - Missing or invalid parameters
- `401` - Not authenticated
- `500` - Database error

---

### 3. Delete Prompt

**Endpoint:** `DELETE /api/prompts/:id`

**Description:** Deletes a saved prompt.

**Authentication:** Required

**Success Response (200):**
\`\`\`json
{
  "message": "Prompt deleted successfully"
}
\`\`\`

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized to delete this prompt
- `404` - Prompt not found
- `500` - Database error

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this structure:

\`\`\`json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
\`\`\`

### Common Errors

**400 Bad Request**
\`\`\`json
{
  "error": "Missing required field: prompt"
}
\`\`\`

**401 Unauthorized**
\`\`\`json
{
  "error": "Authentication required"
}
\`\`\`

**404 Not Found**
\`\`\`json
{
  "error": "Bucket not found"
}
\`\`\`

**500 Internal Server Error**
\`\`\`json
{
  "error": "An error occurred while processing your request"
}
\`\`\`

---

## 🚦 Rate Limiting

### Current Implementation
Currently, no rate limiting is implemented. 

### Recommended for Production
- **Analysis Endpoints:** 10 requests per minute per user
- **Bucket/Prompt Operations:** 30 requests per minute per user
- **Authentication:** 5 requests per minute per IP

### Implementation Suggestion
Use Vercel Edge Config or Upstash Redis for rate limiting:

\`\`\`typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
\`\`\`

---

## 📊 API Usage Examples

### Complete Flow Example

\`\`\`typescript
// 1. Analyze prompt
const analysisResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Write a technical tutorial",
    mode: "normal"
  })
});
const { analysis } = await analysisResponse.json();

// 2. User fills answers
const answers = {
  "Who is your target audience?": "Developers",
  "What level of detail?": "Intermediate"
};

// 3. Generate super prompt
const generateResponse = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Write a technical tutorial",
    answers
  })
});
const { superPrompt } = await generateResponse.json();

// 4. Save to bucket
const saveResponse = await fetch('/api/prompts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Tech Tutorial Prompt",
    original_prompt: "Write a technical tutorial",
    super_prompt: superPrompt,
    bucket_id: "bucket-uuid",
    category: "Education",
    subcategory: "Technical"
  })
});
\`\`\`

---

## 🔒 Security Considerations

1. **API Keys:** Never expose Gemini API key in client-side code
2. **Authentication:** Always verify user authentication in protected endpoints
3. **Input Validation:** Sanitize and validate all user inputs
4. **Row-Level Security:** Supabase RLS ensures users can only access their data
5. **HTTPS:** Always use HTTPS in production

---

## 📚 Related Documentation

- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
- [AI Integration](./AI_INTEGRATION.md)
- [Database Schema](../database/SCHEMA_DOCUMENTATION.md)
- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)

---

**Last Updated:** October 4, 2025  
**API Version:** 1.0

*For AI integration details, see [AI Integration Documentation](./AI_INTEGRATION.md)*

