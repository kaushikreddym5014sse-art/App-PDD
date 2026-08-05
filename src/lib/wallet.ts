import { BrowserProvider, ethers } from "ethers";

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export async function connectMetaMask(): Promise<{ address: string; chainId: number; provider: BrowserProvider }> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask or Web3 wallet is not installed in your browser. Please install MetaMask to interact directly on-chain.");
  }

  const ethereum = (window as any).ethereum;
  const provider = new BrowserProvider(ethereum);
  
  // Request account access
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask.");
  }

  const network = await provider.getNetwork();
  const address = ethers.getAddress(accounts[0]);

  return {
    address,
    chainId: Number(network.chainId),
    provider,
  };
}

export async function switchToPolygon(provider: BrowserProvider) {
  const ethereum = (window as any).ethereum;
  const POLYGON_CHAIN_ID = "0x89"; // 137 in hex
  
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // Chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: POLYGON_CHAIN_ID,
            chainName: "Polygon Mainnet",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://polygon-rpc.com/"],
            blockExplorerUrls: ["https://polygonscan.com/"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export function getWalletState(): { address: string; chainId: number; connected: boolean } {
  if (typeof window === "undefined") {
    return { address: "", chainId: 0, connected: false };
  }
  const addr = localStorage.getItem("blockcertify_wallet_addr") || "";
  return {
    address: addr,
    chainId: 80002,
    connected: Boolean(addr),
  };
}
