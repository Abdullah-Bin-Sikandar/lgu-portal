# 🚀 How to Deploy YPDC LGU Portal on Vercel

The project has been fully configured for Vercel with:
- **`vercel.json`**: Configures frontend build output (`frontend/dist`), SPA route rewrites (no 404 on page refresh), and `/api/*` serverless routing.
- **`api/index.js`**: Serverless adapter running Express API routes seamlessly on Vercel Functions.
- **`backend/config/db.js`**: Connection caching enabled for Vercel cold/warm starts.

---

## 📋 Required Environment Variables in Vercel
Before or after deploying, add these in your Vercel Project Settings (under **Settings ➔ Environment Variables**):

| Key | Example Value | Description |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/lgu_portal?retryWrites=true&w=majority` | MongoDB Atlas cloud database connection URI |
| `JWT_SECRET` | `ypdc_lgu_production_secret_key_2026` | Secure secret for JWT auth |
| `ADMIN_EMAIL` | `admin@lgu.edu.pk` | Initial administrator login email |
| `ADMIN_PASSWORD` | `Admin@LGU2024` | Initial administrator password |
| `NODE_ENV` | `production` | Environment mode |

> ⚠️ **Note on MongoDB**: Local `localhost:27017` will not work on Vercel cloud servers. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and paste the connection string into `MONGO_URI`.

---

## 🌟 Method 1: Deploy via GitHub (Recommended)

1. Push your project to GitHub:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```
2. Open [vercel.com](https://vercel.com/) and sign in.
3. Click **"Add New..."** ➔ **"Project"**.
4. Import your GitHub repository.
5. In **Environment Variables**, add the 5 variables listed in the table above.
6. Click **"Deploy"**.
7. Your app will be live with a URL like `https://ypdc-lgu-portal.vercel.app`.

---

## 💻 Method 2: Deploy using Vercel CLI

Run this command in the project root directory:
```bash
npx vercel
```
1. Follow the interactive prompts to log in and link your project.
2. When prompted:
   - Link to existing project? **No (N)**
   - What's your project's name? **ypdc-lgu-portal**
   - In which directory is your code located? **`./`**
3. Once linked, deploy to production:
   ```bash
   npx vercel --prod
   ```

