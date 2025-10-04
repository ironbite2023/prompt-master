# SUPABASE AUTHENTICATION SETUP INSTRUCTIONS

## 🎯 Quick Start Guide

This guide will help you set up Supabase authentication for Prompt Master.

---

## ✅ STEP 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `prompt-master`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

---

## ✅ STEP 2: Database Setup (Already Complete! ✨)

**Good news!** The database has already been set up automatically using Supabase MCP migrations:

✅ **Migrations Applied:**
- `create_profiles_table_with_rls` - User profiles table
- `create_prompts_table_with_rls` - Prompts history table
- `create_auto_profile_trigger` - Auto-create profiles on signup
- `fix_handle_updated_at_security` - Security hardening

✅ **Verification:**
- 2 tables created with Row Level Security enabled
- All security advisors passed
- Indexes created for performance
- Triggers configured

You can verify in Supabase Dashboard → **Table Editor** → You should see `profiles` and `prompts` tables!

---

## ✅ STEP 3: Configure Environment Variables

1. In Supabase Dashboard, go to **Project Settings → API**
2. Copy these values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (⚠️ Keep this secret!)

3. Create `.env.local` file in project root:

```env
# Existing
GEMINI_API_KEY=your_existing_gemini_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the placeholder values with your actual keys!**

---

## ✅ STEP 4: Configure Authentication

1. In Supabase Dashboard, go to **Authentication → Providers**
2. **Enable Email Provider**:
   - Toggle **"Enable Email provider"** to ON
   - **Confirm email**: Toggle ON (recommended)
   - **Secure email change**: Toggle ON

3. Go to **Authentication → URL Configuration**
4. Set:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

---

## ✅ STEP 5: Test Locally

1. Open terminal in project directory:
   ```bash
   cd "C:\Users\user\OneDrive\Ironbite Buisness Documents\GitHub\prompt-master"
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to [http://localhost:3000](http://localhost:3000)

4. **Test Authentication**:
   - Click **"Sign In"** button in navbar
   - Create a new account
   - Check your email for confirmation link
   - Sign in with your credentials
   - Verify navbar shows your user menu

5. **Test Prompt Workflow**:
   - Create a prompt (should require authentication)
   - Generate super prompt
   - Click **"Save to History"**
   - Navigate to **"Prompt History"** from user menu
   - Verify your saved prompt appears

---

## ✅ STEP 6: Verify Database

1. In Supabase Dashboard, go to **Table Editor**
2. You should see:
   - ✅ **profiles** table (with your user profile)
   - ✅ **prompts** table (with your saved prompts)

3. Click **Authentication → Users**
4. Verify your registered user appears

---

## 🎉 SETUP COMPLETE!

Your Prompt Master app now has full authentication!

### What You Can Do Now:

✅ Sign up and sign in  
✅ Reset forgotten passwords  
✅ Save prompts to history  
✅ View and delete saved prompts  
✅ User sessions persist across reloads  

---

## 🚀 NEXT STEPS (Optional)

### Add OAuth Providers

1. Go to **Authentication → Providers** in Supabase
2. Enable **Google**, **GitHub**, or other providers
3. Follow Supabase docs to configure OAuth credentials

### Deploy to Production

1. Update **Authentication → URL Configuration** with production URLs
2. Add environment variables to Vercel/Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

3. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

---

## 🐛 Troubleshooting

### "Invalid login credentials" error
- Verify email is confirmed (check Supabase Auth dashboard)
- Ensure user exists in **Authentication → Users**

### API routes return 401
- Check browser cookies are enabled
- Verify environment variables are set correctly
- Restart dev server after changing `.env.local`

### Email confirmation not received
- Check spam folder
- In Supabase Dashboard, go to **Authentication → Email Templates**
- For development, disable email confirmation temporarily

### Database policies not working
- Verify RLS is enabled (green lock icon in Table Editor)
- Check policy definitions in SQL Editor
- Test queries manually in SQL Editor

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Need help?** Check the Supabase Discord or documentation!
