use chrono::Utc;
// src/db.rs
use sqlx::{PgPool, postgres::PgPoolOptions};
use crate::models::*;
use crate::error::BillingError;

pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
}

pub async fn create_session(
    pool: &PgPool,
    session: &StreamingSession,
) -> Result<StreamingSession, BillingError> {
    let record = sqlx::query_as::<_, StreamingSession>(
        r#"
        INSERT INTO streaming_sessions 
        (id, session_code, user_wallet_address, vendor_wallet_address, vendor_id, 
         start_time, last_billed_time, rate_per_hour, total_amount_billed, 
         status AS "status: SessionStatus", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, session_code, user_wallet_address, vendor_wallet_address, vendor_id,
                  start_time, last_billed_time, end_time, rate_per_hour, total_amount_billed,
                  status AS "status: SessionStatus", created_at, updated_at
        "#
    )
    .bind(session.id)
    .bind(session.session_code.clone())
    .bind(session.user_wallet_address.clone())
    .bind(session.vendor_wallet_address.clone())
    .bind(session.vendor_id.clone())
    .bind(session.start_time)
    .bind(session.last_billed_time)
    .bind(session.rate_per_hour)
    .bind(session.total_amount_billed)
    .bind(session.status.clone() as SessionStatus)
    .bind(session.created_at,)
    .bind(session.updated_at)
    .fetch_one(pool)
    .await?;

    Ok(record)
}

pub async fn get_session_by_code(
    pool: &PgPool,
    session_code: &str,
) -> Result<StreamingSession, BillingError> {
    let session = sqlx::query_as::<_, StreamingSession>(
        r#"
        SELECT id, session_code, user_wallet_address, vendor_wallet_address, vendor_id,
               start_time, last_billed_time, end_time, rate_per_hour, total_amount_billed,
               status AS "status: SessionStatus", created_at, updated_at
        FROM streaming_sessions
        WHERE session_code = $1
        "#
    )
    .bind(session_code)
    .fetch_optional(pool)
    .await
    .map_err(BillingError::Database)?;

    match session {
        Some(s) => Ok(s),
        None => Err(BillingError::SessionNotFound),
    }
}

pub async fn get_active_sessions(pool: &PgPool) -> Result<Vec<StreamingSession>, BillingError> {
    let sessions = sqlx::query_as::<_, StreamingSession>(
        r#"
        SELECT id, session_code, user_wallet_address, vendor_wallet_address, vendor_id,
               start_time, last_billed_time, end_time, rate_per_hour, total_amount_billed,
               status AS "status: SessionStatus", created_at, updated_at
        FROM streaming_sessions
        WHERE status = 'active'
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(sessions)
}

pub async fn update_session(
    pool: &PgPool,
    session: &StreamingSession,
) -> Result<(), BillingError> {
    sqlx::query::<_>(
        r#"
        UPDATE streaming_sessions
        SET last_billed_time = $1,
            end_time = $2,
            total_amount_billed = $3,
            status = $4,
            updated_at = $5
        WHERE id = $6
        "#
    )
    .bind(session.last_billed_time)
    .bind(session.end_time)
    .bind(session.total_amount_billed)
    .bind(session.status.clone() as SessionStatus)
    .bind(Utc::now())
    .bind(session.id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn create_transaction(
    pool: &PgPool,
    transaction: &BillingTransaction,
) -> Result<BillingTransaction, BillingError> {
    let record = sqlx::query_as::<_, BillingTransaction>(
        r#"
        INSERT INTO billing_transactions
        (id, session_id, user_wallet_address, vendor_wallet_address, amount, 
         duration_minutes, tx_hash, status AS "status: TransactionStatus", created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, session_id, user_wallet_address, vendor_wallet_address, amount,
                  duration_minutes, tx_hash, status AS "status: TransactionStatus", created_at
        "#
    )
    .bind(transaction.id)
    .bind(transaction.session_id)
    .bind(transaction.user_wallet_address.clone())
    .bind(transaction.vendor_wallet_address.clone())
    .bind(transaction.amount)
    .bind(transaction.duration_minutes)
    .bind(transaction.tx_hash.clone())
    .bind(transaction.status.clone() as TransactionStatus)
    .bind(transaction.created_at)
    .fetch_one(pool)
    .await?;

    Ok(record)
}