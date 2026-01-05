# How to Push Your Code to GitHub

This guide will help you push your Vocabulary Center project to GitHub.

## Prerequisites

1. **GitHub Account**: Sign up at [github.com](https://github.com) if you don't have one
2. **Git Installed**: Check if Git is installed on your computer

### Check if Git is Installed

Open your terminal/command prompt and run:
```bash
git --version
```

If Git is not installed:
- **Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
- **Mac**: Install via Homebrew: `brew install git` or download from [git-scm.com](https://git-scm.com/download/mac)
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

---

## Method 1: New Repository (First Time)

### Step 1: Create Repository on GitHub

1. **Go to [github.com](https://github.com)** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details**:
   - **Repository name**: `vocabulary-center` (or your preferred name)
   - **Description**: "MERN stack ecommerce app for selling vocabulary PDFs"
   - **Visibility**: Choose **Public** (free) or **Private** (requires paid plan)
   - **DO NOT** check "Initialize this repository with a README" (you already have code)
5. **Click "Create repository"**

### Step 2: Initialize Git (if not already done)

Open terminal/command prompt in your project folder and run:

```bash
# Navigate to your project folder
cd "C:\Users\tikav\Desktop\Portfolio Projects\vocabulary-center"

# Check if git is already initialized
git status
```

**If you see "not a git repository"**, initialize Git:
```bash
git init
```

### Step 3: Add All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Vocabulary Center MERN stack app"
```

### Step 5: Add GitHub Remote

```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/vocabulary-center.git
git remote add origin https://github.com/tikavalery/vocabulary-center.git
```

**Or if you prefer SSH** (if you have SSH keys set up):
```bash
git remote add origin git@github.com:yourusername/vocabulary-center.git
```

### Step 6: Push to GitHub

```bash
# Push to main branch (or master if that's your default)
git branch -M main
git push -u origin main
```

**If your default branch is `master`**:
```bash
git push -u origin master
```

**You'll be prompted for credentials:**
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - See "Creating Personal Access Token" section below

---

## Method 2: Repository Already Exists

If you already have a GitHub repository:

### Step 1: Check Current Remote

```bash
git remote -v
```

### Step 2: Add or Update Remote

**If no remote exists:**
```bash
git remote add origin https://github.com/yourusername/vocabulary-center.git
```

**If remote exists but points to wrong URL:**
```bash
git remote set-url origin https://github.com/yourusername/vocabulary-center.git
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Update: Add latest changes"
git push -u origin main
```

---

## Creating Personal Access Token (for Authentication)

GitHub no longer accepts passwords for Git operations. You need a Personal Access Token:

### Step 1: Generate Token

1. **Go to GitHub** → Click your profile picture → **Settings**
2. **Scroll down** → Click **"Developer settings"**
3. **Click "Personal access tokens"** → **"Tokens (classic)"**
4. **Click "Generate new token"** → **"Generate new token (classic)"**
5. **Fill in**:
   - **Note**: "Vocabulary Center Project"
   - **Expiration**: Choose duration (90 days recommended)
   - **Select scopes**: Check **`repo`** (full control of private repositories)
6. **Click "Generate token"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Step 2: Use Token When Pushing

When you run `git push`, you'll be prompted:
- **Username**: Your GitHub username
- **Password**: Paste your Personal Access Token (not your GitHub password)

---

## Common Commands Reference

```bash
# Check status
git status

# Add all files
git add .

# Add specific file
git add filename.js

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log

# Check remote URL
git remote -v

# Change remote URL
git remote set-url origin https://github.com/yourusername/vocabulary-center.git
```

---

## Troubleshooting

### Error: "remote origin already exists"

**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/yourusername/vocabulary-center.git
```

### Error: "Authentication failed"

**Solution:**
- Make sure you're using a **Personal Access Token**, not your GitHub password
- Generate a new token if needed (see above)

### Error: "failed to push some refs"

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

### Error: "Please tell me who you are"

**Solution:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Files not showing up on GitHub

**Solution:**
1. Check `.gitignore` - some files might be ignored
2. Make sure you committed: `git commit -m "message"`
3. Make sure you pushed: `git push origin main`

---

## What Files Should NOT Be Pushed?

Your `.gitignore` file should already exclude:
- `.env` files (contain secrets)
- `node_modules/` (dependencies)
- `build/` (build output)
- `.DS_Store` (Mac system files)
- `key.js` (your secret keys)

**Never commit:**
- Environment variables (`.env` files)
- API keys
- Passwords
- Personal access tokens

---

## Next Steps After Pushing

1. ✅ **Verify on GitHub**: Go to your repository and check all files are there
2. ✅ **Deploy to Heroku**: See [HEROKU_WEB_DEPLOYMENT.md](./HEROKU_WEB_DEPLOYMENT.md)
3. ✅ **Set up CI/CD**: Optional - automate deployments

---

## Quick Checklist

- [ ] Git is installed
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Git initialized in project folder
- [ ] Files added (`git add .`)
- [ ] Files committed (`git commit`)
- [ ] Remote added (`git remote add origin`)
- [ ] Personal Access Token created
- [ ] Code pushed to GitHub (`git push`)
- [ ] Verified files on GitHub website

---

That's it! Your code is now on GitHub! 🎉

