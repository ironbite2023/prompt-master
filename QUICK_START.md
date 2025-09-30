# 🚀 Quick Start Guide - Prompt Master

## Get Running in 3 Minutes

### Step 1: Get Your Gemini API Key (1 minute)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Configure Environment (30 seconds)

In the project root, create `.env.local`:

```bash
GEMINI_API_KEY=paste_your_api_key_here
```

**Important:** Replace `paste_your_api_key_here` with your actual API key!

### Step 3: Run the App (1 minute)

```bash
# Navigate to project
cd prompt-master

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🎯 Test the Application

### Try This Example:

1. **Stage 1**: Enter this prompt:
   ```
   Write a blog post about artificial intelligence
   ```

2. **Stage 2**: Answer the questions that appear:
   - Target audience: "Tech-savvy professionals"
   - Tone: "Professional yet accessible"
   - Format: "1500 word article with subheadings"

3. **Stage 3**: Copy the generated super prompt and see the difference!

---

## ⚡ That's It!

You now have a fully functional AI prompt engineering tool. 

**Next Steps:**
- Read the full [README.md](./README.md) for details
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Generate PWA icons (optional, see `/public/icons/README.md`)

---

## 🐛 Troubleshooting

**Error: "GEMINI_API_KEY is not defined"**
- Make sure `.env.local` is in the project root
- Restart the dev server after creating the file

**Port 3000 already in use**
```bash
# Use a different port
npm run dev -- -p 3001
```

**Build errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

**Need Help?** Check the [README.md](./README.md) for comprehensive documentation!
