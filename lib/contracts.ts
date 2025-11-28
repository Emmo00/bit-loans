import { Address } from 'viem';

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  LENDING_POOL: '0x' as Address, // To be set after deployment
  COLLATERAL_MANAGER: '0x' as Address, // To be set after deployment
  PRICE_ORACLE: '0x' as Address, // To be set after deployment
  INTEREST_RATE_MODEL: '0x' as Address, // To be set after deployment
  BORROW_ASSET: '0x' as Address, // cNGN token address
} as const;

// Protocol constants (1e18 = 100%)
export const PROTOCOL_PARAMS = {
  SCALE: BigInt('1000000000000000000'), // 1e18
  COLLATERAL_FACTOR: BigInt('800000000000000000'), // 80%
  LIQUIDATION_THRESHOLD: BigInt('850000000000000000'), // 85%
  RESERVE_FACTOR: BigInt('100000000000000000'), // 10%
  CLOSE_FACTOR: BigInt('600000000000000000'), // 60%
  LIQUIDATION_BONUS: BigInt('1050000000000000000'), // 105%
  BASE_INTEREST_RATE: BigInt('20000000000000000'), // 2%
  INTEREST_MULTIPLIER: BigInt('180000000000000000'), // 18%
} as const;

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
] as const;

// Price Oracle ABI
export const PRICE_ORACLE_ABI = [
  {
    type: 'function',
    name: 'getEthPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;