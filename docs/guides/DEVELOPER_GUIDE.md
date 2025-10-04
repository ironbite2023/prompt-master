# Developer Guide 👨‍💻

Complete guide for developers working on Prompt Master. This guide covers setup, development workflow, architecture, and best practices.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Architecture Overview](#architecture-overview)
6. [Component Development](#component-development)
7. [API Development](#api-development)
8. [Database Management](#database-management)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## 🔧 Prerequisites

Before you begin, ensure you have:

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Required Accounts
- **Google Gemini API Key** ([Get one](https://aistudio.google.com/app/apikey))
- **Supabase Account** ([Sign up](https://supabase.com))
- **GitHub Account** (for version control)

### Recommended Tools
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - GitLens

---

## 🚀 Initial Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd prompt-master
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

This installs all required packages:
- Next.js 15
- React 19
- TypeScript 5
- TailwindCSS 4
- Supabase client
- Google Generative AI SDK
- Lucide React icons

### 3. Set Up Environment Variables

Create `.env.local` in the project root:

\`\`\`bash
# Copy the example file (if available)
cp .env.example .env.local
\`\`\`

Add the following environment variables:

\`\`\`env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

**Where to find these:**
- **GEMINI_API_KEY:** [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase URL & Key:** Your Supabase project settings → API

⚠️ **Important:** Never commit `.env.local` to version control!

### 4. Set Up Database

Run the database setup scripts in your Supabase SQL Editor:

\`\`\`sql
-- Execute these files in order:
1. docs/database/SUPABASE_SETUP.sql
2. docs/database/BUCKET_MIGRATION.sql
3. docs/database/ANALYSIS_MODES_MIGRATION.sql
4. docs/database/MANUAL_MODE_MIGRATION.sql
\`\`\`

Or use the Supabase CLI:

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Prompt Master application running!

---

## 📁 Project Structure

\`\`\`
prompt-master/
├── app/                           # Next.js App Router
│   ├── api/                      # API Routes (server-side)
│   │   ├── ai-analyze-generate/  # AI Mode endpoint
│   │   ├── analyze/              # Normal/Extensive analysis
│   │   ├── buckets/              # Bucket CRUD operations
│   │   ├── generate/             # Super prompt generation
│   │   └── prompts/              # Saved prompts CRUD
│   ├── auth/                     # Auth callback routes
│   ├── history/                  # Prompt history page
│   ├── settings/                 # Settings pages
│   │   └── buckets/              # Bucket management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (main app)
│   ├── globals.css               # Global styles
│   └── favicon.ico               # Favicon
│
├── components/                    # React Components
│   ├── auth/                     # Authentication components
│   │   ├── AuthModal.tsx         # Modal wrapper
│   │   ├── LoginForm.tsx         # Login form
│   │   ├── SignupForm.tsx        # Signup form
│   │   ├── ForgotPasswordForm.tsx
│   │   └── UserMenu.tsx          # User dropdown menu
│   ├── providers/                # Context providers
│   │   └── AuthProvider.tsx      # Auth context
│   ├── Stage1InitialPrompt.tsx   # Stage 1: Input
│   ├── Stage2Clarification.tsx   # Stage 2: Questions
│   ├── Stage3SuperPrompt.tsx     # Stage 3: Super prompt
│   ├── AnalysisModeSelector.tsx  # Mode selection
│   ├── AIModeProgress.tsx        # AI Mode loading
│   ├── AnalysisLoadingScreen.tsx # Analysis loading
│   ├── GenerationLoadingScreen.tsx # Generation loading
│   ├── BucketSelector.tsx        # Bucket dropdown
│   ├── BucketManagementCard.tsx  # Bucket card
│   ├── CategorySelector.tsx      # Category selector
│   ├── SubcategorySelector.tsx   # Subcategory selector
│   ├── TemplateGrid.tsx          # Template display
│   ├── TemplateCard.tsx          # Individual template
│   ├── QuickSaveModal.tsx        # Quick save dialog
│   ├── DeletePromptModal.tsx     # Delete confirmation
│   ├── Navbar.tsx                # Navigation bar
│   ├── LoadingSpinner.tsx        # Loading indicator
│   ├── ErrorMessage.tsx          # Error display
│   └── ServiceWorkerRegistration.tsx
│
├── lib/                          # Utility libraries
│   ├── auth/                     # Auth utilities
│   │   └── middleware.ts         # Auth middleware
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── types.ts                  # TypeScript interfaces
│   ├── prompts.ts                # Meta-prompts for AI
│   ├── gemini.ts                 # Gemini API config
│   ├── categoryConfig.ts         # Category definitions
│   ├── subcategoryConfig.ts      # Subcategory definitions
│   ├── templateConfig.ts         # Template definitions
│   └── modeConfig.ts             # Analysis mode config
│
├── docs/                         # Documentation
│   ├── README.md                 # Documentation index
│   ├── PROJECT_OVERVIEW.md       # Project overview
│   ├── tasks/                    # Implementation tasks
│   ├── database/                 # Database docs & SQL
│   ├── architecture/             # Technical architecture
│   ├── guides/                   # User & dev guides
│   ├── api/                      # API documentation
│   └── project/                  # Project management
│
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── [svg files]               # Static SVGs
│
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript config
├── middleware.ts                 # Next.js middleware
└── README.md                     # Project README
\`\`\`

---

## 🔄 Development Workflow

### Daily Workflow

1. **Pull Latest Changes**
   \`\`\`bash
   git pull origin main
   \`\`\`

2. **Create Feature Branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

3. **Start Dev Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Make Changes**
   - Edit files
   - Test in browser
   - Check console for errors

5. **Commit Changes**
   \`\`\`bash
   git add .
   git commit -m "feat: your descriptive commit message"
   \`\`\`

6. **Push to Remote**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

7. **Create Pull Request**
   - Go to GitHub
   - Create PR from your branch
   - Request review

### Commit Message Convention

Follow conventional commits:

\`\`\`
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
\`\`\`

Examples:
\`\`\`bash
git commit -m "feat: add template search functionality"
git commit -m "fix: resolve bucket deletion issue"
git commit -m "docs: update API reference"
\`\`\`

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 4

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Google Gemini AI

**Authentication:**
- Supabase Auth
- Row-Level Security (RLS)

### Data Flow

\`\`\`
User → Frontend Component → API Route → Supabase/Gemini → Response → Update UI
\`\`\`

### State Management

- **React Hooks:** useState, useEffect
- **Context API:** AuthProvider for auth state
- **URL State:** For navigation and filtering
- **Local State:** For component-specific data

---

## 🎨 Component Development

### Creating a New Component

1. **Create File:** `components/YourComponent.tsx`

\`\`\`typescript
'use client';

import React from 'react';

interface YourComponentProps {
  title: string;
  onAction?: () => void;
}

const YourComponent: React.FC<YourComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={onAction}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        Click Me
      </button>
    </div>
  );
};

export default YourComponent;
\`\`\`

2. **Import and Use:**

\`\`\`typescript
import YourComponent from '@/components/YourComponent';

// In your page or component
<YourComponent title="Hello" onAction={() => console.log('Clicked')} />
\`\`\`

### Component Best Practices

✅ **Do:**
- Use TypeScript interfaces for props
- Use 'use client' for interactive components
- Keep components focused and single-purpose
- Use Tailwind for styling
- Handle loading and error states
- Add accessibility attributes

❌ **Don't:**
- Mix server and client components carelessly
- Inline large functions
- Ignore TypeScript errors
- Use inline styles (use Tailwind)
- Forget error boundaries

---

## 🔌 API Development

### Creating an API Route

Create `app/api/your-endpoint/route.ts`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Your logic here
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) throw error;
    
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      );
    }
    
    // Your logic here
    const { data, error } = await supabase
      .from('your_table')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
\`\`\`

### API Best Practices

✅ **Do:**
- Validate all inputs
- Use try-catch blocks
- Return appropriate status codes
- Log errors for debugging
- Use server-side Supabase client
- Check authentication when needed

❌ **Don't:**
- Expose API keys in responses
- Trust user input without validation
- Return sensitive data
- Ignore errors
- Use client-side API keys

---

## 💾 Database Management

### Working with Supabase

**Client-side (Browser):**
\`\`\`typescript
import { createBrowserClient } from '@/lib/supabase/client';

const supabase = createBrowserClient();
const { data, error } = await supabase
  .from('buckets')
  .select('*');
\`\`\`

**Server-side (API Routes):**
\`\`\`typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase
  .from('buckets')
  .select('*');
\`\`\`

### Common Queries

**Select with filter:**
\`\`\`typescript
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('bucket_id', bucketId)
  .order('created_at', { ascending: false });
\`\`\`

**Insert:**
\`\`\`typescript
const { data, error } = await supabase
  .from('buckets')
  .insert({ name: 'New Bucket', user_id: userId })
  .select()
  .single();
\`\`\`

**Update:**
\`\`\`typescript
const { data, error } = await supabase
  .from('buckets')
  .update({ name: 'Updated Name' })
  .eq('id', bucketId)
  .select()
  .single();
\`\`\`

**Delete:**
\`\`\`typescript
const { error } = await supabase
  .from('prompts')
  .delete()
  .eq('id', promptId);
\`\`\`

---

## 🧪 Testing

### Manual Testing Checklist

Before committing:
- ✅ Test in Chrome, Firefox, Safari
- ✅ Test on mobile viewport
- ✅ Test all user flows
- ✅ Check console for errors
- ✅ Verify accessibility (screen readers)
- ✅ Test with slow network
- ✅ Test error scenarios

### Build Testing

\`\`\`bash
# Create production build
npm run build

# Test production build locally
npm start
\`\`\`

---

## 🚀 Deployment

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Quick Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
\`\`\`

---

## 🐛 Troubleshooting

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues.

### Quick Fixes

**Build errors:**
\`\`\`bash
rm -rf .next node_modules
npm install
npm run build
\`\`\`

**Supabase connection issues:**
- Check environment variables
- Verify URL and anon key
- Check RLS policies

**TypeScript errors:**
\`\`\`bash
# Check for type errors
npx tsc --noEmit
\`\`\`

---

## ✅ Best Practices

### Code Quality

1. **TypeScript:** Use proper types, avoid \`any\`
2. **Components:** Keep them small and focused
3. **Comments:** Explain complex logic
4. **Naming:** Use descriptive names
5. **DRY:** Don't repeat yourself

### Performance

1. **Images:** Use Next.js Image component
2. **Loading:** Show loading states
3. **Code Splitting:** Use dynamic imports
4. **Caching:** Leverage Next.js caching
5. **Bundle Size:** Keep dependencies minimal

### Security

1. **Environment Variables:** Never commit secrets
2. **Input Validation:** Validate all user input
3. **SQL Injection:** Use parameterized queries
4. **XSS:** Sanitize user content
5. **Authentication:** Check auth on protected routes

### Accessibility

1. **ARIA Labels:** Add to interactive elements
2. **Keyboard Nav:** Ensure keyboard accessibility
3. **Screen Readers:** Use semantic HTML
4. **Color Contrast:** Maintain WCAG AA standards
5. **Focus Indicators:** Make focus visible

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

## 🤝 Getting Help

- **Documentation:** Check `/docs` folder
- **Issues:** Review [Troubleshooting Guide](./TROUBLESHOOTING.md)
- **Team:** Ask in team chat
- **Community:** Supabase Discord, Next.js GitHub Discussions

---

**Last Updated:** October 4, 2025  
**Version:** 1.0

*Happy Coding! 🚀*

