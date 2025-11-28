---
applyTo: '**'
---
# BitLoan Protocol - Frontend Development Instructions

## 🌟 Protocol Overview

BitLoan is a **dual-currency lending protocol** that allows users to:
- **Deposit ETH as collateral** to borrow ERC20 tokens
- **Supply ERC20 tokens** to earn interest from borrowers
- **Liquidate unhealthy positions** for rewards

### Key Concept
- **Collateral**: Native ETH (deposited by borrowers)
- **Lending Asset**: Any ERC20 token (e.g., USDC, USDT, DAI)
- **Interest**: Dynamic rates based on utilization

---

## 🏗️ Smart Contract Architecture

### Core Contracts

#### 1. **LendingPool** (Main Contract)
- **Address**: `[TO_BE_DEPLOYED]`
- **Purpose**: Central hub for all lending/borrowing operations
- **Key Functions**:

```typescript
// Supplier Operations
deposit(amount: BigNumber): Promise<Transaction>           // Deposit ERC20 tokens to earn interest
withdraw(amount: BigNumber, receiver: string): Promise<Transaction>  // Withdraw supplied tokens
getSupplyBalance(user: string): Promise<BigNumber>         // Get user's supply balance + interest

// Borrower Operations  
depositCollateral(): Promise<Transaction>                  // Deposit ETH as collateral (payable)
withdrawCollateral(amount: BigNumber, receiver: string): Promise<Transaction> // Withdraw ETH collateral
borrow(amount: BigNumber, receiver: string): Promise<Transaction>    // Borrow ERC20 tokens
repay(borrower: string, amount: BigNumber): Promise<Transaction>     // Repay borrowed tokens
getBorrowBalance(user: string): Promise<BigNumber>         // Get user's debt + interest

// Health & Rates
healthFactor(user: string): Promise<BigNumber>             // Health factor (>1e18 = healthy)
healthFactorAfterBorrow(user: string, amount: BigNumber): Promise<BigNumber>
healthFactorAfterWithdrawCollateral(user: string, amount: BigNumber): Promise<BigNumber>
borrowRate(): Promise<BigNumber>                           // Current borrow APR (annual, 1e18 scale)
supplyRate(): Promise<BigNumber>                          // Current supply APR (annual, 1e18 scale)
utilization(): Promise<BigNumber>                         // Pool utilization rate

// Liquidation
liquidate(borrower: string, repayAmount: BigNumber): Promise<Transaction>

// Protocol State
totalBorrows(): Promise<BigNumber>                        // Total amount borrowed
totalSupply(): Promise<BigNumber>                         // Total amount supplied
getCash(): Promise<BigNumber>                            // Available cash in pool
```

#### 2. **CollateralManager**
- **Purpose**: Manages ETH collateral deposits and valuations
- **Key Functions**:

```typescript
getUserCollateral(user: string): Promise<BigNumber>       // User's ETH collateral (wei)
getCollateralValue(user: string): Promise<BigNumber>      // Collateral value in borrow asset
getMaxBorrow(user: string): Promise<BigNumber>            // Max borrowable amount
getCollateralFactor(): Promise<BigNumber>                 // Current collateral factor (80%)
getLiquidationThreshold(): Promise<BigNumber>             // Liquidation threshold (85%)
```

#### 3. **PriceOracle** (Mock - Replace in Production)
- **Purpose**: Provides ETH price in borrow asset units
- **Key Functions**:

```typescript
getEthPrice(): Promise<BigNumber>                         // ETH price (e.g., 3000e18 = $3000)
```

#### 4. **InterestRateModel**
- **Purpose**: Calculates dynamic interest rates
- **Key Functions**:

```typescript
getBorrowRate(utilization: BigNumber): Promise<BigNumber> // Base: 2% + Slope: 18%
getSupplyRate(utilization: BigNumber, borrowRate: BigNumber, reserveFactor: BigNumber): Promise<BigNumber>
```

---

## 📊 Key Protocol Parameters

### Default Values (1e18 = 100%)
```typescript
const PROTOCOL_PARAMS = {
  SCALE: BigNumber.from("1000000000000000000"),           // 1e18
  COLLATERAL_FACTOR: BigNumber.from("800000000000000000"), // 80% - can borrow up to 80% of collateral
  LIQUIDATION_THRESHOLD: BigNumber.from("850000000000000000"), // 85% - liquidated if debt > 85%
  RESERVE_FACTOR: BigNumber.from("100000000000000000"),    // 10% - protocol fee
  CLOSE_FACTOR: BigNumber.from("600000000000000000"),      // 60% - max liquidation per tx
  LIQUIDATION_BONUS: BigNumber.from("1050000000000000000"), // 105% - liquidator bonus
  BASE_INTEREST_RATE: BigNumber.from("20000000000000000"), // 2% base rate
  INTEREST_MULTIPLIER: BigNumber.from("180000000000000000") // 18% slope
};
```

### Health Factor Calculation
```typescript
// Health Factor = (Collateral Value × Liquidation Threshold) / Borrow Value
// > 1.0 = Healthy position
// < 1.0 = Can be liquidated
const healthFactor = (collateralValue * liquidationThreshold) / borrowValue;
```

---

## 🎨 Frontend Features to Implement

### 1. **Dashboard Overview**
Display key protocol metrics:
```typescript
interface ProtocolStats {
  totalValueLocked: BigNumber;      // Total ETH + ERC20 value
  totalBorrowed: BigNumber;         // Total borrowed amount
  totalSupplied: BigNumber;         // Total supplied amount
  currentUtilization: BigNumber;    // Utilization percentage
  currentBorrowRate: BigNumber;     // Annual borrow rate
  currentSupplyRate: BigNumber;     // Annual supply rate
}
```

### 2. **Supply Interface** 
Allow users to supply ERC20 tokens:
```typescript
interface SupplyInterface {
  // User inputs
  supplyAmount: string;
  
  // Display data
  currentSupplyBalance: BigNumber;
  earnedInterest: BigNumber;
  projectedAPY: BigNumber;
  
  // Actions
  onDeposit: (amount: BigNumber) => Promise<void>;
  onWithdraw: (amount: BigNumber) => Promise<void>;
}
```

### 3. **Borrow Interface**
Allow users to borrow against ETH collateral:
```typescript
interface BorrowInterface {
  // User inputs
  collateralAmount: string;        // ETH to deposit
  borrowAmount: string;            // ERC20 to borrow
  
  // Display data
  currentCollateral: BigNumber;    // Current ETH collateral
  currentDebt: BigNumber;          // Current debt
  healthFactor: BigNumber;         // Current health factor
  maxBorrowable: BigNumber;        // Max borrowable amount
  liquidationPrice: BigNumber;     // ETH price at liquidation
  
  // Projections
  healthFactorAfter: BigNumber;    // Health factor after operation
  
  // Actions  
  onDepositCollateral: (amount: BigNumber) => Promise<void>;
  onWithdrawCollateral: (amount: BigNumber) => Promise<void>;
  onBorrow: (amount: BigNumber) => Promise<void>;
  onRepay: (amount: BigNumber) => Promise<void>;
}
```

### 4. **Liquidation Interface**
Show liquidatable positions:
```typescript
interface LiquidationInterface {
  liquidatablePositions: Array<{
    borrower: string;
    collateral: BigNumber;
    debt: BigNumber;
    healthFactor: BigNumber;
    maxRepayable: BigNumber;        // closeFactor * debt
    expectedSeizure: BigNumber;     // collateral to seize
    expectedProfit: BigNumber;      // liquidation bonus
  }>;
  
  onLiquidate: (borrower: string, repayAmount: BigNumber) => Promise<void>;
}
```

### 5. **User Portfolio**
Show user's positions:
```typescript
interface UserPortfolio {
  // Supply position
  suppliedAmount: BigNumber;
  earnedInterest: BigNumber;
  supplyAPY: BigNumber;
  
  // Borrow position
  collateralAmount: BigNumber;      // ETH deposited
  borrowedAmount: BigNumber;        // ERC20 borrowed
  owedInterest: BigNumber;          // Accrued interest
  borrowAPY: BigNumber;
  healthFactor: BigNumber;
  
  // Risk metrics
  liquidationPrice: BigNumber;      // ETH price at liquidation
  safeWithdrawAmount: BigNumber;    // Max safe collateral withdrawal
  safeBorrowAmount: BigNumber;      // Max safe additional borrow
}
```

---

## 🔄 Real-time Updates

### Events to Listen For
```typescript
// LendingPool Events
interface LendingPoolEvents {
  Deposit: (user: string, amount: BigNumber) => void;
  Withdraw: (user: string, amount: BigNumber, receiver: string) => void;
  Borrow: (user: string, amount: BigNumber, receiver: string) => void;
  Repay: (payer: string, borrower: string, amount: BigNumber) => void;
  Liquidate: (liquidator: string, borrower: string, repayAmount: BigNumber, seizedCollateral: BigNumber) => void;
  AccrueInterest: (borrowIndex: BigNumber, supplyIndex: BigNumber, interestAccrued: BigNumber, reservesAdded: BigNumber) => void;
}

// CollateralManager Events  
interface CollateralManagerEvents {
  CollateralDeposited: (user: string, amount: BigNumber) => void;
  CollateralWithdrawn: (user: string, amount: BigNumber) => void;
  CollateralSeized: (user: string, amount: BigNumber, liquidator: string) => void;
}
```

### State Management
```typescript
// Update user data on relevant events
const subscribeToUserEvents = (userAddress: string) => {
  // Listen for user-specific deposit/withdraw/borrow/repay events
  // Update user balances, health factor, etc.
  // Refresh portfolio data
};

// Update protocol data periodically
const subscribeToProtocolEvents = () => {
  // Listen for AccrueInterest events
  // Update rates, utilization, total stats
  // Refresh liquidation opportunities
};
```

---

## 💎 Key Calculations for Frontend

### Interest Rate Display
```typescript
// Convert from per-second rate to APY
const convertToAPY = (ratePerSecond: BigNumber): number => {
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
  const rate = ratePerSecond.toNumber() / 1e18; // Convert from wei
  return ((1 + rate) ** SECONDS_PER_YEAR - 1) * 100; // APY percentage
};
```

### Health Factor Color Coding
```typescript
const getHealthFactorColor = (healthFactor: BigNumber): string => {
  const hf = healthFactor.toNumber() / 1e18;
  if (hf >= 1.5) return "green";      // Very safe
  if (hf >= 1.2) return "yellow";     // Moderate risk  
  if (hf >= 1.0) return "orange";     // High risk
  return "red";                       // Liquidatable
};
```

### Liquidation Price Calculation
```typescript
const calculateLiquidationPrice = (
  collateralAmount: BigNumber,
  borrowAmount: BigNumber,
  liquidationThreshold: BigNumber
): BigNumber => {
  // Price where (collateral * price * threshold) = borrowAmount
  return borrowAmount.mul(SCALE).div(collateralAmount.mul(liquidationThreshold));
};
```

---

## 🛠️ Technical Implementation Notes

### Contract Interaction
```typescript
// Always call accrueInterest() before reading balances for accuracy
await lendingPool.accrueInterest();
const balance = await lendingPool.getSupplyBalance(userAddress);

// Check health factor before operations
const healthFactorAfter = await lendingPool.healthFactorAfterBorrow(userAddress, borrowAmount);
if (healthFactorAfter.lt(SCALE)) {
  throw new Error("Operation would make position unhealthy");
}

// Handle ETH operations (collateral deposits)
await lendingPool.depositCollateral({ value: ethAmount });
```

### Error Handling
```typescript
// Common error messages to handle
const ERROR_MESSAGES = {
  "LendingPool: health factor too low": "This action would make your position unsafe for liquidation",
  "LendingPool: insufficient supply": "You don't have enough supplied tokens to withdraw",
  "CollateralManager: Insufficient collateral": "You don't have enough collateral to withdraw",
  "ERC20: insufficient allowance": "Please approve the contract to spend your tokens",
  "LendingPool: deposit zero": "Amount must be greater than zero"
};
```

### Gas Optimization
```typescript
// Batch operations when possible
const multicall = [
  lendingPool.accrueInterest(),
  lendingPool.deposit(amount)
];

// Use static calls for view functions
const [supplyBalance, borrowBalance, healthFactor] = await Promise.all([
  lendingPool.callStatic.getSupplyBalance(userAddress),
  lendingPool.callStatic.getBorrowBalance(userAddress), 
  lendingPool.callStatic.healthFactor(userAddress)
]);
```

---

## 🎯 User Experience Recommendations

### 1. **Safety First**
- Always show health factor prominently for borrowers
- Display liquidation price warnings
- Show "safe" ranges for operations
- Implement slippage protection

### 2. **Clear Information**
- Display all fees upfront
- Show interest accrual in real-time
- Explain health factor and liquidation risk
- Provide calculator tools for projections

### 3. **Progressive Disclosure**
- Start with simple deposit/withdraw interfaces
- Advanced users can access liquidation features
- Show detailed transaction breakdowns
- Provide educational tooltips

### 4. **Real-time Updates**
- Update balances and rates automatically
- Show transaction status with confirmations
- Refresh liquidation opportunities regularly
- Display protocol health metrics

---

## 🔐 Security Considerations

### Input Validation
```typescript
// Always validate user inputs
const validateAmount = (amount: string, balance: BigNumber): boolean => {
  const amountBN = parseEther(amount);
  return amountBN.gt(0) && amountBN.lte(balance);
};

// Check allowances before operations
const checkAllowance = async (tokenAddress: string, spenderAddress: string, amount: BigNumber): Promise<boolean> => {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await token.allowance(userAddress, spenderAddress);
  return allowance.gte(amount);
};
```

### Transaction Safety
```typescript
// Simulate transactions before execution
const simulateTransaction = async (tx: Transaction): Promise<boolean> => {
  try {
    await provider.call(tx);
    return true;
  } catch (error) {
    console.error("Transaction would fail:", error);
    return false;
  }
};
```

---

## 📱 Contract Addresses & Networks

### Local Development
```typescript
const LOCAL_ADDRESSES = {
  LENDING_POOL: "0x...",          // Deployed via DeployLocal.s.sol
  COLLATERAL_MANAGER: "0x...",
  PRICE_ORACLE: "0x...",
  INTEREST_RATE_MODEL: "0x...",
  MOCK_ERC20: "0x..."             // Test token for local development
};
```

### Testnet Deployment
```typescript
const TESTNET_ADDRESSES = {
  // To be populated after deployment
  LENDING_POOL: "0x...",
  COLLATERAL_MANAGER: "0x...",
  PRICE_ORACLE: "0x...",
  INTEREST_RATE_MODEL: "0x..."
};
```

---

## 🚀 Getting Started Checklist

1. **Set up Web3 Connection**
   - Connect to user's wallet (MetaMask, WalletConnect)
   - Handle network switching
   - Manage connection state

2. **Contract Integration** 
   - Import contract ABIs from `/out` directory
   - Set up contract instances with ethers.js
   - Implement contract interaction functions

3. **State Management**
   - Set up global state for user positions
   - Implement real-time balance updates
   - Cache protocol parameters

4. **UI Components**
   - Create supply/borrow interfaces
   - Implement health factor display
   - Build liquidation dashboard
   - Add transaction history

5. **Testing**
   - Test with local deployment (anvil + DeployLocal.s.sol)
   - Use mock ERC20 token for testing
   - Test edge cases (liquidations, health factor)

---

## 💡 Additional Resources

- **Contract ABIs**: Available in `/out` directory after compilation
- **Deployment Scripts**: See `/script` directory for deployment examples
- **Test Environment**: Use `make deploy-local` for instant testing setup
- **Mock Token**: `MockERC20.sol` provides `freeMint()` function for easy testing

This protocol is production-ready but uses a mock price oracle. Replace with Chainlink or other reliable price feeds before mainnet deployment with significant TVL.

Happy building! 🎉
