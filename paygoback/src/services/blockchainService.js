const { ethers } = require('ethers');

// Contract ABIs
const escrowVaultABI = require('../../../paygosmart-contract/abi/PaygoEscrowVault.json');
const billingABI = require('../../../paygosmart-contract/abi/PaygoBilling.json');
const marketplaceABI = require('../../../paygosmart-contract/abi/PaygoMarketplace.json');
const merchantRegistryABI = require('../../../paygosmart-contract/abi/PaygoMerchantRegistry.json');

// Contract addresses (Base Sepolia)
const CONTRACT_ADDRESSES = {
  ESCROW_VAULT: '0xA973806Ba9102D42f102467EC9c0c859639139Be',
  BILLING: '0xB83B7fACFeAd639850A8E18D85f0AB0324D5b6D8',
  MARKETPLACE: '0xF4a7D296c6bfC7B3B1c9dA3c854E98153F957906',
  MERCHANT_REGISTRY: '0xc324464a1aC5C103c6060Df094f38Cb20d07c33d',
  SUBSCRIPTION_SCHEDULER: '0x1fEd1080A7D8369a5376406fc75Ee4C71f3997a6'
};

// Supported tokens
const TOKENS = {
  NATIVE: '0x0000000000000000000000000000000000000000', // ETH on Base
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  USDT: '0x6B3c8397c4e5e7e0b8b8b8b8b8b8b8b8b8b8b8b8' // Placeholder - replace with actual
};

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isInitialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize(rpcUrl, privateKey) {
    try {
      // Connect to Base Sepolia
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
      }

      // Initialize contracts
      this.contracts = {
        escrowVault: new ethers.Contract(CONTRACT_ADDRESSES.ESCROW_VAULT, escrowVaultABI, this.signer || this.provider),
        billing: new ethers.Contract(CONTRACT_ADDRESSES.BILLING, billingABI, this.signer || this.provider),
        marketplace: new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, marketplaceABI, this.signer || this.provider),
        merchantRegistry: new ethers.Contract(CONTRACT_ADDRESSES.MERCHANT_REGISTRY, merchantRegistryABI, this.signer || this.provider)
      };

      this.isInitialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Get user balance from escrow vault
   */
  async getUserBalance(userAddress, tokenAddress = TOKENS.NATIVE) {
    if (!this.isInitialized) throw new Error('Blockchain service not initialized');

    try {
      const balance = await this.contracts.escrowVault.getUserBalance(userAddress, tokenAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to escrow vault
   */
  async depositFunds(userAddress, tokenAddress, amount) {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      const amountWei = ethers.parseEther(amount.toString());

      if (tokenAddress === TOKENS.NATIVE) {
        // Deposit native token (ETH)
        const tx = await this.contracts.escrowVault.depositNative({
          value: amountWei
        });
        await tx.wait();
      } else {
        // Deposit ERC20 token
        const tokenContract = new ethers.Contract(tokenAddress, ['function approve(address,uint256)'], this.signer);
        await tokenContract.approve(CONTRACT_ADDRESSES.ESCROW_VAULT, amountWei);

        const tx = await this.contracts.escrowVault.depositERC20(tokenAddress, amountWei);
        await tx.wait();
      }

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  }

  /**
   * Start a billing session
   */
  async startSession(sessionId, userAddress, serviceId) {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      // Generate session ID as bytes32
      const sessionIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionId));

      // Generate service ID as bytes32
      const serviceIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(serviceId));

      const tx = await this.contracts.billing.startSession(sessionIdBytes32, userAddress, serviceIdBytes32);
      await tx.wait();

      return { success: true, sessionId: sessionIdBytes32, txHash: tx.hash };
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * End a billing session and process payment
   */
  async endSession(sessionId, reason = 'completed') {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      const sessionIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(sessionId));
      const reasonBytes32 = ethers.encodeBytes32String(reason);

      const tx = await this.contracts.billing.endSession(sessionIdBytes32, reasonBytes32);
      const receipt = await tx.wait();

      // Parse events to get billing details
      const sessionEndedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contracts.billing.interface.parseLog(log);
          return parsed.name === 'SessionEnded';
        } catch {
          return false;
        }
      });

      if (sessionEndedEvent) {
        const parsed = this.contracts.billing.interface.parseLog(sessionEndedEvent);
        return {
          success: true,
          minutesUsed: parsed.args.minutesUsed,
          totalCharged: ethers.formatEther(parsed.args.totalCharged),
          txHash: tx.hash
        };
      }

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Get service details from marketplace
   */
  async getService(serviceId) {
    if (!this.isInitialized) throw new Error('Blockchain service not initialized');

    try {
      const serviceIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(serviceId));
      const service = await this.contracts.marketplace.getService(serviceIdBytes32);

      return {
        serviceId: service.serviceId,
        merchantId: service.merchantId,
        token: service.token,
        ratePerMinute: ethers.formatEther(service.ratePerMinute),
        active: service.active
      };
    } catch (error) {
      console.error('Error getting service:', error);
      throw error;
    }
  }

  /**
   * List a new service on the marketplace
   */
  async listService(serviceId, merchantId, tokenAddress, ratePerMinute) {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      const serviceIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(serviceId));
      const merchantIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(merchantId));
      const rateWei = ethers.parseEther(ratePerMinute.toString());

      const tx = await this.contracts.marketplace.listService(
        serviceIdBytes32,
        merchantIdBytes32,
        tokenAddress,
        rateWei
      );
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error listing service:', error);
      throw error;
    }
  }

  /**
   * Register as a merchant
   */
  async registerMerchant(merchantAddress, name, metadata) {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      // This would depend on the merchant registry contract interface
      // Placeholder implementation
      console.log('Registering merchant:', merchantAddress, name, metadata);
      return { success: true };
    } catch (error) {
      console.error('Error registering merchant:', error);
      throw error;
    }
  }

  /**
   * Withdraw funds as merchant
   */
  async merchantWithdraw(tokenAddress, amount) {
    if (!this.isInitialized || !this.signer) throw new Error('Blockchain service not initialized or no signer');

    try {
      const amountWei = ethers.parseEther(amount.toString());

      const tx = await this.contracts.escrowVault.merchantWithdraw(tokenAddress, amountWei);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId) {
    if (!this.isInitialized) throw new Error('Blockchain service not initialized');

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

  /**
   * Check if token is supported
   */
  async isTokenSupported(tokenAddress) {
    if (!this.isInitialized) throw new Error('Blockchain service not initialized');

    try {
      return await this.contracts.escrowVault.supportedToken(tokenAddress);
    } catch (error) {
      console.error('Error checking token support:', error);
      return false;
    }
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens() {
    return TOKENS;
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;