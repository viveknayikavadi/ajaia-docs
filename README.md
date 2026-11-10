# Ajaia Docs

A lightweight collaborative document editor inspired by Google Docs, built for the Ajaia AI-Native Full Stack Developer assignment.

**Live app:** https://ajaia-docs-xi-seven.vercel.app/
**Walkthrough video:** see `VIDEO_URL.txt`

## Features

- Create, rename, edit, autosave, and reopen documents
- Rich text: bold, italic, underline, headings (H1–H3), bulleted and numbered lists, quotes, undo/redo
- File upload: import a **.txt, .md, or .docx** file (max 1 MB) as a new editable document
- Sharing: the owner shares a document by email; shared users can view and edit it
- The dashboard separates **My documents** from **Shared with me**
- Data is stored in Postgres, so documents, formatting, and sharing survive a refresh

## Demo accounts

There are no passwords. Pick an account on the sign-in screen (mocked auth, as the brief allows).

| Name | Email |
|---|---|
| Alice Johnson | alice@ajaia.test |
| Bob Smith | bob@ajaia.test |
| Carol Lee | carol@ajaia.test |

The seed creates "Welcome to Ajaia Docs", owned by Alice and shared with Bob.

**How to test sharing:** sign in as Alice and open a document. Click **Share** and enter `carol@ajaia.test`. Then click **Switch user** and sign in as Carol. The document appears under **Shared with me**.

## Tech stack

Next.js 14 (App Router, TypeScript) · TipTap editor · Prisma · PostgreSQL (Neon free tier) · Zod · Vitest · Vercel

## Run locally

Requirements: Node.js 18.18+ (20 recommended) and a Postgres database. A free Neon database works, or local Postgres.

```bash
# 1. Install dependencies
npm install

# 2. Configure the database
cp .env.example .env
# edit .env and set DATABASE_URL

# 3. Create the tables and the demo users
npm run db:push
npm run db:seed

# 4. Start the app
npm run dev
# open http://localhost:3000
```

## Tests

```bash
npm test
```

The 17 tests cover access rules (owner / shared / no access), file import (type checks, Markdown and text conversion, HTML escaping), and input validation.

## Deploy (Vercel + Neon)

1. Create a free Postgres database at https://neon.tech and copy the connection string.
2. Push this repo to GitHub, then import it in Vercel.
3. In Vercel → Settings → Environment Variables, add `DATABASE_URL`.
4. From your machine, with the same `DATABASE_URL` in `.env`, run `npm run db:push` and `npm run db:seed` once.
5. Deploy. The build command (`prisma generate && next build`) is already set in `package.json`.

## Supported upload types

`.txt`, `.md`, and `.docx`, up to 1 MB. Other types are rejected with a clear message in the UI and in the API. For `.docx`, text formatting, headings, and lists are imported, but images and complex layout are not.

## Project structure

```
app/                 pages (dashboard, login, document) and API routes
  api/documents      list / create / get / save / rename / delete
  api/documents/[id]/shares   share, list, and remove access
  api/import         file upload → new document
  api/session        mocked sign-in / sign-out
components/          editor, toolbar, share dialog, buttons
lib/                 access rules, validation, import conversion, db, auth
prisma/              schema and seed script
tests/               Vitest tests
samples/             example files for trying the upload
```
