# Deployment Guide 🚀

Complete guide for deploying Prompt Master to production environments.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment (Recommended)](#vercel-deployment)
3. [Alternative Platforms](#alternative-platforms)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Domain Configuration](#domain-configuration)
7. [Post-Deployment](#post-deployment)
8. [Monitoring](#monitoring)
9. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

### Code Preparation

- [ ] All tests passing
- [ ] Production build succeeds locally
- [ ] Environment variables documented
- [ ] Dependencies up to date
- [ ] Security vulnerabilities resolved
- [ ] Code reviewed and approved

### Services Setup

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Gemini API key obtained
- [ ] Domain name acquired (optional)
- [ ] SSL certificate ready (auto with Vercel)

### Testing

- [ ] Manual testing completed
- [ ] Mobile responsiveness verified
- [ ] PWA functionality tested
- [ ] Cross-browser testing done
- [ ] Performance benchmarks met

---

## 🚀 Vercel Deployment (Recommended)

### Why Vercel?

- ✅ Official Next.js platform
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Zero configuration needed
- ✅ Free tier available

### Step 1: Prepare Repository

\`\`\`bash
# Ensure code is committed
git add .
git commit -m "chore: prepare for deployment"
git push origin main
\`\`\`

### Step 2: Connect to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in
3. Click "New Project"
4. Import your Git repository
5. Select the repository
6. Configure project (auto-detected for Next.js)

**Option B: Using Vercel CLI**

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
\`\`\`

### Step 3: Configure Environment Variables

In Vercel dashboard:

1. Go to Project → Settings → Environment Variables
2. Add the following:

\`\`\`
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

3. Select environments: Production, Preview, Development
4. Click "Save"

### Step 4: Deploy

**Automatic Deployment:**
- Push to main branch
- Vercel automatically deploys
- Preview URLs for pull requests

**Manual Deployment:**
\`\`\`bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
\`\`\`

### Step 5: Verify Deployment

1. Visit your deployment URL
2. Test authentication
3. Create a prompt
4. Verify AI functionality
5. Check PWA installation

---

## 🌐 Alternative Platforms

### Netlify

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
\`\`\`

**Configuration:**
- Build command: `npm run build`
- Publish directory: `.next`
- Add environment variables in dashboard

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### AWS Amplify

1. Connect repository
2. Configure build settings
3. Add environment variables
4. Deploy

### Docker

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

---

## ⚙️ Environment Configuration

### Required Variables

\`\`\`env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Optional Variables

\`\`\`env
# Analytics (if added)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Monitoring (if added)
SENTRY_DSN=your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
\`\`\`

### Security Notes

- ⚠️ Never commit `.env.local`
- ✅ Use platform-specific secret management
- ✅ Rotate API keys regularly
- ✅ Use different keys for development/production

---

## 💾 Database Setup

### Supabase Configuration

1. **Create Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for provisioning (~2 minutes)

2. **Run Migrations:**
   - Go to SQL Editor
   - Execute in order:
     ```sql
     -- 1. SUPABASE_SETUP.sql
     -- 2. BUCKET_MIGRATION.sql
     -- 3. ANALYSIS_MODES_MIGRATION.sql
     -- 4. MANUAL_MODE_MIGRATION.sql
     ```

3. **Verify Tables:**
   - Check Table Editor
   - Verify RLS policies enabled
   - Test with sample data

4. **Get Credentials:**
   - Project Settings → API
   - Copy URL and anon key
   - Add to environment variables

---

## 🌍 Domain Configuration

### Custom Domain (Vercel)

1. Go to Project → Settings → Domains
2. Add your domain
3. Configure DNS:

**Option A: Vercel DNS (Recommended)**
- Change nameservers to Vercel's
- Automatic SSL

**Option B: External DNS**
- Add A record: `76.76.21.21`
- Add CNAME: `cname.vercel-dns.com`
- SSL auto-configured

### SSL Certificate

- **Vercel:** Automatic (Let's Encrypt)
- **Others:** Configure platform-specific SSL

---

## ✅ Post-Deployment

### Immediate Checks

1. **Functionality:**
   - [ ] Homepage loads
   - [ ] Authentication works
   - [ ] Prompt analysis works
   - [ ] Database connections work
   - [ ] API endpoints respond

2. **Performance:**
   - [ ] Load time < 3 seconds
   - [ ] API responses < 100ms
   - [ ] No console errors
   - [ ] No network errors

3. **Security:**
   - [ ] HTTPS enabled
   - [ ] API keys not exposed
   - [ ] RLS policies active
   - [ ] No security warnings

### User Testing

- Test complete user flow
- Verify on multiple devices
- Check different browsers
- Test PWA installation

---

## 📊 Monitoring

### Vercel Analytics

- Enable in dashboard
- Track page views
- Monitor performance
- Check error rates

### Uptime Monitoring

Recommended tools:
- UptimeRobot (free)
- Pingdom
- StatusCake

\`\`\`javascript
// pages/api/health.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
\`\`\`

### Error Tracking

Consider adding:
- Sentry
- LogRocket
- Bugsnag

---

## 🔄 Rollback Procedures

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click three dots → "Promote to Production"
4. Instant rollback

### Manual Rollback

\`\`\`bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
\`\`\`

### Database Rollback

- Keep migration backups
- Test rollback procedures
- Have restore plan ready

---

## 🛠️ Troubleshooting

### Build Failures

**Issue:** Build fails
**Solution:**
- Check build logs
- Verify dependencies
- Test locally: `npm run build`
- Check environment variables

### Runtime Errors

**Issue:** API routes failing
**Solution:**
- Check server logs
- Verify environment variables
- Test API endpoints
- Check database connection

### Performance Issues

**Issue:** Slow loading
**Solution:**
- Check CDN configuration
- Optimize images
- Review bundle size
- Check database queries

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Deployment Checklist Complete! 🎉**

*Last Updated: October 4, 2025*

