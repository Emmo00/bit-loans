'use client';

import React, { useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, isValidAmount, parseWAD, formatCurrency, getHealthFactorColor } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface WithdrawCollateralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawCollateralModal({ open, onOpenChange }: WithdrawCollateralModalProps) {
  const { address } = useAccount();
  const {
    userPosition,
    protocolState,
    withdrawCollateral,
    calculateHealthFactorAfterWithdraw,
    refreshUserData
  } = useProtocol();

  const [amount, setAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [projectedHealthFactor, setProjectedHealthFactor] = useState<bigint | null>(null);

  // Calculate projected values
  const withdrawAmount = isValidAmount(amount) ? parseWAD(amount) : BigInt(0);
  const currentCollateral = userPosition?.collateralETH || BigInt(0);
  const newCollateral = currentCollateral > withdrawAmount ? currentCollateral - withdrawAmount : BigInt(0);
  
  const ethPrice = protocolState?.ethPrice || BigInt(0);
  const newCollateralValue = newCollateral * ethPrice / BigInt(1e18);
  const collateralFactor = protocolState?.collateralFactor || BigInt(0);
  const newMaxBorrow = newCollateralValue * collateralFactor / BigInt(1e18);
  const currentDebt = userPosition?.debtBalance || BigInt(0);
  const newAvailableBorrow = newMaxBorrow > currentDebt ? newMaxBorrow - currentDebt : BigInt(0);

  // Validation
  const isAmountValid = isValidAmount(amount) && withdrawAmount > BigInt(0) && withdrawAmount <= currentCollateral;
  
  // Check health factor
  React.useEffect(() => {
    if (isAmountValid && withdrawAmount > BigInt(0)) {
      calculateHealthFactorAfterWithdraw(withdrawAmount)
        .then(setProjectedHealthFactor)
        .catch(() => setProjectedHealthFactor(null));
    } else {
      setProjectedHealthFactor(null);
    }
  }, [withdrawAmount, isAmountValid, calculateHealthFactorAfterWithdraw]);

  const wouldBeUnsafe = projectedHealthFactor !== null && projectedHealthFactor < BigInt(1e18);
  const isFormValid = isAmountValid && !wouldBeUnsafe && !isWithdrawing;

  const handleWithdraw = async () => {
    if (!isFormValid || !address) return;

    setIsWithdrawing(true);
    setError('');

    try {
      const hash = await withdrawCollateral(withdrawAmount);
      toast.success('Collateral withdrawn successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`
      });
      
      setAmount('');
      onOpenChange(false);
      await refreshUserData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw collateral';
      setError(errorMessage);
      toast.error('Failed to withdraw collateral', {
        description: errorMessage
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMaxSafeClick = () => {
    if (!userPosition || currentDebt === BigInt(0)) {
      // If no debt, can withdraw all
      setAmount(formatWAD(currentCollateral));
      return;
    }

    // Calculate max safe withdrawal to maintain health factor > 1.2
    const liquidationThreshold = protocolState?.liquidationThreshold || BigInt('850000000000000000');
    const safeThreshold = BigInt('1200000000000000000'); // 1.2 for safety buffer
    
    // Required collateral = (debt * safeThreshold) / (ethPrice * liquidationThreshold)
    const requiredCollateralValue = (currentDebt * safeThreshold) / liquidationThreshold;
    const requiredCollateral = (requiredCollateralValue * BigInt(1e18)) / ethPrice;
    
    const maxWithdraw = currentCollateral > requiredCollateral ? currentCollateral - requiredCollateral : BigInt(0);
    setAmount(formatWAD(maxWithdraw));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw ETH Collateral</DialogTitle>
          <DialogDescription>
            Withdraw ETH collateral. Ensure your position remains healthy after withdrawal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (ETH)</Label>
            <div className="flex space-x-2">
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <Button variant="outline" onClick={handleMaxSafeClick} type="button">
                Max Safe
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Available: {formatCurrency(formatWAD(currentCollateral))} ETH
            </div>
          </div>

          {/* Projection Card */}
          {isValidAmount(amount) && withdrawAmount > BigInt(0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Collateral:</span>
                    <span>{formatCurrency(formatWAD(currentCollateral))} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Withdrawal:</span>
                    <span className="font-medium">{formatCurrency(formatWAD(newCollateral))} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collateral Value:</span>
                    <span>{formatCurrency(formatWAD(newCollateralValue))} cNGN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available to Borrow:</span>
                    <span className={newAvailableBorrow < (userPosition?.availableToBorrow || BigInt(0)) ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(formatWAD(newAvailableBorrow))} cNGN
                    </span>
                  </div>
                  {projectedHealthFactor !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">New Health Factor:</span>
                      <span className={`font-medium ${getHealthFactorColor(projectedHealthFactor)}`}>
                        {(Number(projectedHealthFactor) / 1e18).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Warning */}
          {wouldBeUnsafe && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Unsafe Withdrawal</p>
                    <p className="text-sm">This withdrawal would make your position liquidatable.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Messages */}
          {amount && !isAmountValid && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {withdrawAmount > currentCollateral 
                  ? 'Amount exceeds available collateral'
                  : 'Please enter a valid amount'
                }
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={!isFormValid}
            className="min-w-[100px]"
            variant={wouldBeUnsafe ? "destructive" : "default"}
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              'Withdraw ETH'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}