# Replit Setup Quick Start

<!-- TOC -->

- [Important: Manual Setup Required](#important-manual-setup-required)
- [What You Need to Do](#what-you-need-to-do)
  - [✅ Step 1: Create Replit Project (REQUIRED)](#-step-1-create-replit-project-required)
  - [✅ Step 2: Connect to GitHub (REQUIRED)](#-step-2-connect-to-github-required)
  - [✅ Step 3: Create Deployment (REQUIRED)](#-step-3-create-deployment-required)
  - [⚠️ Step 4: Manual Deployment (REQUIRED)](#-step-4-manual-deployment-required)
- [What the CI/CD Pipeline Does](#what-the-ci-cd-pipeline-does)
- [After Setup](#after-setup)
- [Full Instructions](#full-instructions)

<!-- /TOC -->
## Important: Manual Setup Required

**The CI/CD pipeline cannot create your Replit project automatically.** You must manually create and configure the Replit project before the automated deployment will work.

## What You Need to Do

### ✅ Step 1: Create Replit Project (REQUIRED)

1. Go to [replit.com](https://replit.com) and log in
2. Click **"Create Repl"** or **"New Repl"**
3. Choose **"HTML/CSS/JS"** or **"Static Site"** template
4. **Name it:** `tensor-logic` (or your preferred name)
5. Click **"Create Repl"**

**The CI/CD pipeline will NOT create this for you - you must do this manually.**

### ✅ Step 2: Connect to GitHub (REQUIRED)

1. In your Replit project, click the **Version Control** tab (Git icon)
2. Click **"Connect to GitHub"**
3. Authenticate and select: `MrBesterTester/tensor-logic`
4. Click **"Pull"** to sync files

**The CI/CD pipeline will NOT connect Replit to GitHub - you must do this manually.**

### ✅ Step 3: Create Deployment (REQUIRED)

1. In Replit, click the **"Deploy"** button
2. Choose **Autoscale** (recommended) or **Reserved VM**
3. Click **"Deploy"** or **"Create Deployment"**
4. Note your deployment URL - this is where your app will be hosted

**The CI/CD pipeline will NOT create the deployment - you must do this manually.**

### ⚠️ Step 4: Manual Deployment (REQUIRED)

**Important:** Replit does not provide API tokens for automated deployments. You must manually deploy:

1. After pushing to GitHub, go to your Replit project
2. Open **Version Control** → Click **"Pull"** to get latest code
3. Go to **Deploy** → Click **"Redeploy"** or **"Deploy"**

**The CI/CD pipeline will NOT automatically deploy - you must do this manually after each push.**

## What the CI/CD Pipeline Does

Once you complete the manual setup above, the CI/CD pipeline will:

1. ✅ Automatically build your app when you push to `main`
2. ✅ Run tests and linting
3. ⚠️ **Manual step required:** You must manually pull and deploy in Replit (see Step 4)

**Note:** Replit does not provide API access for automated deployments, so full automation is not possible.

## After Setup

Once all manual steps are complete:

1. Push a commit to `main` branch
2. GitHub Actions will build and test
3. **Manually:** Go to Replit → Pull from GitHub → Deploy
4. Your app will be live on Replit!

## Full Instructions

For detailed step-by-step instructions, see: [`docs/REPLIT_SETUP.md`](./REPLIT_SETUP.md)

---

**Summary:** You must manually create the Replit project, connect it to GitHub, and set up deployment. The CI/CD pipeline builds and tests, but **you must manually deploy in Replit** after each push since Replit doesn't provide API access for automated deployments.
