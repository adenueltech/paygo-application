use redis::{Client, aio::ConnectionManager, AsyncCommands};
use crate::error::BillingError;

pub fn create_redis_client(redis_url: &str) -> Result<Client, redis::RedisError> {
    Client::open(redis_url)
}

pub async fn get_connection(client: &Client) -> Result<ConnectionManager, BillingError> {
    client
        .get_connection_manager()
        .await
        .map_err(|e| BillingError::Cache(e.to_string()))
}

pub async fn cache_session_code(
    client: &Client,
    session_code: &str,
    session_id: &str,
    expiry_seconds: usize,
) -> Result<(), BillingError> {
    let mut conn = get_connection(client).await?;
    conn.set_ex::<_, _, ()>(
        format!("session:{}", session_code),
        session_id,
        expiry_seconds as u64,
    )
    .await
    .map_err(|e| BillingError::Cache(e.to_string()))?;
    
    Ok(())
}