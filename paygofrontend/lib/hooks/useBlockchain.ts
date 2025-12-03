import { useState, useEffect, useCallback } from 'react';
import { blockchainService, formatAddress, formatBalance, switchToBaseSepolia } from '../blockchain';
import { authService } from '../auth';

export interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: number | null;
  ratePerMinute: string;
  totalCost: string;
}

export interface AnalyticsData {
  totalSpending: number;
  servicesUsed: number;
  avgUsageTime: number;
  todaySpend: number;
  monthSpend: number;
  serviceBreakdown: Record<string, number>;
  totalBalance: number;
  chartData: {
    monthlySpending: Array<{ month: string; amount: number }>;
    topServices: Array<{ service: string; amount: number }>;
    usageOverTime: Array<{ date: string; usage: number }>;
  };
}

export const useBlockchain = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
    error: null
  });

  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    ratePerMinute: '0',
    totalCost: '0'
  });

  const [analyticsState, setAnalyticsState] = useState<AnalyticsData | null>(null);

  // Initialize wallet connection
  useEffect(() => {
    const initWallet = async () => {
      if (blockchainService.isWalletConnected()) {
        const address = await blockchainService.getSignerAddress();
        if (address) {
          setWalletState(prev => ({
            ...prev,
            address: address,
            isConnected: true
          }));
          await updateBalance(address);
        }
      }
    };

    initWallet();
  }, []);

  const updateBalance = useCallback(async (address: string) => {
    try {
      const balance = await blockchainService.getUserBalance(address);
      setWalletState(prev => ({
        ...prev,
        balance: formatBalance(balance),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update balance:', error);
      setWalletState(prev => ({
        ...prev,
        error: 'Failed to fetch balance'
      }));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Switch to Base Sepolia network first
      await switchToBaseSepolia();

      // Connect wallet
      const address = await blockchainService.connectWallet();

      if (address) {
        setWalletState({
          address,
          balance: '0',
          isConnected: true,
          isConnecting: false,
          error: null
        });

        // Update balance
        await updateBalance(address);
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet'
      }));
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
      error: null
    });
    setSessionState({
      sessionId: null,
      isActive: false,
      startTime: null,
      ratePerMinute: '0',
      totalCost: '0'
    });
  }, []);

  const depositFunds = useCallback(async (tokenAddress: string, amount: string) => {
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setWalletState(prev => ({ ...prev, error: null }));

      const result = await blockchainService.depositFunds(tokenAddress, amount);

      // Update balance after deposit
      if (walletState.address) {
        await updateBalance(walletState.address);
      }

      return result;
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Deposit failed'
      }));
      throw error;
    }
  }, [walletState.isConnected, walletState.address, updateBalance]);

  const startSession = useCallback(async (serviceId: string) => {
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setWalletState(prev => ({ ...prev, error: null }));

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await blockchainService.startSession(sessionId, serviceId);

      setSessionState({
        sessionId,
        isActive: true,
        startTime: Date.now(),
        ratePerMinute: '0', // Will be updated from contract
        totalCost: '0'
      });

      return { sessionId, result };
    } catch (error: any) {
      console.error('Start session failed:', error);
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Failed to start session'
      }));
      throw error;
    }
  }, [walletState.isConnected]);

  const endSession = useCallback(async (reason: string = 'completed') => {
    if (!sessionState.sessionId) {
      throw new Error('No active session');
    }

    try {
      setWalletState(prev => ({ ...prev, error: null }));

      const result = await blockchainService.endSession(sessionState.sessionId!, reason);

      setSessionState({
        sessionId: null,
        isActive: false,
        startTime: null,
        ratePerMinute: '0',
        totalCost: '0'
      });

      // Update balance after session ends
      if (walletState.address) {
        await updateBalance(walletState.address);
      }

      return result;
    } catch (error: any) {
      console.error('End session failed:', error);
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Failed to end session'
      }));
      throw error;
    }
  }, [sessionState.sessionId, walletState.address, updateBalance]);

  const getSessionDetails = useCallback(async (sessionId: string) => {
    try {
      const details = await blockchainService.getSessionDetails(sessionId);
      return details;
    } catch (error) {
      console.error('Failed to get session details:', error);
      throw error;
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/wallet/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsState(data);
      return data;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }, []);

  // Calculate session cost in real-time
  useEffect(() => {
    if (!sessionState.isActive || !sessionState.startTime || !sessionState.ratePerMinute) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const durationMinutes = (now - sessionState.startTime!) / (1000 * 60);
      const cost = durationMinutes * parseFloat(sessionState.ratePerMinute);

      setSessionState(prev => ({
        ...prev,
        totalCost: cost.toFixed(4)
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sessionState.isActive, sessionState.startTime, sessionState.ratePerMinute]);

  return {
    // Wallet state
    wallet: walletState,

    // Session state
    session: sessionState,

    // Analytics state
    analytics: analyticsState,

    // Actions
    connectWallet,
    disconnectWallet,
    depositFunds,
    startSession,
    endSession,
    getSessionDetails,
    getAnalytics,
    updateBalance,

    // Utilities
    formatAddress,
    formatBalance
  };
};