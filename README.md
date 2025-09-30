# Prompt Master 🚀

**Transform your simple ideas into powerful, AI-optimized prompts**

Prompt Master is a sophisticated, AI-powered web application that helps users refine and enhance their text-based prompts for Large Language Models (LLMs). It transforms simple, underdeveloped ideas into comprehensive, structured, and highly-effective "super prompts" through an interactive three-stage workflow.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square)

## ✨ Features

- **🎯 Three-Stage Wizard Workflow**
  - **Stage 1**: Input your initial prompt or idea
  - **Stage 2**: Answer AI-generated clarifying questions
  - **Stage 3**: Receive your optimized super prompt

- **🤖 AI-Powered Analysis**
  - Powered by Google Gemini 2.0 Flash
  - Intelligent question generation based on context gaps
  - Best practice prompt engineering principles

- **🎨 Modern UI/UX**
  - Dark mode with purple-to-pink gradient theme
  - Fully responsive design (mobile to desktop)
  - Smooth animations and transitions
  - Accessible keyboard navigation

- **📱 Progressive Web App (PWA)**
  - Installable on mobile and desktop
  - Offline capability with service worker
  - Native app-like experience

- **⚡ Performance**
  - Built with Next.js 15 App Router
  - Server-side API routes for security
  - Optimized bundle size

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **AI Service**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **PWA**: Custom Service Worker

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd prompt-master
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`bash
# Copy the example file
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` and add your Gemini API key:

\`\`\`env
GEMINI_API_KEY=your_actual_api_key_here
\`\`\`

**Important**: Never commit your \`.env.local\` file to version control!

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
prompt-master/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # API: Analyze prompt & generate questions
│   │   └── generate/
│   │       └── route.ts          # API: Generate super prompt
│   ├── layout.tsx                # Root layout with metadata & PWA config
│   ├── page.tsx                  # Main application page
│   └── globals.css               # Global styles & Tailwind config
├── components/
│   ├── Stage1InitialPrompt.tsx   # Stage 1: Prompt input
│   ├── Stage2Clarification.tsx   # Stage 2: Questions & answers
│   ├── Stage3SuperPrompt.tsx     # Stage 3: Super prompt display
│   ├── LoadingSpinner.tsx        # Reusable loading indicator
│   ├── ErrorMessage.tsx          # Error display component
│   └── ServiceWorkerRegistration.tsx # PWA service worker setup
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── prompts.ts                # Meta-prompts for AI
│   └── gemini.ts                 # Gemini API client config
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # PWA icons (192x192, 512x512)
└── package.json
\`\`\`

## 🎯 How It Works

### Stage 1: Initial Prompt Input
Users enter their basic prompt or idea into a clean, focused textarea. The system validates the input and prepares it for analysis.

### Stage 2: AI-Powered Clarification
The Gemini API analyzes the initial prompt and generates 4-6 targeted clarifying questions. Users answer these to provide missing context about:
- Target audience
- Desired tone and style
- Output format
- Specific constraints
- Background information

### Stage 3: Super Prompt Generation

The system employs a **Master Prompt Engineering Expert** methodology that:

**Critical Analysis Phase:**
- Identifies strengths, weaknesses, and ambiguities in the original prompt
- Analyzes gaps in context, constraints, and requirements

**Transformation Phase:**  
Strategically applies 12+ industry-standard prompt engineering techniques:

1. **Role-Playing** - Assigns authoritative, competent personas
2. **Contextualization** - Provides rich background information
3. **Task Decomposition** - Breaks complex requests into manageable steps
4. **Constraint Definition** - Outlines clear boundaries and requirements
5. **Exemplification** - Illustrates input-output patterns (Few-Shot Learning)
6. **Chain-of-Thought** - Encourages step-by-step reasoning
7. **Zero-Shot Prompting** - Leverages inherent AI knowledge
8. **Persona Alignment** - Ensures consistent character responses
9. **Instruction Clarity** - Removes all vagueness
10. **Output Control** - Guides quality and nature of responses
11. **Negative Constraints** - Specifies what to avoid
12. **Goal Reinforcement** - Emphasizes primary objectives

**Result:**  
A significantly more effective super prompt that ensures the AI understands nuances and executes with maximum precision. Users can copy this to use with any AI model (ChatGPT, Claude, Gemini, etc.) for superior results.

## 🔧 Configuration

### Tailwind CSS Customization

The app uses TailwindCSS v4 with CSS-based configuration in `app/globals.css`:

\`\`\`css
@theme inline {
  --color-purple-600: #9333ea;
  --color-pink-600: #db2777;
  /* Custom colors and gradients */
}
\`\`\`

### Gemini API Configuration

Modify model settings in `lib/gemini.ts`:

\`\`\`typescript
export const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
\`\`\`

## 📦 Building for Production

### Create Production Build

\`\`\`bash
npm run build
\`\`\`

### Start Production Server

\`\`\`bash
npm start
\`\`\`

### Test Production Build Locally

\`\`\`bash
npm run build && npm start
\`\`\`

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run

**Environment Variable Setup**: Ensure `GEMINI_API_KEY` is set in your deployment platform's environment configuration.

## 🔐 Security Best Practices

- ✅ API keys stored in environment variables
- ✅ Server-side API routes (no client-side exposure)
- ✅ Input validation on all endpoints
- ✅ Error handling with user-friendly messages
- ✅ Rate limiting recommended for production

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css`:

\`\`\`css
--color-purple-600: #your-color;
--color-pink-600: #your-color;
\`\`\`

### Modify Meta-Prompts

Edit `lib/prompts.ts` to customize how the AI analyzes prompts and generates questions.

### Adjust AI Parameters

Modify temperature and token limits in API routes (`app/api/analyze/route.ts` and `app/api/generate/route.ts`).

## 🐛 Troubleshooting

### API Key Error
**Error**: "GEMINI_API_KEY is not defined"
**Solution**: Ensure `.env.local` exists and contains your API key. Restart the dev server.

### Build Errors
**Error**: TypeScript compilation errors
**Solution**: Run `npm install` to ensure all dependencies are installed. Check for type errors in your code.

### Service Worker Not Registering
**Error**: PWA not installing
**Solution**: Service workers only work on HTTPS or localhost. Ensure you're using a secure connection in production.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the PRD in the repository

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini API](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

**Made with ❤️ for better AI interactions**
