# Deployment & Setup Manual for Portfolio Site & Admin CMS

This document outlines the step-by-step instructions to configure **Supabase**, lock down security permissions, run initial migrations, and deploy both the **Public Portfolio Site** (Netlify) and the **Admin CMS Panel** (Vercel) on free tiers.

---

## 1. Supabase Database & Storage Setup

### A. Execute Database Schema Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** tab on the left sidebar.
3. Open `supabase_schema.sql` (found in the root of this repository).
4. Paste the SQL code into the editor and click **Run**.
5. This creates the following tables, triggers, policies, and storage buckets:
   - Tables: `projects`, `project_media`, `team_members`, `site_settings`
   - Row Level Security (RLS): Anonymous `anon` role can ONLY `SELECT` published rows (`is_published = true`); `authenticated` admin role has full CRUD capabilities.
   - Storage Bucket: `portfolio-assets` (Public read, authenticated write).

---

### B. Lock Down Public Sign-ups (CRITICAL SECURITY REQUIREMENT)
> [!CAUTION]
> To prevent unauthorized users from creating accounts and gaining `authenticated` CRUD permissions:
> 1. In Supabase Dashboard, navigate to **Authentication -> Settings**.
> 2. Scroll down to **User Signups**.
> 3. **Disable / Toggle OFF** `Allow new users to sign up`.
> 4. Save settings.

---

### C. Create Single Admin User
1. In Supabase Dashboard, navigate to **Authentication -> Users**.
2. Click **Add User** -> **Create User**.
3. Enter your desired Admin Email and a strong Password.
4. Click **Create User**.
5. Use these credentials to sign in to the **Admin CMS Panel**.

---

## 2. Public Site Configuration & Netlify Deployment (Free Tier)

### Local Environment Testing
To test Supabase data fetching on the static portfolio site locally:
1. Open `js/supabase-config.js`.
2. Enter your `SUPABASE_URL` and `SUPABASE_ANON_KEY`:
   ```javascript
   window.SUPABASE_URL = "https://your-project.supabase.co";
   window.SUPABASE_ANON_KEY = "your-anon-key";
   ```
3. Open `index.html` in your browser.

### Netlify Deployment
1. Log in to [Netlify](https://netlify.com).
2. Click **Add new site** -> **Import an existing project**.
3. Select GitHub/GitLab and pick `portfolio-team`.
4. Configure Build Settings:
   - **Build Command**: *(Leave empty)*
   - **Publish Directory**: `.` (Root directory)
5. Click **Deploy Site**.
6. (Optional) In Netlify **Site configuration -> Environment variables**, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## 3. Admin CMS Panel Configuration & Vercel Deployment (Free Tier)

### Local Development
1. Navigate to the `admin/` directory:
   ```bash
   cd admin
   ```
2. Create `.env` file inside `admin/`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Access the admin panel at `http://localhost:5173`. Sign in with your admin email and password.

---

### Vercel Deployment
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`portfolio-team`).
4. In project configuration:
   - **Root Directory**: Select `admin`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - Key: `VITE_SUPABASE_URL`, Value: `https://your-project.supabase.co`
   - Key: `VITE_SUPABASE_ANON_KEY`, Value: `your-anon-key`
6. Click **Deploy**.

---

## 4. Key Features Summary
- **Public RLS Enforcement**: Unauthenticated visitors can only view published projects (`is_published = true`).
- **Video Embed Support**: Supports `media_type` of `'video_embed'` (YouTube/Vimeo/Loom URLs) to conserve your 1GB free storage limit.
- **Storage Cleanup on Delete**: Deleting a project, media item, or team avatar automatically removes the file from the `portfolio-assets` storage bucket.
- **Drag-to-Reorder**: Reordering projects or team members instantly updates `sort_order` in Supabase.
