# Research behind this project

Done 2026-09-18, for the question "can we run 0xSplits-equivalent splits on
Arc before 0xSplits supports it themselves, using the same lazy/counterfactual
deploy pattern klap-core already relies on?" Answer: yes, and here's the
evidence.

## Arc itself

- EVM-compatible Layer-1 built by Circle for stablecoin finance. USDC is the
  native gas token. Sub-second finality on Malachite BFT consensus.
- Testnet chain ID `5042002`, live since 2025-10-28.
- **Mainnet chain ID `5042`, live since 2026-09-16** — two days before this
  research, which is why 0xSplits hasn't caught up yet.
- Standard EVM tooling works: Foundry, Hardhat, viem all confirmed supported.

Sources: [crypto.news mainnet launch](https://crypto.news/circle-arc-mainnet-launches-with-usdc-gas/),
[Arc docs](https://docs.arc.io/arc-chain),
[cryptotimes.io](https://www.cryptotimes.io/2026/09/16/circles-usdc-native-layer-1-blockchain-arc-goes-live-on-mainnet/).

## 0xSplits does not support Arc yet

- No `5042.json` or `5042002.json` in
  `0xSplits/splits-contracts-monorepo`'s `packages/splits-v2/deployments/`
  as of commit `d31b827` (2026-09-14).
- [Issue #77](https://github.com/0xSplits/splits-contracts-monorepo/issues/77),
  filed by Circle/Arc's own DevRel (Elton Tay), asks 0xSplits to add Arc
  Testnet to their dashboard and offers to help. **Open, unassigned, no
  maintainer response** as of 2026-09-18. This is the single thing to watch —
  when it closes or a `5042.json` deployment file appears upstream, this
  whole repo is done.

## 0xSplits' contracts are forkable

- `packages/splits-v2` (the current, `SplitsWarehouse`/`SplitWalletV2`-based
  version — what actually matters, their older `splits-contracts` repo is
  legacy) is **GPL-3.0**, confirmed from the repo's own `LICENSE` file.
  Forking, redeploying, and publishing the fork as open source is exactly
  what GPL-3.0 permits and expects.
- `@0xsplits/splits-sdk` (their TypeScript client) is **MIT**.
- `packages/contracts` in this repo mirrors the GPL-3.0 obligation;
  `packages/sdk` (original code, not a fork) is MIT — see this repo's
  `README.md` for why that split is deliberate.

## The deterministic-deployment prerequisite already exists on Arc

This is what makes the "lazy" pattern possible at all — the whole reason it's
worth doing this project instead of shrugging and using a plain, per-deploy
CREATE address:

- 0xSplits deploys `SplitsWarehouse` via
  [CreateX](https://github.com/pcaversaccio/createx)'s `deployCreate3`, at
  the canonical CreateX factory address `0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`
  (confirmed identical `SplitsWarehouse` address across Base (`8453`) and
  Arbitrum (`42161`) deployment records — proof the pattern works as
  documented, not just in theory).
- **CreateX is already deployed on Arc mainnet**, at that same canonical
  address — a PR
  ([pcaversaccio/createx#339](https://github.com/pcaversaccio/createx/pull/339))
  added Arc to CreateX's own multi-chain deployment list. We don't need to
  bootstrap anything; CREATE3 deployment is available on Arc today.
- Their factories (`PushSplitFactory`/`PullSplitFactory`) are deployed with
  plain `CREATE2` tied to their own deployer EOA's address — **not** CreateX
  — which is exactly why our fork can't land on their eventual address (see
  README's "What this deliberately is NOT" section). Our own deploy script
  (`packages/contracts/script/DeployKlapArc.s.sol`) uses CreateX/CREATE3 for
  every contract, including the factories, specifically to avoid tying our
  own addresses to one specific deployer key going forward.

## What "lazy" means here, concretely

Two distinct things, both real:

1. **Deploy-time laziness** (the pattern klap-core already has): a split's
   address is computed off-chain via CREATE2/CREATE3 prediction before any
   contract exists at it. The actual `SplitWalletV2` only gets created the
   first time someone actually calls `createSplit`/`createSplitDeterministic`
   — exactly mirroring `klap-core`'s existing non-custodial split address
   model (see `klap-core`'s `gotchas.md`, the 0xSplits `createSplit`+
   `distribute` non-atomicity note).
2. **Vendoring laziness**: this repo never hand-copies 0xSplits' Solidity
   source through a summarizing tool — that would risk silent transcription
   errors in security-critical code. `packages/contracts/scripts/vendor-contracts.sh`
   pulls the exact bytes from a pinned upstream commit instead, so the fork
   is always mechanically diffable against a real commit hash, not
   reconstructed from memory.
