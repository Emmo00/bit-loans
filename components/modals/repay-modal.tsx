'use client';

import React, { useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, isValidAmount, parseWAD, formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface RepayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepayModal({ open, onOpenChange }: RepayModalProps) {
  const { address } = useAccount();
  const {
    userPosition,
    protocolState,
    tokenBalances,
    repay,
    approveCNGN,
    refreshUserData
  } = useProtocol();

  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [error, setError] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);

  // Calculate values
  const repayAmount = isValidAmount(amount) ? parseWAD(amount) : 0n;
  const currentDebt = userPosition?.debtBalance || 0n;
  const cngnBalance = tokenBalances?.cngn || 0n;
  const cngnAllowance = tokenBalances?.cngnAllowance || 0n;
  
  const newDebt = currentDebt > repayAmount ? currentDebt - repayAmount : 0n;
  const currentCollateral = userPosition?.collateralETH || 0n;
  const ethPrice = protocolState?.ethPrice || 0n;
  const collateralValue = currentCollateral * ethPrice / BigInt(1e18);
  
  // Calculate collateral that could be released
  const collateralFactor = protocolState?.collateralFactor || 0n;
  const newRequiredCollateralValue = newDebt > 0n ? (newDebt * BigInt(1e18)) / collateralFactor : 0n;
  const newRequiredCollateral = newRequiredCollateralValue > 0n ? (newRequiredCollateralValue * BigInt(1e18)) / ethPrice : 0n;
  const releasableCollateral = currentCollateral > newRequiredCollateral ? currentCollateral - newRequiredCollateral : 0n;

  // Check if approval is needed
  React.useEffect(() => {
    setNeedsApproval(repayAmount > 0n && repayAmount > cngnAllowance);
  }, [repayAmount, cngnAllowance]);

  // Validation
  const isAmountValid = isValidAmount(amount) && repayAmount > 0n && repayAmount <= currentDebt && repayAmount <= cngnBalance;
  const isFormValid = isAmountValid && !isApproving && !isRepaying;

  const handleApprove = async () => {
    if (!address || repayAmount === 0n) return;

    setIsApproving(true);
    setError('');

    try {
      // Approve slightly more than needed to avoid precision issues
      const approveAmount = repayAmount + parseWAD('0.01'); // Add small buffer
      const hash = await approveCNGN(approveAmount);
      
      toast.success('Approval successful!', {
        description: `Transaction: ${hash.slice(0, 10)}...`
      });
      
      await refreshUserData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve cNGN';
      setError(errorMessage);
      toast.error('Approval failed', {
        description: errorMessage
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRepay = async () => {
    if (!isFormValid || !address) return;

    // Check if approval is still needed
    if (needsApproval) {
      await handleApprove();
      return;
    }

    setIsRepaying(true);
    setError('');

    try {
      const hash = await repay(repayAmount);
      toast.success('Repayment successful!', {
        description: `Transaction: ${hash.slice(0, 10)}...`
      });
      
      setAmount('');
      onOpenChange(false);
      await refreshUserData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to repay debt';
      setError(errorMessage);
      toast.error('Repayment failed', {
        description: errorMessage
      });
    } finally {
      setIsRepaying(false);
    }
  };

  const handleMaxClick = () => {
    const maxRepay = currentDebt < cngnBalance ? currentDebt : cngnBalance;
    setAmount(formatWAD(maxRepay));
  };

  const handlePercentageClick = (percentage: number) => {
    const percentageAmount = (currentDebt * BigInt(percentage)) / 100n;
    const maxRepay = percentageAmount < cngnBalance ? percentageAmount : cngnBalance;
    setAmount(formatWAD(maxRepay));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Repay Debt</DialogTitle>
          <DialogDescription>
            Repay your cNGN debt to reduce interest and unlock collateral.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Debt Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Debt:</span>
                  <span className="font-medium">{formatCurrency(formatWAD(currentDebt))} cNGN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span>{formatCurrency(formatWAD(cngnBalance))} cNGN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Borrow Rate:</span>
                  <span>
                    {protocolState ? ((Number(protocolState.borrowRate) / 1e18) * 100 * 365 * 24 * 3600).toFixed(2) : '0'}% APY
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="repay-amount">Repay Amount (cNGN)</Label>
            <div className="flex space-x-2">
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
              <Button variant="outline" onClick={handleMaxClick} type="button">
                Max
              </Button>
            </div>
          </div>

          {/* Quick Percentage Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePercentageClick(25)}
              className="flex-1"
            >
              25%
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePercentageClick(50)}
              className="flex-1"
            >
              50%
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePercentageClick(75)}
              className="flex-1"
            >
              75%
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePercentageClick(100)}
              className="flex-1"
            >
              100%
            </Button>
          </div>

          {/* Projection Card */}
          {isValidAmount(amount) && repayAmount > 0n && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Debt:</span>
                    <span>{formatCurrency(formatWAD(currentDebt))} cNGN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Repay Amount:</span>
                    <span className="text-red-600">-{formatCurrency(formatWAD(repayAmount))} cNGN</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Remaining Debt:</span>
                    <span className={newDebt === 0n ? "text-green-600" : ""}>
                      {formatCurrency(formatWAD(newDebt))} cNGN
                      {newDebt === 0n && <CheckCircle className="inline ml-1 h-4 w-4" />}
                    </span>
                  </div>
                  
                  {releasableCollateral > 0n && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Collateral Unlocked:</span>
                      <span className="text-green-600">
                        {formatCurrency(formatWAD(releasableCollateral))} ETH
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Status */}
          {needsApproval && (
            <Card className="border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Approval Required</p>
                    <p className="text-sm">You need to approve cNGN spending first.</p>
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
                {repayAmount > currentDebt 
                  ? 'Amount exceeds total debt'
                  : repayAmount > cngnBalance
                  ? 'Insufficient cNGN balance'
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
            onClick={handleRepay} 
            disabled={!isFormValid}
            className="min-w-[120px]"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : isRepaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repaying...
              </>
            ) : needsApproval ? (
              'Approve cNGN'
            ) : (
              'Repay Debt'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}