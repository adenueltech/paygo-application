# PayGo MVP Deployment Instructions

## Prerequisites
1. Make sure you have Sepolia test ETH in your wallet
2. Have your private key ready
3. Environment variables set up

## Step 1: Set up your environment variables

Edit your `.env` file and add your private key:
```bash
DEPLOYER_PRIVATE_KEY=your_actual_private_key_here
```

## Step 2: Deploy to Sepolia Testnet

Run this command:
```bash
forge script script/Deploy_MVP.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast --slow
```

## Step 3: Alternative RPC URLs (if the above doesn't work)
```bash
# Infura
forge script script/Deploy_MVP.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY --broadcast --slow

# Alchemy
forge script script/Deploy_MVP.s.sol --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY --broadcast --slow

# Ankr
forge script script/Deploy_MVP.s.sol --rpc-url https://rpc.ankr.com/eth_sepolia --broadcast --slow
```

## Step 4: Expected Output
After successful deployment, you should see:
```
Vault: [DEPLOYED_CONTRACT_ADDRESS]
Registry: [DEPLOYED_CONTRACT_ADDRESS]
Marketplace: [DEPLOYED_CONTRACT_ADDRESS]
Billing: [DEPLOYED_CONTRACT_ADDRESS]
Scheduler: [DEPLOYED_CONTRACT_ADDRESS]
```

## Step 5: Verify Contracts (Optional)
```bash
forge script script/Deploy_MVP.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast --slow --verify
```

## Step 6: Update .env file with deployed addresses
After successful deployment, update your `.env` file:
```
ESCROW_VAULT_ADDRESS=[your_vault_address]
MARKETPLACE_ADDRESS=[your_marketplace_address]
BILLING_ADDRESS=[your_billing_address]
MERCHANT_REGISTRY_ADDRESS=[your_registry_address]
SUBSCRIPTION_SCHEDULER_ADDRESS=[your_scheduler_address]
```

## Troubleshooting
- If you get "insufficient funds", make sure you have Sepolia test ETH
- If RPC errors occur, try a different RPC endpoint
- For private key issues, ensure it's formatted correctly (with 0x prefix)