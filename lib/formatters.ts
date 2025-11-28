import { formatUnits, parseUnits } from 'viem';
import { PROTOCOL_PARAMS } from './contracts';

// Convert BigInt to formatted number string
export const formatWAD = (value: bigint, decimals: number = 18): string => {
  return formatUnits(value, decimals);
};

// Parse number string to BigInt WAD
export const parseWAD = (value: string, decimals: number = 18): bigint => {
  return parseUnits(value, decimals);
};

// Format percentage from WAD (1e18 = 100%)
export const formatPercentage = (wadValue: bigint): string => {
  const percentage = (Number(wadValue) / Number(PROTOCOL_PARAMS.SCALE)) * 100;
  return percentage.toFixed(2) + '%';
};

// Convert per-second rate to APY
export const convertToAPY = (ratePerSecond: bigint): number => {
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
  const rate = Number(ratePerSecond) / Number(PROTOCOL_PARAMS.SCALE);
  return ((1 + rate) ** SECONDS_PER_YEAR - 1) * 100;
};

// Health factor color coding
export const getHealthFactorColor = (healthFactor: bigint): string => {
  const hf = Number(healthFactor) / Number(PROTOCOL_PARAMS.SCALE);
  if (hf >= 1.5) return 'text-green-500';
  if (hf >= 1.2) return 'text-yellow-500';
  if (hf >= 1.0) return 'text-orange-500';
  return 'text-red-500';
};

// Calculate liquidation price
export const calculateLiquidationPrice = (
  collateralAmount: bigint,
  borrowAmount: bigint,
  liquidationThreshold: bigint
): bigint => {
  if (collateralAmount === 0n) return 0n;
  return (borrowAmount * PROTOCOL_PARAMS.SCALE) / (collateralAmount * liquidationThreshold / PROTOCOL_PARAMS.SCALE);
};

// Format currency values
export const formatCurrency = (value: string | number, symbol: string = ''): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${symbol}${num.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 6 
  })}`;
};

// Truncate address for display
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Safe BigInt operations
export const safeBigInt = (value: any): bigint => {
  try {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'string' && value !== '') return BigInt(value);
    if (typeof value === 'number') return BigInt(Math.floor(value));
    return 0n;
  } catch {
    return 0n;
  }
};

// Check if amount is valid for input
export const isValidAmount = (amount: string): boolean => {
  if (!amount || amount === '') return false;
  try {
    const num = parseFloat(amount);
    return num > 0 && !isNaN(num) && isFinite(num);
  } catch {
    return false;
  }
};

// Calculate LTV (Loan-to-Value ratio)
export const calculateLTV = (borrowValue: bigint, collateralValue: bigint): number => {
  if (collateralValue === 0n) return 0;
  return (Number(borrowValue) / Number(collateralValue)) * 100;
};

// Format health factor for display
export const formatHealthFactor = (healthFactor: bigint): string => {
  const hf = Number(healthFactor) / Number(PROTOCOL_PARAMS.SCALE);
  return hf.toFixed(2);
};