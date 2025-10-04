# 🎛️ Gemini Configuration Guide

## Overview

All Gemini API configuration is **centralized** in `lib/gemini.ts`. Change settings in ONE place, and they apply everywhere across all API routes and analysis modes.

---

## 📍 Central Configuration Location

**File:** `lib/gemini.ts`

### Key Configuration Object

```typescript
export const GEMINI_CONFIG = {
  // Sampling parameters (applied to all API calls)
  topP: 0.95,    // Nucleus sampling: 0.0-1.0 (higher = more diverse)
  topK: 40,      // Token diversity: 1-100 (higher = more options)
  
  // Temperature ranges by use case
  temperature: {
    creative: 1.0,      // For creative, diverse outputs (generation, playground)
    balanced: 0.9,      // For balanced quality (normal analysis)
    analytical: 0.7,    // For focused, consistent outputs (if needed)
  },
  
  // Token limits by operation type
  maxOutputTokens: {
    analysis: 4096,     // For generating questions (Normal/AI modes)
    extensive: 6144,    // For extensive analysis (8-12 questions)
    generation: 8192,   // For super prompt generation
    playground: 8192,   // For playground responses
  }
}
```

---

## 🔧 How to Change Settings

### Example 1: Increase Diversity Globally

Want more creative, diverse AI responses everywhere?

```typescript
// In lib/gemini.ts
export const GEMINI_CONFIG = {
  topP: 0.98,    // Changed from 0.95 → More diverse
  topK: 60,      // Changed from 40 → More token options
  // ... rest stays the same
}
```

**Effect:** All AI routes (playground, analysis, generation) now use these new settings.

---

### Example 2: Adjust Temperature for Specific Operations

Want more creative super prompts but keep analysis focused?

```typescript
// In lib/gemini.ts
export const GEMINI_CONFIG = {
  // ...
  temperature: {
    creative: 1.2,     // Increased for wilder prompts
    balanced: 0.85,    // Slightly lowered for consistency
    analytical: 0.6,   // More focused
  },
  // ...
}
```

**Effect:**
- Playground and generation routes get more creative (1.2)
- Normal/AI analysis stays balanced (0.85)
- Extensive mode gets creative outputs (1.2)

---

### Example 3: Increase Token Limits

Need longer AI responses?

```typescript
// In lib/gemini.ts
export const GEMINI_CONFIG = {
  // ...
  maxOutputTokens: {
    analysis: 6144,     // Was 4096
    extensive: 8192,    // Was 6144
    generation: 12288,  // Was 8192
    playground: 16384,  // Was 8192
  }
}
```

**Effect:** All operations can now generate longer content.

---

## 🗺️ Where Settings Are Applied

### API Routes Using Centralized Config

| Route | Config Helper | Temperature | Max Tokens |
|-------|--------------|-------------|------------|
| `/api/playground/test` | `getCreativeConfig()` | `creative (1.0)` | `playground (8192)` |
| `/api/ai-analyze-generate` (Step 1) | `getAnalysisConfig()` | `balanced (0.9)` | `analysis (4096)` |
| `/api/ai-analyze-generate` (Step 2) | `getCreativeConfig()` | `creative (1.0)` | `generation (8192)` |
| `/api/generate` | `getCreativeConfig()` | `creative (1.0)` | `generation (8192)` |
| `/api/analyze` | `getAnalysisConfig()` + mode override | Mode-specific | Mode-specific |

### Analysis Modes (via `lib/modeConfig.ts`)

Analysis modes automatically reference `GEMINI_CONFIG`:

| Mode | Temperature | Max Tokens |
|------|-------------|------------|
| **AI Mode** | `GEMINI_CONFIG.temperature.balanced` | `GEMINI_CONFIG.maxOutputTokens.analysis` |
| **Normal Mode** | `GEMINI_CONFIG.temperature.balanced` | `GEMINI_CONFIG.maxOutputTokens.analysis` |
| **Extensive Mode** | `GEMINI_CONFIG.temperature.creative` | `GEMINI_CONFIG.maxOutputTokens.extensive` |

---

## 🎯 Helper Functions

### `getBaseGeminiConfig()`

Returns the base config that ALL routes should include:
```typescript
{
  topP: 0.95,
  topK: 40
}
```

### `getCreativeConfig(maxTokens?)`

For creative operations (generation, playground):
```typescript
{
  topP: 0.95,
  topK: 40,
  temperature: 1.0,
  maxOutputTokens: 8192 (or custom)
}
```

**Used by:**
- Playground
- Super prompt generation
- AI Mode (step 2)

### `getAnalysisConfig(maxTokens?)`

For analytical operations (question generation):
```typescript
{
  topP: 0.95,
  topK: 40,
  temperature: 0.9,
  maxOutputTokens: 4096 (or custom)
}
```

**Used by:**
- Normal mode analysis
- AI Mode (step 1)
- Extensive mode analysis

---

## 📊 Parameter Explanations

### `topP` (Nucleus Sampling)
- **Range:** 0.0 - 1.0
- **Current:** 0.95
- **Effect:** Higher = more diverse vocabulary and creativity
- **Recommendation:** 0.9-0.95 for quality content

### `topK` (Token Diversity)
- **Range:** 1 - 100
- **Current:** 40
- **Effect:** Number of token options to sample from
- **Recommendation:** 20-40 for focused, 40-60 for creative

### `temperature`
- **Range:** 0.0 - 2.0
- **Current:** 0.9-1.0 (depends on operation)
- **Effect:** Randomness in output
  - 0.0-0.3: Very focused, deterministic
  - 0.7-0.9: Balanced quality
  - 1.0-1.2: Creative, diverse
  - 1.5+: Very experimental
- **Recommendation:** 0.7-1.0 for most use cases

### `maxOutputTokens`
- **Range:** 1 - 8192 (Gemini 2.5 Pro)
- **Current:** 4096-8192 (depends on operation)
- **Effect:** Maximum response length
- **Cost Impact:** Higher = more expensive API calls
- **Recommendation:** Match to expected output length

---

## 🚀 Best Practices

### 1. Test After Changes
After modifying config, test:
- ✅ Normal mode analysis
- ✅ AI mode full flow
- ✅ Playground generation
- ✅ Super prompt quality

### 2. Monitor API Costs
Higher `maxOutputTokens` = higher costs. Balance quality vs. budget.

### 3. Gradual Adjustments
Change parameters incrementally (±0.1 for temperature, ±10 for topK).

### 4. Document Changes
When you modify config, note the reason and date in this file.

---

## 📝 Configuration Change Log

| Date | Parameter | Old | New | Reason |
|------|-----------|-----|-----|--------|
| 2025-10-04 | `topP` | Hardcoded 0.95 | Centralized | Initial centralization |
| 2025-10-04 | `topK` | Hardcoded 40 | Centralized | Initial centralization |
| 2025-10-04 | Model | `gemini-2.0-flash-exp` | `gemini-2.5-pro` | Quality upgrade |
| 2025-10-04 | `maxOutputTokens` | 2048-4096 | 4096-8192 | Pro model support |

---

## 🔍 Troubleshooting

### "No response from AI model"
**Check:**
1. `maxOutputTokens` not too low
2. `temperature` within valid range (0.0-2.0)
3. API key valid in `.env.local`

### Responses too random/nonsensical
**Fix:** Lower `temperature` to 0.7-0.8

### Responses too repetitive
**Fix:** Increase `topP` to 0.98 or `topK` to 50-60

### Responses cut off mid-sentence
**Fix:** Increase `maxOutputTokens` for that operation type

---

## 💡 Quick Reference

**Want more creativity?** ↑ `temperature`, ↑ `topP`, ↑ `topK`  
**Want more consistency?** ↓ `temperature`, ↓ `topP`, ↓ `topK`  
**Want longer responses?** ↑ `maxOutputTokens`  
**Want to save costs?** ↓ `maxOutputTokens`  

**Single Source of Truth:** `lib/gemini.ts` → Change once, apply everywhere! 🎉

