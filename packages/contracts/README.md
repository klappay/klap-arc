# @klap-arc/contracts

An unmodified fork of `0xSplits/splits-contracts-monorepo`'s `packages/splits-v2`
contracts, deployed independently on Arc. See the repo root
[`README.md`](../../README.md) for why this exists and
[`docs/research.md`](../../docs/research.md) for the research it's based on.

**`src/vendored/` is never hand-edited.** See `vendor-manifest/UPSTREAM.json`
for the exact upstream commit it's pulled from, and `CLAUDE.md` at the repo
root for the rule.

## Setup

```bash
# 1. External Solidity dependencies, pinned to the exact versions the
#    pinned upstream commit itself depends on (packages/splits-v2's own
#    package.json: @openzeppelin/contracts ^4.9.3, solady ^0.0.156 — NOT
#    their latest tags, which are a major version ahead and won't compile
#    against solc 0.8.23, see below). Deliberately NOT `forge install` —
#    that registers each dep as a real git submodule (.gitmodules + a
#    gitlink in the index), which bypasses .gitignore entirely and
#    re-stages itself every time someone runs it again. This script does a
#    plain tarball download into lib/ instead, same idea as vendor.sh's own
#    approach to the 0xSplits source itself.
pnpm install-deps

# 2. Pull the vendored 0xSplits sources from the pinned upstream commit
#    (already done once for this scaffold — re-run after bumping the
#    pinned commit in vendor-manifest/UPSTREAM.json)
pnpm vendor

# 3. Build — verified clean (exit 0) against solc 0.8.23 pinned in
#    foundry.toml (auto_detect_solc = false, matching upstream's own
#    foundry.toml exactly — OpenZeppelin's current default branch needs
#    ^0.8.24 and will fail loudly if installed unpinned instead of @v4.9.3).
pnpm build
```

## Deploying

The deployer key never touches a `.env` file or the shell's environment —
it lives in forge's own encrypted keystore, same as upstream 0xSplits' own
deploy scripts do (`--account SPLITS_V2_DEPLOYER`):

```bash
cast wallet import klap-arc-deployer --interactive   # once, ever
cp .env.sample .env   # fill in DEPLOYER (that wallet's address) + RPC URLs
source .env

pnpm deploy:testnet   # Arc testnet, chain 5042002
pnpm deploy:mainnet   # Arc mainnet, chain 5042 — real USDC gas, real funds
```

`DEPLOYER` must be the exact address the `klap-arc-deployer` keystore signs
with — `DeployKlapArc.s.sol` broadcasts explicitly *as* `DEPLOYER`
(`vm.startBroadcast(deployer)`), so forge itself refuses to proceed on a
mismatch. This matters more than it looks: CreateX's own guarded-salt check
doesn't revert on a mismatched deployer, it silently falls back to an
*unguarded* salt and deploys somewhere else with no error — verified by
reading CreateX's `_parseSalt`/`_guard` source directly. The explicit
`vm.startBroadcast(deployer)` (not a bare `vm.startBroadcast()`) is what
actually prevents that, not just the `--sender` flag.

`script/DeployKlapArc.s.sol` deploys `SplitsWarehouse`, `PullSplitFactory`,
and `PushSplitFactory` via [CreateX](https://github.com/pcaversaccio/createx)
`deployCreate3` — already live on Arc at `0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`,
no bootstrap needed. All three use a `klap-arc`-namespaced salt (see the
script), independent of upstream's own salts — **these addresses will not
match 0xSplits' own eventual official Arc deployment**, see the root
README's "What this deliberately is NOT" section.

Successful deploys are recorded in `deployments/{chainId}.json`, matching
upstream's own format. After deploying, copy those addresses into
`packages/sdk/src/addresses.ts`.
