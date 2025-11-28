'use client';

import React, { useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, formatPercentage, getHealthFactorColor, formatCurrency, convertToAPY } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { DepositCollateralModal } from '@/components/modals/deposit-collateral-modal';
import { WithdrawCollateralModal } from '@/components/modals/withdraw-collateral-modal';
import { BorrowModal } from '@/components/modals/borrow-modal';
import { RepayModal } from '@/components/modals/repay-modal';

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { 
    userPosition, 
    protocolState, 
    tokenBalances, 
    isLoading, 
    error,
    refreshUserData 
  } = useProtocol();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access the lending protocol.
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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refreshUserData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasPosition = userPosition && (userPosition.collateralETH > 0n || userPosition.debtBalance > 0n);
  const isHealthy = userPosition ? userPosition.healthFactor >= BigInt(1e18) : true;
  const isAtRisk = userPosition ? userPosition.healthFactor < BigInt('1200000000000000000') && userPosition.healthFactor >= BigInt(1e18) : false;
  
  const borrowAPY = protocolState ? convertToAPY(protocolState.borrowRate) : 0;
  const supplyAPY = protocolState ? convertToAPY(protocolState.supplyRate) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Position</h1>
            <p className="text-muted-foreground">
              Single lending position with ETH collateral and cNGN borrowing
            </p>
          </div>
          
          {/* Health Status Badge */}
          {hasPosition && (
            <Badge
              variant={!isHealthy ? "destructive" : isAtRisk ? "secondary" : "default"}
              className="text-sm"
            >
              {!isHealthy ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Liquidatable
                </>
              ) : isAtRisk ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  At Risk
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Healthy
                </>
              )}
            </Badge>
          )}
        </div>

        {/* Main Position Overview */}
        {hasPosition ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Collateral Card */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collateral Deposited</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(formatWAD(userPosition!.collateralETH))} ETH
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(formatWAD(userPosition!.collateralValue), '$')} cNGN
                </p>
              </CardContent>
            </Card>

            {/* Debt Card */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Debt Outstanding</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(formatWAD(userPosition!.debtBalance))} cNGN
                </div>
                <p className="text-xs text-muted-foreground">
                  Borrow Rate: {borrowAPY.toFixed(2)}% APY
                </p>
              </CardContent>
            </Card>

            {/* Health Factor Card */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Factor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getHealthFactorColor(userPosition!.healthFactor)}`}>
                  {(Number(userPosition!.healthFactor) / 1e18).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userPosition!.healthFactor >= BigInt(1e18) ? 'Safe Position' : 'Liquidation Risk'}
                </p>
              </CardContent>
            </Card>

            {/* Available to Borrow Card */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available to Borrow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(formatWAD(userPosition!.availableToBorrow))} cNGN
                </div>
                <p className="text-xs text-muted-foreground">
                  Max: {formatCurrency(formatWAD(userPosition!.maxBorrow))} cNGN
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Position State */
          <Card className="glass p-8 text-center">
            <CardContent>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Active Position</h3>
                <p className="text-muted-foreground">
                  Start by depositing ETH collateral or borrowing cNGN directly
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LTV and Risk Metrics */}
        {hasPosition && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current LTV</span>
                  <span className="text-sm">{userPosition!.currentLTV.toFixed(2)}%</span>
                </div>
                <Progress 
                  value={userPosition!.currentLTV} 
                  className="w-full" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Liquidation Price</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(formatWAD(userPosition!.liquidationPrice), '$')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Borrow Index</div>
                  <div className="text-lg font-semibold">
                    {(Number(userPosition!.borrowIndex) / 1e18).toFixed(6)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Protocol Stats */}
        {protocolState && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Protocol Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold">
                    {formatCurrency(formatWAD(protocolState.totalSupply))} cNGN
                  </div>
                  <div className="text-sm text-muted-foreground">Total Supplied</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold">
                    {formatCurrency(formatWAD(protocolState.totalBorrows))} cNGN
                  </div>
                  <div className="text-sm text-muted-foreground">Total Borrowed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold">
                    {formatPercentage(protocolState.utilization)}
                  </div>
                  <div className="text-sm text-muted-foreground">Utilization Rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-500">
                    {supplyAPY.toFixed(2)}% APY
                  </div>
                  <div className="text-sm text-muted-foreground">Supply Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-500">
                    {borrowAPY.toFixed(2)}% APY
                  </div>
                  <div className="text-sm text-muted-foreground">Borrow Rate</div>
                </div>
              </div>

              {/* Protocol Parameters - Fetched from Contracts */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Protocol Parameters (Live from Contracts)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Collateral Factor</div>
                    <div className="font-medium">{formatPercentage(protocolState.protocolParams.collateralFactor)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Liquidation Threshold</div>
                    <div className="font-medium">{formatPercentage(protocolState.protocolParams.liquidationThreshold)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reserve Factor</div>
                    <div className="font-medium">{formatPercentage(protocolState.protocolParams.reserveFactor)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Close Factor</div>
                    <div className="font-medium">{formatPercentage(protocolState.protocolParams.closeFactor)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Liquidation Bonus</div>
                    <div className="font-medium">{formatPercentage(protocolState.protocolParams.liquidationBonus)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ETH Price</div>
                    <div className="font-medium">{formatCurrency(formatWAD(protocolState.ethPrice))} cNGN</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowDepositModal(true)}
            size="lg"
            className="glass-button"
          >
            Deposit Collateral
          </Button>
          
          <Button 
            onClick={() => setShowWithdrawModal(true)}
            size="lg"
            variant="outline"
            className="glass-button"
            disabled={!hasPosition || !isHealthy}
          >
            Withdraw Collateral
          </Button>
          
          <Button 
            onClick={() => setShowBorrowModal(true)}
            size="lg"
            className="glass-button"
            disabled={!isHealthy}
          >
            Borrow cNGN
          </Button>
          
          <Button 
            onClick={() => setShowRepayModal(true)}
            size="lg"
            variant="outline"
            className="glass-button"
            disabled={!hasPosition || userPosition?.debtBalance === 0n}
          >
            Repay Debt
          </Button>
        </div>

        {/* Modals */}
        <DepositCollateralModal 
          open={showDepositModal} 
          onOpenChange={setShowDepositModal}
        />
        
        <WithdrawCollateralModal 
          open={showWithdrawModal} 
          onOpenChange={setShowWithdrawModal}
        />
        
        <BorrowModal 
          open={showBorrowModal} 
          onOpenChange={setShowBorrowModal}
        />
        
        <RepayModal 
          open={showRepayModal} 
          onOpenChange={setShowRepayModal}
        />
      </div>
    </div>
  );
}
