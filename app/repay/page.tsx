"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { RepayModal } from "@/components/modals/repay-modal";
import { useProtocol } from "@/lib/protocol-context";
import { useAccount } from "wagmi";
import { formatCurrency, formatWAD, formatHealthFactor } from "@/lib/formatters";
import { parseEther } from "viem";
import { 
  ArrowUpCircle, 
  Shield, 
  TrendingDown, 
  AlertCircle,
  DollarSign,
  PieChart,
  Wallet
} from "lucide-react";

export default function Repay() {
  const { address, isConnected } = useAccount();
  const { userPosition, protocolState, isLoading } = useProtocol();
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Wallet Not Connected</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to view your loan position
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasDebt = userPosition && userPosition.debt > 0n;
  const repayAmountBN = repayAmount ? parseEther(repayAmount) : 0n;
  const maxRepayAmount = userPosition?.debt || 0n;

  // Helper functions for validation
  const isValidAmount = (amount: string) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Repay Loan</h1>
            <p className="text-muted-foreground">
              Manage your lending position and repay your debt
            </p>
          </div>

          {!hasDebt ? (
            /* No Debt State */
            <Card className="glass">
              <CardContent className="pt-12 pb-12 text-center">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No Active Debt</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have any outstanding debt to repay.
                </p>
                <Button 
                  onClick={() => window.location.href = '/borrow'} 
                  variant="outline"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Start Borrowing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Position Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(formatWAD(userPosition?.debt || 0n))} cNGN
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Principal amount borrowed
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collateral Locked</CardTitle>
                    <Shield className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(formatWAD(userPosition?.collateral || 0n))} ETH
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Securing your loan
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Health Factor</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userPosition ? formatHealthFactor(userPosition.healthFactor) : "0"}
                    </div>
                    <div className="mt-2">
                      {userPosition && (
                        <Badge 
                          variant={
                            userPosition.healthFactor >= 200n 
                              ? "default" 
                              : userPosition.healthFactor >= 110n 
                              ? "secondary" 
                              : "destructive"
                          }
                        >
                          {userPosition.healthFactor >= 200n 
                            ? "Healthy" 
                            : userPosition.healthFactor >= 110n 
                            ? "Moderate Risk" 
                            : "High Risk"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Repay Interface */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Repay Debt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="repay-amount">Repayment Amount (cNGN)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="repay-amount"
                        type="number"
                        placeholder="Enter amount to repay"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        max={formatWAD(maxRepayAmount)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setRepayAmount(formatWAD(maxRepayAmount))}
                        disabled={maxRepayAmount === 0n}
                      >
                        Max
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maximum: {formatCurrency(formatWAD(maxRepayAmount))} cNGN
                    </div>
                  </div>

                  {/* Repayment Impact */}
                  {isValidAmount(repayAmount) && repayAmountBN > 0n && (
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Repaying:</span>
                            <span className="font-medium">{formatCurrency(repayAmount)} cNGN</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining Debt:</span>
                            <span className="font-medium">
                              {formatCurrency(formatWAD(maxRepayAmount - repayAmountBN))} cNGN
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="font-medium">
                              {((Number(repayAmountBN) / Number(maxRepayAmount)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={(Number(repayAmountBN) / Number(maxRepayAmount)) * 100} 
                          className="mt-3"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Warning for partial repayment */}
                  {isValidAmount(repayAmount) && repayAmountBN > 0n && repayAmountBN < maxRepayAmount && (
                    <Card className="border-orange-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-orange-700">Partial Repayment</p>
                            <p className="text-sm text-orange-600">
                              This will reduce your debt but won't close your position completely.
                              You can withdraw collateral proportionally after repayment.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => setShowRepayModal(true)}
                    disabled={!isValidAmount(repayAmount) || repayAmountBN === 0n || repayAmountBN > maxRepayAmount}
                    className="w-full"
                    size="lg"
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    {repayAmountBN === maxRepayAmount ? 'Repay & Close Position' : 'Make Repayment'}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Protocol Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Protocol Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Borrowed</div>
                  <div className="font-medium">
                    {protocolState ? formatCurrency(formatWAD(protocolState.totalBorrows)) : '0'} cNGN
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Collateral</div>
                  <div className="font-medium">
                    {protocolState ? formatCurrency(formatWAD(protocolState.totalCollateral)) : '0'} ETH
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Available Liquidity</div>
                  <div className="font-medium">
                    {protocolState ? formatCurrency(formatWAD(protocolState.availableLiquidity)) : '0'} cNGN
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current ETH Price</div>
                  <div className="font-medium">
                    {protocolState ? formatCurrency(formatWAD(protocolState.ethPrice)) : '0'} cNGN
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repay Modal */}
          <RepayModal 
            open={showRepayModal} 
            onOpenChange={setShowRepayModal}
          />
        </div>
      </div>
    </div>
  );
}
