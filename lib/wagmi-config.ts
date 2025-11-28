import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// Configure chains - Base Sepolia for testing
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

// Export the target chain for easy reference
export const TARGET_CHAIN = baseSepolia;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
