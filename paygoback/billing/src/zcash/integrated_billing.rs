// src/zcash/integrated_billing.rs
use sqlx::PgPool;
use redis::Client as RedisClient;
use std::sync::Arc;
use chrono::{Utc, Duration};
use uuid::Uuid;
use rust_decimal::Decimal;
use tracing::{info, warn, error};

use crate::models::*;
use crate::blockchain::BlockchainClient;
use crate::config::Config;
use crate::error::BillingError;
use crate::db;
use crate::cache;
use crate::zcash::zcash_service::ZcashService;

/// Enhanced billing engine that integrates with Zcash spending permissions
pub struct IntegratedBillingEngine {
    db_pool: PgPool,
    redis_client: RedisClient,
    blockchain_client: Arc<BlockchainClient>,
    zcash_service: Arc<ZcashService>,
    config: Config,
}

impl IntegratedBillingEngine {
    pub fn new(
        db_pool: PgPool,
        redis_client: RedisClient,
        blockchain_client: Arc<BlockchainClient>,
        zcash_service: Arc<ZcashService>,
        config: Config,
    ) -> Self {
        Self {
            db_pool,
            redis_client,
            blockchain_client,
            zcash_service,
            config,
        }
    }

    /// Create a session with Zcash permission validation
    pub async fn create_session_with_permission(
        &self,
        user_wallet_address: String,
        vendor_id: String,
    ) -> Result<CreateSessionResponse, BillingError> {
        // Check if user has an active Zcash spending permission
        let permission_opt = self.zcash_service
            .get_active_permission_by_wallet(&user_wallet_address)
            .await?;

        let permission = match permission_opt {
            Some(p) => p,
            None => {
                return Err(BillingError::Config(
                    "No active spending permission found. Please create a permission first.".to_string()
                ));
            }
        };

        // Check if permission has remaining balance
        if permission.remaining_amount <= Decimal::ZERO {
            return Err(BillingError::InsufficientBalance);
        }

        // Generate unique session code
        let session_code = self.generate_session_code();
        
        // Fetch vendor details
        let vendor_wallet_address = self.get_vendor_wallet(&vendor_id).await?;
        let rate_per_hour = self.get_vendor_rate(&vendor_id).await?;
        
        // Validate rate matches permission rate
        if rate_per_hour != permission.rate_per_hour {
            warn!(
                "Rate mismatch for user {}. Expected: {}, Got: {}",
                user_wallet_address, permission.rate_per_hour, rate_per_hour
            );
        }

        let now = Utc::now();
        let session = StreamingSession {
            id: Uuid::new_v4(),
            session_code: session_code.clone(),
            user_wallet_address: user_wallet_address.clone(),
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
            86400,
        )
        .await?;

        // Link session to permission
        self.link_session_to_permission(created_session.id, permission.id).await?;
        
        info!(
            "Created session {} for user {} with permission {}",
            session_code, user_wallet_address, permission.id
        );
        
        Ok(CreateSessionResponse {
            session_code,
            session_id: created_session.id,
        })
    }

    /// End session and deduct from Zcash permission
    pub async fn end_session_with_permission(
        &self,
        session_code: &str,
    ) -> Result<BillingTransaction, BillingError> {
        let mut session = db::get_session_by_code(&self.db_pool, session_code).await?;
        
        if session.status != SessionStatus::Active {
            return Err(BillingError::InvalidSessionCode);
        }

        // Get the linked permission
        let permission_id = self.get_session_permission_id(session.id).await?;
        
        // Calculate final duration
        let now = Utc::now();
        let duration = now.signed_duration_since(session.last_billed_time);
        let hours = Decimal::from(duration.num_seconds()) / Decimal::from(3600);
        let amount = session.rate_per_hour * hours;

        // Deduct from Zcash permission
        match self.zcash_service.deduct_streaming_time(permission_id, hours).await {
            Ok(_) => {
                info!("Deducted {} hours from permission {}", hours, permission_id);
            }
            Err(e) => {
                error!("Failed to deduct from permission: {:?}", e);
                session.status = SessionStatus::Failed;
                db::update_session(&self.db_pool, &session).await?;
                return Err(e);
            }
        }

        // Create transaction record
        let transaction = BillingTransaction {
            id: Uuid::new_v4(),
            session_id: session.id,
            user_wallet_address: session.user_wallet_address.clone(),
            vendor_wallet_address: session.vendor_wallet_address.clone(),
            amount,
            duration_minutes: duration.num_minutes(),
            tx_hash: None, // Zcash permissions don't generate tx hashes per session
            status: TransactionStatus::Confirmed,
            created_at: Utc::now(),
        };
        
        let saved_transaction = db::create_transaction(&self.db_pool, &transaction).await?;
        
        // Mark session as completed
        session.status = SessionStatus::Completed;
        session.end_time = Some(now);
        session.total_amount_billed += amount;
        db::update_session(&self.db_pool, &session).await?;
        
        info!("Ended session {} with final bill ${}", session_code, amount);
        
        Ok(saved_transaction)
    }

    /// Process active sessions with Zcash permission deduction
    pub async fn process_active_sessions_with_permissions(&self) -> Result<(), BillingError> {
        let active_sessions = db::get_active_sessions(&self.db_pool).await?;
        
        info!("Processing {} active sessions with Zcash permissions", active_sessions.len());
        
        for mut session in active_sessions {
            let now = Utc::now();
            let duration = now.signed_duration_since(session.last_billed_time);
            
            // Bill if interval has passed
            if duration.num_seconds() >= self.config.billing_interval_seconds as i64 {
                // Get the linked permission
                let permission_id_result = self.get_session_permission_id(session.id).await;
                
                match permission_id_result {
                    Ok(permission_id) => {
                        let hours = Decimal::from(duration.num_seconds()) / Decimal::from(3600);
                        
                        // Try to deduct from permission
                        match self.zcash_service.deduct_streaming_time(permission_id, hours).await {
                            Ok(_) => {
                                let amount = session.rate_per_hour * hours;
                                
                                // Create transaction record
                                let transaction = BillingTransaction {
                                    id: Uuid::new_v4(),
                                    session_id: session.id,
                                    user_wallet_address: session.user_wallet_address.clone(),
                                    vendor_wallet_address: session.vendor_wallet_address.clone(),
                                    amount,
                                    duration_minutes: duration.num_minutes(),
                                    tx_hash: None,
                                    status: TransactionStatus::Confirmed,
                                    created_at: Utc::now(),
                                };
                                
                                let _ = db::create_transaction(&self.db_pool, &transaction).await;
                                
                                // Update session
                                session.last_billed_time = Utc::now();
                                session.total_amount_billed += amount;
                                let _ = db::update_session(&self.db_pool, &session).await;
                                
                                info!(
                                    "Billed session {} for ${} from permission",
                                    session.session_code, amount
                                );
                            }
                            Err(BillingError::InsufficientBalance) => {
                                warn!(
                                    "Insufficient balance in permission for session {}",
                                    session.session_code
                                );
                                session.status = SessionStatus::Paused;
                                let _ = db::update_session(&self.db_pool, &session).await;
                            }
                            Err(e) => {
                                error!("Failed to deduct from permission: {:?}", e);
                                session.status = SessionStatus::Failed;
                                let _ = db::update_session(&self.db_pool, &session).await;
                            }
                        }
                    }
                    Err(e) => {
                        error!("Failed to get permission for session {}: {:?}", session.session_code, e);
                        // Fallback to regular blockchain billing
                        match self.bill_session_blockchain(&mut session, duration).await {
                            Ok(transaction) => {
                                info!(
                                    "Billed session {} via blockchain fallback for ${}",
                                    session.session_code, transaction.amount
                                );
                            }
                            Err(e) => {
                                error!("Blockchain billing also failed: {:?}", e);
                                session.status = SessionStatus::Failed;
                                let _ = db::update_session(&self.db_pool, &session).await;
                            }
                        }
                    }
                }
            }
        }
        
        Ok(())
    }

    /// Get estimated streaming hours for a user
    pub async fn get_user_streaming_capacity(
        &self,
        user_wallet_address: &str,
    ) -> Result<StreamingCapacity, BillingError> {
        let permission_opt = self.zcash_service
            .get_active_permission_by_wallet(user_wallet_address)
            .await?;

        match permission_opt {
            Some(permission) => {
                let remaining_hours = if permission.rate_per_hour > Decimal::ZERO {
                    permission.remaining_amount / permission.rate_per_hour
                } else {
                    Decimal::ZERO
                };

                Ok(StreamingCapacity {
                    has_permission: true,
                    remaining_balance: permission.remaining_amount,
                    remaining_hours,
                    rate_per_hour: permission.rate_per_hour,
                    expires_at: Some(permission.expires_at),
                })
            }
            None => {
                Ok(StreamingCapacity {
                    has_permission: false,
                    remaining_balance: Decimal::ZERO,
                    remaining_hours: Decimal::ZERO,
                    rate_per_hour: Decimal::ZERO,
                    expires_at: None,
                })
            }
        }
    }

    // Private helper methods

    async fn link_session_to_permission(
        &self,
        session_id: Uuid,
        permission_id: Uuid,
    ) -> Result<(), BillingError> {
        sqlx::query(
            r#"
            INSERT INTO session_permissions (session_id, permission_id, created_at)
            VALUES ($1, $2, NOW())
            "#
        )
        .bind(session_id)
        .bind(permission_id)
        .execute(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(())
    }

    async fn get_session_permission_id(&self, session_id: Uuid) -> Result<Uuid, BillingError> {
        let result: (Uuid,) = sqlx::query_as(
            r#"
            SELECT permission_id
            FROM session_permissions
            WHERE session_id = $1
            "#
        )
        .bind(session_id)
        .fetch_one(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(result.0)
    }

    async fn bill_session_blockchain(
        &self,
        session: &mut StreamingSession,
        duration: Duration,
    ) -> Result<BillingTransaction, BillingError> {
        let hours = Decimal::from(duration.num_seconds()) / Decimal::from(3600);
        let amount = session.rate_per_hour * hours;
        
        let balance = self.blockchain_client
            .get_user_balance(&session.user_wallet_address)
            .await?;
        
        if balance < amount {
            return Err(BillingError::InsufficientBalance);
        }
        
        let tx_hash = self.blockchain_client
            .bill_user(
                &session.user_wallet_address,
                &session.vendor_wallet_address,
                amount,
            )
            .await?;
        
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
        
        session.last_billed_time = Utc::now();
        session.total_amount_billed += amount;
        db::update_session(&self.db_pool, session).await?;
        
        Ok(saved_transaction)
    }

    fn generate_session_code(&self) -> String {
        use rand::Rng;
        const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let mut rng = rand::rng();
        
        (0..12)
            .map(|_| {
                let idx = rng.random_range(0..CHARSET.len());
                CHARSET[idx] as char
            })
            .collect()
    }

    async fn get_vendor_wallet(&self, vendor_id: &str) -> Result<String, BillingError> {
        let url = format!("{}/internal/vendors/{}", self.config.vendor_service_url, vendor_id);
        let client = reqwest::Client::new();
        let response = client.get(&url)
            .bearer_auth(&self.config.vendor_service_token)
            .send()
            .await
            .map_err(|e| BillingError::Config(format!("vendor service request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(BillingError::Config(
                format!("Vendor Service returned status {} for vendor {}", response.status(), vendor_id)
            ));
        }

        let vendor: VendorInfo = response.json().await
            .map_err(|e| BillingError::Config(format!("Invalid vendor JSON: {}", e)))?;

        if !vendor.wallet_address.starts_with("0x") || vendor.wallet_address.len() != 42 {
            return Err(BillingError::Config(format!("Invalid vendor wallet for {}", vendor_id)));
        }

        Ok(vendor.wallet_address)
    }

    async fn get_vendor_rate(&self, vendor_id: &str) -> Result<Decimal, BillingError> {
        let url = format!("{}/internal/vendors/{}", self.config.vendor_service_url, vendor_id);
        let client = reqwest::Client::new();
        let response = client.get(&url)
            .bearer_auth(&self.config.vendor_service_token)
            .send()
            .await
            .map_err(|e| BillingError::Config(format!("Vendor service request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(BillingError::Config(
                format!("Vendor service returned status {} for vendor {}", response.status(), vendor_id)
            ));
        }

        let vendor: VendorInfo = response.json().await
            .map_err(|e| BillingError::Config(format!("Invalid vendor JSON: {}", e)))?;

        if vendor.rate_per_hour <= Decimal::ZERO || vendor.rate_per_hour > Decimal::from(1_000) {
            return Err(BillingError::Config(
                format!("Suspicious rate per hour {} for vendor {}", vendor.rate_per_hour, vendor_id)
            ));
        }

        Ok(vendor.rate_per_hour)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct StreamingCapacity {
    pub has_permission: bool,
    pub remaining_balance: Decimal,
    pub remaining_hours: Decimal,
    pub rate_per_hour: Decimal,
    pub expires_at: Option<chrono::DateTime<Utc>>,
}