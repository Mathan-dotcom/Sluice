import { ethers } from "ethers";
import { ARC_TESTNET_CONFIG } from "./arc";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export async function requestArcNetworkSwitch(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet (MetaMask / Rabby) detected.");
  }

  try {
    // Attempt to switch to Arc Testnet (0x4cef52 = 5042002)
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Code 4902 means the chain has not been added to MetaMask yet
    if (
      switchError.code === 4902 ||
      switchError?.data?.originalError?.code === 4902
    ) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_TESTNET_CONFIG.chainIdHex,
              chainName: ARC_TESTNET_CONFIG.chainName,
              rpcUrls: ARC_TESTNET_CONFIG.rpcUrls,
              nativeCurrency: ARC_TESTNET_CONFIG.nativeCurrency,
              blockExplorerUrls: ARC_TESTNET_CONFIG.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch (addError: any) {
        console.warn("Could not auto-add Arc Testnet:", addError);
        return false;
      }
    }
    console.warn("Chain switch error:", switchError);
    return false;
  }
}

export async function connectBrowserWallet(forceFreshPrompt: boolean = true): Promise<{
  address: string;
  balance: string;
  chainId: number;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found. Please install MetaMask or Rabby.");
  }

  // 1. Clear any cached local/session storage items
  if (typeof window !== "undefined") {
    localStorage.removeItem("sluice_connected_wallet");
    localStorage.removeItem("walletconnect");
    sessionStorage.clear();
  }

  // 2. Force the wallet to pop up the account selection prompt by requesting permissions
  if (forceFreshPrompt) {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (permErr: any) {
      if (permErr?.code === 4001) {
        throw new Error("Connection request cancelled by user.");
      }
      console.warn("wallet_requestPermissions fallback notice:", permErr?.message || permErr);
    }
  }

  // 3. Request account access
  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No account selected in wallet.");
  }

  const userAddress = accounts[0];

  // Check current network
  const currentChainHex = await window.ethereum.request({
    method: "eth_chainId",
  });
  const currentChainId = parseInt(currentChainHex, 16);

  if (currentChainId !== ARC_TESTNET_CONFIG.chainId) {
    await requestArcNetworkSwitch();
  }

  // Fetch native balance on Arc
  let balance = "0.0000";
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balanceWei = await provider.getBalance(userAddress);
    balance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
  } catch (balErr) {
    console.warn("Could not fetch wallet balance:", balErr);
  }

  return {
    address: userAddress,
    balance,
    chainId: currentChainId,
  };
}
