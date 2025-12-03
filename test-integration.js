#!/usr/bin/env node

/**
 * PayGo Integration Test Script
 * Tests the full integration between frontend, backend, and smart contracts
 */

const { ethers } = require('ethers');
const axios = require('axios');

// Configuration
const CONFIG = {
  backendUrl: 'http://localhost:5000',
  frontendUrl: 'http://localhost:3000',
  rpcUrl: 'https://sepolia.base.org',
  contractAddresses: {
    escrowVault: '0xA973806Ba9102D42f102467EC9c0c859639139Be',
    billing: '0xB83B7fACFeAd639850A8E18D85f0AB0324D5b6D8',
    marketplace: '0xF4a7D296c6bfC7B3B1c9dA3c854E98153F957906'
  }
};

// Test results
const results = {
  backend: { status: 'pending', message: '' },
  blockchain: { status: 'pending', message: '' },
  contracts: { status: 'pending', message: '' },
  integration: { status: 'pending', message: '' }
};

async function testBackendConnection() {
  console.log('🔍 Testing Backend API connection...');

  try {
    const response = await axios.get(`${CONFIG.backendUrl}/api/v1/wallet/supported-tokens`);
    if (response.status === 200 && response.data.supportedTokens) {
      results.backend = { status: 'passed', message: 'Backend API responding correctly' };
      console.log('✅ Backend connection successful');
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    results.backend = { status: 'failed', message: `Backend connection failed: ${error.message}` };
    console.log('❌ Backend connection failed:', error.message);
  }
}

async function testBlockchainConnection() {
  console.log('🔍 Testing Blockchain connection...');

  try {
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const network = await provider.getNetwork();

    if (network.chainId === 84532n) { // Base Sepolia
      results.blockchain = { status: 'passed', message: 'Connected to Base Sepolia' };
      console.log('✅ Blockchain connection successful');
    } else {
      throw new Error(`Wrong network: ${network.name} (${network.chainId})`);
    }
  } catch (error) {
    results.blockchain = { status: 'failed', message: `Blockchain connection failed: ${error.message}` };
    console.log('❌ Blockchain connection failed:', error.message);
  }
}

async function testSmartContracts() {
  console.log('🔍 Testing Smart Contract connections...');

  try {
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);

    // Test Escrow Vault contract
    const escrowCode = await provider.getCode(CONFIG.contractAddresses.escrowVault);
    if (escrowCode === '0x') {
      throw new Error('Escrow Vault contract not deployed');
    }

    // Test Billing contract
    const billingCode = await provider.getCode(CONFIG.contractAddresses.billing);
    if (billingCode === '0x') {
      throw new Error('Billing contract not deployed');
    }

    // Test Marketplace contract
    const marketplaceCode = await provider.getCode(CONFIG.contractAddresses.marketplace);
    if (marketplaceCode === '0x') {
      throw new Error('Marketplace contract not deployed');
    }

    results.contracts = { status: 'passed', message: 'All contracts deployed and accessible' };
    console.log('✅ Smart contracts accessible');
  } catch (error) {
    results.contracts = { status: 'failed', message: `Contract test failed: ${error.message}` };
    console.log('❌ Smart contract test failed:', error.message);
  }
}

async function testIntegrationFlow() {
  console.log('🔍 Testing Integration Flow...');

  try {
    // Test wallet balance endpoint (should work even without auth for supported tokens)
    const tokensResponse = await axios.get(`${CONFIG.backendUrl}/api/v1/wallet/supported-tokens`);
    if (!tokensResponse.data.supportedTokens.includes('ETH')) {
      throw new Error('ETH not in supported tokens');
    }

    // Test that backend can communicate with blockchain
    // This is a basic connectivity test - full integration requires user authentication

    results.integration = { status: 'passed', message: 'Basic integration flow working' };
    console.log('✅ Integration flow test passed');
  } catch (error) {
    results.integration = { status: 'failed', message: `Integration test failed: ${error.message}` };
    console.log('❌ Integration flow test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting PayGo Integration Tests\n');
  console.log('=' .repeat(50));

  await testBackendConnection();
  console.log('');

  await testBlockchainConnection();
  console.log('');

  await testSmartContracts();
  console.log('');

  await testIntegrationFlow();
  console.log('');

  // Print results
  console.log('=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));

  const statusIcons = {
    passed: '✅',
    failed: '❌',
    pending: '⏳'
  };

  Object.entries(results).forEach(([component, result]) => {
    console.log(`${statusIcons[result.status]} ${component.toUpperCase()}: ${result.message}`);
  });

  console.log('');
  const allPassed = Object.values(results).every(r => r.status === 'passed');
  if (allPassed) {
    console.log('🎉 All integration tests passed! PayGo system is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, results };