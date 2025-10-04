# Contributing to Prompt Master 🤝

Thank you for your interest in contributing to Prompt Master! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Suggesting Features](#suggesting-features)
9. [Documentation](#documentation)
10. [Community](#community)

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

---

## 🎯 How Can I Contribute?

### Reporting Bugs
Found a bug? Please report it! See [Reporting Bugs](#reporting-bugs)

### Suggesting Features
Have an idea? We'd love to hear it! See [Suggesting Features](#suggesting-features)

### Improving Documentation
Documentation improvements are always welcome!

### Writing Code
Ready to code? Follow our [Development Setup](#development-setup)

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- Supabase account
- Gemini API key

### Setup Steps

1. **Fork the Repository**
   - Click "Fork" on GitHub
   - Clone your fork:
     \`\`\`bash
     git clone https://github.com/your-username/prompt-master.git
     cd prompt-master
     \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set Up Environment**
   \`\`\`bash
   cp .env.example .env.local
   # Add your API keys
   \`\`\`

4. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

---

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define interfaces for props
- Avoid `any` type
- Use meaningful variable names

### React Components
- Use functional components
- Use hooks (useState, useEffect)
- Keep components focused
- Extract reusable logic

### Styling
- Use TailwindCSS classes
- Follow existing color scheme
- Ensure responsive design
- Maintain accessibility

### Code Style
- Use early returns
- Keep functions small
- Add comments for complex logic
- Use descriptive names

### Example Component

\`\`\`typescript
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  const handleClick = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={handleClick}
        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded"
        aria-label="Action button"
      >
        Click Me
      </button>
    </div>
  );
};

export default MyComponent;
\`\`\`

---

## 📝 Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

\`\`\`bash
feat(buckets): add bucket search functionality

Implements search bar for filtering buckets by name.
Includes debounced input and case-insensitive matching.

Closes #123

---

fix(auth): resolve session timeout issue

Fixed issue where sessions expired prematurely.
Updated token refresh logic.

Fixes #456

---

docs(readme): update installation instructions

Added troubleshooting section for common setup issues.
\`\`\`

---

## 🔄 Pull Request Process

### Before Submitting

1. **Create Feature Branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make Your Changes**
   - Write code
   - Test thoroughly
   - Update documentation

3. **Test Your Changes**
   \`\`\`bash
   npm run build  # Ensure it builds
   npm run dev    # Test locally
   \`\`\`

4. **Commit Your Changes**
   \`\`\`bash
   git add .
   git commit -m "feat: your feature description"
   \`\`\`

5. **Push to Your Fork**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

### Pull Request Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added (if applicable)
\`\`\`

### Review Process

1. Submit pull request
2. Automated checks run
3. Team reviews code
4. Address feedback
5. Approval and merge

---

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Collect error messages
- Note steps to reproduce

### Bug Report Template

\`\`\`markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
\`\`\`

---

## 💡 Suggesting Features

### Feature Request Template

\`\`\`markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Proposed Solution**
Describe your solution

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Mockups, examples, or additional info

**Would you like to implement this?**
- [ ] Yes, I can work on this
- [ ] No, just suggesting
\`\`\`

---

## 📚 Documentation

### Documentation Standards

- Use clear, simple language
- Provide code examples
- Include screenshots when helpful
- Keep documentation up-to-date
- Link related documentation

### Documentation Contributions

1. Find documentation gap
2. Create/update relevant file
3. Follow existing format
4. Submit pull request

---

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- CHANGELOG.md

---

## ❓ Questions?

- Check [Documentation](../README.md)
- Open a GitHub Discussion
- Ask in community chat

---

**Thank you for contributing to Prompt Master! 🚀**

*Last Updated: October 4, 2025*

