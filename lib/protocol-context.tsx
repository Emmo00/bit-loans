'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config, TARGET_CHAIN } from './wagmi-config';
import { CONTRACT_ADDRESSES, ERC20_ABI, PRICE_ORACLE_ABI } from './contracts';
import LendingPoolABI from '../abis/LendingPool.json';
import CollateralManagerABI from '../abis/CollateralManager.json';
import { formatWAD } from './formatters';

// Utility function to ensure all contract reads use the correct chain
const readContractWithChain = (contractConfig: any) => {
  return readContract(config, {
    ...contractConfig,
    chainId: TARGET_CHAIN.id
  });
};

// User position interface
interface UserPosition {
  collateralETH: bigint;
  collateralValue: bigint;
  debtBalance: bigint;
  healthFactor: bigint;
  maxBorrow: bigint;
  availableToBorrow: bigint;
  currentLTV: number;
  liquidationPrice: bigint;
  borrowIndex: bigint;
  userBorrowIndex: bigint;
}

// Protocol state interface
interface ProtocolState {
  totalSupply: bigint;
  totalBorrows: bigint;
  borrowRate: bigint;
  supplyRate: bigint;
  utilization: bigint;
  collateralFactor: bigint;
  liquidationThreshold: bigint;
  availableLiquidity: bigint;
  ethPrice: bigint;
}

// Token balances interface
interface TokenBalances {
  cngn: bigint;
  cngnAllowance: bigint;
  eth: bigint;
}

// Context interface
interface ProtocolContextType {
  userPosition: UserPosition | null;
  protocolState: ProtocolState | null;
  tokenBalances: TokenBalances | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshUserData: () => Promise<void>;
  refreshProtocolData: () => Promise<void>;
  
  // Contract interactions
  depositCollateral: (amount: bigint) => Promise<string>;
  withdrawCollateral: (amount: bigint) => Promise<string>;
  borrow: (amount: bigint) => Promise<string>;
  repay: (amount: bigint) => Promise<string>;
  approveCNGN: (amount: bigint) => Promise<string>;
  
  // Calculations
  calculateRequiredCollateral: (borrowAmount: bigint) => Promise<bigint>;
  calculateHealthFactorAfterBorrow: (borrowAmount: bigint) => Promise<bigint>;
  calculateHealthFactorAfterWithdraw: (withdrawAmount: bigint) => Promise<bigint>;
}

const ProtocolContext = createContext<ProtocolContextType | null>(null);

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) {
    throw new Error('useProtocol must be used within a ProtocolProvider');
  }
  return context;
};

export const ProtocolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [protocolState, setProtocolState] = useState<ProtocolState | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user position data
  const fetchUserPosition = useCallback(async (): Promise<UserPosition | null> => {
    if (!address || !isConnected) return null;

    try {
      const [
        collateralETH,
        collateralValue,
        debtBalance,
        healthFactor,
        maxBorrow,
        borrowIndex,
        userBorrowIndex
      ] = await Promise.all([
        readContractWithChain({
          address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
          abi: CollateralManagerABI,
          functionName: 'getUserCollateral',
          args: [address]
        }) as Promise<bigint>,
        
        readContractWithChain({
          address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
          abi: CollateralManagerABI,
          functionName: 'getCollateralValue',
          args: [address]
        }) as Promise<bigint>,
        
        readContractWithChain({
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'getBorrowBalance',
          args: [address]
        }) as Promise<bigint>,
        
        readContractWithChain({
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'healthFactor',
          args: [address]
        }) as Promise<bigint>,
        
        readContractWithChain({
          address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
          abi: CollateralManagerABI,
          functionName: 'getMaxBorrow',
          args: [address]
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'borrowIndex'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'borrowerIndex',
          args: [address]
        }) as Promise<bigint>
      ]);

      const availableToBorrow = maxBorrow > debtBalance ? maxBorrow - debtBalance : 0n;
      const currentLTV = collateralValue > 0n ? 
        (Number(debtBalance) / Number(collateralValue)) * 100 : 0;
      
      // Calculate liquidation price
      const liquidationThreshold = await readContract(config, {
        address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
        abi: CollateralManagerABI,
        functionName: 'getLiquidationThreshold'
      }) as bigint;

      const liquidationPrice = collateralETH > 0n ? 
        (debtBalance * BigInt(1e18)) / (collateralETH * liquidationThreshold / BigInt(1e18)) : 0n;

      return {
        collateralETH,
        collateralValue,
        debtBalance,
        healthFactor,
        maxBorrow,
        availableToBorrow,
        currentLTV,
        liquidationPrice,
        borrowIndex,
        userBorrowIndex
      };
    } catch (err) {
      console.error('Error fetching user position:', err);
      return null;
    }
  }, [address, isConnected]);

  // Fetch protocol state
  const fetchProtocolState = useCallback(async (): Promise<ProtocolState | null> => {
    try {
      const [
        totalSupply,
        totalBorrows,
        borrowRate,
        supplyRate,
        utilization,
        collateralFactor,
        liquidationThreshold,
        availableLiquidity,
        ethPrice
      ] = await Promise.all([
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'totalSupply'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'totalBorrows'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'borrowRate'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'supplyRate'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'utilization'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
          abi: CollateralManagerABI,
          functionName: 'getCollateralFactor'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
          abi: CollateralManagerABI,
          functionName: 'getLiquidationThreshold'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.LENDING_POOL,
          abi: LendingPoolABI,
          functionName: 'getCash'
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.PRICE_ORACLE,
          abi: PRICE_ORACLE_ABI,
          functionName: 'getEthPrice'
        }) as Promise<bigint>
      ]);

      return {
        totalSupply,
        totalBorrows,
        borrowRate,
        supplyRate,
        utilization,
        collateralFactor,
        liquidationThreshold,
        availableLiquidity,
        ethPrice
      };
    } catch (err) {
      console.error('Error fetching protocol state:', err);
      return null;
    }
  }, []);

  // Fetch token balances
  const fetchTokenBalances = useCallback(async (): Promise<TokenBalances | null> => {
    if (!address || !isConnected) return null;

    try {
      const [cngn, cngnAllowance, eth] = await Promise.all([
        readContract(config, {
          address: CONTRACT_ADDRESSES.BORROW_ASSET,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address]
        }) as Promise<bigint>,
        
        readContract(config, {
          address: CONTRACT_ADDRESSES.BORROW_ASSET,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, CONTRACT_ADDRESSES.LENDING_POOL]
        }) as Promise<bigint>,
        
        publicClient?.getBalance({ address }) || 0n
      ]);

      return { cngn, cngnAllowance, eth };
    } catch (err) {
      console.error('Error fetching token balances:', err);
      return null;
    }
  }, [address, isConnected, publicClient]);

  // Refresh all user data
  const refreshUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [position, balances] = await Promise.all([
        fetchUserPosition(),
        fetchTokenBalances()
      ]);
      
      setUserPosition(position);
      setTokenBalances(balances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserPosition, fetchTokenBalances]);

  // Refresh protocol data
  const refreshProtocolData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const state = await fetchProtocolState();
      setProtocolState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protocol data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProtocolState]);

  // Contract interaction functions
  const depositCollateral = async (amount: bigint): Promise<string> => {
    if (!walletClient) throw new Error('Wallet not connected');
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'depositCollateral',
      value: amount
    });
    
    await waitForTransactionReceipt(config, { hash });
    await refreshUserData();
    return hash;
  };

  const withdrawCollateral = async (amount: bigint): Promise<string> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'withdrawCollateral',
      args: [amount, address]
    });
    
    await waitForTransactionReceipt(config, { hash });
    await refreshUserData();
    return hash;
  };

  const borrow = async (amount: bigint): Promise<string> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'borrow',
      args: [amount, address]
    });
    
    await waitForTransactionReceipt(config, { hash });
    await refreshUserData();
    return hash;
  };

  const repay = async (amount: bigint): Promise<string> => {
    if (!walletClient || !address) throw new Error('Wallet not connected');
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'repay',
      args: [address, amount]
    });
    
    await waitForTransactionReceipt(config, { hash });
    await refreshUserData();
    return hash;
  };

  const approveCNGN = async (amount: bigint): Promise<string> => {
    if (!walletClient) throw new Error('Wallet not connected');
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.BORROW_ASSET,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.LENDING_POOL, amount]
    });
    
    await waitForTransactionReceipt(config, { hash });
    await refreshUserData();
    return hash;
  };

  // Calculation functions
  const calculateRequiredCollateral = async (borrowAmount: bigint): Promise<bigint> => {
    if (!protocolState) return 0n;
    
    // Required collateral = borrowAmount / (ethPrice * collateralFactor)
    const requiredCollateral = (borrowAmount * BigInt(1e18)) / 
      (protocolState.ethPrice * protocolState.collateralFactor / BigInt(1e18));
    
    return requiredCollateral;
  };

  const calculateHealthFactorAfterBorrow = async (borrowAmount: bigint): Promise<bigint> => {
    if (!address) return 0n;
    
    return readContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'healthFactorAfterBorrow',
      args: [address, borrowAmount]
    }) as Promise<bigint>;
  };

  const calculateHealthFactorAfterWithdraw = async (withdrawAmount: bigint): Promise<bigint> => {
    if (!address) return 0n;
    
    return readContract(config, {
      address: CONTRACT_ADDRESSES.LENDING_POOL,
      abi: LendingPoolABI,
      functionName: 'healthFactorAfterWithdrawCollateral',
      args: [address, withdrawAmount]
    }) as Promise<bigint>;
  };

  // Load data on mount and wallet connection
  useEffect(() => {
    if (isConnected) {
      refreshUserData();
    } else {
      setUserPosition(null);
      setTokenBalances(null);
    }
  }, [isConnected, refreshUserData]);

  useEffect(() => {
    refreshProtocolData();
  }, [refreshProtocolData]);

  const contextValue: ProtocolContextType = {
    userPosition,
    protocolState,
    tokenBalances,
    isLoading,
    error,
    refreshUserData,
    refreshProtocolData,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    approveCNGN,
    calculateRequiredCollateral,
    calculateHealthFactorAfterBorrow,
    calculateHealthFactorAfterWithdraw
  };

  return (
    <ProtocolContext.Provider value={contextValue}>
      {children}
    </ProtocolContext.Provider>
  );
};