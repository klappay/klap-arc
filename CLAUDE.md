# klap-arc

**Deprecated as of 2026-10-05.** 0xSplits shipped official Arc support
(v2.2 factories on `5042`/`5042002`, 2026-10-02,
[0xSplits/splits-contracts-monorepo#77](https://github.com/0xSplits/splits-contracts-monorepo/issues/77))
and `klap-core` already moved onto it. Don't add features here; the only
legitimate work left is `docs/migration.md` (sweeping splits that were
actually deployed through this fork's factory) and retiring the repo.

## Rules specific to this repo

- **`packages/contracts/src/vendored/**` is never hand-edited.** It's pulled
  verbatim from a pinned upstream commit by
  `packages/contracts/scripts/vendor-contracts.sh` — see
  `packages/contracts/vendor-manifest/UPSTREAM.json` for the exact commit.
  If upstream fixes a bug we need, re-run the vendor script against a newer
  pinned commit; don't patch the vendored file in place. A genuine
  klap-arc-specific need (different constructor args, a different salt
  scheme) belongs in `packages/contracts/script/DeployKlapArc.s.sol`, which
  is ours, not vendored.
- **`packages/contracts` stays GPL-3.0, `packages/sdk` stays MIT.** Don't
  move code between them in a way that blurs that boundary — see the
  README's license section for why.
- **Never claim our deployed addresses match, or will match, 0xSplits' own
  future official Arc deployment.** They won't — see README's "What this
  deliberately is NOT". Every address `packages/sdk` hands out carries a
  `source` tag for exactly this reason; a new address-producing code path
  needs that tag too.
- **This project deliberately reuses as much of 0xSplits itself as
  possible** (their exact contracts, their exact pinned dependency
  versions, their own CreateX deployer) — that's a security decision, not
  laziness. Don't introduce custom split/accounting logic here; if
  something 0xSplits' contracts don't do is needed, that's a sign this
  repo isn't the right place for it.

## Gotchas

- **Never run `forge install` for the pinned Solidity dependencies
  (forge-std/OpenZeppelin/solady) — use `pnpm install-deps`.** `forge
  install` registers each dependency as a real git submodule (`.gitmodules`
  + a gitlink in the index), which bypasses `.gitignore` entirely and
  re-stages itself into the index every single time it's run again, no
  matter how many times it's been `git rm --cached`'d before. Confirmed
  recurring, not a one-off, across multiple sessions. `install-solidity-deps.sh`
  does a plain tarball download into `lib/` instead, same approach
  `vendor-contracts.sh` already uses for the 0xSplits source itself — this
  is the permanent fix, not a workaround to repeat.
- **`DeployKlapArc.s.sol` broadcasts explicitly as `vm.startBroadcast(deployer)`,
  never a bare `vm.startBroadcast()` — don't "simplify" that back.**
  CreateX's guarded-salt check doesn't revert when the broadcasting signer
  doesn't match the `DEPLOYER` address baked into the salt — it silently
  falls back to computing an *unguarded* salt and deploys somewhere else
  with no error at all. The explicit signer argument is what makes forge
  itself refuse to proceed on a mismatch, since nothing on the Solidity
  side would ever catch it otherwise.

## Rules ported from `klap-core` (the same reasoning applies here)

- **Commits — Conventional Commits, English, authored as the person driving
  the session.** Never attribute a commit to `CLAUDE.md`, to Claude, or to
  any AI persona — no `Co-Authored-By: Claude` (or similar) trailer, ever.
  Every commit message follows Conventional Commits (`feat:`, `fix:`,
  `refactor:`, `docs:`, `chore:`, `test:`, etc.), in English regardless of
  what language the conversation happened in. When asked to commit: run
  `git status`/`git diff` first to see everything pending, not just the
  most recently touched files; split into separate commits along real
  seams rather than bundling unrelated changes or over-splitting a single
  cohesive change.
- **No comments in code, ever**, with one narrow exception: a genuinely
  non-obvious gotcha (a framework/platform quirk, a deliberate
  simplification) that naming and structure alone can't convey —
  `patches/tron-create2-prefix.patch`-style comments in `klap-tron` are
  the bar to match, not a license to narrate what code does.
- **Default to parallelizing independent work** — independent file
  reads/edits, independent investigations, parallel tool calls in one
  message. Never leave scratch/coordination files behind once the
  parallelized work is done.
