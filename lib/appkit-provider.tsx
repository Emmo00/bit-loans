"use client";

import { ReactNode } from "react";
import { wagmiAdapter, queryClient } from "./appkit-config";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}