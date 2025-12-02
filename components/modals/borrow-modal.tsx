'use client';

import React, { useState } from 'react';
import { useProtocol } from '@/lib/protocol-context';
import { formatWAD, isValidAmount, parseWAD, formatCurrency, getHealthFactorColor } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface BorrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorrowModal({ open, onOpenChange }: BorrowModalProps) {
  const { address } = useAccount();
  const {
    userPosition,
    protocolState,
    tokenBalances,
    borrow,
    depositCollateral,
    calculateRequiredCollateral,
    calculateHealthFactorAfterBorrow,
    refreshUserData
  } = useProtocol();

  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState('');
  const [requiredCollateral, setRequiredCollateral] = useState<bigint>(BigInt(0));
  const [projectedHealthFactor, setProjectedHealthFactor] = useState<bigint | null>(null);
  const [showCollateralStep, setShowCollateralStep] = useState(false);

  // Calculate values
  const borrowAmountBN = isValidAmount(borrowAmount) ? parseWAD(borrowAmount) : BigInt(0);
  const collateralAmountBN = isValidAmount(collateralAmount) ? parseWAD(collateralAmount) : BigInt(0);
  const currentCollateral = userPosition?.collateralETH || BigInt(0);
  const availableToBorrow = userPosition?.availableToBorrow || BigInt(0);
  const userEthBalance = tokenBalances?.eth || BigInt(0);

  // Check if user needs more collateral
  React.useEffect(() => {
    if (isValidAmount(borrowAmount) && borrowAmountBN > BigInt(0)) {
      calculateRequiredCollateral(borrowAmountBN)
        .then((required) => {
          setRequiredCollateral(required);
          const additionalNeeded = required > currentCollateral ? required - currentCollateral : BigInt(0);
          setShowCollateralStep(additionalNeeded > BigInt(0));
          if (additionalNeeded > BigInt(0)) {
            setCollateralAmount(formatWAD(additionalNeeded));
          }
        })
        .catch(() => setRequiredCollateral(BigInt(0)));
        
      calculateHealthFactorAfterBorrow(borrowAmountBN)
        .then(setProjectedHealthFactor)
        .catch(() => setProjectedHealthFactor(null));
    } else {
      setRequiredCollateral(BigInt(0));
      setProjectedHealthFactor(null);
      setShowCollateralStep(false);
    }
  }, [borrowAmountBN, currentCollateral, calculateRequiredCollateral, calculateHealthFactorAfterBorrow]);

  // Validation
  const isBorrowAmountValid = isValidAmount(borrowAmount) && borrowAmountBN > BigInt(0);
  const isCollateralAmountValid = !showCollateralStep || (isValidAmount(collateralAmount) && collateralAmountBN > BigInt(0) && collateralAmountBN <= userEthBalance);
  const canBorrowDirectly = isBorrowAmountValid && borrowAmountBN <= availableToBorrow;
  const wouldBeUnsafe = projectedHealthFactor !== null && projectedHealthFactor < BigInt(1e18);
  
  const isFormValid = isBorrowAmountValid && (canBorrowDirectly || isCollateralAmountValid) && !wouldBeUnsafe && !isBorrowing && !isDepositing;

  const handleBorrow = async () => {
    if (!isFormValid || !address) return;

    try {
      // Step 1: Deposit collateral if needed
      if (showCollateralStep && collateralAmountBN > BigInt(0)) {
        setIsDepositing(true);
        setError('');
        
        const depositHash = await depositCollateral(collateralAmountBN);
        toast.success('Collateral deposited successfully!', {
          description: `Transaction: ${depositHash.slice(0, 10)}...`
        });
        
        // Wait for data to update
        await refreshUserData();
      }

      // Step 2: Borrow
      setIsDepositing(false);
      setIsBorrowing(true);
      setError('');
      
      const borrowHash = await borrow(borrowAmountBN);
      toast.success('cNGN borrowed successfully!', {
        description: `Transaction: ${borrowHash.slice(0, 10)}...`
      });
      
      setBorrowAmount('');
      setCollateralAmount('');
      onOpenChange(false);
      await refreshUserData();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete borrow transaction';
      setError(errorMessage);
      toast.error('Transaction failed', {
        description: errorMessage
      });
    } finally {
      setIsBorrowing(false);
      setIsDepositing(false);
    }
  };

  const handleMaxBorrowClick = () => {
    setBorrowAmount(formatWAD(availableToBorrow));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Borrow cNGN</DialogTitle>
          <DialogDescription>
            Borrow cNGN using your ETH collateral. Additional collateral may be required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Borrow Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="borrow-amount">Borrow Amount (cNGN)</Label>
            <div className="flex space-x-2">
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.0"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                step="0.01"
                min="0"
              />
              <Button variant="outline" onClick={handleMaxBorrowClick} type="button">
                Max
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Available: {formatCurrency(formatWAD(availableToBorrow))} cNGN
            </div>
          </div>

          {/* Additional Collateral Required */}
          {showCollateralStep && (
            <Card className="border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2 mb-4">
                  <Info className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-700">Additional Collateral Required</p>
                    <p className="text-sm text-orange-600">
                      You need to deposit more ETH to borrow this amount.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="collateral-amount">Deposit ETH</Label>
                  <Input
                    id="collateral-amount"
                    type="number"
                    placeholder="0.0"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    step="0.000001"
                    min="0"
                  />
                  <div className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(formatWAD(userEthBalance))} ETH
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projection Card */}
          {isBorrowAmountValid && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Required Collateral:</span>
                    <span>{formatCurrency(formatWAD(requiredCollateral))} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Collateral:</span>
                    <span>{formatCurrency(formatWAD(currentCollateral))} ETH</span>
                  </div>
                  {showCollateralStep && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">After Deposit:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(formatWAD(currentCollateral + collateralAmountBN))} ETH
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Borrow Amount:</span>
                    <span className="font-medium">{formatCurrency(formatWAD(borrowAmountBN))} cNGN</span>
                  </div>
                  {projectedHealthFactor !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Health Factor:</span>
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
                    <p className="font-medium">Unsafe Borrow Amount</p>
                    <p className="text-sm">This amount would make your position liquidatable.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Messages */}
          {borrowAmount && !isBorrowAmountValid && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Please enter a valid borrow amount</span>
            </div>
          )}

          {showCollateralStep && collateralAmount && !isCollateralAmountValid && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {collateralAmountBN > userEthBalance 
                  ? 'Insufficient ETH balance'
                  : 'Please enter a valid collateral amount'
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
            onClick={handleBorrow} 
            disabled={!isFormValid}
            className="min-w-[120px]"
          >
            {isDepositing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Depositing...
              </>
            ) : isBorrowing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Borrowing...
              </>
            ) : (
              showCollateralStep ? 'Deposit & Borrow' : 'Borrow cNGN'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}