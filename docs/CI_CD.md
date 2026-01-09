# CI/CD Setup Guide for Tensor Logic

<!-- TOC -->

- [Purpose](#purpose)
- [Overview](#overview)
- [GitHub Actions CI Setup](#github-actions-ci-setup)
  - [Step 0: Get GitHub Personal Access Token (Optional)](#step-0-get-github-personal-access-token-optional)
  - [Step 1: Create Workflow File](#step-1-create-workflow-file)
  - [Step 2: Configure GitHub Secrets (if needed)](#step-2-configure-github-secrets-if-needed)
  - [Step 3: Create GitHub Repository (if needed)](#step-3-create-github-repository-if-needed)
  - [Step 3.5: Set Up SSH Authentication (Optional but Recommended)](#step-35-set-up-ssh-authentication-optional-but-recommended)
  - [Step 4: Push and Test](#step-4-push-and-test)
- [Deployment to Replit](#deployment-to-replit)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
  - [Setting Up GitHub Actions Deployment](#setting-up-github-actions-deployment)
  - [Deployment Process](#deployment-process)
- [Workflow Configuration](#workflow-configuration)
  - [What Gets Tested](#what-gets-tested)
  - [When CI Runs](#when-ci-runs)
  - [Skipping CI (Optional)](#skipping-ci-optional)
  - [Controlling CI](#controlling-ci)
- [Troubleshooting](#troubleshooting)
  - [CI Fails But Local Build Works](#ci-fails-but-local-build-works)
  - [Deployment Fails](#deployment-fails)
  - [Secrets Not Working](#secrets-not-working)
- [Next Steps](#next-steps)
- [Project Scripts](#project-scripts)
  - [generate-toc.ts](#generate-tocts)
  - [check-dns-propagation.ts](#check-dns-propagationts)
  - [verify-domain-setup.ts](#verify-domain-setupts)
- [Custom Domain Configuration](#custom-domain-configuration)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Setup Procedure (Automated)](#setup-procedure-automated)
  - [Manual Procedures](#manual-procedures)
  - [Troubleshooting Domain Setup](#troubleshooting-domain-setup)
  - [SSL Certificate Management](#ssl-certificate-management)
  - [Cost Considerations](#cost-considerations)
  - [Quick Reference Card](#quick-reference-card)

<!-- /TOC -->

## Purpose

This guide provides step-by-step instructions for setting up:

1. **GitHub Actions CI** - Automated testing on every push
2. **Replit Deployment** - Deploy the static site to Replit.com

**Key Principle:** CI runs tests automatically on every push. Deployment is automatic via GitHub Actions when CI passes on the `main` branch.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                                          │
│                                                              │
│  1. Write code                                              │
│  2. Test locally: npm run build && npm run lint            │
│  3. Commit: git commit -m "feature"                        │
│  4. Push: git push origin main                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ git push
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS CI                                          │
│                                                              │
│  5. Automatically runs:                                    │
│     - Type checking (tsc)                                  │
│     - Linting (eslint)                                     │
│     - Build (vite build)                                   │
│  6. Reports: ✅ PASS or ❌ FAIL                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ (CI passes, on main branch)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS DEPLOYMENT                                  │
│                                                              │
│  7. Automatically runs (if configured):                    │
│     - Builds frontend (npm run build)                      │
│     - Deploys to Replit (via Deployments API)               │
│  8. App is live at: https://your-app.replit.dev            │
└─────────────────────────────────────────────────────────────┘

Note: Manual deployment can be triggered from Replit's web interface if needed.
```

---

## GitHub Actions CI Setup

### Step 0: Get GitHub Personal Access Token (Optional)

If you plan to use the GitHub MCP server in Cursor, you'll need a GitHub Personal Access Token:

1. **Go to GitHub Settings:**
   - Log in to your GitHub account
   - Click your profile picture (top right) → **Settings**
   - In the left sidebar, click **Developer settings**

2. **Create a New Token:**
   - Under **Personal access tokens**, click **Tokens (classic)**
   - Click **Generate new token (classic)**

3. **Configure the Token:**
   - **Note:** Give it a descriptive name (e.g., "Cursor MCP")
   - **Expiration:** Choose an expiration period
   - **Scopes:** Select `repo` (full control of private repositories)
   - Click **Generate token**

4. **Copy the Token:**
   - **Important:** Copy the token immediately - you won't be able to see it again!
   - Add it to your `~/.cursor/mcp.json` file in the `env` section of the GitHub MCP server:
     ```json
     {
       "mcpServers": {
         "github": {
           "command": "npx",
           "args": ["-y", "github-mcp@latest"],
           "env": {
             "GITHUB_PERSONAL_ACCESS_TOKEN": "paste_your_token_here"
           }
         }
       }
     }
     ```
   - Reload Cursor to apply changes:
     - Press `Cmd+Shift+P` → Type "Reload Window" → Select it
     - Or fully restart Cursor if needed

**Direct link:** https://github.com/settings/tokens

**Note:** 
- This step is only needed if you want to use GitHub MCP features in Cursor. It's not required for GitHub Actions CI to work.
- The GitHub MCP server uses the npm package `github-mcp` (no Docker required).
- After adding the token, use "Reload Window" command (`Cmd+Shift+P`) instead of a full restart.

### Step 1: Create Workflow File

Create the GitHub Actions workflow file:

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run typecheck
        
      - name: Type check scripts
        run: npm run typecheck:scripts
        
      - name: Build application
        run: npm run build
        
      - name: Build scripts
        run: npm run build:scripts
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

**What this does:**
- Runs on every push to `main`/`master` and on pull requests
- Installs Node.js 20 with npm caching
- Runs linting, type checking, and builds
- Uploads build artifacts for 7 days

### Step 2: Configure GitHub Secrets (if needed)

For this project, **no secrets are required** for CI since it's a static frontend app with no API keys.

If you add features that require secrets later:
1. Go to: `https://github.com/MrBesterTester/tensor-logic/settings/secrets/actions`
2. Click "New repository secret"
3. Add secrets as needed
4. Reference in workflow: `${{ secrets.SECRET_NAME }}`

### Step 3: Create GitHub Repository (if needed)

If you haven't created a GitHub repository for this project yet:

1. **Go to GitHub.com:**
   - Log in to your GitHub account
   - Click the "+" icon (top right) → **New repository**

2. **Create the repository:**
   - **Repository name:** `tensor-logic`
   - **Description:** (optional) "Educational demo of Tensor Logic - unifying neural and symbolic AI"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **Create repository**

3. **Connect your local repo to GitHub:**

   **Option A: Using SSH (recommended, works with 1Password):**
   ```bash
   git remote add origin git@github.com:MrBesterTester/tensor-logic.git
   ```

   **Option B: Using HTTPS (requires credentials each time):**
   ```bash
   git remote add origin https://github.com/MrBesterTester/tensor-logic.git
   ```

**Note:** If the repository already exists and is connected, skip this step.

### Step 3.5: Set Up SSH Authentication (Optional but Recommended)

Using SSH with 1Password eliminates credential prompts and provides seamless authentication:

1. **Generate SSH Key in 1Password:**
   - Open 1Password desktop app
   - Click "New Item" → Select "SSH Key"
   - Click "Add Private Key" → "Generate a New Key"
   - Choose **Ed25519** (recommended) or RSA
   - Title it: "GitHub - tensor-logic" (or similar)
   - Click "Generate" then "Save"

2. **Copy the Public Key:**
   - In 1Password, open the SSH Key item you created
   - Click the "Public Key" field to copy it to your clipboard

3. **Add Public Key to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - **Title:** "MacBook Pro - 1Password" (or similar descriptive name)
   - **Key type:** Authentication Key
   - **Key:** Paste the public key from 1Password
   - Click "Add SSH key"

4. **Enable 1Password SSH Agent:**
   - In 1Password: **Preferences** → **Developer**
   - Check "Use 1Password as SSH Agent"
   - Follow any additional setup instructions shown

5. **Test SSH Connection:**
   ```bash
   ssh -T git@github.com
   ```
   You should see: `Hi MrBesterTester! You've successfully authenticated, but GitHub does not provide shell access.`

6. **Switch Git Remote to SSH (if you used HTTPS initially):**
   ```bash
   git remote set-url origin git@github.com:MrBesterTester/tensor-logic.git
   ```

**Benefits of SSH:**
- ✅ No credential prompts (handled by 1Password)
- ✅ More secure (key-based authentication)
- ✅ Works seamlessly with 1Password SSH Agent
- ✅ No need to manage tokens or passwords

**Alternative:** If you prefer to use your existing SSH keys instead of generating new ones in 1Password:
- Copy your existing public key: `cat ~/.ssh/id_ed25519.pub`
- Add it to GitHub (same steps as above)
- Import the private key into 1Password if you want 1Password to manage it

### Step 4: Push and Test

1. **Commit and push:**
   ```bash
   git add .github/
   git commit -m "Add GitHub Actions CI workflow"
   git push origin main
   ```

2. **Watch it run:**
   - Go to GitHub.com in your browser: `https://github.com/MrBesterTester/tensor-logic/actions`
   - You should see a workflow run start automatically (appears within seconds of pushing)
   - **Tip:** On subsequent runs, refresh the page or navigate back to this link to see the latest run. Otherwise, you'll be looking at the last run you viewed.
   - Click on the workflow run to watch live logs
   - Should complete in ~2-3 minutes

3. **Verify:**
   - Green ✅ checkmark appears on your commit
   - All steps should pass

---

## Deployment to Replit

### Overview

Replit deployment uses the **Replit Deployments API** to automatically deploy your app when you push to GitHub. The deployment is triggered via GitHub Actions after CI passes.

**For detailed setup instructions, see:** [`docs/REPLIT_SETUP.md`](./REPLIT_SETUP.md)

### Prerequisites

1. **Replit Account** - Core account or higher
2. **Replit Project** - Created and connected to your GitHub repository
3. **Replit Deployment** - Set up in your Replit project
4. **Replit API Token** - Generated from your Replit account settings
5. **Deployment ID** - Obtained from your Replit deployment settings

### Initial Setup

**Complete setup instructions:** See [`docs/REPLIT_SETUP.md`](./REPLIT_SETUP.md) for step-by-step instructions.

**Quick summary:**
1. Create a Replit project (HTML/CSS/JS or Static Site template)
2. Connect the Replit project to your GitHub repository
3. Set up a deployment in Replit (Autoscale or Reserved VM)
4. Generate a Replit API token from account settings
5. Get your deployment ID from deployment settings
6. Add `REPLIT_DEPLOY_TOKEN` and `REPLIT_DEPLOYMENT_ID` secrets to GitHub

### Setting Up GitHub Actions Deployment

The GitHub Actions workflow is already configured in `.github/workflows/ci.yml`. The deployment job:

1. **Builds the frontend** (`npm run build`)
2. **Triggers Replit deployment** via the Deployments API
3. **Only runs on `main` branch** after CI passes

**Required GitHub Secrets:**
- `REPLIT_DEPLOY_TOKEN` - Your Replit API token
- `REPLIT_DEPLOYMENT_ID` - Your Replit deployment ID

**To add secrets:**
1. Go to: `https://github.com/MrBesterTester/tensor-logic/settings/secrets/actions`
2. Click "New repository secret"
3. Add both secrets as described in [`docs/REPLIT_SETUP.md`](./REPLIT_SETUP.md)

### Deployment Process

**How it works:**

1. **You push code to GitHub** → `git push origin main`
2. **GitHub Actions runs CI** → Tests and builds your app
3. **If CI passes and on main branch** → Deployment job runs automatically
4. **Deployment job:**
   - Checks out code
   - Builds frontend (`npm run build`)
   - Calls Replit Deployments API to trigger deployment
5. **Replit deploys your app** → Your app is live on Replit

**Timeline:**
- CI runs: ~2-3 minutes after push
- Deployment (via GitHub Actions): ~1-2 minutes after CI passes
- Replit deployment: Typically completes within a few minutes

**Note:** Replit will pull the latest code from your connected GitHub repository and deploy it automatically when triggered by the API call.

---

## Workflow Configuration

### What Gets Tested

**In CI:**
- ✅ TypeScript type checking (`tsc --noEmit`)
- ✅ ESLint code quality checks
- ✅ Application build (`vite build`)
- ✅ Scripts build (`tsc -p tsconfig.scripts.json`)

**Not tested in CI:**
- ❌ Browser-based E2E tests (requires browser automation setup)
- ❌ Visual regression tests
- ❌ Performance benchmarks

### When CI Runs

**CI automatically runs when:**
- ✅ You push code to `main` or `master` branch (`git push origin main`)
- ✅ You create or update a pull request targeting `main` or `master`
- ✅ You manually trigger it from the GitHub Actions tab (if configured)

**CI does NOT run when:**
- ❌ You commit locally without pushing (`git commit` - stays local)
- ❌ You push to other branches (unless you configure it to)
- ❌ You make changes but don't commit them

**Important:** CI only runs **after** you push to GitHub. You have full control - if you don't push, CI doesn't run.

### Skipping CI (Optional)

**Method 1: Don't Push (Simplest)**
The easiest way to skip CI is to simply not push:
```bash
git commit -m "WIP: experimental work"
# Don't push yet - CI won't run
# Continue working, make more commits...
# When ready: git push origin main
```

**Method 2: Push to a Different Branch**
Push to a feature branch that doesn't trigger CI:
```bash
git checkout -b wip/experimental
git commit -m "experimental changes"
git push origin wip/experimental
# CI won't run (only main/master trigger it)
```

**That's it!** These two methods cover all practical use cases. You control when CI runs by choosing when and where to push.

### Controlling CI

**Temporarily disable:**
```bash
# Rename workflow file
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
git add .github/
git commit -m "Temporarily disable CI"
git push
```

**Permanently remove:**
```bash
git rm .github/workflows/ci.yml
git commit -m "Remove CI"
git push
```

---

## Troubleshooting

### CI Fails But Local Build Works

**Common causes:**
1. **Node version mismatch**
   - Solution: Ensure CI uses same Node version as local
   - Check: `node --version` locally vs workflow file

2. **Missing dependencies**
   - Solution: Ensure `package-lock.json` is committed
   - Run: `npm ci` (not `npm install`) in CI

3. **Path issues**
   - Solution: CI runs from repo root, ensure paths are relative

4. **Cached dependencies**
   - Solution: GitHub Actions caches npm, but first run is slower

### Deployment Fails

**Common issues:**
1. **Replit API authentication fails**
   - Solution: Verify `REPLIT_DEPLOY_TOKEN` secret is correctly set in GitHub
   - Ensure the token hasn't expired - regenerate if needed

2. **Deployment ID not found**
   - Solution: Verify `REPLIT_DEPLOYMENT_ID` secret matches your actual deployment ID
   - Check the deployment ID in Replit deployment settings

3. **Build artifacts missing**
   - Solution: Ensure `npm run build` runs before deployment step
   - Verify the build output directory exists

4. **Replit deployment doesn't update**
   - Solution: Check that Replit is connected to the correct GitHub branch
   - Verify the deployment is configured to pull from GitHub
   - Try manually triggering a deployment in Replit to test

### Secrets Not Working

**If you add secrets later:**
1. Verify secrets exist: GitHub repo → Settings → Secrets → Actions
2. Check secret names match exactly (case-sensitive)
3. Reference correctly: `${{ secrets.SECRET_NAME }}`
4. Re-run workflow after adding secrets

---

## Next Steps

**Immediate:**
1. ✅ Create `.github/workflows/ci.yml` with the workflow above
2. ✅ Commit and push to trigger first CI run
3. ✅ Verify CI passes

**Future enhancements:**
1. **Add E2E tests** - Playwright or Cypress in CI
2. **Deploy to Shuttle** - Set up static site hosting
3. **GitHub Pages** - Alternative deployment option (free)
4. **Preview deployments** - Deploy PRs to staging
5. **Performance monitoring** - Track build sizes over time
6. **Dependency updates** - Enable Dependabot

**Remember:**
- CI runs automatically on push
- Deployment is always manual (`shuttle deploy`)
- You control when code is pushed and deployed
- CI validates code quality, deployment releases to users

---

**Questions or issues?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or [Shuttle documentation](https://docs.shuttle.dev/).

---

## Project Scripts

This project includes several automation scripts in the `scripts/` directory. All scripts are written in TypeScript with strict type checking and must be built before use.

**Note:** All scripts in this directory are written in TypeScript with strict type checking. When creating new scripts, use TypeScript and ensure they compile with `npm run build:scripts`.

### generate-toc.ts

Automatically generates a 3-level Table of Contents (TOC) for Markdown files.

**Usage:**

The script is written in TypeScript and must be built first:

```bash
npm run build:scripts
node scripts/dist/generate-toc.js <path-to-markdown-file>
```

Or use the TypeScript source directly with a TypeScript runner (if you have one installed):

```bash
npx tsx scripts/generate-toc.ts <path-to-markdown-file>
```

**Features:**

- Generates TOC for H1, H2, and H3 headings
- Automatically inserts/updates TOC between `<!-- TOC -->` and `<!-- /TOC -->` markers
- Creates anchor links using slugified heading text
- Preserves existing TOC if markers are present, otherwise inserts after first H1

**Git Hook:**

A pre-commit hook is installed at `.git/hooks/pre-commit` that automatically generates TOCs for all staged `.md` files before each commit.

**Manual TOC Generation:**

To manually generate TOC for all markdown files:

```bash
npm run build:scripts
find docs -name "*.md" -exec node scripts/dist/generate-toc.js {} \;
```

### check-dns-propagation.ts

Monitors DNS propagation for a CNAME record. Polls DNS servers until the record is found or timeout is reached.

**Usage:**

```bash
npm run build:scripts
node scripts/dist/check-dns-propagation.js <domain> <target>
```

**Example:**
```bash
node scripts/dist/check-dns-propagation.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

**Features:**

- Checks CNAME record propagation status
- Polls every 5 minutes (configurable)
- Maximum 48 attempts (4 hours) by default
- Provides real-time status updates
- Exits when propagation is complete or timeout reached

**Options:**
- `intervalSeconds`: Time between checks (default: 300 seconds / 5 minutes)
- `maxAttempts`: Maximum number of attempts (default: 48)

### verify-domain-setup.ts

Comprehensive verification script that checks all aspects of custom domain configuration for Shuttle deployments.

**Usage:**

```bash
npm run build:scripts
node scripts/dist/verify-domain-setup.js <domain> <shuttle-url>
```

**Example:**
```bash
node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

**Features:**

- **DNS Resolution Check:** Verifies domain resolves to IP addresses
- **CNAME Record Check:** Verifies CNAME points to correct Shuttle URL
- **HTTP Access Check:** Tests HTTP connectivity
- **HTTPS Access Check:** Tests HTTPS connectivity
- **SSL Certificate Check:** Verifies SSL certificate is valid and shows expiration date
- Provides comprehensive status report with pass/fail indicators

**Output:**
- ✅ Green checkmarks for passing checks
- ⚠️ Warning indicators for potential issues (non-critical, won't cause script to fail)
- ❌ Red X for failing checks (causes script to exit with error code)
- Detailed messages for each check

**Exit Codes:**
- Exit code 0: All critical checks passed (warnings are allowed)
- Exit code 1: One or more critical checks failed

---

## Custom Domain Configuration

> **Note:** This section is for **Shuttle deployment only**. If you're using Replit deployment, custom domain configuration should be handled through Replit's domain settings. See [Replit documentation](https://docs.replit.com/hosting/deployments) for details.

### Overview

This section provides step-by-step instructions for configuring a custom subdomain (e.g., `tensor-logic.samkirk.com`) to point to your Shuttle-hosted application instead of using the default Shuttle-provided URL.

**Goal:** Users access your app at `https://tensor-logic.samkirk.com` instead of `https://tensor-logic-noo5.shuttle.app`

**Architecture:**
```
User → tensor-logic.samkirk.com
         ↓ (DNS CNAME)
       tensor-logic-noo5.shuttle.app (Shuttle-provided URL)
         ↓
       Your Shuttle-hosted app
```

### Prerequisites

**What You Need:**
- ✅ Shuttle project deployed: `tensor-logic` (Project ID: `proj_01KCJDQWVDRP2A38R07R3M30F4`)
- ✅ Current Shuttle URL: `https://tensor-logic-noo5.shuttle.app`
- ✅ Domain ownership: `samkirk.com`
- ✅ Access to DNS management for `samkirk.com` (Microsoft 365 Admin Center)
- ✅ Shuttle CLI installed and authenticated

**What You'll Create:**
- CNAME record: `tensor-logic.samkirk.com` → `tensor-logic-noo5.shuttle.app`
- SSL certificate for HTTPS access

### Setup Procedure (Automated)

This streamlined procedure uses automation scripts wherever possible. Manual procedures are available as backups in the [Manual Procedures](#manual-procedures) section below.

**Prerequisites:**
- Build the automation scripts: `npm run build:scripts`
- Have your Shuttle URL ready (or get it in Step 1)

#### Step 1: Get Your Shuttle URL

```bash
cd backend/tensor-logic
shuttle project status
```

**Expected Output:**
```
Project info:
  Project ID: proj_01KCJDQWVDRP2A38R07R3M30F4
  Project Name: tensor-logic
  URIs:
    - https://tensor-logic-noo5.shuttle.app
```

**Note:** The chatbot can run this command automatically. Save the URL for use in subsequent steps.

#### Step 2: Add CNAME Record (Manual - Required)

Add a CNAME record at your DNS registrar:
- **Host:** `tensor-logic`
- **Points to:** `tensor-logic-noo5.shuttle.app` (your Shuttle URL from Step 1)

**Quick Reference:**
- **Microsoft 365 Admin Center:** See [Manual DNS Configuration](#manual-dns-configuration) below

**Note:** This is the only manual step required. All subsequent steps can be automated.

#### Step 3: Monitor DNS Propagation (Automated)

Use the automated script to monitor DNS propagation:

```bash
npm run build:scripts
node scripts/dist/check-dns-propagation.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

**What the script does:**
- Checks if DNS has already propagated (exits immediately if found)
- Polls every 5 minutes until the CNAME record is found
- Continues for up to 4 hours (48 attempts) by default
- Exits when propagation is complete or timeout is reached

**Timeline:** Typically 1-4 hours, but can take up to 24-48 hours.

**Alternative:** See [Manual DNS Checks](#manual-dns-checks) below if you prefer manual verification.

**Chatbot Assistance:** The chatbot can run this script automatically for you.

#### Step 4: Add SSL Certificate (Automated)

Once DNS has propagated (Step 3 completes), add the SSL certificate:

```bash
cd backend/tensor-logic
shuttle certificate add tensor-logic.samkirk.com
```

**Expected Output:**
```
Creating SSL certificate for tensor-logic.samkirk.com...
Certificate created successfully!

Your domain is now configured for HTTPS:
https://tensor-logic.samkirk.com
```

**If it fails:** DNS may not have propagated yet. Re-run Step 3 to verify, then retry.

**Chatbot Assistance:** The chatbot can run this command automatically once DNS propagation is confirmed.

#### Step 5: Verify Complete Setup (Automated)

Use the verification script to check all aspects of your domain configuration:

```bash
npm run build:scripts
node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

**What the script checks:**
1. DNS Resolution - Verifies domain resolves to IP addresses
2. CNAME Record - Verifies CNAME points to correct Shuttle URL
3. HTTP Access - Tests HTTP connectivity
4. HTTPS Access - Tests HTTPS connectivity
5. SSL Certificate - Verifies SSL certificate is valid and shows expiration date

**Expected Output:**
```
🔍 Verifying domain setup for: tensor-logic.samkirk.com
   Expected Shuttle URL: tensor-logic-noo5.shuttle.app

1. Checking DNS resolution...
2. Checking CNAME record...
3. Checking HTTP access...
4. Checking HTTPS access...
5. Checking SSL certificate...

📊 Verification Results:
────────────────────────────────────────────────────────────
✅ DNS Resolution: Domain resolves to: <IP addresses>
✅ CNAME Record: CNAME correctly points to: tensor-logic-noo5.shuttle.app
✅ HTTP Access: HTTP accessible (status: 200)
✅ HTTPS Access: HTTPS accessible (status: 200)
✅ SSL Certificate: SSL certificate valid (expires: <date>)
────────────────────────────────────────────────────────────

✅ All checks passed! Domain is properly configured.
```

**Alternative:** See [Manual Verification](#manual-verification) below if you prefer manual checks.

**Chatbot Assistance:** The chatbot can run this script automatically and provide a status report.

**Done!** Your domain should now be accessible at `https://tensor-logic.samkirk.com`

### Manual Procedures

The following sections provide detailed manual procedures as alternatives to the automated scripts above.

#### Manual DNS Configuration

**Microsoft 365 Admin Center:**

1. Go to: [admin.microsoft.com](https://admin.microsoft.com) or [admin.cloud.microsoft.com](https://admin.cloud.microsoft.com)
2. Navigate to: **Settings → Domains**
3. Click on `samkirk.com`
4. Click: **DNS records** or **Manage DNS**

5. **Using the Assisted Path:**
   - If you see an assisted path or guided wizard option, use it to add custom DNS records
   - The assisted path will guide you through adding a CNAME record step by step
   - This is the recommended approach as it simplifies the process

6. **Configure the CNAME record:**
   - **Type:** CNAME (or select from dropdown)
   - **Host name / Alias:** `tensor-logic` (without the domain - just `tensor-logic`)
   - **Points to address / Target:** `tensor-logic-noo5.shuttle.app` (without `https://` or trailing dot)
   - **TTL:** 3600 (1 hour) or leave default

7. Click **Save** or **Add** to complete the process

**Note:** If you don't see an assisted path option, look for a **"+ Add"** or **"Add record"** button, or scroll down past service-specific sections (Exchange, Skype, etc.) to find a **"Custom records"** or **"Other records"** section.

#### Manual DNS Checks

**Check CNAME Record:**

```bash
# Mac/Linux
dig CNAME tensor-logic.samkirk.com

# Expected output:
# tensor-logic.samkirk.com. 3600 IN CNAME tensor-logic-noo5.shuttle.app.

# macOS alternative
nslookup -type=CNAME tensor-logic.samkirk.com
```

**Online Tools:**
- https://dnschecker.org/
- https://www.whatsmydns.net/

Search for: `tensor-logic.samkirk.com` (Type: CNAME)

#### Manual Verification

**Step-by-Step Manual Checks:**

```bash
# 1. Check DNS Resolution
dig +short tensor-logic.samkirk.com

# 2. Check CNAME Record
dig CNAME +short tensor-logic.samkirk.com

# 3. Test HTTP Access
curl -I http://tensor-logic.samkirk.com

# 4. Test HTTPS Access
curl -I https://tensor-logic.samkirk.com

# 5. Test in Browser
# Visit: https://tensor-logic.samkirk.com
```

### Troubleshooting Domain Setup

**Problem: "shuttle certificate add" Fails**

**Error:** `Error: Failed to validate domain ownership`

**Solution (Automated):**
```bash
# Use the DNS propagation script to verify status
npm run build:scripts
node scripts/dist/check-dns-propagation.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app

# Once propagation is complete, retry certificate
shuttle certificate add tensor-logic.samkirk.com
```

**Causes:**
1. DNS hasn't propagated yet (most common)
2. CNAME record is incorrect
3. TTL is too long

**Chatbot Assistance:** The chatbot can run the DNS propagation script and retry the certificate command automatically once propagation is confirmed.

**Problem: Browser Shows Security Warning**

**Error:** "Your connection is not private" or "NET::ERR_CERT_COMMON_NAME_INVALID"

**Solution (Automated):**
```bash
# Use verification script to check certificate status
npm run build:scripts
node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

**Manual Fix:**
```bash
# List current certificates
shuttle certificate list

# If not present, add it
shuttle certificate add tensor-logic.samkirk.com

# If present but not working, delete and re-add
shuttle certificate delete tensor-logic.samkirk.com
shuttle certificate add tensor-logic.samkirk.com
```

**Chatbot Assistance:** The chatbot can check certificate status and fix issues automatically.

**Problem: Site Not Loading**

**Symptoms:** DNS_PROBE_FINISHED_NXDOMAIN or similar

**Solution (Automated):**

Use the verification script to diagnose all issues automatically:

```bash
npm run build:scripts
node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

The script will check:
1. CNAME record exists and points to correct Shuttle URL
2. Shuttle app is running and accessible
3. DNS resolution from your location
4. HTTP/HTTPS connectivity
5. SSL certificate status

**Manual Checks:**
```bash
# 1. Check CNAME record exists
dig CNAME tensor-logic.samkirk.com

# 2. Verify Shuttle app is running
curl https://tensor-logic-noo5.shuttle.app

# 3. Check DNS from multiple locations
# Use: https://dnschecker.org/
```

**Chatbot Assistance:** The chatbot can run the verification script automatically to diagnose issues.

### SSL Certificate Management

**List Certificates:**
```bash
shuttle certificate list
```

**Add Certificate:**
```bash
shuttle certificate add tensor-logic.samkirk.com
```

**Delete Certificate:**
```bash
shuttle certificate delete tensor-logic.samkirk.com
```

**Certificate Auto-Renewal:**

Shuttle automatically renews Let's Encrypt certificates before expiration (typically 90 days). No manual intervention needed.

**To Verify Renewal (Automated):**

Use the verification script which includes SSL certificate expiration:

```bash
npm run build:scripts
node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
```

The script will show the certificate expiration date in the SSL Certificate check.

**Manual Check:**
```bash
# Check certificate expiration
echo | openssl s_client -servername tensor-logic.samkirk.com \
  -connect tensor-logic.samkirk.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

**Chatbot Assistance:** The chatbot can run the verification script to check certificate expiration dates and renewal status automatically.

### Cost Considerations

**DNS Costs:**

**Microsoft 365:**
- DNS management included with Microsoft 365 subscription
- No additional cost for CNAME records

**Shuttle:**
- Custom domains: **Free** (included in all tiers)
- SSL certificates: **Free** (Let's Encrypt)

**Total Additional Cost:** $0/month

### Quick Reference Card

**Complete Setup Checklist (Automated):**

- [ ] Build scripts: `npm run build:scripts`
- [ ] Get Shuttle URL: `shuttle project status` (or use: `https://tensor-logic-noo5.shuttle.app`)
- [ ] Add CNAME record at DNS registrar (manual - see [Manual DNS Configuration](#manual-dns-configuration)):
  - Host: `tensor-logic`
  - Points to: `tensor-logic-noo5.shuttle.app`
- [ ] Monitor DNS propagation: `node scripts/dist/check-dns-propagation.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app`
- [ ] Add SSL: `shuttle certificate add tensor-logic.samkirk.com`
- [ ] Verify setup: `node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app`
- [ ] Test in browser: `https://tensor-logic.samkirk.com`

**Automation Scripts:**
- `scripts/check-dns-propagation.ts` - Monitor DNS propagation automatically
- `scripts/verify-domain-setup.ts` - Complete domain verification

**Chatbot Assistance:**
- Getting Shuttle URL automatically
- Running DNS propagation monitoring script
- Adding SSL certificates
- Running verification script
- Troubleshooting issues

**Support:**
- Shuttle Discord: https://discord.gg/shuttle
- Shuttle Docs: https://docs.shuttle.dev/
- Custom Domains: https://docs.shuttle.dev/docs/domain-names

---

**Document Version:** 1.0  
**Date:** 2025-12-16  
**Project:** tensor-logic  
**Domain:** tensor-logic.samkirk.com  
**Shuttle URL:** https://tensor-logic-noo5.shuttle.app

