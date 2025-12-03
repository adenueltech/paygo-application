// src/zcash/zcash_config.rs
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub struct ZcashConfig {
    pub rpc_url: String,
    pub rpc_user: String,
    pub rpc_password: String,
    pub service_wallet_address: String,
    pub min_confirmations: u32,
    pub default_permission_duration_days: i64,
}

impl ZcashConfig {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(ZcashConfig {
            rpc_url: std::env::var("ZCASH_RPC_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8232".to_string()),
            rpc_user: std::env::var("ZCASH_RPC_USER")?,
            rpc_password: std::env::var("ZCASH_RPC_PASSWORD")?,
            service_wallet_address: std::env::var("ZCASH_SERVICE_WALLET")?,
            min_confirmations: std::env::var("ZCASH_MIN_CONFIRMATIONS")
                .unwrap_or_else(|_| "1".to_string())
                .parse()?,
            default_permission_duration_days: std::env::var("DEFAULT_PERMISSION_DURATION_DAYS")
                .unwrap_or_else(|_| "30".to_string())
                .parse()?,
        })
    }
}

// Update the main Config struct
#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub rpc_url: String,
    pub contract_address: String,
    pub private_key: String,
    pub chain_id: u64,
    pub host: String,
    pub port: u16,
    pub billing_interval_seconds: u64,
    pub vendor_service_url: String,
    pub vendor_service_token: String,
    pub zcash: ZcashConfig,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config {
            database_url: std::env::var("DATABASE_URL")?,
            redis_url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            rpc_url: std::env::var("RPC_URL")?,
            contract_address: std::env::var("CONTRACT_ADDRESS")?,
            private_key: std::env::var("PRIVATE_KEY")?,
            chain_id: std::env::var("CHAIN_ID")?.parse()?,
            host: std::env::var("HOST")
                .unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()?,
            billing_interval_seconds: std::env::var("BILLING_INTERVAL_SECONDS")
                .unwrap_or_else(|_| "60".to_string())
                .parse()?,
            vendor_service_url: std::env::var("VENDOR_SERVICE_URL")?,
            vendor_service_token: std::env::var("VENDOR_SERVICE_TOKEN")?,
            zcash: ZcashConfig::from_env()?,
        })
    }
}