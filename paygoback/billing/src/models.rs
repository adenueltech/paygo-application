use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct StreamingSession {
    pub id: Uuid,
    pub session_code: String,
    pub user_wallet_address: String,
    pub vendor_wallet_address: String,
    pub vendor_id: String,
    pub start_time: DateTime<Utc>,
    pub last_billed_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub rate_per_hour: Decimal, // in USD or token units
    pub total_amount_billed: Decimal,
    pub status: SessionStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type, PartialEq)]
#[sqlx(type_name = "session_status", rename_all = "lowercase")]
pub enum SessionStatus {
    Active,
    Paused,
    Completed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BillingTransaction {
    pub id: Uuid,
    pub session_id: Uuid,
    pub user_wallet_address: String,
    pub vendor_wallet_address: String,
    pub amount: Decimal,
    pub duration_minutes: i64,
    pub tx_hash: Option<String>,
    pub status: TransactionStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone)]
#[sqlx(type_name = "transaction_status", rename_all = "lowercase")]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

#[derive(Debug, Deserialize)]
pub struct CreateSessionRequest {
    pub user_wallet_address: String,
    pub vendor_id: String,
}

#[derive(Debug, Serialize)]
pub struct CreateSessionResponse {
    pub session_code: String,
    pub session_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct ActivateSessionRequest {
    pub session_code: String,
}

#[derive(Debug, Deserialize)]
pub struct EndSessionRequest {
    pub session_code: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStreamingTimeRequest {
    pub session_code: String,
    pub streaming_duration_seconds: u64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct VendorInfo {
    pub id: String,
    pub wallet_address: String,
    pub rate_per_hour: Decimal,
    pub currency: String,
}