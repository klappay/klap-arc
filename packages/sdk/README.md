# @klappay/arc-splits

> **⛔ Deprecated.** 0xSplits officially supports Arc since 2026-10-02 —
> use [`@0xsplits/splits-sdk`](https://www.npmjs.com/package/@0xsplits/splits-sdk)
> (6.7.0 or later) instead. See the repo root's
> [`docs/migration.md`](../../docs/migration.md).

MIT. A thin [viem](https://viem.sh)-based client for the `klap-arc` fork of
0xSplits' contracts, deliberately shaped close to
[`@0xsplits/splits-sdk`](https://www.npmjs.com/package/@0xsplits/splits-sdk)'s
own call surface so swapping to the real package later (see the repo root's
[`docs/migration.md`](../../docs/migration.md)) touches as little consumer
code as possible.

Scoped deliberately narrow: only the **deterministic-salt** create/predict
flow (`createSplitDeterministic`/`predictDeterministicAddress(salt)`), not
0xSplits' nonce-based `createSplit`/`predictDeterministicAddress()` overload
— the whole point of this package is the lazy, address-known-in-advance
pattern `klap-core` already relies on with real 0xSplits, so that's the only
flow worth wrapping here.

## Usage

```ts
import { createPublicClient, createWalletClient, http } from "viem";
import { ARC_MAINNET_CHAIN_ID, createArcSplitsClient } from "@klappay/arc-splits";

const publicClient = createPublicClient({ transport: http("https://rpc.arc.io") });
const walletClient = createWalletClient({ transport: http("https://rpc.arc.io"), account });

const splits = createArcSplitsClient(ARC_MAINNET_CHAIN_ID, publicClient, walletClient);

const split = {
  recipients: [merchantAddress, treasuryAddress],
  allocations: [990_000n, 10_000n],
  totalAllocation: 1_000_000n,
  distributionIncentive: 0,
};

// Predicted off-chain, costs nothing — the counterfactual/lazy address.
const address = await splits.predictSplitAddress(split, ownerAddress, salt);

// Only actually deploys the SplitWalletV2 the first time this is called.
await splits.createSplitDeterministic(split, ownerAddress, creatorAddress, salt);
```

`getChainAddresses` (used internally) throws if a chain either has no
registry entry, or has one whose addresses are still `null` — i.e. nothing's
been deployed there yet via `packages/contracts`' deploy script. That's
deliberate: this package refuses to silently hand out a placeholder address
that doesn't point at a real, deployed factory.
