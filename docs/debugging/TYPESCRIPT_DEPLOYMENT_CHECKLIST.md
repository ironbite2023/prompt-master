# TypeScript & Deployment Checklist

Quick reference guide to avoid common TypeScript errors and deployment failures.

## 🚫 Never Use `any` Type

### ❌ DON'T
```typescript
const data: any = response.data;
const items: any[] = [];
catch (err: any) { }
function process(input: any) { }
```

### ✅ DO
```typescript
const data: ResponseType = response.data;
const items: PromptAnswer[] = [];
catch (err: unknown) { }
function process(input: string | Record<string, unknown>) { }
```

---

## 📦 Type Definitions

### Always Define Proper Interfaces
- Create interfaces for all database models
- Define return types for API responses
- Type all function parameters and returns
- Use `Record<string, Type>` for objects with dynamic keys

### Example
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// ✅ For JSONB/unknown data
const data: Record<string, unknown> = jsonData;
const getString = (val: unknown): string => 
  typeof val === 'string' ? val : '';
```

---

## 🔄 Import/Export Best Practices

### Centralize Types
- Put shared types in `lib/types.ts`
- Export types alongside interfaces
- Import types where needed, not re-export

### Example
```typescript
// ✅ types.ts
export interface PromptData { ... }

// ✅ utils.ts
import { PromptData } from './types';

// ✅ component.tsx
import { PromptData } from '@/lib/types';
```

---

## 🛡️ Error Handling

### Use `unknown` for Catch Blocks
```typescript
// ❌ DON'T
catch (err: any) {
  console.log(err.message);
}

// ✅ DO
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.log(message);
}
```

---

## 🔍 Working with Unknown Types

### Safe Type Extraction
```typescript
// ✅ Helper functions
const getString = (value: unknown, defaultValue: string): string => {
  return typeof value === 'string' ? value : defaultValue;
};

const getNumber = (value: unknown, defaultValue: number): number => {
  return typeof value === 'number' ? value : defaultValue;
};

const getArray = <T>(value: unknown, defaultValue: T[]): T[] => {
  return Array.isArray(value) ? value : defaultValue;
};
```

---

## ✅ Pre-Deployment Checklist

### Before Every Commit
1. **Run local build**
   ```bash
   npm run build
   ```

2. **Check for linter errors**
   ```bash
   npm run lint
   ```

3. **Fix all TypeScript errors**
   - No `@typescript-eslint/no-explicit-any` errors
   - No type assignment errors
   - No missing imports

4. **Test the changes**
   - Verify features work locally
   - Check console for runtime errors

5. **Commit & Push**
   ```bash
   git add -A
   git commit -m "Description of changes"
   git push origin main
   ```

---

## 🎯 Common Pitfalls

### Database Records
```typescript
// ❌ DON'T
const { data } = await supabase.from('prompts').select('*');
data.forEach((item: any) => { ... });

// ✅ DO
interface DbPrompt {
  id: string;
  title: string;
  // ... all fields
}
const { data } = await supabase.from('prompts').select('*');
(data as DbPrompt[]).forEach((item) => { ... });
```

### JSON/JSONB Fields
```typescript
// ❌ DON'T
const category = prompt.questionnaire_data.category;

// ✅ DO
const questionnaireData: Record<string, unknown> = prompt.questionnaire_data || {};
const category = typeof questionnaireData.category === 'string' 
  ? questionnaireData.category 
  : 'default';
```

### API Responses
```typescript
// ❌ DON'T
const response = await fetch('/api/endpoint');
const result = await response.json();

// ✅ DO
interface ApiResponse {
  success: boolean;
  data: YourDataType[];
  error?: string;
}
const response = await fetch('/api/endpoint');
const result: ApiResponse = await response.json();
```

---

## 📋 Quick Reference Commands

```bash
# Local development
npm run dev

# Check for errors (no build)
npm run lint

# Full production build test
npm run build

# Type check only
npx tsc --noEmit

# Clean build cache
rm -rf .next
npm run build
```

---

## 🔧 ESLint Configuration

If you need to temporarily disable a rule (use sparingly):

```typescript
// For a single line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyFunction();

// For entire file (AVOID THIS)
/* eslint-disable @typescript-eslint/no-explicit-any */
```

**Note:** Only use eslint-disable as a last resort. Always prefer fixing the type properly.

---

## 🎓 TypeScript Principles

1. **Type everything** - Functions, variables, returns
2. **Avoid `any`** - Use `unknown` or specific types
3. **Create interfaces** - For all data structures
4. **Type guards** - Use `typeof`, `instanceof`, `Array.isArray()`
5. **Build locally** - Before every push
6. **Read errors** - TypeScript errors are helpful, not annoying

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

**Remember:** A few minutes of proper typing saves hours of debugging! 🚀

