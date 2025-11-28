'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, formatCurrency, isValidAmount, parseWAD, convertToAPY } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BorrowModal } from '@/components/modals/borrow-modal';
import { AlertCircle, TrendingUp, Loader2 } from 'lucide-react';

export default function BorrowPage() {
  const { isConnected } = useAccount();
  const {
    userPosition,
    protocolState,
    tokenBalances,
    isLoading,
    error,
    calculateRequiredCollateral
  } = useProtocol();

  const [borrowAmount, setBorrowAmount] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [requiredCollateral, setRequiredCollateral] = useState<bigint>(0n);

  // Calculate required collateral when borrow amount changes
  React.useEffect(() => {
    if (isValidAmount(borrowAmount)) {
      const amount = parseWAD(borrowAmount);
      calculateRequiredCollateral(amount)
        .then(setRequiredCollateral)
        .catch(() => setRequiredCollateral(0n));
    } else {
      setRequiredCollateral(0n);
    }
  }, [borrowAmount, calculateRequiredCollateral]);

  // Calculate values
  const borrowAmountBN = isValidAmount(borrowAmount) ? parseWAD(borrowAmount) : 0n;
  const currentCollateral = userPosition?.collateralETH || 0n;
  const availableToBorrow = userPosition?.availableToBorrow || 0n;
  const ethPrice = protocolState?.ethPrice || 0n;
  const borrowRate = protocolState?.borrowRate || 0n;
  const borrowAPY = convertToAPY(borrowRate);

  const needsCollateral = requiredCollateral > currentCollateral;
  const additionalCollateralNeeded = needsCollateral ? requiredCollateral - currentCollateral : 0n;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access borrowing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center border-destructive">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Borrow cNGN</h1>
          <p className="text-muted-foreground">
            Borrow cNGN against your ETH collateral at competitive rates
          </p>
        </div>

        {/* Current Position Summary */}
        {userPosition && (
          <Card className="glass mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Collateral Deposited</div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(formatWAD(currentCollateral))} ETH
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Available to Borrow</div>
                  <div className="text-xl font-semibold text-green-600">
                    {formatCurrency(formatWAD(availableToBorrow))} cNGN
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Borrow Form */}
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle>Borrow Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrow-amount">Amount (cNGN)</Label>
              <Input
                id="borrow-amount"
                type="number"
                placeholder="Enter amount to borrow"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                step="0.01"
                min="0"
              />
              <div className="text-sm text-muted-foreground">
                Current borrow rate: {borrowAPY.toFixed(2)}% APY
              </div>
            </div>

            {/* Calculation Display */}
            {isValidAmount(borrowAmount) && borrowAmountBN > 0n && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Borrow Amount:</span>
                      <span className="font-medium">{formatCurrency(formatWAD(borrowAmountBN))} cNGN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Required Collateral:</span>
                      <span className="font-medium">{formatCurrency(formatWAD(requiredCollateral))} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Collateral:</span>
                      <span className={currentCollateral >= requiredCollateral ? "text-green-600" : "text-orange-600"}>
                        {formatCurrency(formatWAD(currentCollateral))} ETH
                      </span>
                    </div>
                    {needsCollateral && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Additional Needed:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(formatWAD(additionalCollateralNeeded))} ETH
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ETH Price:</span>
                      <span>{formatCurrency(formatWAD(ethPrice))} cNGN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {needsCollateral && borrowAmountBN > 0n && (
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-700">Additional Collateral Required</p>
                      <p className="text-sm text-orange-600">
                        You need to deposit {formatCurrency(formatWAD(additionalCollateralNeeded))} ETH more to borrow this amount.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setShowBorrowModal(true)}
              disabled={!isValidAmount(borrowAmount) || borrowAmountBN === 0n}
              className="w-full"
              size="lg"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {needsCollateral ? 'Deposit & Borrow' : 'Borrow cNGN'}
            </Button>
          </CardContent>
        </Card>

        {/* Protocol Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Protocol Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Collateral Factor</div>
                <div className="font-medium">
                  {protocolState ? ((Number(protocolState.collateralFactor) / 1e18) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Liquidation Threshold</div>
                <div className="font-medium">
                  {protocolState ? ((Number(protocolState.liquidationThreshold) / 1e18) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Borrowed</div>
                <div className="font-medium">
                  {protocolState ? formatCurrency(formatWAD(protocolState.totalBorrows)) : '0'} cNGN
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Available Liquidity</div>
                <div className="font-medium">
                  {protocolState ? formatCurrency(formatWAD(protocolState.availableLiquidity)) : '0'} cNGN
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrow Modal */}
        <BorrowModal 
          open={showBorrowModal} 
          onOpenChange={setShowBorrowModal}
        />
      </div>
    </div>
  );
}
