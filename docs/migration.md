# Migration to official 0xSplits Arc support

Run this the day
[0xSplits/splits-contracts-monorepo#77](https://github.com/0xSplits/splits-contracts-monorepo/issues/77)
closes, or a `5042.json`/`5042002.json` file appears under
`packages/splits-v2/deployments/` in their repo — whichever happens first.

## 1. Confirm the official deployment

Check `0xSplits/splits-contracts-monorepo/packages/splits-v2/deployments/5042.json`
(mainnet) directly, and cross-check the addresses resolve on-chain (real
bytecode, not an empty account) before trusting them.

## 2. Split every consumer's split addresses into two buckets

Every address this repo's SDK ever handed out is tagged with the factory
that generated it (`packages/sdk/src/addresses.ts`'s `source` field —
`'klap-arc-temporary'`). For each one, check on-chain whether a
`SplitWalletV2` actually exists there yet (`eth_getCode` != `0x`):

- **Not yet deployed** (still counterfactual): free. Recompute the
  prediction against the official `@0xsplits/splits-sdk` config for chain
  `5042`/`5042002` and start handing out the new address instead. Nothing
  to migrate — nothing was ever created under the old one.
- **Already deployed** (something was actually created and possibly funded):
  needs an explicit sweep. This fork's `SplitWalletV2` is a real, live
  contract that 0xSplits' official infrastructure will never index or
  recognize — it's ours to operate for as long as it holds funds.
  - Call `distribute()` against the split still on `klap-arc`'s factory to
    pay out whatever's there under the current recipients.
  - Once empty, stop directing new payments to it; any new charge/payout
    for that same recipient set gets a fresh address from the official
    0xSplits deployment going forward.

## 3. Swap the SDK

In every consumer (`klap-core` included, wherever it currently points at
`@klappay/arc-splits`): replace the import with `@0xsplits/splits-sdk`, pointed at
chain `5042` (or `5042002` for testnet). The method surface was deliberately
kept close (`predictSplitAddress`, `createSplit`, `distribute`) specifically
to make this swap mechanical, not a rewrite.

## 4. Retire this repo

Once every `klap-arc`-sourced split address above has been swept (step 2)
and no consumer imports `@klappay/arc-splits` anymore, archive this repo. Leave
`packages/contracts/deployments/*.json` in place in the final commit — it's
the permanent record of which addresses this fork ever controlled, in case
a stray payment shows up at one of them years later.

## 5. Consider contributing upstream

If Circle's DevRel offer in issue #77 is still open, the deploy tooling in
`packages/contracts/script/` and the research in `docs/research.md` are
useful groundwork for whoever ends up doing the official 0xSplits Arc
deployment — worth offering, not just deleting.
