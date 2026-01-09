# Replit Deployment Setup Guide

<!-- TOC -->

- [⚠️ Important: Replit Deployment Limitations](#-important-replit-deployment-limitations)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Create Replit Project](#step-1-create-replit-project)
- [Step 2: Connect Replit to GitHub](#step-2-connect-replit-to-github)
- [Step 3: Set Up Deployment](#step-3-set-up-deployment)
- [Step 4: Manual Deployment Process](#step-4-manual-deployment-process)
  - [Option A: Manual Pull and Deploy in Replit](#option-a-manual-pull-and-deploy-in-replit)
  - [Option B: Configure Auto-Deploy (if available)](#option-b-configure-auto-deploy-if-available)
- [Step 5: Deploy Your App](#step-5-deploy-your-app)
- [Troubleshooting](#troubleshooting)
  - [Replit Doesn't Have API Token Option](#replit-doesnt-have-api-token-option)
  - [Build Succeeds But Site Doesn't Update](#build-succeeds-but-site-doesnt-update)
  - [Files Not Found After Deployment](#files-not-found-after-deployment)
- [Replit Deployment API (Not Available)](#replit-deployment-api-not-available)
- [Next Steps](#next-steps)
- [Additional Resources](#additional-resources)

<!-- /TOC -->
This guide provides step-by-step instructions for setting up deployment of the Tensor Logic web app to Replit.

## ⚠️ Important: Replit Deployment Limitations

**As of 2025, Replit does not appear to provide a public API for automated deployments.** Based on current information:

- ❌ Replit does not offer API tokens for automated deployment triggers
- ❌ The Replit Deployments API (if it exists) is not publicly documented or accessible
- ✅ Replit supports **manual GitHub integration** - you can connect your Replit project to GitHub and manually pull updates
- ✅ Replit deployments can be triggered manually from the Replit interface

## Overview

**Current Deployment Flow (Manual):**

```
Local Project → git push → GitHub → (Manual) Pull in Replit → Replit Hosting
```

**Note:** Full automation via GitHub Actions is not currently possible with Replit's available tools. You'll need to manually trigger deployments in Replit after pushing to GitHub.

## Prerequisites

- ✅ Replit Core account (or higher)
- ✅ GitHub repository: `MrBesterTester/tensor-logic`
- ✅ Access to GitHub repository settings (for adding secrets)

## Step 1: Create Replit Project

1. **Go to Replit:**
   - Visit [replit.com](https://replit.com) and log in
   - Click **"Create Repl"** or **"New Repl"**

2. **Choose Template:**
   - Select **"HTML/CSS/JS"** or **"Static Site"** template
   - Name your project: `tensor-logic` (or your preferred name)
   - Click **"Create Repl"**

3. **Initial Setup:**
   - The project will open with a basic HTML file
   - You can delete the default files - they'll be replaced by the GitHub integration

## Step 2: Connect Replit to GitHub

1. **In Replit, open the Git pane:**
   - Click on the **Version Control** tab (Git icon) on the left sidebar
   - If you see "Initialize Git repository", click it first

2. **Connect to GitHub:**
   - Click **"Connect to GitHub"**
   - Authenticate with your GitHub account
   - Select the repository: `MrBesterTester/tensor-logic`
   - Click **"Connect"**

3. **Pull from GitHub:**
   - After connecting, click **"Pull"** to sync the repository
   - Your project files should now appear in Replit

## Step 3: Set Up Deployment

1. **Create a Deployment:**
   - In your Replit project, click the **"Deploy"** button (top right, or in the sidebar)
   - Choose deployment type:
     - **Autoscale** (recommended for static sites) - scales automatically
     - **Reserved VM** - dedicated resources (if you have Core+ plan)
   - Click **"Deploy"** or **"Create Deployment"**

2. **Verify Deployment:**
   - After creating the deployment, you'll see deployment details
   - Note your deployment URL - this is where your app will be hosted
   - The deployment should be active and ready to serve your app

3. **Configure Deployment Settings:**
   - Ensure the deployment is set to serve static files
   - **Important:** The build outputs to `backend/tensor-logic/dist/`
   - Configure Replit to serve from this directory, or adjust the "Root directory" setting in deployment settings
   - For static sites, Replit should automatically detect and serve `index.html` from the configured directory

## Step 4: Manual Deployment Process

Since Replit does not provide API tokens for automated deployments, you'll need to manually trigger deployments:

### Option A: Manual Pull and Deploy in Replit

1. **After pushing to GitHub:**
   - Go to your Replit project
   - Open the **Version Control** tab (Git icon)
   - Click **"Pull"** to sync the latest code from GitHub
   - Your deployment should automatically update, or you may need to manually trigger it

2. **Trigger Deployment:**
   - Go to the **Deploy** section in Replit
   - Click **"Redeploy"** or **"Deploy"** to update your live site

### Option B: Configure Auto-Deploy (if available)

Some Replit plans may offer automatic deployment when connected to GitHub. Check your deployment settings:

1. In your Replit deployment settings
2. Look for **"Auto-deploy"** or **"Automatic deployment"** options
3. Enable it if available to automatically deploy when you pull from GitHub

## Step 5: Deploy Your App

The GitHub Actions workflow (`.github/workflows/ci.yml`) is configured to:
- ✅ Run tests and build on every push
- ⚠️ **Note:** The automated Replit deployment step has been removed since Replit doesn't provide API access

**Deployment Process:**

1. **Push your changes from your local project to GitHub:**
   - In your local project (in Cursor or terminal), run:
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```
   - This pushes your code from your local machine to GitHub
   - GitHub Actions will automatically build and test your code

2. **Manually deploy in Replit:**
   - Go to your Replit project at [replit.com](https://replit.com)
   - Open the **Version Control** tab (Git icon) → Click **"Pull"** to sync the latest code from GitHub
   - Go to the **Deploy** section → Click **"Redeploy"** or **"Deploy"** to update your live site

3. **Verify the deployment:**
   - Check your Replit project - the latest code should be deployed
   - Visit your Replit deployment URL to see the live app

## Troubleshooting

### Replit Doesn't Have API Token Option

**Problem:** You can't find API tokens in Replit settings

**Solution:**
- This is expected - Replit does not currently provide public API tokens for automated deployments
- Use manual deployment process (see Step 4 above)
- Check Replit's documentation for any updates on API availability

### Build Succeeds But Site Doesn't Update

**Problem:** Replit isn't picking up the new files

**Solution:**
- Check that Replit is connected to the correct GitHub branch (`main`)
- Verify the deployment is configured to pull from GitHub
- Try manually triggering a deployment in Replit to test

### Files Not Found After Deployment

**Problem:** Build output location doesn't match Replit's expectations

**Solution:**
- The build outputs to `backend/tensor-logic/dist/`
- Configure Replit deployment settings to serve from `backend/tensor-logic/dist/` as the root directory
- Check Replit deployment settings for "Root directory" or "Start command" configuration
- Alternatively, you can adjust `vite.config.ts` to output to a different location if needed

## Replit Deployment API (Not Available)

**⚠️ Important:** As of 2025, Replit does not appear to provide a publicly accessible Deployments API for automated deployments. The API endpoint mentioned in some older documentation (`https://api.replit.com/v0/deployments/`) is not publicly documented or accessible.

**Alternative:** Use Replit's manual GitHub integration:
1. Connect your Replit project to GitHub
2. Manually pull updates when you push to GitHub
3. Manually trigger deployments in the Replit interface

If Replit adds API support in the future, this documentation will be updated accordingly.

## Next Steps

After successful setup:

1. ✅ Push changes to `main` branch
2. ✅ GitHub Actions automatically builds and tests
3. ⚠️ **Manual step required:** Pull updates in Replit and trigger deployment
4. ✅ Your app is live on Replit!

**Note:** Full automation is not currently possible with Replit's available tools. You'll need to manually trigger deployments after pushing to GitHub.

## Additional Resources

- [Replit Documentation](https://docs.replit.com/)
- [Replit Deployments](https://docs.replit.com/hosting/deployments)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Document Version:** 1.1  
**Date:** 2025-01-09  
**Last Updated:** 2025-01-09 (Removed API token steps - Replit doesn't provide public API)  
**Project:** tensor-logic  
**Deployment Platform:** Replit  
**Note:** Replit does not currently provide API tokens for automated deployments. Manual deployment required.
