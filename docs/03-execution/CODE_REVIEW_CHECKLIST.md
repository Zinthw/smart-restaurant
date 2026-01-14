# Code Review Checklist - Smart Restaurant

## Before Creating PR

### General
- [ ] Code compiles without errors
- [ ] No console.log() left in production code
- [ ] Removed TODO/FIXME comments or documented them
- [ ] Self-reviewed the diff

### Naming
- [ ] Variables/functions have meaningful names
- [ ] Consistent naming convention (camelCase)
- [ ] No abbreviations that are unclear

### Code Quality
- [ ] No duplicate code
- [ ] Functions are small (<30 lines ideally)
- [ ] No deeply nested conditionals (>3 levels)
- [ ] Early returns used where appropriate

---

## PR Description Template

```markdown
## What does this PR do?
[Brief description of changes]

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing done
- [ ] Tested locally
- [ ] Screenshots attached (if UI change)

## Related issues
Closes #[issue number]
```

---

## Reviewer Checklist

### Frontend (React/NextJS)

#### Components
- [ ] Props are typed/validated
- [ ] No inline styles (use CSS modules)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Key prop used for lists

#### State
- [ ] No unnecessary re-renders
- [ ] State is at appropriate level
- [ ] useEffect dependencies correct

#### UI/UX
- [ ] Responsive design works
- [ ] Accessible (aria labels, tabbing)
- [ ] Consistent with design mockups

---

### Backend (NodeJS/Express)

#### API
- [ ] Correct HTTP methods
- [ ] Input validation present
- [ ] Error handling with appropriate status codes
- [ ] Response format consistent

#### Security
- [ ] No sensitive data in logs
- [ ] Authentication required where needed
- [ ] Authorization checked
- [ ] SQL injection prevented (parameterized queries)

#### Database
- [ ] Indexes on frequently queried columns
- [ ] Migrations reversible
- [ ] No N+1 query issues

---

### Common Issues to Avoid

| Issue | Solution |
|-------|----------|
| Hardcoded values | Use environment variables or constants |
| Missing error handling | Wrap async calls in try/catch |
| Large files | Split into smaller modules |
| No comments | Add JSDoc for complex functions |
| Missing loading states | Add skeleton/spinner |

---

## Approval Criteria

### Can Merge ✅
- No critical issues
- At least 1 approval
- CI passes (if configured)

### Request Changes 🔄
- Security vulnerabilities
- Breaking changes not documented
- Missing tests for complex logic

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
