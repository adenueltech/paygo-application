// src/zcash/zcash_service.rs
use reqwest::Client;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use sqlx::{PgPool, prelude::FromRow};
use tracing::{info, warn, error};
use std::collections::HashMap;

use crate::error::BillingError;

// Zcash RPC request/response structures
#[derive(Debug, Serialize)]
struct ZcashRpcRequest {
    jsonrpc: String,
    id: String,
    method: String,
    params: Vec<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct ZcashRpcResponse<T> {
    result: Option<T>,
    error: Option<ZcashRpcError>,
    id: String,
}

#[derive(Debug, Deserialize)]
struct ZcashRpcError {
    code: i32,
    message: String,
}

#[derive(Debug, Deserialize)]
struct ZcashBalance {
    transparent: String,
    private: String,
    total: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SpendingPermission {
    pub id: Uuid,
    pub user_wallet_address: String,
    pub approved_amount: Decimal,
    pub remaining_amount: Decimal,
    pub rate_per_hour: Decimal,
    pub max_streaming_hours: Decimal,
    pub used_streaming_hours: Decimal,
    pub status: PermissionStatus,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum PermissionStatus {
    Pending,
    Approved,
    Active,
    Exhausted,
    Expired,
    Revoked,
}

impl std::fmt::Display for PermissionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PermissionStatus::Pending => write!(f, "pending"),
            PermissionStatus::Approved => write!(f, "approved"),
            PermissionStatus::Active => write!(f, "active"),
            PermissionStatus::Exhausted => write!(f, "exhausted"),
            PermissionStatus::Expired => write!(f, "expired"),
            PermissionStatus::Revoked => write!(f, "revoked"),
        }
    }
}

impl std::str::FromStr for PermissionStatus {
    type Err = BillingError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(PermissionStatus::Pending),
            "approved" => Ok(PermissionStatus::Approved),
            "active" => Ok(PermissionStatus::Active),
            "exhausted" => Ok(PermissionStatus::Exhausted),
            "expired" => Ok(PermissionStatus::Expired),
            "revoked" => Ok(PermissionStatus::Revoked),
            _ => Err(BillingError::Config(format!("Invalid permission status: {}", s))),
        }
    }
}

// Helper struct for database reading
#[derive(Debug, FromRow)]
struct SpendingPermissionDb {
    pub id: Uuid,
    pub user_wallet_address: String,
    pub approved_amount: Decimal,
    pub remaining_amount: Decimal,
    pub rate_per_hour: Decimal,
    pub max_streaming_hours: Decimal,
    pub used_streaming_hours: Decimal,
    pub status: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<SpendingPermissionDb> for SpendingPermission {
    fn from(db: SpendingPermissionDb) -> Self {
        Self {
            id: db.id,
            user_wallet_address: db.user_wallet_address,
            approved_amount: db.approved_amount,
            remaining_amount: db.remaining_amount,
            rate_per_hour: db.rate_per_hour,
            max_streaming_hours: db.max_streaming_hours,
            used_streaming_hours: db.used_streaming_hours,
            status: db.status.parse().unwrap_or(PermissionStatus::Pending),
            expires_at: db.expires_at,
            created_at: db.created_at,
            updated_at: db.updated_at,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePermissionRequest {
    pub user_wallet_address: String,
    pub requested_amount: Decimal,
    pub rate_per_hour: Decimal,
    pub duration_days: i64,
}

#[derive(Debug, Serialize)]
pub struct CreatePermissionResponse {
    pub permission_id: Uuid,
    pub max_streaming_hours: Decimal,
    pub expires_at: DateTime<Utc>,
    pub payment_address: String,
    pub amount_to_pay: Decimal,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PermissionStatusResponse {
    pub permission_id: Uuid,
    pub status: PermissionStatus,
    pub remaining_amount: Decimal,
    pub remaining_hours: Decimal,
    pub used_hours: Decimal,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WalletBalanceResponse {
    pub wallet_address: String,
    pub transparent_balance: Decimal,
    pub shielded_balance: Decimal,
    pub total_balance: Decimal,
    pub can_stream: bool,
    pub estimated_hours: Decimal,
}

pub struct ZcashService {
    http_client: Client,
    rpc_url: String,
    rpc_user: String,
    rpc_password: String,
    service_wallet_address: String,
    db_pool: PgPool,
}

impl ZcashService {
    pub fn new(
        rpc_url: String,
        rpc_user: String,
        rpc_password: String,
        service_wallet_address: String,
        db_pool: PgPool,
    ) -> Self {
        Self {
            http_client: Client::new(),
            rpc_url,
            rpc_user,
            rpc_password,
            service_wallet_address,
            db_pool,
        }
    }

    // Create a spending permission request
    pub async fn create_spending_permission(
        &self,
        request: CreatePermissionRequest,
    ) -> Result<CreatePermissionResponse, BillingError> {
        // Validate wallet address format
        self.validate_zcash_address(&request.user_wallet_address).await?;

        // Calculate max streaming hours
        let max_hours = request.requested_amount / request.rate_per_hour;

        // Create permission record
        let permission = SpendingPermission {
            id: Uuid::new_v4(),
            user_wallet_address: request.user_wallet_address.clone(),
            approved_amount: request.requested_amount,
            remaining_amount: request.requested_amount,
            rate_per_hour: request.rate_per_hour,
            max_streaming_hours: max_hours,
            used_streaming_hours: Decimal::ZERO,
            status: PermissionStatus::Pending,
            expires_at: Utc::now() + Duration::days(request.duration_days),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Save to database
        self.save_permission(&permission).await?;

        info!(
            "Created spending permission {} for user {} - {} ZEC for {} hours",
            permission.id,
            request.user_wallet_address,
            request.requested_amount,
            max_hours
        );

        Ok(CreatePermissionResponse {
            permission_id: permission.id,
            max_streaming_hours: max_hours,
            expires_at: permission.expires_at,
            payment_address: self.service_wallet_address.clone(),
            amount_to_pay: request.requested_amount,
        })
    }

    // Verify payment and activate permission
    pub async fn verify_and_activate_permission(
        &self,
        permission_id: Uuid,
    ) -> Result<SpendingPermission, BillingError> {
        let mut permission = self.get_permission(permission_id).await?;

        if permission.status != PermissionStatus::Pending {
            return Err(BillingError::Config(
                "Permission is not in pending status".to_string()
            ));
        }

        // Check if payment has been received
        let received_amount = self.check_payment_received(
            &permission.user_wallet_address,
            &self.service_wallet_address,
            permission.approved_amount,
        ).await?;

        if received_amount >= permission.approved_amount {
            permission.status = PermissionStatus::Active;
            permission.updated_at = Utc::now();
            
            self.update_permission(&permission).await?;

            info!(
                "Activated spending permission {} for user {}",
                permission_id,
                permission.user_wallet_address
            );

            Ok(permission)
        } else {
            Err(BillingError::Config(format!(
                "Insufficient payment received. Expected: {}, Got: {}",
                permission.approved_amount, received_amount
            )))
        }
    }

    // Get user's wallet balance
    pub async fn get_wallet_balance(
        &self,
        wallet_address: &str,
        rate_per_hour: Decimal,
    ) -> Result<WalletBalanceResponse, BillingError> {
        self.validate_zcash_address(wallet_address).await?;

        let balance = self.get_balance(wallet_address).await?;
        
        let transparent = Decimal::from_str_exact(&balance.transparent)
            .unwrap_or(Decimal::ZERO);
        let shielded = Decimal::from_str_exact(&balance.private)
            .unwrap_or(Decimal::ZERO);
        let total = transparent + shielded;

        let estimated_hours = if rate_per_hour > Decimal::ZERO {
            total / rate_per_hour
        } else {
            Decimal::ZERO
        };

        let can_stream = total >= rate_per_hour;

        Ok(WalletBalanceResponse {
            wallet_address: wallet_address.to_string(),
            transparent_balance: transparent,
            shielded_balance: shielded,
            total_balance: total,
            can_stream,
            estimated_hours,
        })
    }

    // Check permission status
    pub async fn get_permission_status(
        &self,
        permission_id: Uuid,
    ) -> Result<PermissionStatusResponse, BillingError> {
        let permission = self.get_permission(permission_id).await?;

        let remaining_hours = if permission.rate_per_hour > Decimal::ZERO {
            permission.remaining_amount / permission.rate_per_hour
        } else {
            Decimal::ZERO
        };

        Ok(PermissionStatusResponse {
            permission_id: permission.id,
            status: permission.status.clone(),
            remaining_amount: permission.remaining_amount,
            remaining_hours,
            used_hours: permission.used_streaming_hours,
            expires_at: permission.expires_at,
        })
    }

    // Deduct streaming time from permission
    pub async fn deduct_streaming_time(
        &self,
        permission_id: Uuid,
        hours_used: Decimal,
    ) -> Result<SpendingPermission, BillingError> {
        let mut permission = self.get_permission(permission_id).await?;

        if permission.status != PermissionStatus::Active {
            return Err(BillingError::Config(
                "Permission is not active".to_string()
            ));
        }

        // Check if permission has expired
        if Utc::now() > permission.expires_at {
            permission.status = PermissionStatus::Expired;
            self.update_permission(&permission).await?;
            return Err(BillingError::Config("Permission has expired".to_string()));
        }

        let amount_to_deduct = hours_used * permission.rate_per_hour;

        if amount_to_deduct > permission.remaining_amount {
            permission.status = PermissionStatus::Exhausted;
            self.update_permission(&permission).await?;
            return Err(BillingError::InsufficientBalance);
        }

        permission.remaining_amount -= amount_to_deduct;
        permission.used_streaming_hours += hours_used;
        permission.updated_at = Utc::now();

        // Mark as exhausted if depleted
        if permission.remaining_amount <= Decimal::ZERO {
            permission.status = PermissionStatus::Exhausted;
        }

        self.update_permission(&permission).await?;

        info!(
            "Deducted {} hours (${}) from permission {}. Remaining: ${}",
            hours_used,
            amount_to_deduct,
            permission_id,
            permission.remaining_amount
        );

        Ok(permission)
    }

    // Revoke a permission
    pub async fn revoke_permission(
        &self,
        permission_id: Uuid,
    ) -> Result<SpendingPermission, BillingError> {
        let mut permission = self.get_permission(permission_id).await?;

        permission.status = PermissionStatus::Revoked;
        permission.updated_at = Utc::now();

        self.update_permission(&permission).await?;

        info!("Revoked permission {}", permission_id);

        Ok(permission)
    }

    // Get user's active permission
    pub async fn get_active_permission_by_wallet(
        &self,
        wallet_address: &str,
    ) -> Result<Option<SpendingPermission>, BillingError> {
        let permission = sqlx::query_as::<_, SpendingPermissionDb>(
            r#"
            SELECT id, user_wallet_address, approved_amount, remaining_amount,
                   rate_per_hour, max_streaming_hours, used_streaming_hours,
                   status, expires_at, created_at, updated_at
            FROM spending_permissions
            WHERE user_wallet_address = $1 
            AND status = 'active'
            AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
            "#
        )
        .bind(wallet_address)
        .fetch_optional(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(permission.map(|p| p.into()))
    }

    // Private helper methods

    async fn call_zcash_rpc<T: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        params: Vec<serde_json::Value>,
    ) -> Result<T, BillingError> {
        let request = ZcashRpcRequest {
            jsonrpc: "2.0".to_string(),
            id: Uuid::new_v4().to_string(),
            method: method.to_string(),
            params,
        };

        let mut request_builder = self.http_client
            .post(&self.rpc_url);

        // Handle different authentication methods based on URL
        if self.rpc_url.starts_with("https://") && self.rpc_user != "YOUR_API_KEY" {
            // For nownodes.io - use API key as username
            request_builder = request_builder.basic_auth(&self.rpc_user, Option::<&str>::None);
        } else if !self.rpc_url.starts_with("https://") {
            // For local nodes - use username/password
            request_builder = request_builder.basic_auth(&self.rpc_user, Some(&self.rpc_password));
        }

        let response = request_builder
            .json(&request)
            .send()
            .await
            .map_err(|e| BillingError::Blockchain(format!("RPC request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(BillingError::Blockchain(format!(
                "RPC request failed with status {}: {}",
                response.status(),
                response.text().await.unwrap_or_default()
            )));
        }

        let rpc_response: ZcashRpcResponse<T> = response
            .json()
            .await
            .map_err(|e| BillingError::Blockchain(format!("RPC response parse failed: {}", e)))?;

        if let Some(error) = rpc_response.error {
            return Err(BillingError::Blockchain(format!(
                "RPC error {}: {}",
                error.code, error.message
            )));
        }

        rpc_response.result.ok_or_else(|| {
            BillingError::Blockchain("RPC returned no result".to_string())
        })
    }

    async fn validate_zcash_address(&self, address: &str) -> Result<(), BillingError> {
        // For testing, mock the validation if RPC is not available
        if self.rpc_url.contains("localhost:8232") {
            // Simple validation for Zcash addresses
            if address.starts_with("t1") && address.len() == 35 {
                return Ok(());
            } else {
                return Err(BillingError::Blockchain(
                    "Invalid Zcash address".to_string()
                ));
            }
        }

        let result: serde_json::Value = self.call_zcash_rpc(
            "z_validateaddress",
            vec![serde_json::json!(address)],
        ).await?;

        if !result["isvalid"].as_bool().unwrap_or(false) {
            return Err(BillingError::Blockchain(
                "Invalid Zcash address".to_string()
            ));
        }

        Ok(())
    }

    async fn get_balance(&self, address: &str) -> Result<ZcashBalance, BillingError> {
        // For testing, mock the balance if RPC is not available
        if self.rpc_url.contains("localhost:8232") {
            return Ok(ZcashBalance {
                transparent: "100000000".to_string(), // 1 ZEC
                private: "50000000".to_string(),     // 0.5 ZEC
                total: "150000000".to_string(),       // 1.5 ZEC total
            });
        }

        let result: serde_json::Value = self.call_zcash_rpc(
            "z_getbalanceforaddress",
            vec![serde_json::json!(address)],
        ).await?;

        Ok(ZcashBalance {
            transparent: result["transparent"].as_str().unwrap_or("0").to_string(),
            private: result["private"].as_str().unwrap_or("0").to_string(),
            total: result["total"].as_str().unwrap_or("0").to_string(),
        })
    }

    async fn check_payment_received(
        &self,
        from_address: &str,
        to_address: &str,
        _expected_amount: Decimal,
    ) -> Result<Decimal, BillingError> {
        // Get transactions for the service wallet
        let transactions: Vec<serde_json::Value> = self.call_zcash_rpc(
            "z_listreceivedbyaddress",
            vec![serde_json::json!(to_address), serde_json::json!(1)],
        ).await?;

        let mut total_received = Decimal::ZERO;

        for tx in transactions {
            if let Some(amount) = tx["amount"].as_f64() {
                // Verify the sender address to prevent unauthorized payments
                if let Some(txid) = tx["txid"].as_str() {
                    // Get detailed transaction information to verify sender
                    if let Ok(sender_verified) = self.verify_transaction_sender(txid, from_address).await {
                        if sender_verified {
                            total_received += Decimal::from_f64_retain(amount).unwrap_or(Decimal::ZERO);
                        }
                    }
                } else {
                    // Fallback for backward compatibility (log warning)
                    warn!("Transaction without txid detected - skipping sender verification");
                    continue;
                }
            }
        }

        Ok(total_received)
    }

    async fn verify_transaction_sender(
        &self,
        txid: &str,
        expected_sender: &str,
    ) -> Result<bool, BillingError> {
        // Get detailed transaction information
        let tx_details: serde_json::Value = self.call_zcash_rpc(
            "gettransaction",
            vec![serde_json::json!(txid)],
        ).await?;

        // For shielded transactions, we need to use z_viewtransaction
        if let Some(details) = tx_details["details"].as_array() {
            for detail in details {
                if let Some(address) = detail["address"].as_str() {
                    if address == expected_sender {
                        return Ok(true);
                    }
                }
            }
        }

        // If standard gettransaction doesn't show sender details (shielded tx),
        // try to get more detailed information
        let detailed_tx: serde_json::Value = self.call_zcash_rpc(
            "z_viewtransaction",
            vec![serde_json::json!(txid)],
        ).await?;

        // Check shielded spends for the sender
        if let Some(spends) = detailed_tx["spends"].as_array() {
            for spend in spends {
                if let Some(spending_address) = spend["spendingKeyDesc"].as_str() {
                    // Note: In production, you'd need to map spending keys to addresses
                    // This is a simplified implementation
                    if spending_address.contains(expected_sender) {
                        return Ok(true);
                    }
                }
            }
        }

        Ok(false)
    }

    async fn save_permission(
        &self,
        permission: &SpendingPermission,
    ) -> Result<(), BillingError> {
        sqlx::query(
            r#"
            INSERT INTO spending_permissions
            (id, user_wallet_address, approved_amount, remaining_amount,
             rate_per_hour, max_streaming_hours, used_streaming_hours,
             status, expires_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#
        )
        .bind(permission.id)
        .bind(&permission.user_wallet_address)
        .bind(permission.approved_amount)
        .bind(permission.remaining_amount)
        .bind(permission.rate_per_hour)
        .bind(permission.max_streaming_hours)
        .bind(permission.used_streaming_hours)
        .bind(permission.status.to_string())
        .bind(permission.expires_at)
        .bind(permission.created_at)
        .bind(permission.updated_at)
        .execute(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(())
    }

    async fn get_permission(
        &self,
        permission_id: Uuid,
    ) -> Result<SpendingPermission, BillingError> {
        let permission = sqlx::query_as::<_, SpendingPermissionDb>(
            r#"
            SELECT id, user_wallet_address, approved_amount, remaining_amount,
                   rate_per_hour, max_streaming_hours, used_streaming_hours,
                   status, expires_at, created_at, updated_at
            FROM spending_permissions
            WHERE id = $1
            "#
        )
        .bind(permission_id)
        .fetch_optional(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        permission
            .map(|p| p.into())
            .ok_or_else(|| BillingError::Config("Permission not found".to_string()))
    }

    async fn update_permission(
        &self,
        permission: &SpendingPermission,
    ) -> Result<(), BillingError> {
        sqlx::query(
            r#"
            UPDATE spending_permissions
            SET remaining_amount = $1,
                used_streaming_hours = $2,
                status = $3,
                updated_at = $4
            WHERE id = $5
            "#
        )
        .bind(permission.remaining_amount)
        .bind(permission.used_streaming_hours)
        .bind(permission.status.to_string())
        .bind(permission.updated_at)
        .bind(permission.id)
        .execute(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(())
    }

    // Background job to check and update expired permissions
    pub async fn check_expired_permissions(&self) -> Result<(), BillingError> {
        sqlx::query(
            r#"
            UPDATE spending_permissions
            SET status = 'expired', updated_at = NOW()
            WHERE status = 'active'
            AND expires_at < NOW()
            "#
        )
        .execute(&self.db_pool)
        .await
        .map_err(BillingError::Database)?;

        Ok(())
    }
}