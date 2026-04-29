# AI eBook Creator

An AI-powered eBook creation platform where users can describe their book idea, generate chapter outlines with AI, and then generate full chapter content with streaming. Built with a full-stack architecture for persistent storage and scalability.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Express + Bun + Vercel AI SDK + Google Gemini |
| Database | SQLite (via `bun:sqlite`) |

## Features

- **AI-Powered Book Outline Generation**: Describe your book idea and get a comprehensive chapter outline
- **Streaming Chapter Content**: Generate full chapter content with real-time streaming
- **Interactive Editor**: Edit and refine generated content with a rich text editor
- **Book Preview**: Preview your book in a realistic page-flipping format
- **Persistent Storage**: All your books and chapters are saved in the database
- **Custom Chapters**: Add custom chapters to your book
- **Cover Image Generation**: Generate AI cover images for your books
- **Dark/Light Mode**: Comfortable writing experience

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) v1.0+
- Google Generative AI API key — get one at [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

### 1. Install dependencies

```bash
cd ai-ebook-creator
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Running the App

### Development mode

```bash
npm run dev
```

This starts both the server (port 3001) and client (port 3000) concurrently.

### Production mode

```bash
# Build frontend
cd client
npm run build

# Start server
cd ../server
bun run src/index.ts
```

### Open the app

Go to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-ebook-creator/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components (Dashboard, Wizard, Editor, Preview)
│   │   ├── services/        # API service layer
│   │   ├── App.tsx          # Main app component
│   │   ├── types.ts         # TypeScript types
│   │   └── index.css        # Tailwind styles
│   ├── package.json
│   └── vite.config.ts       # Vite config with API proxy
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.ts         # Express entry point
│   │   ├── db.ts            # SQLite database layer
│   │   └── routes/
│   │       └── book.ts      # API routes + AI integration
│   ├── .env.example         # Environment variable template
│   └── package.json
└── package.json             # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get a single book with chapters |
| POST | `/api/books` | Create a new book with AI-generated outline |
| POST | `/api/books/:id/chapters/:chapterId/generate` | Stream chapter content generation |
| PUT | `/api/books/:id/chapters/:chapterId` | Update chapter content |
| PUT | `/api/books/:id/cover` | Update book cover image |
| POST | `/api/books/:id/chapters` | Add a custom chapter |
| DELETE | `/api/books/:id` | Delete a book |
| DELETE | `/api/books/:id/chapters/:chapterId` | Delete a chapter |

## Usage

1. **Create a New Book**: Click "Create New Book" and fill in the book details (title, genre, target audience, description)
2. **Generate Outline**: AI will generate a comprehensive chapter outline based on your description
3. **Generate Chapters**: Click "Generate" on any chapter to create full content with AI streaming
4. **Edit Content**: Use the rich text editor to refine and customize the generated content
5. **Preview**: Preview your book in a realistic page-flipping format
6. **Save Changes**: All changes are automatically saved to the database

## Technology Highlights

- **Server-Sent Events**: Real-time streaming of AI-generated content
- **Optimistic UI Updates**: Immediate feedback while content is being generated
- **Type-Safe**: Full TypeScript coverage for type safety
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Persistence**: SQLite for reliable data storage
- **Modern Stack**: Built with the latest React 19, Vite, and Bun

## License

MIT License - feel free to use this project for your own AI-powered applications!
