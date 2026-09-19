# Contracts

`packages/contracts` is an **unmodified** fork of
[`0xSplits/splits-contracts-monorepo`](https://github.com/0xSplits/splits-contracts-monorepo)'s
`packages/splits-v2` — `SplitsWarehouse`, `PushSplitFactory`,
`PullSplitFactory`, and their dependencies — pinned to a specific upstream
commit and vendored by a script, never hand-copied. GPL-3.0, inherited from
upstream. See [Research](/research) for why no source changes were needed
on Arc (unlike [klap-tron](https://github.com/klappay/klap-tron), where a
one-byte patch is required for TRON's TVM).

## Setup

```bash
pnpm install-deps   # forge-std, OpenZeppelin v4.9.3, solady v0.0.156 — a
                     # plain tarball download into lib/, not `forge install`
                     # (which registers real git submodules and bypasses
                     # .gitignore)
pnpm vendor          # pulls packages/splits-v2/src from the pinned commit
pnpm build           # forge build
```

## Deploying

Deployed via [CreateX](https://github.com/pcaversaccio/createx) —
already live on Arc mainnet at the canonical address
`0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`, no bootstrap step needed —
using a `klap-arc`-namespaced salt. **These addresses will not match
0xSplits' own eventual official Arc deployment** — see the root
[README's "What this deliberately is NOT"](https://github.com/klappay/klap-arc#what-this-deliberately-is-not)
section for why, and [Migration](/migration) for what that means
operationally.

```bash
pnpm deploy:testnet   # Arc testnet, chain 5042002
pnpm deploy:mainnet   # Arc mainnet, chain 5042
```

Full setup, remappings, and CI details:
[`packages/contracts/README.md`](https://github.com/klappay/klap-arc/blob/main/packages/contracts/README.md).
