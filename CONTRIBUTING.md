# 🤝 Contributing Guide - Smart Incentive Calculator v5.0

## 👋 Welcome Contributors!

Thank you for considering to contribute to the Smart Incentive Calculator project. This guide will help you understand our development process and standards.

---

## 🎯 Code of Conduct

Be respectful, inclusive, and professional. We're building a positive community.

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork on GitHub
git clone https://github.com/YOUR_USERNAME/sic-vercel.git
cd sic-vercel-app
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### 3. Setup Development
```bash
npm install
npm run dev
```

---

## 📋 Development Standards

### Code Style

#### TypeScript Requirements
```typescript
// ✅ Good
interface UserData {
  name: string;
  sales: number;
  target: number;
}

function calculateIncentive(data: UserData): number {
  return (data.sales / data.target) * 100;
}

// ❌ Bad - no types
function calculate(d) {
  return (d.s / d.t) * 100;
}
```

#### Naming Conventions
```typescript
// Constants
const MAX_RECORDS = 500;
const DEFAULT_SPLIT = 60;

// Functions - verb first
function validateTiers(tiers: Tier[]): string[] {}
function calculateIncentive(sales: number, target: number): number {}

// Components - PascalCase
function IndividualMode() {}
function BulkMode() {}

// Variables - camelCase
const staffRecords = [];
const isLoading = true;
```

#### Comments
```typescript
/**
 * Calculate incentive for a staff member
 * @param sales - Total sales amount
 * @param target - Target amount
 * @param rate - Incentive rate (0-100)
 * @returns Calculated incentive amount
 */
function calculateIncentive(sales: number, target: number, rate: number): number {
  // ... implementation
}
```

### Component Structure

#### Component Template
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/common';
import { moduleFunction } from '@/lib';

interface ComponentProps {
  // Define props
}

export default function ComponentName({ }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Initialization
  }, []);

  // Handlers
  const handleAction = () => {
    // Logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🔄 Branching Strategy

### Branch Naming
```
feature/*     - New features
bugfix/*      - Bug fixes
docs/*        - Documentation
refactor/*    - Code refactoring
perf/*        - Performance improvements
test/*        - Tests and test infrastructure
```

### Commit Messages
```bash
# Good
git commit -m "Add tier comparison tool"
git commit -m "Fix Excel parsing for multi-sheet files"
git commit -m "Improve analytics performance"

# Bad
git commit -m "Updates"
git commit -m "WIP"
git commit -m "Fix stuff"
```

---

## 🧪 Testing Requirements

### Run Before Committing
```bash
# Linting
npm run lint

# Build test
npm run build

# Manual testing
npm run dev
# Test your changes manually
```

### Testing Checklist
- [ ] Feature works as intended
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Tested on mobile (DevTools)
- [ ] Dark mode tested
- [ ] Edge cases considered

---

## 📝 Pull Request Process

### 1. Prepare Your PR
```bash
# Update main branch
git fetch origin
git rebase origin/main

# Push your branch
git push origin feature/your-feature
```

### 2. Create PR on GitHub
- Go to your fork
- Click "Compare & Pull Request"
- Fill in the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Documentation

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] Build passes
- [ ] Lint passes

## Screenshots (if UI change)
Add before/after screenshots

## Related Issues
Closes #123
```

### 3. Code Review
- At least 1 approval required
- Resolve requested changes
- Keep conversation professional

---

## 🎨 Design Guidelines

### Component Consistency
- Use existing component library (Card, Button, Input, etc.)
- Follow color scheme (Tailwind teal-600)
- Maintain responsive design
- Support dark mode

### UI Patterns
```typescript
// Use consistent patterns for:
// 1. Loading states
<Spinner message="Processing..." />

// 2. Error messages
<Alert type="error" title="Error">Error details</Alert>

// 3. Success feedback
<Alert type="success">Success message</Alert>

// 4. Forms
<Input label="Label" value={} onChange={} />
```

---

## 📦 Adding Dependencies

### Before Adding
1. Check if existing library exists
2. Consider bundle impact
3. Ensure it's actively maintained
4. Check license compatibility

### Adding a Dependency
```bash
npm install package-name

# Update package.json and commit
git add package.json package-lock.json
git commit -m "Add package-name for feature X"
```

### Avoid Adding
- Duplicate functionality
- Large packages for small features
- Unmaintained packages
- Packages with GPL licenses

---

## 🔍 Code Review Checklist

When reviewing PRs, check:

### Functionality
- [ ] Feature works as described
- [ ] No regressions introduced
- [ ] Edge cases handled
- [ ] Error handling proper

### Code Quality
- [ ] Follows naming conventions
- [ ] TypeScript types correct
- [ ] No console.log left behind
- [ ] No commented code

### Performance
- [ ] No unnecessary renders
- [ ] useMemo/useCallback used where needed
- [ ] Bundle size acceptable
- [ ] No memory leaks

### Accessibility
- [ ] Proper semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient

---

## 🐛 Reporting Bugs

### Create Issue
1. Go to Issues
2. Click "New Issue"
3. Fill in template:

```markdown
## Description
What is the bug?

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Version: 5.0.0

## Screenshots
If applicable
```

---

## 💡 Suggesting Features

### Feature Request
1. Go to Discussions or Issues
2. Describe use case
3. Propose solution
4. Gather feedback

```markdown
## Problem
Describe the problem this solves

## Proposed Solution
How should it work?

## Alternative Solutions
Other approaches?

## Additional Context
Why is this important?
```

---

## 📚 Documentation

### When to Update Docs
- Adding new feature
- Changing existing behavior
- New API endpoint
- Important bugfix

### Documentation Files
- **README.md** - Overview & quick start
- **IMPLEMENTATION_GUIDE.md** - Architecture
- **DEPLOYMENT_GUIDE.md** - Setup steps
- **PERFORMANCE_GUIDE.md** - Optimization
- **CONTRIBUTING.md** - This file

### Code Comments
```typescript
// When to comment:
// 1. Complex logic
// 2. Non-obvious decisions
// 3. Workarounds for browser bugs
// 4. Performance-critical sections

// When NOT to comment:
// - Obvious code: const name = "John";
// - Well-named functions: function validateEmail()
// - Self-explanatory logic
```

---

## 🚀 Release Process

### Versioning (Semantic)
```
MAJOR.MINOR.PATCH
5.0.0
│ │ └─ Bugfixes
│ └──── New features
└─────── Breaking changes
```

### Release Checklist
- [ ] All PRs merged
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Lighthouse > 95
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Tagged on GitHub
- [ ] Deployed to production

---

## 📂 Project Structure Explanation

### lib/ - Business Logic
```
lib/
├── configManager.ts    - Configuration management
├── validation.ts       - Input validation
├── tierManager.ts      - Tier calculations
├── analyticsTracker.ts - Analytics tracking
├── excelParser.ts      - Excel parsing
└── teamComparison.ts   - Team comparison
```

**When to modify:** Adding business logic or calculations

### components/ - UI Components
```
components/
├── modes/              - Feature modes
├── common/             - Shared components
├── TabNavigation.tsx   - Tabs
├── SettingsPage.tsx    - Settings
├── AnalyticsDashboard.tsx - Analytics
└── TeamComparisonTool.tsx  - Comparison
```

**When to modify:** Adding UI features or improving layout

### app/ - Next.js App
```
app/
├── page.tsx            - Main page
├── layout.tsx          - Root layout
├── globals.css         - Global styles
└── api/                - API routes
```

**When to modify:** Adding routes or API endpoints

---

## 🎓 Learning Resources

### TypeScript
- https://www.typescriptlang.org/docs/
- https://www.typescriptlang.org/play/

### React
- https://react.dev/
- https://react.dev/learn

### Next.js
- https://nextjs.org/docs
- https://nextjs.org/learn

### Tailwind CSS
- https://tailwindcss.com/docs
- https://tailwindcss.com/docs/responsive-design

### Testing
- Testing Library: https://testing-library.com/
- Jest: https://jestjs.io/

---

## 🔗 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Check code quality
npm run lint -- --fix   # Auto-fix linting issues

# Git
git status              # Check changes
git diff                # See changes
git log --oneline       # View history
git rebase origin/main  # Rebase with main

# Node
npm install             # Install dependencies
npm update              # Update packages
npm list                # List installed packages
npm audit               # Security audit
```

---

## 🤔 Common Questions

### Q: How do I add a new tier field?
A: Modify the `Tier` interface in `lib/configManager.ts`, then update:
1. Settings UI component
2. TierManager calculations
3. Excel parsing if needed

### Q: How do I add a new calculation?
A: Add to `lib/tierManager.ts`, export from `lib/index.ts`, then use in components.

### Q: How do I add dark mode to new component?
A: Use Tailwind dark: prefix: `dark:bg-gray-800`

### Q: How do I optimize performance?
A: See PERFORMANCE_GUIDE.md for detailed strategies.

---

## 📞 Getting Help

- **Documentation:** Check README.md and guides
- **Issues:** Search existing issues
- **Discussions:** Ask questions in Discussions
- **Code:** Review similar components for patterns

---

## ✨ Thank You!

Your contributions make this project better. We appreciate your effort and collaboration!

---

**Version:** 5.0.0
**Last Updated:** April 18, 2026

For more information, see other documentation files:
- README.md
- IMPLEMENTATION_GUIDE.md
- DEPLOYMENT_GUIDE.md
- PERFORMANCE_GUIDE.md
