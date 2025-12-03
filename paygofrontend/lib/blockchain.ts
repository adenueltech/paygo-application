import { ethers } from 'ethers';

// Contract ABIs (imported from smart contracts)
const escrowVaultABI = [
  {
    "inputs": [{"name": "admin", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "depositNative",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "token", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "depositERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}, {"name": "token", "type": "address"}],
    "name": "getUserBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "token", "type": "address"}],
    "name": "supportedToken",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const billingABI = [
  {
    "inputs": [{"name": "sessionId", "type": "bytes32"}, {"name": "user", "type": "address"}, {"name": "serviceId", "type": "bytes32"}],
    "name": "startSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "sessionId", "type": "bytes32"}, {"name": "reason", "type": "bytes32"}],
    "name": "endSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "bytes32"}],
    "name": "sessions",
    "outputs": [
      {"name": "user", "type": "address"},
      {"name": "serviceId", "type": "bytes32"},
      {"name": "merchantId", "type": "bytes32"},
      {"name": "startTs", "type": "uint256"},
      {"name": "ratePerMinute", "type": "uint256"},
      {"name": "token", "type": "address"},
      {"name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses (Base Sepolia)
export const CONTRACT_ADDRESSES = {
  ESCROW_VAULT: process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS || '0xA973806Ba9102D42f102467EC9c0c859639139Be',
  BILLING: process.env.NEXT_PUBLIC_BILLING_ADDRESS || '0xB83B7fACFeAd639850A8E18D85f0AB0324D5b6D8',
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0xF4a7D296c6bfC7B3B1c9dA3c854E98153F957906',
  MERCHANT_REGISTRY: process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS || '0xc324464a1aC5C103c6060Df094f38Cb20d07c33d',
  SUBSCRIPTION_SCHEDULER: process.env.NEXT_PUBLIC_SUBSCRIPTION_SCHEDULER_ADDRESS || '0x1fEd1080A7D8369a5376406fc75Ee4C71f3997a6'
};

// Supported tokens
export const TOKENS = {
  NATIVE: '0x0000000000000000000000000000000000000000', // ETH on Base
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  USDT: '0x6B3c8397c4e5e7e0b8b8b8b8b8b8b8b8b8b8b8b8' // Placeholder
};

export class BlockchainService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: any = {};

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Browser environment with MetaMask
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      await this.connectWallet();
    } else {
      // Fallback to RPC provider (for server-side or when MetaMask not available)
      this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org');
    }

    this.initializeContracts();
  }

  private initializeContracts() {
    if (!this.provider) return;

    this.contracts = {
      escrowVault: new ethers.Contract(CONTRACT_ADDRESSES.ESCROW_VAULT, escrowVaultABI, this.provider),
      billing: new ethers.Contract(CONTRACT_ADDRESSES.BILLING, billingABI, this.provider)
    };
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider || !(this.provider instanceof ethers.BrowserProvider)) {
      throw new Error('MetaMask not available');
    }

    try {
      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Update contracts with signer for write operations
      this.contracts.escrowVault = new ethers.Contract(CONTRACT_ADDRESSES.ESCROW_VAULT, escrowVaultABI, this.signer);
      this.contracts.billing = new ethers.Contract(CONTRACT_ADDRESSES.BILLING, billingABI, this.signer);

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getUserBalance(userAddress: string, tokenAddress: string = TOKENS.NATIVE): Promise<string> {
    if (!this.contracts.escrowVault) throw new Error('Contracts not initialized');

    try {
      const balance = await this.contracts.escrowVault.getUserBalance(userAddress, tokenAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  async depositFunds(tokenAddress: string, amount: string): Promise<any> {
    if (!this.contracts.escrowVault || !this.signer) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      const amountWei = ethers.parseEther(amount);

      if (tokenAddress === TOKENS.NATIVE) {
        // Deposit native token (ETH)
        const tx = await this.contracts.escrowVault.depositNative({
          value: amountWei
        });
        return await tx.wait();
      } else {
        // Deposit ERC20 token
        const tx = await this.contracts.escrowVault.depositERC20(tokenAddress, amountWei);
        return await tx.wait();
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  }

  async startSession(sessionId: string, serviceId: string): Promise<any> {
    if (!this.contracts.billing || !this.signer) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      const sessionIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionId));
      const serviceIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(serviceId));
      const userAddress = await this.signer.getAddress();

      const tx = await this.contracts.billing.startSession(sessionIdBytes32, userAddress, serviceIdBytes32);
      return await tx.wait();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async endSession(sessionId: string, reason: string = 'completed'): Promise<any> {
    if (!this.contracts.billing || !this.signer) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      const sessionIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionId));
      const reasonBytes32 = ethers.encodeBytes32String(reason);

      const tx = await this.contracts.billing.endSession(sessionIdBytes32, reasonBytes32);
      return await tx.wait();
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    if (!this.contracts.billing) throw new Error('Contracts not initialized');

    try {
      const sessionIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionId));
      const session = await this.contracts.billing.sessions(sessionIdBytes32);

      return {
        user: session.user,
        serviceId: session.serviceId,
        merchantId: session.merchantId,
        startTs: session.startTs,
        ratePerMinute: ethers.formatEther(session.ratePerMinute),
        token: session.token,
        active: session.active
      };
    } catch (error) {
      console.error('Error getting session details:', error);
      throw error;
    }
  }

  async isTokenSupported(tokenAddress: string): Promise<boolean> {
    if (!this.contracts.escrowVault) return false;

    try {
      return await this.contracts.escrowVault.supportedToken(tokenAddress);
    } catch (error) {
      console.error('Error checking token support:', error);
      return false;
    }
  }

  async getSignerAddress(): Promise<string | null> {
    return this.signer ? await this.signer.getAddress() : null;
  }

  isWalletConnected(): boolean {
    return !!this.signer;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  return parseFloat(balance).toFixed(4);
};

export const switchToBaseSepolia = async (): Promise<void> => {
  if (!(window as any).ethereum) throw new Error('MetaMask not available');

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x14a34' }], // Base Sepolia chain ID
    });
  } catch (error: any) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14a34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        }],
      });
    } else {
      throw error;
    }
  }
};