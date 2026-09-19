import type { ChainAddresses } from "./types.js";

export const ARC_MAINNET_CHAIN_ID = 5042;
export const ARC_TESTNET_CHAIN_ID = 5042002;

export const KLAP_ARC_ADDRESSES: Record<number, ChainAddresses> = {
  [ARC_MAINNET_CHAIN_ID]: {
    chainId: ARC_MAINNET_CHAIN_ID,
    network: "Arc mainnet",
    source: "klap-arc-temporary",
    splitsWarehouse: null,
    pushSplitFactory: null,
    pullSplitFactory: null,
  },
  [ARC_TESTNET_CHAIN_ID]: {
    chainId: ARC_TESTNET_CHAIN_ID,
    network: "Arc testnet",
    source: "klap-arc-temporary",
    splitsWarehouse: "0xa516E0C89F7f8265AD6789488f46BB9CA6Ab3A4E",
    pushSplitFactory: "0x4b4Ef8227474fE52a8bBB9183Ecf52f4D072B3F3",
    pullSplitFactory: "0xb80249B742CB30390af2b2F13D55A7A3ca60C97B",
  },
};

export function getChainAddresses(chainId: number): ChainAddresses {
  const addresses = KLAP_ARC_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`klap-arc has no address registry for chain ${chainId}`);
  }
  if (!addresses.splitsWarehouse || !addresses.pushSplitFactory) {
    throw new Error(
      `Chain ${chainId} has no deployed klap-arc contracts yet — run packages/contracts' deploy script and fill in the null addresses here first.`,
    );
  }
  return addresses;
}
