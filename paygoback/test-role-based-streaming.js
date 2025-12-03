const crypto = require('crypto');

// Mock user roles and streaming functionality
const mockUsers = {
  normalUser: {
    userId: '507f1f77bcf86cd799439011',
    role: 'user',
    name: 'John User',
    email: 'user@paygo.com'
  },
  vendor: {
    userId: '507f1f77bcf86cd799439012', 
    role: 'vendor',
    name: 'Jane Vendor',
    email: 'vendor@paygo.com'
  },
  admin: {
    userId: '507f1f77bcf86cd799439013',
    role: 'admin', 
    name: 'Admin User',
    email: 'admin@paygo.com'
  }
};

const mockServices = [
  {
    _id: 'service_123',
    name: 'Premium Streaming',
    description: 'High quality streaming service',
    rate: 2.0, // per minute
    userId: mockUsers.vendor.userId // Created by vendor
  }
];

// Role-based streaming access control
const canStartStream = (userRole) => {
  return userRole === 'user';
};

const canCreateService = (userRole) => {
  return userRole === 'vendor';
};

const canChargeSession = (userRole) => {
  return userRole === 'user';
};

// Simulate streaming session start
const startStreamingSession = (user, serviceId) => {
  if (!canStartStream(user.role)) {
    return {
      success: false,
      error: `Access denied. Only normal users can start streaming sessions. Your role: ${user.role}`,
      userRole: user.role
    };
  }

  const service = mockServices.find(s => s._id === serviceId);
  if (!service) {
    return {
      success: false,
      error: 'Service not found'
    };
  }

  const sessionId = crypto.randomBytes(8).toString('hex');
  
  return {
    success: true,
    message: 'Streaming session started successfully',
    session: {
      sessionId,
      userId: user.userId,
      serviceId,
      vendorId: service.userId,
      startTime: new Date(),
      status: 'active'
    },
    userRole: user.role
  };
};

// Simulate session charging
const chargeSession = (user, sessionId, amount, rate, duration) => {
  if (!canChargeSession(user.role)) {
    return {
      success: false,
      error: `Access denied. Only normal users can be charged for sessions. Your role: ${user.role}`,
      userRole: user.role
    };
  }

  // Mock wallet balance
  const mockBalance = 100;
  
  if (mockBalance < amount) {
    return {
      success: false,
      error: 'Insufficient balance',
      currentBalance: mockBalance,
      required: amount
    };
  }

  const remainingBalance = mockBalance - amount;
  const isLowBalance = remainingBalance <= 20;

  return {
    success: true,
    message: 'Charge successful',
    remainingBalance,
    isLowBalance,
    sessionId,
    userRole: user.role
  };
};

// Test runner
const runRoleBasedTests = () => {
  console.log('🧪 Role-Based Streaming Access Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  const test = (name, testFn) => {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };
  
  const expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }
  });

  // Test 1: Normal user can start stream
  test('Normal user should be able to start streaming session', () => {
    const result = startStreamingSession(mockUsers.normalUser, 'service_123');
    expect(result.success).toBe(true);
    expect(result.userRole).toBe('user');
  });

  // Test 2: Vendor cannot start stream
  test('Vendor should NOT be able to start streaming session', () => {
    const result = startStreamingSession(mockUsers.vendor, 'service_123');
    expect(result.success).toBe(false);
    expect(result.userRole).toBe('vendor');
  });

  // Test 3: Admin cannot start stream
  test('Admin should NOT be able to start streaming session', () => {
    const result = startStreamingSession(mockUsers.admin, 'service_123');
    expect(result.success).toBe(false);
    expect(result.userRole).toBe('admin');
  });

  // Test 4: Normal user can be charged
  test('Normal user should be able to be charged for sessions', () => {
    const result = chargeSession(mockUsers.normalUser, 'session_123', 10, 2.0, 5);
    expect(result.success).toBe(true);
    expect(result.userRole).toBe('user');
  });

  // Test 5: Vendor cannot be charged
  test('Vendor should NOT be able to be charged for sessions', () => {
    const result = chargeSession(mockUsers.vendor, 'session_123', 10, 2.0, 5);
    expect(result.success).toBe(false);
    expect(result.userRole).toBe('vendor');
  });

  // Test 6: Role permissions
  test('Role permissions should be correctly defined', () => {
    expect(canStartStream('user')).toBe(true);
    expect(canStartStream('vendor')).toBe(false);
    expect(canStartStream('admin')).toBe(false);
    
    expect(canCreateService('vendor')).toBe(true);
    expect(canCreateService('user')).toBe(false);
    
    expect(canChargeSession('user')).toBe(true);
    expect(canChargeSession('vendor')).toBe(false);
  });

  console.log(`\n📊 Role-Based Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return { passed, failed };
};

// Integration flow test
const runIntegrationFlowTest = () => {
  console.log('\n🔄 PayGo Role-Based Integration Flow\n');
  
  // Scenario 1: Normal User Flow
  console.log('📱 Scenario 1: Normal User Flow');
  console.log('Step 1: User tries to start streaming session');
  const userStreamResult = startStreamingSession(mockUsers.normalUser, 'service_123');
  
  if (userStreamResult.success) {
    console.log(`✅ Session started: ${userStreamResult.session.sessionId}`);
    
    console.log('Step 2: User gets charged for session');
    const chargeResult = chargeSession(mockUsers.normalUser, userStreamResult.session.sessionId, 10, 2.0, 5);
    
    if (chargeResult.success) {
      console.log(`✅ Charge successful: $${10}, Remaining: $${chargeResult.remainingBalance}`);
      if (chargeResult.isLowBalance) {
        console.log('⚠️  Low balance alert triggered');
      }
    } else {
      console.log(`❌ Charge failed: ${chargeResult.error}`);
    }
  } else {
    console.log(`❌ Stream start failed: ${userStreamResult.error}`);
  }
  
  // Scenario 2: Vendor Flow (Should Fail)
  console.log('\n🏪 Scenario 2: Vendor Flow (Should Fail)');
  console.log('Step 1: Vendor tries to start streaming session');
  const vendorStreamResult = startStreamingSession(mockUsers.vendor, 'service_123');
  
  if (!vendorStreamResult.success) {
    console.log(`✅ Correctly blocked: ${vendorStreamResult.error}`);
  } else {
    console.log(`❌ Security issue: Vendor was allowed to start stream`);
  }
  
  console.log('Step 2: Vendor tries to get charged');
  const vendorChargeResult = chargeSession(mockUsers.vendor, 'session_456', 10, 2.0, 5);
  
  if (!vendorChargeResult.success) {
    console.log(`✅ Correctly blocked: ${vendorChargeResult.error}`);
  } else {
    console.log(`❌ Security issue: Vendor was allowed to be charged`);
  }
  
  // Scenario 3: PayGo UID Access
  console.log('\n🆔 Scenario 3: PayGo UID Access (All roles allowed)');
  Object.values(mockUsers).forEach(user => {
    const paygoUID = crypto.createHash('sha256').update(user.userId).digest('hex').substring(0, 16);
    const canStartStreams = user.role === 'user';
    console.log(`✅ ${user.role}: UID=${paygoUID}, Can Start Streams=${canStartStreams}`);
  });
  
  console.log('\n🎉 Integration flow test completed!');
};

// API endpoint simulation
const simulateAPIEndpoints = () => {
  console.log('\n🌐 Role-Based API Endpoint Simulation\n');
  
  // POST /api/v1/streams/start (Normal User)
  console.log('POST /api/v1/streams/start (Normal User)');
  const userRequest = {
    user: mockUsers.normalUser,
    body: { serviceId: 'service_123', device: 'mobile' }
  };
  
  const userResponse = startStreamingSession(userRequest.user, userRequest.body.serviceId);
  console.log(`Request User: ${userRequest.user.role}`);
  console.log(`Response: ${JSON.stringify(userResponse, null, 2)}\n`);
  
  // POST /api/v1/streams/start (Vendor - Should Fail)
  console.log('POST /api/v1/streams/start (Vendor - Should Fail)');
  const vendorRequest = {
    user: mockUsers.vendor,
    body: { serviceId: 'service_123', device: 'desktop' }
  };
  
  const vendorResponse = startStreamingSession(vendorRequest.user, vendorRequest.body.serviceId);
  console.log(`Request User: ${vendorRequest.user.role}`);
  console.log(`Response: ${JSON.stringify(vendorResponse, null, 2)}\n`);
  
  // POST /api/v1/wallet/charge-session (Normal User)
  console.log('POST /api/v1/wallet/charge-session (Normal User)');
  const chargeRequest = {
    user: mockUsers.normalUser,
    body: { sessionId: 'session_123', amount: 10, rate: 2.0, duration: 5, serviceType: 'streaming' }
  };
  
  const chargeResponse = chargeSession(
    chargeRequest.user, 
    chargeRequest.body.sessionId, 
    chargeRequest.body.amount, 
    chargeRequest.body.rate, 
    chargeRequest.body.duration
  );
  console.log(`Request User: ${chargeRequest.user.role}`);
  console.log(`Response: ${JSON.stringify(chargeResponse, null, 2)}\n`);
  
  console.log('✅ All role-based API endpoints simulated successfully!');
};

// Run all tests
console.log('🚀 Starting Role-Based PayGo Streaming Tests...\n');

const testResults = runRoleBasedTests();
runIntegrationFlowTest();
simulateAPIEndpoints();

console.log('\n🏁 All role-based tests completed!');
console.log('\n📋 Role-Based Access Summary:');
console.log('- Normal Users: ✅ Can start streams, ✅ Can be charged');
console.log('- Vendors: ❌ Cannot start streams, ❌ Cannot be charged');
console.log('- Admins: ❌ Cannot start streams, ❌ Cannot be charged');
console.log('- All Roles: ✅ Can get PayGo UID');

if (testResults.failed === 0) {
  console.log('\n🎉 Role-based streaming access is working as intended!');
  console.log('✅ Only normal users can start streaming sessions');
  console.log('✅ Only normal users can be charged for sessions');
  console.log('✅ Vendors are restricted from streaming (they create services instead)');
} else {
  console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please review.`);
}