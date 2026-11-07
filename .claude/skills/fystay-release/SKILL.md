---
name: fystay-release
description: FYStay's release workflow. Use for any change to the repo. Commit work in bundles and push nothing on its own. Push to the preview branch only when the owner says "push to preview" (then send the preview link). Merge to Production only when the owner says "push to production".
---

# FYStay release workflow (owner's rule, 7 Nov 2026)

The owner reviews the site, not the commits. Keep changes local until asked.

## Default: build and commit, don't push

- Work on `claude/affectionate-meitner-5a9q99`.
- Make changes in logical bundles. Run the checks for each bundle (typecheck, lint, the relevant unit tests). Run the full checks (unit tests, lint, typecheck, build, and the end-to-end suite when UI or flows changed) before a bundle is called ready.
- Commit each finished bundle with a clear message. Do **not** push after each commit.
- Don't open pull requests.
- Tell the owner briefly what is committed and ready. Don't ask for permission to keep working.

## "push to preview"

1. Push the branch: `git push -u origin claude/affectionate-meitner-5a9q99` (retry on network errors only, with backoff).
2. Find the Preview deployment for that commit (Vercel `list_deployments` for the branch, or the branch's Preview URL). Wait until it is Ready. If the build fails, fix it on the branch, push again, and say so.
3. Send the owner the Preview link, and a line on what changed since the last preview.

## "push to production"

Production is `claude/airbnb-competitor-1fjjpk`. Merging it deploys live. Only do this when the owner says "push to production" for the bundle named in that request.

1. Confirm the Preview for the exact commit is Ready and the owner has seen it (they said so, or they asked for production after a preview).
2. Check for database migrations in the bundle (`prisma/migrations`). If there are any, stop and tell the owner: the migration is run through the Production migration workflow and needs their go-ahead. Don't run it yourself.
3. Merge the reviewed commit into `claude/airbnb-competitor-1fjjpk` (fast-forward where possible), push, and watch the Production deployment until it is Ready.
4. Check `/api/health` returns ok, and report the result.

## Never without an explicit request

- Pushing to any branch other than the working branch.
- Merging into the Production branch.
- Running production migrations, changing live settings, or changing credentials.
- Pushing the same bundle twice without a change in it.
