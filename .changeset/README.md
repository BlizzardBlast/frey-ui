# Changesets

Use `pnpm changeset` when a package change should trigger a version bump.

Release flow:

1. Create one or more changesets in feature branches.
2. Merge to `main`.
3. The release workflow opens/updates a version PR.
4. Merging the version PR publishes changed public packages to npm.
