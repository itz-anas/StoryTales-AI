# 📚 StoryTales-AI — AI-Powered eBook Creator

> A full-stack AI-powered eBook creation platform where users can describe their book idea, generate chapter outlines with AI, write full chapter content with real-time streaming, and preview their book in a realistic page-flipping format.

![StoryTales-AI](https://img.shields.io/badge/StoryTales-AI-indigo?style=for-the-badge)
![Bun](https://img.shields.io/badge/Bun-1.3.13-black?style=for-the-badge&logo=bun)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Turso](https://img.shields.io/badge/Turso-SQLite-teal?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=for-the-badge&logo=google)

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | [Vercel Deployment](https://storytalesai.vercel.app/) |
| **Backend** | [Render Deployment](https://storytales-ai.onrender.com) |

---

## ✨ Features

- 🤖 **AI Book Outline Generation** — Describe your idea and get a full chapter outline instantly
- ⚡ **Streaming Chapter Content** — Watch AI write your chapters in real-time
- 📖 **Page-Flip Preview** — Read your book in a realistic page-flipping format
- 🎨 **Dark Themed UI** — Beautiful dark grainy interface with genre-based card colors
- 💾 **Persistent Storage** — All books and chapters saved permanently in Turso cloud database
- ✏️ **Rich Text Editor** — Edit and refine AI-generated content
- 🖼️ **Cover Image Support** — Add custom cover images to your books
- 📥 **Export as Markdown** — Download your book as a `.md` file
- 🌙 **Genre Color Coding** — Each genre gets its own unique gradient color

---

## 🗂️ Project Structure

```
StoryTales-AI/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx        # Home page — book library
│   │   │   ├── Editor.tsx           # Chapter editor with AI generation
│   │   │   ├── Preview.tsx          # Page-flip book preview
│   │   │   └── Wizard.tsx           # Book creation wizard
│   │   ├── services/
│   │   │   └── api.ts               # API service layer
│   │   ├── App.tsx                  # Main app with routing
│   │   ├── types.ts                 # TypeScript types
│   │   └── index.css                # Tailwind styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.ts                 # Express entry point + DB init
│   │   ├── db.ts                    # Turso database layer
│   │   └── routes/
│   │       └── book.ts              # API routes + AI integration
│   ├── .env.example                 # Environment variable template
│   └── package.json
│
├── railway.toml                     # Railway deployment config
├── package.json                     # Root scripts
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| react-pageflip | Book page flip animation |
| lucide-react | Icons |
| streamdown | Markdown streaming renderer |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | HTTP server & routing |
| Bun | JavaScript runtime |
| Vercel AI SDK | AI streaming integration |
| Google Gemini 2.5 Flash | AI model for content generation |
| Zod | Schema validation |

### Database
| Technology | Purpose |
|---|---|
| Turso (LibSQL) | Cloud-hosted SQLite database |
| @libsql/client | Turso client for Node/Bun |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Turso Cloud | Database hosting |

---

## 🗄️ Database Schema

```sql
-- Books table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  created_at INTEGER NOT NULL
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  outline TEXT NOT NULL,
  content TEXT,
  sort_order INTEGER NOT NULL,
  is_complete INTEGER DEFAULT 0
);
```

---

## 🚀 Local Development Setup

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) v1.0+
- A [Google AI Studio](https://aistudio.google.com/) API key
- A [Turso](https://turso.tech/) account (free)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/itz-anas/StoryTales-AI
cd StoryTales-AI
```

---

### Step 2 — Install all dependencies

```bash
npm run install:all
```

This installs both frontend and backend packages.

---

### Step 3 — Setup Turso Database

1. Sign up at [app.turso.io](https://app.turso.io)
2. Create a new database named `storytale`
3. Get your **Database URL** and **Auth Token**

---

### Step 4 — Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```

> ⚠️ Never commit `.env` to GitHub. It is already in `.gitignore`.

---

### Step 5 — Run the development servers

You need **2 terminals**:

**Terminal 1 — Backend:**
```bash
cd server
bun run src/index.ts
```

Expected output:
```
✅ Database connected to Turso
🚀 Server running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
Local: http://localhost:3000
```

---

### Step 6 — Open the app

Go to **http://localhost:3000** in your browser 🎉

---

## 🌍 Production Deployment

### Backend — Deploy on Render

1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `bun install`
   - **Start Command:** `bun run src/index.ts`
5. Add environment variables:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY = your_key
   TURSO_DATABASE_URL           = libsql://your-db.turso.io
   TURSO_AUTH_TOKEN             = your_token
   ```
6. Click **Deploy**
7. Copy your Render URL → e.g. `https://storytales-ai.onrender.com`

---

### Frontend — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"** → Import your repo
3. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL = https://your-render-backend.onrender.com
   ```
5. Click **Deploy** 🎉

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/books` | Get all books |
| `GET` | `/api/books/:id` | Get a single book with chapters |
| `POST` | `/api/books` | Create a new book with AI-generated outline |
| `POST` | `/api/books/:id/chapters/:chapterId/generate` | Stream chapter content generation |
| `PUT` | `/api/books/:id/chapters/:chapterId` | Update chapter content |
| `PUT` | `/api/books/:id/cover` | Update book cover image |
| `POST` | `/api/books/:id/chapters` | Add a custom chapter |
| `DELETE` | `/api/books/:id` | Delete a book |
| `DELETE` | `/api/books/:id/chapters/:chapterId` | Delete a chapter |

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key from [AI Studio](https://aistudio.google.com/) | ✅ Yes |
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://...`) | ✅ Yes |
| `TURSO_AUTH_TOKEN` | Turso authentication token | ✅ Yes |
| `PORT` | Server port (default: 3001) | ❌ Optional |

### Client (`client/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend URL for production | ✅ Production only |

---

## 📜 Available Scripts

### Root
```bash
npm run dev          # Start both frontend and backend concurrently
npm run build        # Build the frontend for production
npm run start        # Start the backend server
npm run install:all  # Install all dependencies
```

### Client
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server
```bash
bun run src/index.ts        # Start server
bun run --watch src/index.ts # Start with hot reload
```

---


## 📄 License

MIT License — feel free to use this project for your own AI-powered applications!

---

## 🙏 Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) for the AI model
- [Turso](https://turso.tech/) for the cloud SQLite database
- [Vercel AI SDK](https://sdk.vercel.ai/) for streaming AI integration
- [react-pageflip](https://nodlik.github.io/react-pageflip/) for the book preview

---

