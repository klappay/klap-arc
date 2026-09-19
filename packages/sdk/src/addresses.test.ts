import { describe, expect, it } from "vitest";

import { ARC_MAINNET_CHAIN_ID, ARC_TESTNET_CHAIN_ID, getChainAddresses } from "./addresses.js";

describe("getChainAddresses", () => {
  it("throws for a chain with no registry entry at all", () => {
    expect(() => getChainAddresses(1)).toThrow(/no address registry/);
  });

  it("returns real, deployed addresses for Arc mainnet — deployed 2026-09-19, independently verified on-chain (see addresses.ts's own comment)", () => {
    const addresses = getChainAddresses(ARC_MAINNET_CHAIN_ID);
    expect(addresses.splitsWarehouse).toBe("0xa516E0C89F7f8265AD6789488f46BB9CA6Ab3A4E");
    expect(addresses.pushSplitFactory).toBe("0x4b4Ef8227474fE52a8bBB9183Ecf52f4D072B3F3");
    expect(addresses.pullSplitFactory).toBe("0xb80249B742CB30390af2b2F13D55A7A3ca60C97B");
  });

  it("returns the identical addresses for mainnet and testnet — expected, not a bug: CreateX's CREATE3 address depends only on deployer + salt, not chainId, and both deployments used the same deployer wallet and fixed salts", () => {
    const mainnet = getChainAddresses(ARC_MAINNET_CHAIN_ID);
    const testnet = getChainAddresses(ARC_TESTNET_CHAIN_ID);
    expect(mainnet.splitsWarehouse).toBe(testnet.splitsWarehouse);
    expect(mainnet.pushSplitFactory).toBe(testnet.pushSplitFactory);
    expect(mainnet.pullSplitFactory).toBe(testnet.pullSplitFactory);
  });
});
