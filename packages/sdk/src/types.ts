import type { Address } from "viem";

export type Split = {
  recipients: Address[];
  allocations: bigint[];
  totalAllocation: bigint;
  distributionIncentive: number;
};

export type AddressSource = "klap-arc-temporary" | "0xsplits-official";

export type ChainAddresses = {
  chainId: number;
  network: string;
  source: AddressSource;
  splitsWarehouse: Address | null;
  pushSplitFactory: Address | null;
  pullSplitFactory: Address | null;
};
