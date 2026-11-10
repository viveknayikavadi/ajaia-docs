# Submission: Ajaia Docs

## Links

- **Live app:** https://ajaia-docs-xi-seven.vercel.app/
- **Walkthrough video:** https://www.loom.com/share/b62c680eb8ca45c2a05409be1da01a7d
- **Google Drive folder:** <PASTE_DRIVE_LINK>
- **Source repo (optional):** https://github.com/viveknayikavadi/ajaia-docs

## Test accounts (no password, pick one on the sign-in screen)

- alice@ajaia.test: owns "Welcome to Ajaia Docs"
- bob@ajaia.test: the welcome doc is shared with him
- carol@ajaia.test: use her to test sharing from scratch

## What is included

| Item | File / location |
|---|---|
| Source code | `app/`, `components/`, `lib/`, `prisma/`, `tests/` |
| Setup and run instructions | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| This file | `SUBMISSION.md` |
| Video link | `VIDEO_URL.txt` |
| Screenshots | `screenshots/` |
| Sample upload files | `samples/` |

## What is working end to end

- Create, rename, edit, autosave, and reopen documents
- Bold, italic, underline, headings, bulleted and numbered lists
- Upload .txt / .md / .docx → new editable document
- Owner shares by email; the shared user sees the document under "Shared with me" and can edit it
- Server-side access checks (strangers get a "no access" page or a 403)
- Persistence in Postgres, so everything survives a refresh
- Validation and error messages, plus 17 automated tests

## What is incomplete or intentionally left out

- No real-time co-editing; the last save wins
- Mocked authentication (seeded users, no passwords)
- One shared role (editor); there is no viewer-only role yet
- Images inside documents are not supported

## What I would build next with another 2–4 hours

1. Viewer vs. editor roles
2. Export to Markdown / PDF
3. Conflict detection on save
4. API integration tests with a test database
