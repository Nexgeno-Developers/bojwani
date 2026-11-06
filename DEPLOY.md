# Deployment notes (Linux / PM2)

## Why table names are mapped to lowercase

MySQL on Windows (and macOS) stores table names in lowercase (`lower_case_table_names=1`), so a
database created locally contains `setting`, `navitem`, `legalsection`, ... When that database is
copied to a Linux server, the names stay lowercase, and on Linux table names are case-sensitive.

Every model in `prisma/schema.prisma` therefore has an explicit `@@map("lowercase_name")`.
Without it Prisma queries `Setting`, `NavItem`, ... and fails with
`P2021: The table 'Setting' does not exist in the current database`.

Index and foreign-key names are pinned with `map:` to the names that already exist in the
database, so the schema matches the database exactly and no database change is needed.

## Deploying to production (`/var/www/bojwani`, PM2 process `bojwani`)

Read-only checks first. These never modify the database:

```bash
cd /var/www/bojwani
git pull                     # or upload the changed files
npm install                  # also runs "prisma generate" (postinstall)
npm run db:check-drift       # expect: "No difference detected."
npm run db:verify            # expect: OK for all 9 models
```

Then build and restart:

```bash
npm run build                # runs "prisma generate" then "next build"
pm2 restart bojwani
pm2 logs bojwani --lines 50  # should show no PrismaClientKnownRequestError / P2021
```

Do **not** run `prisma db push`, `prisma migrate reset` or `npm run db:reset` on production.
None of them are needed for this fix.

## Rollback (code only, data is never touched)

The fix only changes `prisma/schema.prisma` (plus two npm scripts and `scripts/verify-db.cjs`),
so rolling back is just going back to the previous code and rebuilding:

```bash
cd /var/www/bojwani
git log --oneline -5         # find the previous commit
git checkout <previous-commit> -- prisma/schema.prisma package.json
npm run build && pm2 restart bojwani
```
