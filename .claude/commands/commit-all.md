Before committing, check whether /run-cleanup has been executed since the last code change in this conversation. If it has not, ask the user if they want to run /run-cleanup before proceeding.

If the user confirms they want to skip cleanup or cleanup has already been done, proceed with the following:
1. Run `git status` to see all uncommitted changes
2. Run `git diff HEAD` to review what will be committed
3. Confirm the current branch with the user before staging anything
4. Stage all changed files by name (avoid `git add -A` or `git add .`)
5. Commit with a clear message describing the changes
6. End the commit message with:
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
