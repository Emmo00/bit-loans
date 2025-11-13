#!/bin/bash

# BitLoans Wallet Integration Setup Script
echo "🚀 Setting up wagmi wallet integration for BitLoans..."

# Install required dependencies
echo "📦 Installing wagmi dependencies..."
npm install wagmi viem @tanstack/react-query

# Check if dependencies were installed successfully
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please install them manually:"
    echo "npm install wagmi viem @tanstack/react-query"
    exit 1
fi

echo "🎉 Wallet integration setup complete!"
echo ""
echo "📋 What was integrated:"
echo "   • Real Web3 wallet connection via wagmi"
echo "   • Support for MetaMask and other injected wallets" 
echo "   • Ethereum mainnet & Sepolia testnet support"
echo "   • Automatic balance fetching"
echo "   • Improved error handling"
echo ""
echo "🔧 To start development:"
echo "   npm run dev"
echo ""
echo "📖 See WALLET_SETUP.md for detailed information"