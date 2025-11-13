# BitLoans - Wallet Integration Setup

## Installation

First, install the required dependencies for wagmi wallet integration:

```bash
# Using npm
npm install wagmi viem @tanstack/react-query

# Or using pnpm
pnpm add wagmi viem @tanstack/react-query

# Or using yarn
yarn add wagmi viem @tanstack/react-query
```

## Wallet Integration

The application now uses **wagmi** for proper Web3 wallet integration instead of the previous mock implementation.

### Key Changes Made:

1. **New Files:**
   - `lib/wagmi-config.ts` - Wagmi configuration with mainnet and sepolia
   - `lib/use-wallet.ts` - Custom hook providing the same interface as before

2. **Updated Files:**
   - `lib/wallet-context.tsx` - Now provides wagmi providers
   - `app/layout.tsx` - Includes WalletProvider at root level
   - All page components - Removed individual WalletProvider wrappers
   - `components/navbar.tsx` - Uses new wallet hook

### Features:

- **Real Wallet Connection:** Uses `window.ethereum` (MetaMask, etc.)
- **Multi-Chain Support:** Configured for Ethereum mainnet and Sepolia testnet  
- **Balance Display:** Shows actual ETH balance from connected wallet
- **Automatic Detection:** Detects injected wallets automatically

### Usage:

The `useWallet()` hook provides:
- `address`: Shortened wallet address (e.g., "0x742d...8E0C")  
- `rawAddress`: Full wallet address
- `connected`: Connection status
- `connect()`: Function to connect wallet
- `disconnect()`: Function to disconnect wallet
- `balance`: Formatted ETH balance

### Browser Support:

Works with any wallet that injects `window.ethereum`:
- MetaMask
- Coinbase Wallet  
- Trust Wallet
- Rainbow Wallet
- And many more...

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000` with full wallet functionality.