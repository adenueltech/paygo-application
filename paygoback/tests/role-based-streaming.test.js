const crypto = require('crypto');

// Mock user roles
const mockUsers = {
  normalUser: { userId: '507f1f77bcf86cd799439011', role: 'user', name: 'John User' },
  vendor: { userId: '507f1f77bcf86cd799439012', role: 'vendor', name: 'Jane Vendor' },
  admin: { userId: '507f1f77bcf86cd799439013', role: 'admin', name: 'Admin User' }
};

// Role-based access functions
const canStartStream = (userRole) => userRole === 'user';
const canChargeSession = (userRole) => userRole === 'user';
const canCreateService = (userRole) => userRole === 'vendor';

// Simulate streaming session start
const startStreamingSession = (user, serviceId) => {
  if (!canStartStream(user.role)) {
    return {
      success: false,
      error: `Access denied. Only normal users can start streaming sessions. Your role: ${user.role}`,
      userRole: user.role
    };
  }

  return {
    success: true,
    message: 'Streaming session started successfully',
    session: {
      sessionId: crypto.randomBytes(8).toString('hex'),
      userId: user.userId,
      serviceId,
      startTime: new Date(),
      status: 'active'
    },
    userRole: user.role
  };
};

// Simulate session charging
const chargeSession = (user, sessionId, amount) => {
  if (!canChargeSession(user.role)) {
    return {
      success: false,
      error: `Access denied. Only normal users can be charged for sessions. Your role: ${user.role}`,
      userRole: user.role
    };
  }

  const mockBalance = 100;
  if (mockBalance < amount) {
    return {
      success: false,
      error: 'Insufficient balance',
      currentBalance: mockBalance,
      required: amount
    };
  }

  return {
    success: true,
    message: 'Charge successful',
    remainingBalance: mockBalance - amount,
    isLowBalance: (mockBalance - amount) <= 20,
    sessionId,
    userRole: user.role
  };
};

describe('Role-Based Streaming Access Control', () => {
  describe('Stream Starting Permissions', () => {
    test('normal user should be able to start streaming session', () => {
      const result = startStreamingSession(mockUsers.normalUser, 'service_123');
      expect(result.success).toBe(true);
      expect(result.userRole).toBe('user');
      expect(result.session).toBeDefined();
    });

    test('vendor should NOT be able to start streaming session', () => {
      const result = startStreamingSession(mockUsers.vendor, 'service_123');
      expect(result.success).toBe(false);
      expect(result.userRole).toBe('vendor');
      expect(result.error).toContain('Access denied');
    });

    test('admin should NOT be able to start streaming session', () => {
      const result = startStreamingSession(mockUsers.admin, 'service_123');
      expect(result.success).toBe(false);
      expect(result.userRole).toBe('admin');
      expect(result.error).toContain('Access denied');
    });
  });

  describe('Session Charging Permissions', () => {
    test('normal user should be able to be charged for sessions', () => {
      const result = chargeSession(mockUsers.normalUser, 'session_123', 10);
      expect(result.success).toBe(true);
      expect(result.userRole).toBe('user');
      expect(result.remainingBalance).toBe(90);
    });

    test('vendor should NOT be able to be charged for sessions', () => {
      const result = chargeSession(mockUsers.vendor, 'session_123', 10);
      expect(result.success).toBe(false);
      expect(result.userRole).toBe('vendor');
      expect(result.error).toContain('Access denied');
    });

    test('admin should NOT be able to be charged for sessions', () => {
      const result = chargeSession(mockUsers.admin, 'session_123', 10);
      expect(result.success).toBe(false);
      expect(result.userRole).toBe('admin');
      expect(result.error).toContain('Access denied');
    });
  });

  describe('Role Permission Validation', () => {
    test('should validate streaming permissions correctly', () => {
      expect(canStartStream('user')).toBe(true);
      expect(canStartStream('vendor')).toBe(false);
      expect(canStartStream('admin')).toBe(false);
    });

    test('should validate charging permissions correctly', () => {
      expect(canChargeSession('user')).toBe(true);
      expect(canChargeSession('vendor')).toBe(false);
      expect(canChargeSession('admin')).toBe(false);
    });

    test('should validate service creation permissions correctly', () => {
      expect(canCreateService('vendor')).toBe(true);
      expect(canCreateService('user')).toBe(false);
      expect(canCreateService('admin')).toBe(false);
    });
  });

  describe('Integration Flow', () => {
    test('complete normal user flow should work', () => {
      // Start session
      const sessionResult = startStreamingSession(mockUsers.normalUser, 'service_123');
      expect(sessionResult.success).toBe(true);
      
      // Charge session
      const chargeResult = chargeSession(mockUsers.normalUser, sessionResult.session.sessionId, 15);
      expect(chargeResult.success).toBe(true);
      expect(chargeResult.remainingBalance).toBe(85);
    });

    test('vendor flow should be properly blocked', () => {
      // Vendor tries to start session
      const sessionResult = startStreamingSession(mockUsers.vendor, 'service_123');
      expect(sessionResult.success).toBe(false);
      
      // Vendor tries to get charged
      const chargeResult = chargeSession(mockUsers.vendor, 'session_456', 15);
      expect(chargeResult.success).toBe(false);
    });
  });
});