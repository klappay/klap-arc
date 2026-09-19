import { describe, expect, it } from "vitest";

import { ARC_MAINNET_CHAIN_ID, getChainAddresses } from "./addresses.js";

describe("getChainAddresses", () => {
  it("throws for a chain with no registry entry at all", () => {
    expect(() => getChainAddresses(1)).toThrow(/no address registry/);
  });

  it("throws for a registered chain whose contracts haven't been deployed yet", () => {
    expect(() => getChainAddresses(ARC_MAINNET_CHAIN_ID)).toThrow(/no deployed klap-arc contracts yet/);
  });
});
