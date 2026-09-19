<img src="./docs/public/logo.png" alt="Klappay" width="80" />
<img src="./docs/public/arc-logo.png" alt="Arc" width="80" />

# klap-arc

> **⚠️ Temporary by design.** This project exists only until
> [0xSplits](https://splits.org) ships official support for
> [Circle's Arc](https://arc.network). The day that happens, this repo's
> contracts are meant to be retired in favor of 0xSplits' own official
> deployment and `@0xsplits/splits-sdk` — see [`docs/migration.md`](docs/migration.md).
> It is not, and was never meant to be, a long-term replacement for 0xSplits.

A temporary, **100% open-source**, self-hosted deployment of 0xSplits'
splitter contracts on Arc — because 0xSplits does not run there yet. Every
contract here is either an unmodified fork of 0xSplits' own audited source,
or plainly original deploy/client code — deliberately reusing as much of
0xSplits itself as possible (their exact contracts, their exact pinned
dependency versions, their own CreateX deployment infrastructure) rather
than writing custom split logic, specifically to keep the security bar as
close to 0xSplits' own as this stopgap can get.

See [`docs/research.md`](docs/research.md) for the full research this
project is based on, and
[0xSplits/splits-contracts-monorepo#77](https://github.com/0xSplits/splits-contracts-monorepo/issues/77)
for the (open, unassigned, as of 2026-09-18) community request for official
Arc support — Circle's own DevRel team filed it and offered to help, so
official support may land at any time. Check that issue before doing anything
with this repo.

## Why this exists

Arc (Circle's USDC-native, EVM-compatible L1, chain ID `5042`, mainnet live
since 2026-09-16) launched without 0xSplits support. Klappay Core's payment
model depends on 0xSplits for non-custodial split addresses — see
`klap-core`'s `klap-payments-ledger` and `klap-settlement-distribution`
skills. Until 0xSplits deploys there themselves, any product that wants
split-based payouts on Arc needs its own instance of the same, unmodified
contracts.

## What this is, concretely

- An **unmodified fork** of `0xSplits/splits-contracts-monorepo`'s
  `packages/splits-v2` contracts (`SplitsWarehouse`, `PushSplitFactory`,
  `PullSplitFactory`, and their dependencies), pinned to upstream commit
  [`d31b827`](https://github.com/0xSplits/splits-contracts-monorepo/commit/d31b827990301cac49bb5bbe32157a812ca120ce)
  (2026-09-14) — vendored via a script, never hand-copied, so it's always
  possible to diff against a real upstream commit. See
  [`packages/contracts/README.md`](packages/contracts/README.md).
- Deployed **by us** on Arc, using
  [CreateX](https://github.com/pcaversaccio/createx) — the same
  deterministic CREATE2/CREATE3 factory 0xSplits itself uses for cross-chain
  address consistency, already live on Arc mainnet at the canonical address
  `0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`. No bootstrap step needed.
- A thin TypeScript SDK (`@klappay/arc-splits`, MIT) shaped closely after
  `@0xsplits/splits-sdk`'s own call surface, so swapping the underlying
  package later is close to a one-line change everywhere it's consumed.
- The same **lazy, counterfactual deployment pattern** `klap-core` already
  uses with real 0xSplits: a split's address is predicted off-chain before
  anything is deployed, and the actual `SplitWalletV2` contract is only
  created on first use. Nothing about this repo changes that pattern —
  it changes which factory computes and eventually deploys to that address.

## What this deliberately is NOT

**Our deployed addresses will not match whatever address 0xSplits' own
eventual official Arc deployment ends up at.** 0xSplits' `SplitsWarehouse`
salt (see `packages/contracts/script/DeployKlapArc.s.sol` for the mechanism)
is deployer-address-gated in CreateX's guarded-salt scheme — only *their*
specific deployer key can reproduce their cross-chain address. We deploy
with our own key and our own salt namespace, so this is a **separate,
parallel, fully-compatible instance**, not a placeholder squatting their
future address. Two consequences:

1. Anything still in the *predicted-but-undeployed* state when 0xSplits
   ships real Arc support costs nothing to migrate — recompute the
   prediction against the real factory and start using that address
   instead. Nothing was ever created under the old one.
2. Anything **already deployed** (funds actually sent, `SplitWalletV2`
   actually created) against this fork's factory needs an explicit sweep —
   it lives on a contract we control, not one 0xSplits will ever recognize.
   `docs/migration.md` has the runbook. Every address this SDK hands out is
   tagged with which factory generated it for exactly this reason — see
   `packages/sdk/src/addresses.ts`.

## Structure

```
packages/
  contracts/   GPL-3.0 — the vendored 0xSplits contracts + our deploy script
  sdk/         MIT — the TypeScript client any app (klap-core included) consumes
docs/
  research.md    the research behind this project (chain facts, license, CreateX)
  migration.md    how to cut over once 0xSplits ships official Arc support
  .vitepress/     the docs site (pnpm docs:dev / pnpm docs:build) — dark theme, same as klap-node
```

## License

GPL-3.0, inherited from `0xSplits/splits-contracts-monorepo` (`packages/contracts`
is a fork of GPL-3.0 code and stays GPL-3.0; `packages/sdk` is original code
and is MIT — the same split `klap-core` uses between its own proprietary code
and the MIT-licensed `@klappay/types` package, see `klap-core`'s
`klap-licensing` skill). See [`LICENSE`](LICENSE).
