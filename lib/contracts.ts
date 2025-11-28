import { Address } from 'viem';
import { readContract } from 'wagmi/actions';
import { config, TARGET_CHAIN } from './wagmi-config';
import LendingPoolABI from '../abis/LendingPool.json';
import CollateralManagerABI from '../abis/CollateralManager.json';

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  LENDING_POOL: '0x528612f226dDAa9818242b071126fcDE8201CAD0' as Address, // To be set after deployment
  COLLATERAL_MANAGER: '0x7BdF62bdcd7d3db3513eAb9344dCD344cf8d3FF7' as Address, // To be set after deployment
  PRICE_ORACLE: '0x43b2A2D97553f1A63Dd4fCE786E3e8827772A3Fb' as Address, // To be set after deployment
  INTEREST_RATE_MODEL: '0x5897aAECeD11fBd64777D928Aa901b49e037996e' as Address, // To be set after deployment
  BORROW_ASSET: '0x08b26e305aeCe44DAD7859FB87d698ABc53A2962' as Address, // cNGN token address
} as const;

// Protocol constants (1e18 = 100%) - Hardcoded fallbacks only
export const PROTOCOL_PARAMS = {
  SCALE: BigInt('1000000000000000000'), // 1e18
} as const;

// Dynamic protocol parameters fetched from contracts
export interface ProtocolParameters {
  scale: bigint;
  collateralFactor: bigint;
  liquidationThreshold: bigint;
  reserveFactor: bigint;
  closeFactor: bigint;
  liquidationBonus: bigint;
}

// Fetch all protocol parameters from contracts
export const fetchProtocolParameters = async (): Promise<ProtocolParameters> => {
  try {
    const [
      collateralFactor,
      liquidationThreshold,
      reserveFactor,
      closeFactor,
      liquidationBonus,
    ] = await Promise.all([
      readContract(config, {
        address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
        abi: CollateralManagerABI,
        functionName: 'getCollateralFactor',
        chainId: TARGET_CHAIN.id,
      }) as Promise<bigint>,
      
      readContract(config, {
        address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
        abi: CollateralManagerABI,
        functionName: 'getLiquidationThreshold',
        chainId: TARGET_CHAIN.id,
      }) as Promise<bigint>,
      
      readContract(config, {
        address: CONTRACT_ADDRESSES.LENDING_POOL,
        abi: LendingPoolABI,
        functionName: 'reserveFactor',
        chainId: TARGET_CHAIN.id,
      }) as Promise<bigint>,
      
      readContract(config, {
        address: CONTRACT_ADDRESSES.LENDING_POOL,
        abi: LendingPoolABI,
        functionName: 'closeFactor',
        chainId: TARGET_CHAIN.id,
      }) as Promise<bigint>,
      
      readContract(config, {
        address: CONTRACT_ADDRESSES.LENDING_POOL,
        abi: LendingPoolABI,
        functionName: 'liquidationBonus',
        chainId: TARGET_CHAIN.id,
      }) as Promise<bigint>,
    ]);

    return {
      scale: PROTOCOL_PARAMS.SCALE,
      collateralFactor,
      liquidationThreshold,
      reserveFactor,
      closeFactor,
      liquidationBonus,
    };
  } catch (error) {
    console.error('Failed to fetch protocol parameters:', error);
    // Return fallback values
    return {
      scale: BigInt('1000000000000000000'), // 1e18
      collateralFactor: BigInt('800000000000000000'), // 80%
      liquidationThreshold: BigInt('850000000000000000'), // 85%
      reserveFactor: BigInt('100000000000000000'), // 10%
      closeFactor: BigInt('600000000000000000'), // 60%
      liquidationBonus: BigInt('1050000000000000000'), // 105%
    };
  }
};

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