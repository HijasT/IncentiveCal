# 📋 SEMANTIC VERSIONING GUIDE

## **Understanding Version Numbers: X.Y.Z**

```
7.2.2
│ │ └── PATCH (Bug fixes, small corrections)
│ └──── MINOR (New features, non-breaking changes)
└────── MAJOR (Breaking changes, complete rewrites)
```

---

## **WHEN TO BUMP VERSIONS:**

### **PATCH (7.2.1 → 7.2.2)**
Increment for:
- ✅ Bug fixes
- ✅ Typo corrections
- ✅ Performance improvements (no user-visible changes)
- ✅ Documentation updates
- ✅ Code cleanup

**Examples:**
- Fixed tier settings not applying ← v7.2.2
- Fixed broken link
- Corrected spelling error

---

### **MINOR (7.1.0 → 7.2.0)**
Increment for:
- ✅ New features
- ✅ UI improvements
- ✅ New functionality
- ✅ Enhanced analytics
- ✅ Non-breaking additions

**Examples:**
- New percentile-based formula ← v7.2.0
- Added privacy notices ← v7.2.1
- New dashboard views
- Additional export formats

---

### **MAJOR (6.0.0 → 7.0.0)**
Increment for:
- ✅ Complete redesigns
- ✅ Breaking API changes
- ✅ Major architecture changes
- ✅ Removed features
- ✅ Changed calculation methods (that break old results)

**Examples:**
- HTML → Next.js conversion ← v7.0.0
- Changed from client-side to server-side
- Removed backward compatibility

---

## **SMART INCENTIVE CALCULATOR HISTORY:**

| Version | Type | Changes |
|---------|------|---------|
| **7.0.0** | MAJOR | HTML → Next.js conversion, complete rewrite |
| **7.1.0** | MINOR | UI improvements, cleaner design |
| **7.2.0** | MINOR | New percentile-based performance formula |
| **7.2.1** | MINOR | Privacy notices, alphabetical sorting, info tooltips, view mode filtering |
| **7.2.2** | PATCH | **Bug fix:** Tier settings now apply to calculations |

---

## **YOUR QUESTION: Why stuck at 7.2.1?**

You were **100% RIGHT** to question this!

We made these changes:
1. **First set** (About page, privacy, sorting) = v7.2.1 ✅
2. **Second set** (Tier bug fix) = Should be v7.2.2 ✅

I should have bumped to **v7.2.2** after the bug fix!

---

## **WHEN TO VERSION:**

### **Every Git Commit? ❌ NO**
```
commit: "Fixed typo"  → Don't bump version
commit: "Work in progress" → Don't bump version
commit: "Debugging" → Don't bump version
```

### **Every Release? ✅ YES**
```
commit: "v7.2.2: Fixed tier settings bug" → Bump version
commit: "v7.2.3: Added export to CSV" → Bump version
```

---

## **BEST PRACTICES:**

### **Rule of Thumb:**
1. **Making changes?** Work normally, commit often
2. **Ready to release?** Bump version, update changelog
3. **Pushed to production?** Tag the release

### **Workflow:**
```bash
# Work on features
git commit -m "Add feature X"
git commit -m "Fix bug Y"
git commit -m "Update docs"

# Ready to release?
# 1. Bump version in package.json
# 2. Update CHANGELOG
# 3. Commit with version number
git commit -m "v7.2.2: Critical bug fixes"

# 4. Tag the release
git tag v7.2.2
git push origin main --tags
```

---

## **FOR SMART INCENTIVE CALCULATOR:**

### **Current Status:**
✅ **v7.2.2** (Updated!)

### **Next Version Will Be:**
- **v7.2.3** if: Small bug fix, typo correction
- **v7.3.0** if: New feature (e.g., email reports, new chart type)
- **v8.0.0** if: Breaking change (e.g., change calculation formula in non-compatible way)

---

## **QUICK DECISION TREE:**

```
Did I break existing functionality?
  YES → MAJOR (8.0.0)
  NO ↓

Did I add new features?
  YES → MINOR (7.3.0)
  NO ↓

Did I fix bugs/improve performance?
  YES → PATCH (7.2.3)
```

---

## **SUMMARY:**

✅ **v7.2.2** is now the correct version  
✅ Updated in package.json, About page  
✅ CHANGELOG created  
✅ Ready for next release  

**You were right to call this out - good catch!** 🎯

