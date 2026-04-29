import { Router, type Request, type Response } from "express";
import { generateObject, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {
  insertBook,
  insertChapter,
  updateChapterContent,
  updateBookCover,
  getAllBooks,
  getBookById,
  getChaptersByBookId,
  deleteBook,
  deleteChapter,
  type BookRow,
  type ChapterRow,
} from "../db.js";

const router = Router();

// --- Helpers ---
function mapChapterRow(row: ChapterRow) {
  return {
    id: row.id,
    title: row.title,
    outline: row.outline,
    content: row.content || "",
    isGenerating: false,
    isComplete: row.is_complete === 1,
  };
}

function mapBookRow(book: BookRow, chapters: ChapterRow[]) {
  return {
    id: book.id,
    title: book.title,
    genre: book.genre,
    targetAudience: book.target_audience,
    description: book.description,
    coverImage: book.cover_image || undefined,
    chapters: chapters.map(mapChapterRow),
    createdAt: book.created_at,
  };
}

// --- Routes ---

// GET /api/books
router.get("/books", async (_req: Request, res: Response) => {
  try {
    const books = await getAllBooks();
    const result = books.map((b) => ({
      id: b.id,
      title: b.title,
      genre: b.genre,
      targetAudience: b.target_audience,
      description: b.description,
      coverImage: b.cover_image,
      createdAt: b.created_at,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// GET /api/books/:id
router.get("/books/:id", async (req: Request, res: Response) => {
  try {
    const book = await getBookById(req.params.id);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    const chapters = await getChaptersByBookId(book.id);
    res.json(mapBookRow(book, chapters));
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// POST /api/books
router.post("/books", async (req: Request, res: Response) => {
  const { title, genre, targetAudience, description } = req.body;

  if (!title || !genre || !targetAudience) {
    res.status(400).json({ error: "title, genre, and targetAudience are required" });
    return;
  }

  try {
    const outlineSchema = z.array(
      z.object({
        chapterTitle: z.string(),
        chapterDescription: z.string(),
      })
    );

    const prompt = `Create a comprehensive table of contents for a book.
Title: ${title}
Genre: ${genre}
Target Audience: ${targetAudience}
Description: ${description}

Return a list of 5-12 chapters. For each chapter, provide a title and a brief 1-sentence description of what happens or is discussed in that chapter.`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: outlineSchema,
      prompt,
    });

    const bookId = crypto.randomUUID();
    const book: BookRow = {
      id: bookId,
      title,
      genre,
      target_audience: targetAudience,
      description: description || "",
      cover_image: null,
      created_at: Date.now(),
    };

    await insertBook(book);

    // Insert all chapters
    for (const [index, item] of object.entries()) {
      const chapterRow: Omit<ChapterRow, "content"> & { content?: string } = {
        id: crypto.randomUUID(),
        book_id: bookId,
        title: item.chapterTitle,
        outline: item.chapterDescription,
        sort_order: index,
        is_complete: 0,
      };
      await insertChapter(chapterRow);
    }

    const savedChapters = await getChaptersByBookId(bookId);
    res.json(mapBookRow(book, savedChapters));
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// POST /api/books/:id/chapters/:chapterId/generate
router.post("/books/:id/chapters/:chapterId/generate", async (req: Request, res: Response) => {
  const { id: bookId, chapterId } = req.params;

  try {
    const book = await getBookById(bookId);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const chapters = await getChaptersByBookId(bookId);
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) {
      res.status(404).json({ error: "Chapter not found" });
      return;
    }

    const chapterIndex = chapters.findIndex((c) => c.id === chapterId);
    const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined;
    const previousContext = previousChapter?.content || undefined;

    const prompt = `You are writing a book titled "${book.title}".
Context/Description: ${book.description}

Write the full content for the chapter titled: "${chapter.title}".
Chapter Goal: ${chapter.outline}

${previousContext ? `The previous chapter ended with: ${previousContext.slice(-500)}... Connect smoothly if applicable.` : ""}

Write in valid Markdown format. Use headings (##) for sections within the chapter if needed. Do not include the Chapter Title as an H1, just start writing the content.
Tone: Professional, engaging, and appropriate for the genre.
Length: Approximately 800-1500 words.`;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    let fullText = "";

    for await (const chunk of result.textStream) {
      fullText += chunk;
      res.write(chunk);
      if (typeof (res as any).flush === "function") {
        (res as any).flush();
      }
    }

    res.end();

    // Save to Turso after streaming
    await updateChapterContent(chapterId, fullText, true);
  } catch (error) {
    console.error("Error generating chapter:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate chapter" });
    } else {
      res.end();
    }
  }
});

// PUT /api/books/:id/cover
router.put("/books/:id/cover", async (req: Request, res: Response) => {
  const { coverImage } = req.body;
  if (!coverImage) {
    res.status(400).json({ error: "coverImage is required" });
    return;
  }
  try {
    await updateBookCover(req.params.id, coverImage);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cover" });
  }
});

// PUT /api/books/:id/chapters/:chapterId
router.put("/books/:id/chapters/:chapterId", async (req: Request, res: Response) => {
  const { content } = req.body;
  if (typeof content !== "string") {
    res.status(400).json({ error: "content (string) is required" });
    return;
  }
  try {
    await updateChapterContent(req.params.chapterId, content, true);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update chapter" });
  }
});

// POST /api/books/:id/chapters
router.post("/books/:id/chapters", async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }
  try {
    const chapterId = crypto.randomUUID();
    const chapters = await getChaptersByBookId(req.params.id);
    const chapter: Omit<ChapterRow, "content"> & { content?: string } = {
      id: chapterId,
      book_id: req.params.id,
      title,
      outline: "Custom added chapter",
      sort_order: chapters.length,
      is_complete: 0,
    };
    await insertChapter(chapter);
    res.json(mapChapterRow(chapter as ChapterRow));
  } catch (error) {
    res.status(500).json({ error: "Failed to add chapter" });
  }
});

// DELETE /api/books/:id
router.delete("/books/:id", async (req: Request, res: Response) => {
  try {
    await deleteBook(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// DELETE /api/books/:id/chapters/:chapterId
router.delete("/books/:id/chapters/:chapterId", async (req: Request, res: Response) => {
  try {
    await deleteChapter(req.params.chapterId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chapter" });
  }
});

export default router;