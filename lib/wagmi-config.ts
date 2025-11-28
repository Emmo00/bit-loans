import { createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Configure chains - using mainnet, sepolia, and localhost for development
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({
      // Configure which wallets to detect
      target: "metaMask", // Prioritize MetaMask but will work with any injected wallet
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
