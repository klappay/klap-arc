import type { Address, Hash, PublicClient, WalletClient } from "viem";

import { PUSH_SPLIT_ABI, PUSH_SPLIT_FACTORY_ABI } from "./abi.js";
import { getChainAddresses } from "./addresses.js";
import type { Split } from "./types.js";

const ZERO_SALT = `0x${"0".repeat(64)}` as const;

export type ArcSplitsClient = {
  predictSplitAddress: (split: Split, owner: Address, salt?: Hash) => Promise<Address>;
  isSplitDeployed: (split: Split, owner: Address, salt?: Hash) => Promise<{ address: Address; exists: boolean }>;
  createSplit: (split: Split, owner: Address, creator: Address) => Promise<Hash>;
  createSplitDeterministic: (split: Split, owner: Address, creator: Address, salt: Hash) => Promise<Hash>;
  distribute: (splitAddress: Address, split: Split, token: Address, distributor: Address) => Promise<Hash>;
};

export function createArcSplitsClient(
  chainId: number,
  publicClient: PublicClient,
  walletClient: WalletClient,
): ArcSplitsClient {
  const addresses = getChainAddresses(chainId);
  const factory = addresses.pushSplitFactory as Address;

  return {
    async predictSplitAddress(split, owner, salt = ZERO_SALT) {
      return publicClient.readContract({
        address: factory,
        abi: PUSH_SPLIT_FACTORY_ABI,
        functionName: "predictDeterministicAddress",
        args: [split, owner, salt],
      });
    },

    async isSplitDeployed(split, owner, salt = ZERO_SALT) {
      const [address, exists] = await publicClient.readContract({
        address: factory,
        abi: PUSH_SPLIT_FACTORY_ABI,
        functionName: "isDeployed",
        args: [split, owner, salt],
      });
      return { address, exists };
    },

    async createSplit(split, owner, creator) {
      return walletClient.writeContract({
        address: factory,
        abi: PUSH_SPLIT_FACTORY_ABI,
        functionName: "createSplit",
        args: [split, owner, creator],
        chain: walletClient.chain,
        account: walletClient.account ?? null,
      });
    },

    async createSplitDeterministic(split, owner, creator, salt) {
      return walletClient.writeContract({
        address: factory,
        abi: PUSH_SPLIT_FACTORY_ABI,
        functionName: "createSplitDeterministic",
        args: [split, owner, creator, salt],
        chain: walletClient.chain,
        account: walletClient.account ?? null,
      });
    },

    async distribute(splitAddress, split, token, distributor) {
      return walletClient.writeContract({
        address: splitAddress,
        abi: PUSH_SPLIT_ABI,
        functionName: "distribute",
        args: [split, token, distributor],
        chain: walletClient.chain,
        account: walletClient.account ?? null,
      });
    },
  };
}
