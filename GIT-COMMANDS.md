# Git Commands Quick Reference

## Your Repository
**GitHub URL:** https://github.com/tubb-han/kiro-crossing  
**Live Site:** https://tubb-han.github.io/kiro-crossing/ (after enabling GitHub Pages)

---

## Daily Workflow (Most Common)

### When You Make Changes to Your Game

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Your message here"

# 4. Push to GitHub (with SSL workaround if needed)
git -c http.sslVerify=false push origin main
```

**Example:**
```bash
git status
git add .
git commit -m "Fixed ghost collision bug"
git -c http.sslVerify=false push origin main
```

---

## Common Commands

### Check Status
```bash
# See what files changed
git status

# See what changed in files
git diff
```

### Add Files
```bash
# Add all files
git add .

# Add specific file
git add game.js

# Add multiple specific files
git add game.js index.html
```

### Commit Changes
```bash
# Commit with message
git commit -m "Your descriptive message"

# Commit all tracked files (skip git add)
git commit -am "Your message"
```

### Push to GitHub
```bash
# Normal push
git push origin main

# Push with SSL verification disabled (if you get certificate errors)
git -c http.sslVerify=false push origin main
```

### Pull Latest Changes
```bash
# Get latest from GitHub
git pull origin main

# With SSL workaround
git -c http.sslVerify=false pull origin main
```

---

## View History

```bash
# See commit history
git log

# See compact history
git log --oneline

# See last 5 commits
git log -5
```

---

## Undo Changes

### Undo Changes to a File (Before Commit)
```bash
# Discard changes to a file
git restore game.js

# Discard all changes
git restore .
```

### Undo Last Commit (Keep Changes)
```bash
# Undo commit but keep files changed
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
# WARNING: This deletes your changes!
git reset --hard HEAD~1
```

---

## Branches (Advanced)

### Create and Switch to New Branch
```bash
# Create new branch
git branch feature-new-level

# Switch to branch
git checkout feature-new-level

# Create and switch in one command
git checkout -b feature-new-level
```

### Switch Back to Main
```bash
git checkout main
```

### Merge Branch into Main
```bash
# Switch to main first
git checkout main

# Merge your branch
git merge feature-new-level
```

---

## Quick Fixes

### Forgot to Add a File to Last Commit
```bash
git add forgotten-file.js
git commit --amend --no-edit
git -c http.sslVerify=false push origin main --force
```

### Change Last Commit Message
```bash
git commit --amend -m "New commit message"
git -c http.sslVerify=false push origin main --force
```

### See Remote Repository
```bash
git remote -v
```

---

## Typical Update Workflow

### Scenario: You fixed a bug in game.js

```bash
# 1. Check what changed
git status

# 2. See the actual changes
git diff game.js

# 3. Add the file
git add game.js

# 4. Commit
git commit -m "Fix: Ghost collision detection improved"

# 5. Push to GitHub
git -c http.sslVerify=false push origin main
```

### Scenario: You added a new feature

```bash
# 1. Add all new files
git add .

# 2. Check what will be committed
git status

# 3. Commit
git commit -m "Add: New power-up system"

# 4. Push
git -c http.sslVerify=false push origin main
```

---

## GitHub Pages Deployment

After pushing to GitHub, your site automatically updates at:
```
https://tubb-han.github.io/kiro-crossing/
```

**Note:** It takes 1-2 minutes for changes to appear on the live site.

### Force Refresh in Browser
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

---

## Troubleshooting

### SSL Certificate Error
Use the `-c http.sslVerify=false` flag:
```bash
git -c http.sslVerify=false push origin main
```

### Authentication Required
If prompted for credentials, use your GitHub username and a **Personal Access Token** (not your password).

**Create token:** https://github.com/settings/tokens

### Merge Conflicts
```bash
# See conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< and >>>>>>> markers

# After fixing
git add .
git commit -m "Resolve merge conflicts"
git -c http.sslVerify=false push origin main
```

### Accidentally Committed Wrong Files
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Remove unwanted files from staging
git restore --staged unwanted-file.txt

# Commit again
git add .
git commit -m "Correct commit"
git -c http.sslVerify=false push origin main
```

---

## Best Practices

✓ **Commit often** - Small, frequent commits are better than large ones  
✓ **Write clear messages** - "Fix bug" is bad, "Fix ghost collision detection" is good  
✓ **Pull before push** - Get latest changes before pushing yours  
✓ **Test before commit** - Make sure your game works before committing  
✓ **Don't commit secrets** - Never commit passwords or API keys  

---

## Commit Message Examples

**Good:**
- `Add: New enemy type - flying bats`
- `Fix: Player can now wrap around screen edges`
- `Update: Increase game difficulty in level 3`
- `Refactor: Simplify collision detection code`
- `Docs: Update README with new controls`

**Bad:**
- `changes`
- `fix`
- `update`
- `asdf`
- `work in progress`

---

## Your Quick Command

**Most common command you'll use:**
```bash
git add . && git commit -m "Your message" && git -c http.sslVerify=false push origin main
```

This does all three steps in one line!

**Example:**
```bash
git add . && git commit -m "Add new ghost sprites" && git -c http.sslVerify=false push origin main
```

---

## Need Help?

```bash
# Get help for any command
git help <command>

# Example
git help commit
git help push
```

---

## Summary Card

```
┌─────────────────────────────────────────┐
│  MOST USED COMMANDS                     │
├─────────────────────────────────────────┤
│  git status          - Check changes    │
│  git add .           - Stage all files  │
│  git commit -m "msg" - Save changes     │
│  git push origin main - Upload to GitHub│
│  git pull origin main - Download updates│
└─────────────────────────────────────────┘
```

**Your one-liner for updates:**
```bash
git add . && git commit -m "Update game" && git -c http.sslVerify=false push origin main
```
