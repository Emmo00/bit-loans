import { createConfig, http } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Configure chains - using mainnet, sepolia, and localhost for development
export const config = createConfig({
  chains: [mainnet, sepolia, localhost],
  connectors: [
    injected({
      // Configure which wallets to detect
      target: "metaMask", // Prioritize MetaMask but will work with any injected wallet
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(), // For local development
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
