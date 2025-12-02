'use client';

import React, { useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, isValidAmount, parseWAD, formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface DepositCollateralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositCollateralModal({ open, onOpenChange }: DepositCollateralModalProps) {
  const { address } = useAccount();
  const {
    userPosition,
    protocolState,
    tokenBalances,
    depositCollateral,
    calculateHealthFactorAfterBorrow,
    refreshUserData
  } = useProtocol();

  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState('');

  // Calculate projected values
  const depositAmount = isValidAmount(amount) ? parseWAD(amount) : BigInt(0);
  const currentCollateral = userPosition?.collateralETH || BigInt(0);
  const newCollateral = currentCollateral + depositAmount;
  
  const ethPrice = protocolState?.ethPrice || BigInt(0);
  const newCollateralValue = newCollateral * ethPrice / BigInt(1e18);
  const collateralFactor = protocolState?.collateralFactor || BigInt(0);
  const newMaxBorrow = newCollateralValue * collateralFactor / BigInt(1e18);
  const currentDebt = userPosition?.debtBalance || BigInt(0);
  const newAvailableBorrow = newMaxBorrow > currentDebt ? newMaxBorrow - currentDebt : BigInt(0);

  // Validation
  const userEthBalance = tokenBalances?.eth || BigInt(0);
  const isAmountValid = isValidAmount(amount) && depositAmount > BigInt(0) && depositAmount <= userEthBalance;
  const isFormValid = isAmountValid && !isDepositing;

  const handleDeposit = async () => {
    if (!isFormValid || !address) return;

    setIsDepositing(true);
    setError('');

    try {
      const hash = await depositCollateral(depositAmount);
      toast.success('Collateral deposited successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`
      });
      
      setAmount('');
      onOpenChange(false);
      await refreshUserData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit collateral';
      setError(errorMessage);
      toast.error('Failed to deposit collateral', {
        description: errorMessage
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleMaxClick = () => {
    if (userEthBalance > BigInt(0)) {
      // Leave small amount for gas
      const gasBuffer = parseWAD('0.001'); // 0.001 ETH for gas
      const maxAmount = userEthBalance > gasBuffer ? userEthBalance - gasBuffer : BigInt(0);
      setAmount(formatWAD(maxAmount));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit ETH Collateral</DialogTitle>
          <DialogDescription>
            Deposit ETH to increase your borrowing capacity. ETH serves as collateral for cNGN borrowing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (ETH)</Label>
            <div className="flex space-x-2">
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              <Button variant="outline" onClick={handleMaxClick} type="button">
                Max
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Balance: {formatCurrency(formatWAD(userEthBalance))} ETH
            </div>
          </div>

          {/* Projection Card */}
          {isValidAmount(amount) && depositAmount > BigInt(0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Collateral:</span>
                    <span>{formatCurrency(formatWAD(currentCollateral))} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Deposit:</span>
                    <span className="font-medium">{formatCurrency(formatWAD(newCollateral))} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collateral Value:</span>
                    <span>{formatCurrency(formatWAD(newCollateralValue))} cNGN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Borrowable:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(formatWAD(newMaxBorrow))} cNGN
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available to Borrow:</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(formatWAD(newAvailableBorrow - (userPosition?.availableToBorrow || BigInt(0))))} cNGN
                    </span>
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
                {depositAmount > userEthBalance 
                  ? 'Insufficient ETH balance'
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
            onClick={handleDeposit} 
            disabled={!isFormValid}
            className="min-w-[100px]"
          >
            {isDepositing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Depositing...
              </>
            ) : (
              'Deposit ETH'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}