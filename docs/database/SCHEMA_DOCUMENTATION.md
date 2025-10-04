# Database Schema Documentation 💾

Complete documentation of the Prompt Master database schema, powered by Supabase (PostgreSQL).

---

## 📋 Overview

**Database:** PostgreSQL (via Supabase)  
**Total Tables:** 5  
**Authentication:** Supabase Auth  
**Security:** Row-Level Security (RLS) enabled

---

## 📊 Tables

### 1. users (Managed by Supabase Auth)

**Description:** User accounts and authentication data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | User unique identifier |
| email | text | UNIQUE, NOT NULL | User email address |
| created_at | timestamptz | NOT NULL | Account creation timestamp |
| email_confirmed_at | timestamptz | | Email confirmation timestamp |
| last_sign_in_at | timestamptz | | Last login timestamp |

**Managed by:** Supabase Auth system  
**RLS:** Enabled by default

---

### 2. buckets

**Description:** Prompt organization folders created by users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Bucket unique identifier |
| name | text | NOT NULL | Bucket display name |
| category | text | NOT NULL | Category (Content Creation, Marketing, etc.) |
| user_id | uuid | FOREIGN KEY → auth.users(id) | Owner user ID |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_buckets_user_id` on `user_id`
- `idx_buckets_category` on `category`

**RLS Policies:**
- Users can only read their own buckets
- Users can only insert buckets with their user_id
- Users can only update their own buckets
- Users can only delete their own buckets

**SQL:**
\`\`\`sql
CREATE TABLE buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buckets_user_id ON buckets(user_id);
CREATE INDEX idx_buckets_category ON buckets(category);

ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own buckets" ON buckets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own buckets" ON buckets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buckets" ON buckets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own buckets" ON buckets
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

---

### 3. prompts

**Description:** Saved prompt pairs (original + super prompt)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Prompt unique identifier |
| title | text | NOT NULL | User-provided title |
| original_prompt | text | NOT NULL | Original user prompt |
| super_prompt | text | NOT NULL | Generated optimized prompt |
| category | text | NOT NULL | Main category |
| subcategory | text | | Optional subcategory |
| bucket_id | uuid | FOREIGN KEY → buckets(id) | Parent bucket |
| user_id | uuid | FOREIGN KEY → auth.users(id) | Owner user ID |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_prompts_user_id` on `user_id`
- `idx_prompts_bucket_id` on `bucket_id`
- `idx_prompts_category` on `category`
- `idx_prompts_created_at` on `created_at`

**RLS Policies:**
- Users can only read their own prompts
- Users can only insert prompts with their user_id
- Users can only update their own prompts
- Users can only delete their own prompts

**Cascade Behavior:**
- When a bucket is deleted, all its prompts are deleted
- When a user is deleted, all their prompts are deleted

**SQL:**
\`\`\`sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  super_prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_bucket_id ON prompts(bucket_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_created_at ON prompts(created_at);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own prompts" ON prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

---

### 4. categories

**Description:** Predefined categories for organization (Reference table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Category ID |
| name | text | UNIQUE, NOT NULL | Category name |
| color | text | NOT NULL | Badge color (Tailwind class) |
| description | text | | Category description |

**Predefined Categories (13):**
1. Content Creation (#9333ea - purple)
2. Marketing (#db2777 - pink)
3. Code (#10b981 - green)
4. Business (#f59e0b - amber)
5. Creative (#ec4899 - pink)
6. Education (#6366f1 - indigo)
7. Research (#3b82f6 - blue)
8. Data Analysis (#8b5cf6 - violet)
9. Productivity (#14b8a6 - teal)
10. Social Media (#f43f5e - rose)
11. Email (#06b6d4 - cyan)
12. Technical (#6366f1 - indigo)
13. General (#64748b - slate)

**RLS:** Not enabled (read-only reference data)

---

### 5. subcategories

**Description:** Predefined subcategories for granular organization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Subcategory ID |
| name | text | NOT NULL | Subcategory name |
| category | text | NOT NULL | Parent category |

**Example Subcategories:**

**Content Creation:**
- Blog Posts, Articles, Social Media, Scripts, Product Descriptions

**Code:**
- Web Development, Data Science, Algorithms, Debugging, Documentation

**Business:**
- Strategy, Analysis, Planning, Presentations, Reports

**And 40+ more across all categories**

**RLS:** Not enabled (read-only reference data)

---

## 🔗 Relationships

### Entity Relationship Diagram

\`\`\`
┌─────────────┐
│    users    │
│  (Supabase) │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   buckets   │   │   prompts   │
└──────┬──────┘   └─────────────┘
       │                 ▲
       └─────────────────┘
           bucket_id

┌─────────────┐      ┌──────────────────┐
│ categories  │      │ subcategories    │
│ (reference) │      │   (reference)    │
└─────────────┘      └──────────────────┘
\`\`\`

### Relationship Details

1. **users → buckets:** One-to-Many
   - One user can have multiple buckets
   - CASCADE DELETE: Delete user → delete all buckets

2. **buckets → prompts:** One-to-Many
   - One bucket can contain multiple prompts
   - CASCADE DELETE: Delete bucket → delete all prompts

3. **users → prompts:** One-to-Many
   - One user can have multiple prompts
   - CASCADE DELETE: Delete user → delete all prompts

---

## 🔐 Row-Level Security (RLS)

### Implementation

All user-facing tables have RLS enabled with policies ensuring:
- Users can only access their own data
- No cross-user data leakage
- Automatic user_id filtering

### Policy Pattern

\`\`\`sql
-- Read policy
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Write policies
CREATE POLICY "policy_name" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "policy_name" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "policy_name" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

---

## 🗃️ Indexes

### Purpose
Indexes improve query performance for common access patterns.

### Implemented Indexes

\`\`\`sql
-- Buckets
CREATE INDEX idx_buckets_user_id ON buckets(user_id);
CREATE INDEX idx_buckets_category ON buckets(category);

-- Prompts
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_bucket_id ON prompts(bucket_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_created_at ON prompts(created_at);
\`\`\`

### Performance Impact
- User data queries: O(log n) instead of O(n)
- Category filtering: Significantly faster
- Timestamp sorting: Optimized for recent-first ordering

---

## 📝 Common Queries

### Get User's Buckets with Prompt Count

\`\`\`sql
SELECT 
  b.*,
  COUNT(p.id) as prompt_count
FROM buckets b
LEFT JOIN prompts p ON p.bucket_id = b.id
WHERE b.user_id = 'user-uuid'
GROUP BY b.id
ORDER BY b.created_at DESC;
\`\`\`

### Get Prompts in a Bucket

\`\`\`sql
SELECT *
FROM prompts
WHERE bucket_id = 'bucket-uuid'
  AND user_id = 'user-uuid'
ORDER BY created_at DESC;
\`\`\`

### Search Prompts by Category

\`\`\`sql
SELECT *
FROM prompts
WHERE user_id = 'user-uuid'
  AND category = 'Content Creation'
ORDER BY created_at DESC;
\`\`\`

### Get Recent Prompts

\`\`\`sql
SELECT *
FROM prompts
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 10;
\`\`\`

---

## 🔄 Migration History

### Initial Setup
**File:** `SUPABASE_SETUP.sql`  
**Description:** Creates users table extensions and initial schema

### Bucket System
**File:** `BUCKET_MIGRATION.sql`  
**Description:** Adds buckets table and RLS policies

### Analysis Modes
**File:** `ANALYSIS_MODES_MIGRATION.sql`  
**Description:** Adds mode tracking (if needed)

### Manual Mode
**File:** `MANUAL_MODE_MIGRATION.sql`  
**Description:** Manual mode configuration

---

## 🛠️ Maintenance

### Backup Strategy
- **Automated:** Supabase provides daily backups
- **Point-in-Time Recovery:** Available on Pro plan
- **Export:** Use `pg_dump` for manual backups

### Monitoring
- **Supabase Dashboard:** Real-time query performance
- **Logs:** Available in Supabase logs section
- **Alerts:** Set up for high query times

### Optimization Tips
1. Use indexes for frequently queried columns
2. Avoid SELECT * when possible
3. Use pagination for large result sets
4. Monitor slow queries in dashboard
5. Consider materialized views for complex aggregations

---

## 🔒 Security Best Practices

### Implemented
✅ Row-Level Security enabled on all tables  
✅ Foreign key constraints for data integrity  
✅ CASCADE DELETE for cleanup  
✅ User ID validation in RLS policies  
✅ Prepared statements (via Supabase client)

### Recommendations
- Regularly audit RLS policies
- Monitor for unusual query patterns
- Keep Supabase client libraries updated
- Use environment variables for connection strings
- Enable 2FA on Supabase account

---

## 📊 Database Statistics

### Current Schema
- **Tables:** 5 (3 user-facing, 2 reference)
- **Indexes:** 6
- **RLS Policies:** 12 (3 tables × 4 operations)
- **Foreign Keys:** 3
- **Unique Constraints:** 2

### Expected Data Volume (per user)
- **Buckets:** 5-20
- **Prompts:** 50-500
- **Storage per Prompt:** ~2-5 KB
- **Total per User:** ~100 KB - 2.5 MB

---

## 🔗 Related Documentation

- [API Reference](../api/API_REFERENCE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)

---

**Last Updated:** October 4, 2025  
**Schema Version:** 1.0  
**Database:** Supabase PostgreSQL

*For SQL migration files, see files in this directory.*

