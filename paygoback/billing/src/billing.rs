use sqlx::PgPool;
use redis::Client as RedisClient;
use std::sync::Arc;
use chrono::{Utc, Duration};
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;
use tracing::{info, warn, error};

use crate::models::*;
use crate::blockchain::BlockchainClient;
use crate::config::Config;
use crate::error::BillingError;
use crate::db;
use crate::cache;
use crate::models::VendorInfo;

pub struct BillingEngine {
    db_pool: PgPool,
    redis_client: RedisClient,
    blockchain_client: Arc<BlockchainClient>,
    config: Config,
}

impl BillingEngine {
    pub fn new(
        db_pool: PgPool,
        redis_client: RedisClient,
        blockchain_client: Arc<BlockchainClient>,
        config: Config,
    ) -> Self {
        Self {
            db_pool,
            redis_client,
            blockchain_client,
            config,
        }
    }
    
    pub async fn create_session(
        &self,
        user_wallet_address: String,
        vendor_id: String,
    ) -> Result<CreateSessionResponse, BillingError> {
        // Generate unique session code
        let session_code = self.generate_session_code();
        
        // Fetch vendor details (this would come from your Node.js service)
        let vendor_wallet_address = self.get_vendor_wallet(&vendor_id).await?;
        let rate_per_hour = self.get_vendor_rate(&vendor_id).await?;
        
        let now = Utc::now();
        let session = StreamingSession {
            id: Uuid::new_v4(),
            session_code: session_code.clone(),
            user_wallet_address,
            vendor_wallet_address,
            vendor_id,
            start_time: now,
            last_billed_time: now,
            end_time: None,
            rate_per_hour,
            total_amount_billed: Decimal::ZERO,
            status: SessionStatus::Active,
            created_at: now,
            updated_at: now,
        };
        
        let created_session = db::create_session(&self.db_pool, &session).await?;
        
        // Cache session code for quick lookup
        cache::cache_session_code(
            &self.redis_client,
            &session_code,
            &created_session.id.to_string(),
            86400, // 24 hours
        )
        .await?;
        
        info!("Created session {} for user {}", session_code, session.user_wallet_address);
        
        Ok(CreateSessionResponse {
            session_code,
            session_id: created_session.id,
        })
    }
    
    pub async fn activate_session(&self, session_code: &str) -> Result<StreamingSession, BillingError> {
        let mut session = db::get_session_by_code(&self.db_pool, session_code).await?;
        
        // Update start time to now when activated
        session.start_time = Utc::now();
        session.last_billed_time = Utc::now();
        session.status = SessionStatus::Active;
        
        db::update_session(&self.db_pool, &session).await?;
        
        info!("Activated session {}", session_code);
        
        Ok(session)
    }
    
    pub async fn end_session(&self, session_code: &str) -> Result<BillingTransaction, BillingError> {
        let mut session = db::get_session_by_code(&self.db_pool, session_code).await?;
        
        if session.status != SessionStatus::Active {
            return Err(BillingError::InvalidSessionCode);
        }
        
        // Calculate final billing
        let now = Utc::now();
        let duration = now.signed_duration_since(session.last_billed_time);
        let transaction = self.bill_session(&mut session, duration).await?;
        
        // Mark session as completed
        session.status = SessionStatus::Completed;
        session.end_time = Some(now);
        db::update_session(&self.db_pool, &session).await?;
        
        info!("Ended session {} with final bill ${}", session_code, transaction.amount);
        
        Ok(transaction)
    }
    
    pub async fn process_active_sessions(&self) -> Result<(), BillingError> {
        let active_sessions = db::get_active_sessions(&self.db_pool).await?;
        
        info!("Processing {} active sessions", active_sessions.len());
        
        for mut session in active_sessions {
            let now = Utc::now();
            let duration = now.signed_duration_since(session.last_billed_time);
            
            // Bill if interval has passed
            if duration.num_seconds() >= self.config.billing_interval_seconds as i64 {
                match self.bill_session(&mut session, duration).await {
                    Ok(transaction) => {
                        info!(
                            "Billed session {} for ${} (tx: {})",
                            session.session_code,
                            transaction.amount,
                            transaction.tx_hash.unwrap_or_default()
                        );
                    }
                    Err(e) => {
                        error!("Failed to bill session {}: {:?}", session.session_code, e);
                        session.status = SessionStatus::Failed;
                        let _ = db::update_session(&self.db_pool, &session).await;
                    }
                }
            }
        }
        
        Ok(())
    }
    
    async fn bill_session(
        &self,
        session: &mut StreamingSession,
        duration: Duration,
    ) -> Result<BillingTransaction, BillingError> {
        let hours = Decimal::from(duration.num_seconds()) / Decimal::from(3600);
        let amount = session.rate_per_hour * hours;
        
        // Check user balance
        let balance = self.blockchain_client
            .get_user_balance(&session.user_wallet_address)
            .await?;
        
        if balance < amount {
            warn!("Insufficient balance for user {}", session.user_wallet_address);
            return Err(BillingError::InsufficientBalance);
        }
        
        // Execute blockchain transaction
        let tx_hash = self.blockchain_client
            .bill_user(
                &session.user_wallet_address,
                &session.vendor_wallet_address,
                amount,
            )
            .await?;
        
        // Create transaction record
        let transaction = BillingTransaction {
            id: Uuid::new_v4(),
            session_id: session.id,
            user_wallet_address: session.user_wallet_address.clone(),
            vendor_wallet_address: session.vendor_wallet_address.clone(),
            amount,
            duration_minutes: duration.num_minutes(),
            tx_hash: Some(tx_hash),
            status: TransactionStatus::Confirmed,
            created_at: Utc::now(),
        };
        
        let saved_transaction = db::create_transaction(&self.db_pool, &transaction).await?;
        
        // Update session
        session.last_billed_time = Utc::now();
        session.total_amount_billed += amount;
        db::update_session(&self.db_pool, session).await?;
        
        Ok(saved_transaction)
    }
    
    fn generate_session_code(&self) -> String {
        use rand_chacha::rand_core::{SeedableRng, RngCore};
        
        // Use cryptographically secure RNG with system entropy
        let mut rng = rand_chacha::ChaCha8Rng::from_entropy();
        const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        (0..12)
            .map(|_| {
                let idx = rng.next_u32() as usize % CHARSET.len();
                CHARSET[idx] as char
            })
            .collect()
    }
    
    async fn get_vendor_wallet(&self, vendor_id: &str) -> Result<String, BillingError> {
        // For testing, if vendor service is mock, return mock data
        if self.config.vendor_service_url.contains("mock-vendor-service") {
            return Ok("0x1234567890123456789012345678901234567890".to_string());
        }

        let url = format!("{}/internal/vendors/{}", self.config.vendor_service_url, vendor_id);

        let client = reqwest::Client::new();
        let response = client.get(&url)
            .bearer_auth(&self.config.vendor_service_token)
            .send()
            .await
            .map_err(|e| BillingError::Config(format!("vendor service request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(BillingError::Config(
                format!("Vendor Service returned status {} for vendor {}",
                    response.status(),  
                    vendor_id
            )
            ));
        }

        let vendor: VendorInfo = response
        .json()
        .await
        .map_err(|e| BillingError::Config(format!("Invalid vendor JSON: {}", e)))?;

        //Basic validation on wallet address format for length and prefix
        if !vendor.wallet_address.starts_with("0x") || vendor.wallet_address.len() != 42 {
            return Err(BillingError::Config(format!(
                "Invalid vendor wallet for {}",
                vendor_id
            )));

        }
        Ok(vendor.wallet_address)
    }
    
    async fn get_vendor_rate(&self, vendor_id: &str) -> Result<Decimal, BillingError> {
        // For testing, if vendor service is mock, return mock data
        if self.config.vendor_service_url.contains("mock-vendor-service") {
            return Ok(Decimal::from_str_exact("10.50").unwrap()); // $10.50 per hour
        }

        let url = format!("{}/internal/vendors/{}", self.config.vendor_service_url, vendor_id);

        let client = reqwest::Client::new();
        let response = client.get(&url)
        .bearer_auth(&self.config.vendor_service_token)
        .send()
        .await
        .map_err(|e| BillingError::Config(format!("Vendor service request failed: {}", e)))?;

    if !response.status().is_success() {
        return Err(BillingError::Config(format!("Vendor service returned status {} for vendor {}", 
        response.status(),
        vendor_id
    )));
    }

    let vendor: VendorInfo = response
    .json()
    .await
    .map_err(|e| BillingError::Config(format!("Invalid vendor JSON: {}", e)))?;

    //basic check on the rate of the vendor
    if vendor.rate_per_hour <= Decimal::ZERO || vendor.rate_per_hour > Decimal::from(1_000) {
        return Err(BillingError::Config(format!(
            "Suspicious rate per hour {} for vendor {}",
            vendor.rate_per_hour,
            vendor_id
        )));
    }
        Ok(vendor.rate_per_hour)
    }
}

