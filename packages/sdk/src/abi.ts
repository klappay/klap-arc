export const SPLIT_STRUCT_COMPONENTS = [
  { name: "recipients", type: "address[]" },
  { name: "allocations", type: "uint256[]" },
  { name: "totalAllocation", type: "uint256" },
  { name: "distributionIncentive", type: "uint16" },
] as const;

export const PUSH_SPLIT_FACTORY_ABI = [
  {
    type: "function",
    name: "createSplit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_splitParams", type: "tuple", components: SPLIT_STRUCT_COMPONENTS },
      { name: "_owner", type: "address" },
      { name: "_creator", type: "address" },
    ],
    outputs: [{ name: "split", type: "address" }],
  },
  {
    type: "function",
    name: "createSplitDeterministic",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_splitParams", type: "tuple", components: SPLIT_STRUCT_COMPONENTS },
      { name: "_owner", type: "address" },
      { name: "_creator", type: "address" },
      { name: "_salt", type: "bytes32" },
    ],
    outputs: [{ name: "split", type: "address" }],
  },
  {
    type: "function",
    name: "predictDeterministicAddress",
    stateMutability: "view",
    inputs: [
      { name: "_splitParams", type: "tuple", components: SPLIT_STRUCT_COMPONENTS },
      { name: "_owner", type: "address" },
      { name: "_salt", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "isDeployed",
    stateMutability: "view",
    inputs: [
      { name: "_splitParams", type: "tuple", components: SPLIT_STRUCT_COMPONENTS },
      { name: "_owner", type: "address" },
      { name: "_salt", type: "bytes32" },
    ],
    outputs: [
      { name: "split", type: "address" },
      { name: "exists", type: "bool" },
    ],
  },
] as const;

export const PUSH_SPLIT_ABI = [
  {
    type: "function",
    name: "distribute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_split", type: "tuple", components: SPLIT_STRUCT_COMPONENTS },
      { name: "_token", type: "address" },
      { name: "_distributor", type: "address" },
    ],
    outputs: [],
  },
] as const;
