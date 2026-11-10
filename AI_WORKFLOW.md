# AI Workflow Note

> Edit this note so it matches what you actually did. Replace every [bracketed] part with your own real experience. Reviewers check that it is honest and specific.

## Tools used

- **Claude (Anthropic)**: reading the brief, planning scope, generating the first version of the code and docs
- [Add others you used, e.g. GitHub Copilot or Cursor in the editor]

## Where AI materially sped up the work

- Turning the brief into a prioritized plan and a time budget
- Scaffolding: the Prisma schema, API routes, and the TipTap editor and toolbar
- Writing the first version of the tests and documentation

## What I changed or rejected

- [Example: the AI first suggested SQLite. I rejected it because Vercel's filesystem doesn't persist, and switched to Neon Postgres.]
- [Example: I changed X in the editor/toolbar because Y.]
- [Example: I removed or simplified Z because it was out of scope.]
- [Add anything you fixed after testing it yourself.]

## How I verified correctness, UX quality, and reliability

- Ran `npm test`, which checks access rules, import conversion, and validation (17 tests)
- Ran `tsc` and `next build` with no errors
- Manually tested the full flow on the live URL in two browser sessions as Alice and Carol: create, format, refresh, rename, share, and open as the shared user
- Checked the error paths: uploading a `.png`, sharing with an unknown email, an empty title, and opening another user's document URL (gets "no access")
- [Add anything else you checked, e.g. mobile view or keyboard shortcuts]

## Principle

I used AI to move faster, but I made the decisions about scope, data model, and access rules myself, and I tested every flow before submitting.
