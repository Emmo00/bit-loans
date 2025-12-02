import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient } from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";

// 1. Get projectId from Reown Cloud
const projectId = "10253c351e5dfe282bb45de33141d7a9";

// 2. Create wagmiAdapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [baseSepolia],
  ssr: true,
});

// 3. Create modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia],
  projectId,
  metadata: {
    name: "BitLoan Protocol",
    description: "Dual-currency lending protocol on Base Sepolia",
    url: "https://bit-loans.vercel.app", // Update with your actual URL
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

// 4. Create QueryClient
const queryClient = new QueryClient();

export { wagmiAdapter, modal, queryClient, projectId };