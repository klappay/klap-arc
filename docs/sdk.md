# SDK

`@klappay/arc-splits` (MIT) is a thin [viem](https://viem.sh)-based client,
shaped close to
[`@0xsplits/splits-sdk`](https://www.npmjs.com/package/@0xsplits/splits-sdk)'s
own call surface so swapping to the real package later (see
[Migration](/migration)) touches as little consumer code as possible.

Scoped deliberately narrow — only the deterministic-salt create/predict
flow, since the lazy, address-known-in-advance pattern is the whole point
of this package.

## Usage

```ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { ARC_MAINNET_CHAIN_ID, createArcSplitsClient } from '@klappay/arc-splits'

const publicClient = createPublicClient({ transport: http('https://rpc.arc.io') })
const walletClient = createWalletClient({ transport: http('https://rpc.arc.io'), account })

const splits = createArcSplitsClient(ARC_MAINNET_CHAIN_ID, publicClient, walletClient)

const split = {
  recipients: [merchantAddress, treasuryAddress],
  allocations: [990_000n, 10_000n],
  totalAllocation: 1_000_000n,
  distributionIncentive: 0,
}

// Predicted off-chain, costs nothing — the counterfactual/lazy address.
const address = await splits.predictSplitAddress(split, ownerAddress, salt)

// Only actually deploys the SplitWalletV2 the first time this is called.
await splits.createSplitDeterministic(split, ownerAddress, creatorAddress, salt)
```

`getChainAddresses` (used internally) throws if a chain either has no
registry entry, or has one whose addresses are still `null` — nothing's
been deployed there yet. This package refuses to silently hand out a
placeholder address that doesn't point at a real, deployed factory.

Full package docs: [`packages/sdk/README.md`](https://github.com/klappay/klap-arc/blob/main/packages/sdk/README.md).
