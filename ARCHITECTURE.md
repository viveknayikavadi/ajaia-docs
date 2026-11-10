# Architecture Note

## Goal

Ship a small but complete product slice: a user can write a formatted document, import a file, share it with someone, and find everything again after a refresh. I chose depth in the core flow over many shallow features.

## Stack and why

| Choice | Reason |
|---|---|
| Next.js 14 (App Router) | Frontend and API in one project, so one deploy and fast iteration |
| TipTap (ProseMirror) | Solid rich-text editing out of the box; it avoids building an editor from scratch |
| PostgreSQL + Prisma | Real relational data for owners and shares; typed queries |
| Neon + Vercel | Free tiers, so reviewers pay for nothing |
| Zod | One place for input validation with clear error messages |
| Vitest | Fast tests for the core logic |

## Data model

- **User**: id, email, name
- **Document**: id, title, content (HTML), ownerId, timestamps
- **DocumentShare**: documentId + userId, unique together

Content is stored as the editor's HTML. This preserves formatting, TipTap loads it directly, and it is easy to export later. On load, TipTap re-parses the HTML against its schema, so unsupported tags (such as scripts) are dropped. Markdown imports also escape raw HTML.

## Access control

All rules live in `lib/access.ts` as pure functions, which makes them easy to test:

- **Owner:** edit, rename, share, delete
- **Shared user (editor):** view and edit content
- **Everyone else:** 403

Every API route loads the document and checks the caller's role on the server. The UI only reflects these rules; it doesn't enforce them.

## Authentication

Authentication is mocked: the user picks a seeded account, and the user id is stored in an httpOnly cookie. This keeps the focus on sharing logic, which the brief allows. In a real product this would be replaced with real auth (e.g. OAuth through Auth.js).

## Saving

The editor autosaves 800 ms after typing stops. It shows a save status ("Saving…", "All changes saved", "Not saved" with a Retry button), saves before navigating back, and warns before closing the tab with unsaved changes.

## Validation and errors

- Titles must be 1–200 characters. Content is capped at 500k characters.
- Share emails are validated and normalized. Sharing with an unknown user or with yourself is rejected.
- Uploads are checked for type, emptiness, and size (1 MB) on both client and server.
- The API always returns `{ error: "message" }` with the right status code, and the UI shows it.

## What I deprioritized, and why

| Cut | Reason |
|---|---|
| Real-time co-editing (CRDT/Yjs) | Large effort; it would compromise the core flow in the timebox. Last write wins for now. |
| Real authentication | The brief allows mocked users; sharing logic matters more here |
| Viewer vs. editor roles | Basic access was enough for the brief; the role system is ready to extend |
| Migrations (I use `prisma db push`) | Simpler for a one-schema prototype; I would switch to `prisma migrate` for production |
| Images in documents, comments, version history | Stretch features |

## What I'd build next with 2–4 more hours

1. Viewer/editor roles in the share dialog (the `Role` type already supports adding them)
2. Export to Markdown/PDF
3. Conflict detection by sending `updatedAt` with saves to avoid silent overwrites
4. API-level integration tests against a test database
5. Real auth
