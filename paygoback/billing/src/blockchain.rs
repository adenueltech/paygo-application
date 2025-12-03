use ethers::{
    prelude::*,
    providers::{Provider, Ws},
    signers::{LocalWallet, Signer},
    types::Address,
};
use std::sync::Arc;
use crate::error::BillingError;
use rust_decimal::{prelude::ToPrimitive, Decimal};

// ABI for the billing smart contract
abigen!(
    BillingContract,
    r#"[
        function billUser(address user, address vendor, uint256 amount) external returns (bytes32)
        function getUserBalance(address user) external view returns (uint256)
    ]"#,
);

pub struct BlockchainClient {
    provider: Option<Arc<Provider<Ws>>>,
    wallet: Option<LocalWallet>,
    contract: Option<BillingContract<SignerMiddleware<Arc<Provider<Ws>>, LocalWallet>>>,
}

impl BlockchainClient {
    pub fn disabled() -> Self {
        Self {
            provider: None,
            wallet: None,
            contract: None,
        }
    }

    pub async fn new(
        rpc_url: &str,
        contract_address: &str,
    ) -> Result<Self, BillingError> {
        let provider = Provider::<Ws>::connect(rpc_url)
            .await
            .map_err(|e| BillingError::Blockchain(e.to_string()))?;
        
        let provider = Arc::new(provider);
        
        let private_key = std::env::var("PRIVATE_KEY")
            .map_err(|e| BillingError::Config(e.to_string()))?;
        
        let wallet: LocalWallet = private_key
            .parse()
            .map_err(|e| BillingError::Blockchain(format!("Invalid private key: {}", e)))?;
        
        let chain_id = std::env::var("CHAIN_ID")
            .unwrap_or_else(|_| "1".to_string())
            .parse::<u64>()
            .map_err(|e| BillingError::Config(e.to_string()))?;
        
        let wallet = wallet.with_chain_id(chain_id);
        
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());
        
        let address: Address = contract_address
            .parse()
            .map_err(|e| BillingError::Blockchain(format!("Invalid contract address: {}", e)))?;
        
        let contract = BillingContract::new(address, Arc::new(client));
        
        Ok(Self {
            provider: Some(provider),
            wallet: Some(wallet),
            contract: Some(contract),
        })
    }
    
    pub async fn bill_user(
        &self,
        user_address: &str,
        vendor_address: &str,
        amount: Decimal,
    ) -> Result<String, BillingError> {
        // Check if blockchain client is available
        let contract = match &self.contract {
            Some(contract) => contract,
            None => return Err(BillingError::Blockchain("Blockchain client not available - using Zcash instead".to_string())),
        };

        let user_addr: Address = user_address
            .parse()
            .map_err(|e| BillingError::Blockchain(format!("Invalid user address: {}", e)))?;
        
        let vendor_addr: Address = vendor_address
            .parse()
            .map_err(|e| BillingError::Blockchain(format!("Invalid vendor address: {}", e)))?;
        
        // Convert decimal to wei (assuming 18 decimals)
        let amount_wei = (amount * Decimal::from(10_u64.pow(18)))
            .to_u128()
            .ok_or_else(|| BillingError::Blockchain("Amount overflow".to_string()))?;
        
        let tx = contract
            .bill_user(user_addr, vendor_addr, U256::from(amount_wei))
            .send()
            .await
            .map_err(|e| BillingError::Blockchain(format!("Transaction failed: {}", e)))?
            .await
            .map_err(|e| BillingError::Blockchain(format!("Transaction receipt failed: {}", e)))?
            .ok_or_else(|| BillingError::Blockchain("No transaction receipt".to_string()))?;
        
        Ok(format!("{:?}", tx.transaction_hash))
    }
    
    pub async fn get_user_balance(&self, user_address: &str) -> Result<Decimal, BillingError> {
        // Check if blockchain client is available
        let contract = match &self.contract {
            Some(contract) => contract,
            None => return Err(BillingError::Blockchain("Blockchain client not available - using Zcash instead".to_string())),
        };

        let user_addr: Address = user_address
            .parse()
            .map_err(|e| BillingError::Blockchain(format!("Invalid user address: {}", e)))?;
        
        let balance = contract
            .get_user_balance(user_addr)
            .call()
            .await
            .map_err(|e| BillingError::Blockchain(format!("Balance query failed: {}", e)))?;
        
        // Convert from wei to token units (assuming 18 decimals)
        let balance_decimal = Decimal::from(balance.as_u128()) / Decimal::from(10_u64.pow(18));
        
        Ok(balance_decimal)
    }
}