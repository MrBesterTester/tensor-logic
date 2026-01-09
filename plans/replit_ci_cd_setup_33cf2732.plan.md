---
name: Replit CI/CD Setup
overview: Set up CI/CD pipeline to deploy from local project → GitHub → Replit, replacing the current Shuttle deployment with Replit static site hosting.
todos:
  - id: create-replit-docs
    content: Create docs/REPLIT_SETUP.md with manual setup instructions for Replit project creation, deployment setup, and API token generation
    status: completed
  - id: update-github-workflow
    content: Update .github/workflows/ci.yml to replace Shuttle deployment with Replit deployment using Deployments API
    status: completed
  - id: update-ci-cd-docs
    content: Update docs/CI_CD.md to replace Shuttle deployment sections with Replit deployment instructions
    status: completed
  - id: update-readme-files
    content: Update README.md and README_dev.md to reflect Replit deployment instead of Shuttle
    status: completed
  - id: verify-build-config
    content: Verify vite.config.ts build output is compatible with Replit static hosting requirements
    status: completed
---

# Replit CI/CD Pipeline Setup

<!-- TOC -->

- [Overview](#overview)
- [Current State](#current-state)
- [Architecture](#architecture)
- [Implementation Steps](#implementation-steps)
  - [1. Replit Project Setup (Manual Steps Required)](#1-replit-project-setup-manual-steps-required)
  - [2. Update Build Configuration](#2-update-build-configuration)
  - [3. Update GitHub Actions Workflow](#3-update-github-actions-workflow)
  - [4. Remove Shuttle-Specific Code](#4-remove-shuttle-specific-code)
  - [5. Update Documentation](#5-update-documentation)
- [Key Considerations](#key-considerations)
- [Files to Modify](#files-to-modify)
- [Files to Potentially Remove/Archive](#files-to-potentially-remove-archive)
- [Implementation Decisions Made](#implementation-decisions-made)
- [Testing Plan](#testing-plan)

<!-- /TOC -->
## Overview

This plan sets up a CI/CD pipeline that automatically deploys the Tensor Logic web app to Replit when changes are pushed to GitHub. The pipeline will replace the current Shuttle deployment with Replit static site hosting.

## Current State

- Project is a static frontend (TypeScript/Vite) that builds to `backend/tensor-logic/dist/`
- Currently deployed to Shuttle via GitHub Actions using `shuttle-hq/deploy-action@v2`
- Build output configured for Shuttle's Rust backend structure
- GitHub Actions workflow at `.github/workflows/ci.yml` includes Shuttle deployment

## Architecture

```
Local Project → git push → GitHub → GitHub Actions → Replit Deployments API → Replit Hosting
```

## Implementation Steps

### 1. Replit Project Setup (Manual Steps Required)

**Files to create/update:**

- Create `docs/REPLIT_SETUP.md` with manual setup instructions

**Manual steps user must complete:**

1. Create a new Replit project at replit.com
2. Choose "Static Site" or "HTML/CSS/JS" template
3. Connect the Replit project to the GitHub repository
4. Set up a deployment in Replit (Autoscale or Reserved VM)
5. Generate a Replit API token from account settings
6. Get the deployment ID from Replit deployment settings
7. Add `REPLIT_DEPLOY_TOKEN` and `REPLIT_DEPLOYMENT_ID` secrets to GitHub

### 2. Update Build Configuration

**Files to update:**

- `vite.config.ts` - May need adjustment if Replit requires different output structure
- Consider if we need a simple server file for Replit (e.g., `replit.nix` or `package.json` start script)

**Changes:**

- Verify build output location is compatible with Replit
- If Replit needs files in root `dist/` instead of `backend/tensor-logic/dist/`, update Vite config
- Add any Replit-specific configuration files if needed

### 3. Update GitHub Actions Workflow

**File to update:**

- `.github/workflows/ci.yml`

**Changes:**

- Remove the Shuttle deployment job
- Add new Replit deployment job that:
  - Builds the frontend (`npm run build`)
  - Uses Replit Deployments API to trigger deployment
  - Uses `REPLIT_DEPLOY_TOKEN` and `REPLIT_DEPLOYMENT_ID` secrets
  - Only runs on pushes to `main` branch

**New deployment job structure:**

```yaml
deploy-replit:
  needs: build-and-test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  steps:
  - Checkout code
  - Setup Node.js
  - Build frontend
  - Deploy to Replit via API
```

### 4. Remove Shuttle-Specific Code

**Files to potentially update:**

- `backend/tensor-logic/src/main.rs` - May keep for local dev, but not needed for Replit
- `backend/tensor-logic/Shuttle.toml` - Can be kept for reference or removed
- `docs/CI_CD.md` - Update to reflect Replit instead of Shuttle

**Decision needed:**

- Keep Rust backend for local development/testing?
- Or remove entirely if Replit handles static hosting directly?

### 5. Update Documentation

**Files to update:**

- `docs/CI_CD.md` - Replace Shuttle sections with Replit deployment instructions
- `README.md` - Update deployment information
- `README_dev.md` - Update deployment section

**New documentation should include:**

- Replit project setup steps
- How to get deployment ID and API token
- GitHub secrets configuration
- Deployment workflow explanation

## Key Considerations

1. **MCP Server**: Replit doesn't have a built-in MCP server for deployment automation. We'll use the Replit Deployments API directly via GitHub Actions.

2. **Static Site Hosting**: Replit can host static HTML files directly. We may not need the Rust backend for production, but it could be useful for local development.

3. **Build Output**: Current build goes to `backend/tensor-logic/dist/`. Need to verify if Replit expects files in a different location or if we need to copy them.

4. **Deployment Trigger**: Replit Deployments API uses a POST request to trigger deployments. The API endpoint is: `https://api.replit.com/v0/deployments/{deployment-id}`

5. **Secrets Management**: User must manually add `REPLIT_DEPLOY_TOKEN` and `REPLIT_DEPLOYMENT_ID` to GitHub repository secrets.

## Files to Modify

1. `.github/workflows/ci.yml` - Replace Shuttle deployment with Replit deployment
2. `docs/CI_CD.md` - Update deployment documentation
3. `docs/REPLIT_SETUP.md` - New file with Replit setup instructions
4. `README.md` - Update deployment URL/info
5. `README_dev.md` - Update deployment section

## Files to Potentially Remove/Archive

1. `backend/tensor-logic/Shuttle.toml` - No longer needed for production (keep for reference?)
2. Consider if Rust backend is still needed or can be simplified

## Implementation Decisions Made

1. **Rust Backend**: Kept as legacy code for reference, marked in documentation but not removed
2. **Build Output**: Kept existing `backend/tensor-logic/dist/` location - Replit can be configured to serve from this directory
3. **Documentation**: Created comprehensive `docs/REPLIT_SETUP.md` with step-by-step manual setup instructions
4. **Workflow**: Replaced Shuttle deployment job with Replit deployment using curl to call Deployments API
5. **Custom Domain Section**: Left in CI_CD.md but marked as Shuttle-specific for reference

## Testing Plan

1. User completes manual Replit setup steps
2. Push a test commit to trigger the workflow
3. Verify deployment succeeds in GitHub Actions
4. Verify app is accessible on Replit URL
5. Test that subsequent pushes trigger automatic deployments