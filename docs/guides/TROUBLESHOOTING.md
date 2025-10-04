# Troubleshooting Guide 🔧

Common issues and solutions for Prompt Master. Find quick fixes for the most frequent problems.

---

## 📋 Table of Contents

1. [Setup Issues](#setup-issues)
2. [Authentication Problems](#authentication-problems)
3. [API & Backend Errors](#api--backend-errors)
4. [Database Issues](#database-issues)
5. [Build & Development Errors](#build--development-errors)
6. [PWA & Installation Issues](#pwa--installation-issues)
7. [Performance Problems](#performance-problems)
8. [Getting More Help](#getting-more-help)

---

## 🛠️ Setup Issues

### Environment Variables Not Loading

**Symptoms:**
- API key errors
- Database connection fails
- Features not working

**Solutions:**

1. **Check file name:**
   \`\`\`bash
   # Must be exactly .env.local (not .env)
   ls -la | grep .env.local
   \`\`\`

2. **Verify contents:**
   \`\`\`env
   GEMINI_API_KEY=your_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   \`\`\`

3. **Restart dev server:**
   \`\`\`bash
   # Stop server (Ctrl+C)
   npm run dev
   \`\`\`

4. **Check for spaces:**
   - No spaces around `=`
   - No quotes around values
   - No trailing spaces

---

### Dependencies Not Installing

**Symptoms:**
- `npm install` fails
- Missing packages errors

**Solutions:**

1. **Clear cache:**
   \`\`\`bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

2. **Check Node version:**
   \`\`\`bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   \`\`\`

3. **Use correct registry:**
   \`\`\`bash
   npm config set registry https://registry.npmjs.org/
   \`\`\`

---

## 🔐 Authentication Problems

### Can't Log In

**Symptoms:**
- Login fails
- "Invalid credentials" error
- Stuck on login screen

**Solutions:**

1. **Verify email/password:**
   - Check for typos
   - Email is case-sensitive
   - Try password reset

2. **Check Supabase status:**
   - Go to Supabase dashboard
   - Check project status
   - Verify auth is enabled

3. **Clear browser data:**
   \`\`\`javascript
   // In browser console
   localStorage.clear();
   location.reload();
   \`\`\`

4. **Check RLS policies:**
   - Verify policies are enabled
   - Check policy syntax in SQL

---

### Session Expires Immediately

**Symptoms:**
- Logged out after refresh
- Session not persisting

**Solutions:**

1. **Check cookies:**
   - Enable cookies in browser
   - Check for cookie blockers
   - Try incognito mode

2. **Verify Supabase config:**
   \`\`\`typescript
   // Check lib/supabase/client.ts
   NEXT_PUBLIC_SUPABASE_URL should be set
   NEXT_PUBLIC_SUPABASE_ANON_KEY should be set
   \`\`\`

---

### Sign Up Not Working

**Symptoms:**
- Can't create account
- Email not received

**Solutions:**

1. **Check email settings:**
   - Supabase → Authentication → Email Templates
   - Verify SMTP configured
   - Check spam folder

2. **Verify rate limits:**
   - May be temporary rate limit
   - Wait 5 minutes and retry

---

## 🔌 API & Backend Errors

### "GEMINI_API_KEY is not defined"

**Symptoms:**
- Error on prompt analysis
- 500 error in console

**Solutions:**

1. **Add to .env.local:**
   \`\`\`env
   GEMINI_API_KEY=your_actual_api_key
   \`\`\`

2. **Get API key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Generate new key
   - Copy to .env.local

3. **Restart server:**
   \`\`\`bash
   # Stop server (Ctrl+C)
   npm run dev
   \`\`\`

---

### API Requests Failing

**Symptoms:**
- 500 errors
- "Network error"
- API timeouts

**Solutions:**

1. **Check network:**
   \`\`\`bash
   # Test connectivity
   ping google.com
   \`\`\`

2. **Verify API endpoints:**
   - Check browser Network tab
   - Look for 404/500 errors
   - Check API route files exist

3. **Check API key validity:**
   - Test Gemini key in AI Studio
   - Regenerate if needed
   - Update .env.local

4. **Check rate limits:**
   - Gemini: 60 requests/minute
   - Wait and retry

---

### Prompt Analysis Not Working

**Symptoms:**
- Loading forever
- No questions generated
- Blank screen

**Solutions:**

1. **Check console errors:**
   - Open browser DevTools (F12)
   - Look for error messages
   - Check Network tab

2. **Verify prompt length:**
   - Not empty
   - Not too long (>10,000 chars)
   - Contains actual text

3. **Try different mode:**
   - Switch from Extensive to Normal
   - Try AI Mode

---

## 💾 Database Issues

### Can't Connect to Supabase

**Symptoms:**
- Database errors
- Can't fetch data
- RLS errors

**Solutions:**

1. **Check credentials:**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   \`\`\`

2. **Verify project status:**
   - Supabase dashboard
   - Project should be "Active"
   - Check for maintenance

3. **Test connection:**
   \`\`\`typescript
   // In browser console
   const { data, error } = await supabase.from('buckets').select('count');
   console.log(data, error);
   \`\`\`

---

### RLS Policy Errors

**Symptoms:**
- "Row level security" errors
- Can't read/write data
- 403 forbidden errors

**Solutions:**

1. **Check authentication:**
   - Verify user is logged in
   - Check session is valid

2. **Verify RLS policies:**
   \`\`\`sql
   -- In Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'buckets';
   \`\`\`

3. **Re-run migrations:**
   - Execute SUPABASE_SETUP.sql
   - Execute BUCKET_MIGRATION.sql

---

### Migrations Not Running

**Symptoms:**
- Tables don't exist
- Schema errors

**Solutions:**

1. **Run migrations manually:**
   - Open Supabase SQL Editor
   - Copy from docs/database/*.sql
   - Execute in order

2. **Check for errors:**
   - Read SQL error messages
   - Fix syntax errors
   - Retry

---

## 🏗️ Build & Development Errors

### TypeScript Compilation Errors

**Symptoms:**
- Build fails
- Type errors in console

**Solutions:**

1. **Check for type errors:**
   \`\`\`bash
   npx tsc --noEmit
   \`\`\`

2. **Install type definitions:**
   \`\`\`bash
   npm install --save-dev @types/node @types/react @types/react-dom
   \`\`\`

3. **Fix common issues:**
   - Add missing imports
   - Define proper interfaces
   - Fix type mismatches

---

### Build Failures

**Symptoms:**
- `npm run build` fails
- Deployment fails

**Solutions:**

1. **Clean build:**
   \`\`\`bash
   rm -rf .next
   npm run build
   \`\`\`

2. **Check for errors:**
   - Read build output
   - Fix reported issues
   - Check file paths

3. **Verify dependencies:**
   \`\`\`bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   \`\`\`

---

### ESLint Warnings

**Symptoms:**
- Warnings during build
- Lint errors in console

**Solutions:**

1. **Fix warnings:**
   \`\`\`bash
   npm run lint
   # Fix reported issues
   \`\`\`

2. **Auto-fix:**
   \`\`\`bash
   npx eslint --fix .
   \`\`\`

---

## 📱 PWA & Installation Issues

### PWA Not Installing

**Symptoms:**
- No "Install" prompt
- Can't add to home screen

**Solutions:**

1. **Check requirements:**
   - Must use HTTPS (or localhost)
   - Service worker must register
   - Manifest.json must be valid

2. **Verify service worker:**
   - Open DevTools → Application
   - Check Service Workers section
   - Should show "activated"

3. **Check manifest:**
   - DevTools → Application → Manifest
   - Verify all fields correct
   - Check for errors

---

### Offline Mode Not Working

**Symptoms:**
- App doesn't work offline
- White screen when offline

**Solutions:**

1. **Verify SW registration:**
   - Check browser console
   - Look for SW registration message

2. **Clear SW cache:**
   - DevTools → Application → Service Workers
   - Click "Unregister"
   - Reload page

---

## ⚡ Performance Problems

### Slow Loading

**Symptoms:**
- Takes >5 seconds to load
- Slow page transitions

**Solutions:**

1. **Check network:**
   - DevTools → Network tab
   - Look for slow requests
   - Check bundle size

2. **Optimize images:**
   - Use Next.js Image component
   - Compress images
   - Use appropriate formats

3. **Clear cache:**
   \`\`\`bash
   rm -rf .next
   npm run dev
   \`\`\`

---

### API Responses Slow

**Symptoms:**
- Long wait for AI responses
- Timeouts

**Solutions:**

1. **Check mode:**
   - Extensive mode takes longer
   - Try Normal mode
   - AI mode is ~20 seconds

2. **Network issues:**
   - Test internet speed
   - Check Gemini API status
   - Try different network

---

## 🆘 Getting More Help

### Still Having Issues?

1. **Check Documentation:**
   - [Developer Guide](./DEVELOPER_GUIDE.md)
   - [API Reference](../api/API_REFERENCE.md)
   - [Database Docs](../database/SCHEMA_DOCUMENTATION.md)

2. **Search Issues:**
   - GitHub Issues
   - Existing solutions

3. **Create Issue:**
   - Describe problem clearly
   - Include error messages
   - Share steps to reproduce
   - Mention your environment

4. **Include Information:**
   - OS and browser
   - Node.js version
   - Error messages
   - Console logs
   - Network tab screenshots

---

## 🔍 Debug Checklist

When troubleshooting, check:

- [ ] Environment variables set correctly
- [ ] Dependencies installed
- [ ] Node.js version 18+
- [ ] API keys valid
- [ ] Supabase project active
- [ ] Migrations run
- [ ] Browser console for errors
- [ ] Network tab for failed requests
- [ ] Server logs for backend errors

---

**Still stuck? Open an issue on GitHub with details!**

*Last Updated: October 4, 2025*

